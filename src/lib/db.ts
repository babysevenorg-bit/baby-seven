/**
 * Edge-compatible Prisma client for the Baby Seven app.
 *
 * This file is the single seam between the runtime the code is executing in
 * and the database driver Prisma uses. It supports two modes:
 *
 * 1. Local Node.js dev (`bun run dev`):
 *    Standard PrismaClient + the DATABASE_URL env var. Works with any
 *    Postgres connection string (Neon, Supabase, local Postgres, etc.).
 *
 * 2. Cloudflare Pages / Workers edge runtime (production):
 *    PrismaClient instantiated with `@prisma/adapter-neon`, which wraps
 *    `@neondatabase/serverless`. Neon's edge driver uses HTTP (fetch) to
 *    query the database — no TCP socket, no Node-only APIs. This is the
 *    only Postgres driver that works in Cloudflare's edge sandbox.
 *
 * Why a driver adapter is mandatory on the edge:
 *   Prisma's standard client uses Node-only APIs (`net`, `tls`, `fs`,
 *   `child_process`) that don't exist in the Cloudflare Workers runtime.
 *   The Prisma team explicitly requires either Accelerate or a Driver
 *   Adapter — without one, you get `PrismaClientValidationError: In order
 *   to run Prisma Client on edge runtime, either: Use Prisma Accelerate,
 *   or Use Driver Adapters.`
 *
 * How we detect the edge:
 *   On Cloudflare Workers, the request's `env` (containing bindings and
 *   secrets like DATABASE_URL) is exposed to the Worker code via
 *   `globalThis`. We check for it here. When present, we use the Neon
 *   HTTP adapter. When absent (local dev), we fall back to the standard
 *   PrismaClient, which uses the native `pg` driver over TCP.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neon } from "@neondatabase/serverless";

// On Cloudflare, env vars are attached to `globalThis` by the runtime before
// any route runs. We declare the shape here so TS is happy.
type CloudflareEnv = {
  DATABASE_URL?: string;
  CF_PAGES?: string;
};

const cloudflareEnv =
  (globalThis as unknown as { __env?: CloudflareEnv }).__env ??
  (typeof process !== "undefined" ? (process.env as CloudflareEnv) : undefined);

// Detect the Cloudflare edge runtime. We're on the edge if either:
//   - The runtime sets CF_PAGES (set by Cloudflare Pages), OR
//   - The runtime attaches env via globalThis (Workers convention).
const isCloudflareEdge =
  typeof cloudflareEnv !== "undefined" &&
  (cloudflareEnv.CF_PAGES === "1" ||
    // globalThis.__env is the pattern @cloudflare/next-on-pages uses
    !!(globalThis as unknown as { __env?: unknown }).__env);

// Singleton cache so HMR in dev and Workers in prod don't spawn multiple
// clients. NOTE: HMR can leave stale instances pointing at old env vars
// across .env edits — clear it explicitly when DATABASE_URL changes.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  __prismaUrl?: string;
};

function createPrismaClient(): PrismaClient {
  // Always have a DATABASE_URL — required by Prisma either way.
  const databaseUrl =
    cloudflareEnv?.DATABASE_URL ??
    (typeof process !== "undefined" ? process.env.DATABASE_URL : undefined);

  // If the cached client was created with a different URL (e.g. .env was
  // edited during dev), throw away the cached client and create a fresh one.
  if (
    globalForPrisma.prisma &&
    globalForPrisma.__prismaUrl &&
    globalForPrisma.__prismaUrl !== databaseUrl
  ) {
    try {
      void globalForPrisma.prisma.$disconnect();
    } catch {
      // ignore
    }
    globalForPrisma.prisma = undefined;
  }
  globalForPrisma.__prismaUrl = databaseUrl;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not set. Set it in .env locally, or via " +
        "`npx wrangler secret put DATABASE_URL` on Cloudflare.",
    );
  }

  if (isCloudflareEdge) {
    // Edge runtime → use the Neon HTTP adapter.
    // `neon()` returns a tagged-template SQL function; the adapter wraps
    // it so Prisma can use its normal query builder on top.
    const sql = neon(databaseUrl);
    const adapter = new PrismaNeon(sql);
    return new PrismaClient({ adapter, log: ["error", "warn"] });
  }

  // Local Node dev → standard PrismaClient + native pg driver over TCP.
  // The same Neon connection string works here — Neon accepts both TCP
  // (local Node) and HTTP (edge) connections on the same database.
  return new PrismaClient({
    log: ["query", "error", "warn"],
    datasources: { db: { url: databaseUrl } },
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
