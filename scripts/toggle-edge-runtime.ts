#!/usr/bin/env bun
/**
 * scripts/toggle-edge-runtime.ts
 *
 * Build-time transform that adds (or removes) `export const runtime = "edge";`
 * to every API route file under `src/app/api/`. Used by the `pages:build`
 * script so that:
 *
 *   - `bun run pages:build` (run by Cloudflare's build env) injects the edge
 *     runtime export into all routes before `@cloudflare/next-on-pages` runs,
 *     then reverts it afterward. The Cloudflare build passes the edge-runtime
 *     check.
 *   - `bun run dev` (local Node dev) is completely unaffected — the routes
 *     have no `runtime` export, so Next.js uses the default `nodejs` runtime,
 *     and Prisma + SQLite works without the `PrismaClientValidationError`.
 *
 * Why this exists:
 *   Next.js requires `export const runtime` to be a *static string literal*
 *   (a conditional like `process.env.X ? 'edge' : 'nodejs'` is rejected at
 *   compile time). So we can't conditionally opt into edge via env vars at
 *   the route level. A build-time file transform is the cleanest seam.
 *
 * Usage:
 *   bun run scripts/toggle-edge-runtime.ts on    # inject the export
 *   bun run scripts/toggle-edge-runtime.ts off   # remove the export
 *   bun run scripts/toggle-edge-runtime.ts       # same as `on`
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";

const ROOT = join(import.meta.dir, "..");
const API_DIR = join(ROOT, "src", "app", "api");
const MARKER = `export const runtime = "edge";`;

type Mode = "on" | "off";
const mode: Mode = (process.argv[2] as Mode) ?? "on";

async function findRouteFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await findRouteFiles(full)));
    } else if (entry.name === "route.ts" || entry.name === "route.tsx") {
      out.push(full);
    }
  }
  return out;
}

async function main() {
  const files = await findRouteFiles(API_DIR);
  let touched = 0;

  for (const file of files) {
    const src = await readFile(file, "utf8");
    const hasMarker = src.includes(MARKER);

    if (mode === "on" && !hasMarker) {
      // Prepend the edge runtime export. Keep any leading comment by
      // inserting after the first block of `///` or `//` comment lines if
      // present, otherwise at the very top.
      const lines = src.split("\n");
      let insertAt = 0;
      // Skip leading comments / blank lines so the export lands after them.
      while (
        insertAt < lines.length &&
        (lines[insertAt].trim().startsWith("//") ||
          lines[insertAt].trim().startsWith("/*") ||
          lines[insertAt].trim().startsWith("*") ||
          lines[insertAt].trim() === "")
      ) {
        // Don't skip past the end of a block comment.
        if (lines[insertAt].trim().startsWith("/*") && !lines[insertAt].includes("*/")) {
          // advance to the end of the block comment
          while (insertAt < lines.length && !lines[insertAt].includes("*/")) {
            insertAt++;
          }
          insertAt++; // move past the */ line
          continue;
        }
        insertAt++;
      }
      lines.splice(insertAt, 0, `${MARKER}`, "");
      await writeFile(file, lines.join("\n"), "utf8");
      touched++;
      console.log(`  + ${relative(ROOT, file)}`);
    } else if (mode === "off" && hasMarker) {
      // Remove the marker line and the blank line that follows it (if present).
      const lines = src.split("\n");
      const idx = lines.findIndex((l) => l.trim() === MARKER);
      if (idx >= 0) {
        lines.splice(idx, 1);
        // Remove the blank line immediately after, if there is one.
        if (idx < lines.length && lines[idx].trim() === "") {
          lines.splice(idx, 1);
        }
        await writeFile(file, lines.join("\n"), "utf8");
        touched++;
        console.log(`  - ${relative(ROOT, file)}`);
      }
    }
  }

  console.log(
    `\n[${mode}] edge-runtime export ${mode === "on" ? "injected into" : "removed from"} ${touched} route file${touched === 1 ? "" : "s"}.`,
  );
}

main().catch((e) => {
  console.error("toggle-edge-runtime failed:", e);
  process.exit(1);
});
