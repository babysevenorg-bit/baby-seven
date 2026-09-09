/**
 * Edge-compatible Prisma client for the Baby Seven app.
 *
 * This file is the single seam between the runtime the code is executing in
 * and the database driver Prisma uses. It supports two modes:
 *
 * 1. Local Node.js dev (default — what `bun run dev` uses):
 *    Standard PrismaClient + the SQLite file at DATABASE_URL.
 *    This is what runs on the developer's machine and during `next dev`.
 *
 * 2. Cloudflare Pages / Workers edge runtime (production):
 *    PrismaClient instantiated with `@prisma/adapter-d1`, bound to the
 *    Cloudflare D1 database declared in `wrangler.toml` under `[[d1_databases]]`.
 *    The D1 binding is exposed on the request context as `env.DB`.
 *
 * Why a driver adapter is mandatory on the edge:
 *   Prisma's standard client uses Node-only APIs (`fs`, `net`, `child_process`)
 *   that don't exist in the Cloudflare Workers runtime. The Prisma team
 *   explicitly requires either Accelerate or a Driver Adapter — without one,
 *   you get `PrismaClientValidationError: In order to run Prisma Client on
 *   edge runtime, either: Use Prisma Accelerate, or Use Driver Adapters.`
 *
 * Alternative path (not used here — see MIGRATION.md):
 *   Swap Prisma entirely for Drizzle ORM + `@neondatabase/serverless`. That's
 *   a larger rewrite that requires porting every query in src/app/api/*.
 *   The D1 adapter approach below preserves every existing Prisma query
 *   unchanged.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";

// On Cloudflare, the D1 binding + env vars are attached to `globalThis` by
// the runtime before any route runs. We declare the shape here so TS is happy.
type CloudflareEnv = {
  DB?: unknown; // D1Database binding from wrangler.toml
  DATABASE_URL?: string;
  CF_PAGES?: string;
};

const cloudflareEnv = (globalThis as unknown as { __env?: CloudflareEnv }).__env
  ?? (typeof process !== "undefined" ? (process.env as CloudflareEnv) : undefined);

const isCloudflareEdge =
  typeof cloudflareEnv !== "undefined" &&
  // The D1 binding is the source of truth — if it's missing, we can't run on
  // the edge regardless of what other vars say.
  !!cloudflareEnv.DB;

// Singleton cache so HMR in dev and Workers in prod don't spawn multiple clients.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  if (isCloudflareEdge) {
    // Edge runtime → use the D1 driver adapter.
    // The cast is safe because the binding only exists when Cloudflare has
    // actually attached a D1Database to the env.
    const d1Binding = cloudflareEnv!.DB as Parameters<typeof PrismaD1>[0]["binding"];
    const adapter = new PrismaD1({ binding: d1Binding });
    return new PrismaClient({ adapter, log: ["error", "warn"] });
  }

  // Local Node dev → standard SQLite PrismaClient.
  return new PrismaClient({ log: ["query"] });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
