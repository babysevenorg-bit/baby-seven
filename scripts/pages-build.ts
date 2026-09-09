#!/usr/bin/env bun
/**
 * scripts/pages-build.ts
 *
 * Wrapper around `@cloudflare/next-on-pages` that:
 *   1. Injects `export const runtime = "edge";` into every API route file.
 *   2. Runs `npx @cloudflare/next-on-pages` (the Cloudflare Pages build).
 *   3. Reverts the API route files to their original state — REGARDLESS of
 *      whether the build succeeded or failed. This is critical: if we leave
 *      the edge export in, local `next dev` breaks (Prisma + edge = error).
 *
 * This is the script that `bun run pages:build` invokes, and the one
 * Cloudflare's build environment runs during a git-based Pages deploy.
 */
import { spawn } from "node:child_process";

const ON = Bun.spawn(["bun", "run", "scripts/toggle-edge-runtime.ts", "on"], {
  cwd: import.meta.dir + "/..",
  stdout: "inherit",
  stderr: "inherit",
});
await ON.exited;

let buildExitCode = 0;
try {
  const build = spawn(
    "npx",
    ["@cloudflare/next-on-pages", ...process.argv.slice(2)],
    {
      cwd: import.meta.dir + "/..",
      stdio: "inherit",
      env: process.env,
      shell: process.platform === "win32",
    },
  );
  buildExitCode = await new Promise<number>((resolve) => {
    build.on("close", resolve);
    build.on("error", () => resolve(1));
  });
} finally {
  // ALWAYS revert, even if the build threw or exited non-zero.
  const OFF = Bun.spawn(["bun", "run", "scripts/toggle-edge-runtime.ts", "off"], {
    cwd: import.meta.dir + "/..",
    stdout: "inherit",
    stderr: "inherit",
  });
  await OFF.exited;
}

process.exit(buildExitCode);
