# Cloudflare Pages Migration — Baby Seven Portfolio

This document captures the migration from Vercel to Cloudflare Pages for the
Baby Seven portfolio app. It is **honest about gaps** between the original
migration prompt and the actual stack so you don't get stuck at deploy time.

---

## 📊 Where this project actually is (read this first)

The original migration prompt assumed:

- **Next.js 14** + TypeScript + Tailwind + Framer Motion
- **Drizzle ORM** + **Neon Postgres**
- Routes spread across `/app/support/page.tsx`, `/app/portfolio/page.tsx`, etc.

The actual project you're migrating:

| Layer | Spec assumption | Actual project |
|---|---|---|
| Framework | Next.js 14 | **Next.js 16.1.3** (App Router, Turbopack) |
| DB driver | Drizzle ORM + Neon Postgres | **Prisma ORM + SQLite** (local file at `db/custom.db`) |
| Routing | Multi-page (one page per route) | **Single-route SPA** — everything renders at `/` with in-app view switching via a Zustand store. No `/app/support/page.tsx` file exists. |
| API routes | All live under `/app/api/*/route.ts` | Same — but they all import `db` from `@/lib/db`, which is a Prisma client. |

This document is written for the **actual** stack. Where the prompt's literal
instructions would break the running app, we explain why and give you the
safe path.

---

## ✅ What this commit ships (the safe scaffolding)

These changes are universally safe and were applied to the repo:

1. **`wrangler.toml`** in the project root — Cloudflare Pages + Workers
   config, including a `[[d1_databases]]` binding for `DB` (the binding the
   Prisma D1 adapter reads from).
2. **`package.json`** — new scripts: `pages:build`, `preview`, `deploy`,
   plus helpers `d1:create`, `d1:migrate:local`, `d1:migrate:remote`,
   `wrangler:secret`. The `@cloudflare/next-on-pages@1.13.15` dev dependency
   is installed exactly as specified.
3. **`next.config.ts`** — added `images.remotePatterns` (the Next 16 successor
   to the deprecated `images.domains`). Kept `output: "standalone"` for the
   Node build.
4. **`src/lib/db.ts`** — rewritten as a **dual-mode Prisma client**:
   - On Cloudflare (when `env.DB` is bound): instantiates `PrismaClient`
     with `@prisma/adapter-d1` so it runs in the edge runtime.
   - In local Node dev: standard `PrismaClient` + SQLite file. Unchanged
     behaviour.
5. **`public/_headers`** — security headers (`X-Content-Type-Options`,
   `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`).
6. **`public/_redirects`** — SPA fallback `/* /index.html 200`.

---

## ⛔ What this commit intentionally does NOT do (and why)

### 1. `export const runtime = 'edge'` is NOT added to API routes yet

The prompt instructs adding `export const runtime = 'edge'` to every API
route. **Adding this with the current Prisma + SQLite setup breaks every
API route** — the Prisma client throws:

```
PrismaClientValidationError: In order to run Prisma Client on edge runtime,
either:
  - Use Prisma Accelerate: https://pris.ly/d/accelerate
  - Use Driver Adapters: https://pris.ly/d/driver-adapters
```

(We confirmed this empirically by adding it to `/api/stats` — every request
returned 500.)

The driver-adapter path in `src/lib/db.ts` only kicks in when the D1
binding exists (i.e. inside Cloudflare's runtime). In local Node dev there
is no D1 binding, so the adapter is never selected and Prisma uses its
standard SQLite driver — which then fails the edge-runtime check.

To add `runtime = 'edge'` to the API routes **without breaking local dev**,
you must change the local dev workflow too (Phase 2 below).

### 2. `next.config.mjs` was not created

The project uses `next.config.ts`. Next 16 supports both; the TypeScript
form is what the rest of the repo uses, so we updated that instead of
introducing a second config file.

### 3. The Drizzle + `@neondatabase/serverless` swap was not done

The prompt's `src/lib/db.ts` snippet assumes Drizzle + Neon. Doing the
literal swap would require:

- A real Neon Postgres connection string (not available in this sandbox).
- Rewriting every query in `src/app/api/*/route.ts` (6 files, dozens of
  Prisma calls) from Prisma's API to Drizzle's query builder.
- Replacing the Prisma schema with a Drizzle schema.
- Re-seeding via a different script.

That is a real migration, not a config tweak. The D1 adapter approach
above preserves every existing Prisma query unchanged. **If you want the
Drizzle + Neon path, see "Alternative: Drizzle + Neon" below.**

---

## 🚀 Phase 2 — Going live on Cloudflare (the required follow-up)

The Phase 1 scaffolding in this commit is enough to run `next dev` and
`next build` unchanged. To actually deploy to Cloudflare Pages, complete
these steps:

### Step 1 — Install the Wrangler CLI and authenticate

```bash
bun add -g wrangler
npx wrangler login
```

### Step 2 — Create the D1 database

```bash
bun run d1:create
# Output will print a database_id. Paste it into wrangler.toml:
#   database_id = "abc123..."
```

### Step 3 — Generate a D1-compatible Prisma migration

D1 uses SQLite syntax, so the existing Prisma schema is already
D1-compatible. Generate the SQL with:

```bash
bunx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script \
  --output prisma/migrations-d1/0001_init.sql
```

Then apply it to the local D1 simulator (for testing):

```bash
bun run d1:migrate:local
```

### Step 4 — Add `runtime = 'edge'` to every API route

For each file in `src/app/api/*/route.ts`, add this line at the very top:

```ts
export const runtime = "edge";
```

The API routes to update:
- `src/app/api/route.ts`
- `src/app/api/collaborate/route.ts`
- `src/app/api/collaborations/route.ts`
- `src/app/api/collaborations/[id]/route.ts`
- `src/app/api/editors/route.ts`
- `src/app/api/editors/[id]/route.ts`
- `src/app/api/notify/route.ts`
- `src/app/api/projects/route.ts`
- `src/app/api/stats/route.ts`
- `src/app/api/testimonials/route.ts`

### Step 5 — Switch local dev to `wrangler pages dev`

With `runtime = 'edge'` on every API route, plain `next dev` will throw the
Prisma edge error because there's no D1 binding. From this point on, run
local dev through Wrangler so the D1 binding is available:

```bash
bun run pages:build        # one-time build
npx wrangler pages dev .vercel/output/static --compatibility-date=2026-01-31
```

This brings up a local Cloudflare Workers environment with the D1 binding
from `wrangler.toml`, so the Prisma D1 adapter picks it up and every API
route works.

### Step 6 — Set the `DATABASE_URL` secret

```bash
bun run wrangler:secret
# Paste any non-empty string — the D1 binding is the real connection.
# (Required so the dual-mode db.ts doesn't fall back to the SQLite branch.)
```

### Step 7 — Apply the migration to the remote D1 + deploy

```bash
bun run d1:migrate:remote   # creates tables in the live Cloudflare D1
bun run deploy              # builds + uploads to Cloudflare Pages
```

### Step 8 — Seed the production D1

The existing `scripts/seed.ts` writes through the Prisma client. To seed
the remote D1, either:

- Run the seed script in a Cloudflare Pages function, OR
- Convert `scripts/seed.ts` to a SQL dump and run
  `npx wrangler d1 execute baby-seven-db --remote --file=seed.sql`.

---

## 🌐 Git-based deployment (the recommended path)

Once Phase 2 is complete, the simplest way to ship is via the Cloudflare
dashboard:

1. Push the repo to GitHub (`git push origin main` — **use a fresh token,
   never the one previously leaked in chat**).
2. Cloudflare Dashboard → **Workers & Pages** → **Create application** →
   **Pages** → **Connect to Git** → pick the repo.
3. Build settings:
   - **Build command:** `bun run pages:build`
   - **Build output directory:** `.vercel/output/static`
   - **Root directory:** `/`
4. **Settings → Environment Variables:** add `DATABASE_URL` (any
   non-empty string; the D1 binding is the real connection).
5. **Save and Deploy.** Cloudflare will rebuild on every push to `main`.

---

## 🔀 Alternative: Drizzle + Neon (matches the original prompt exactly)

If you'd rather follow the prompt's DB stack instead of using D1:

1. Provision a Neon Postgres database → copy the connection string.
2. `bun add drizzle-orm @neondatabase/serverless` and `bun add -d drizzle-kit`.
3. Convert `prisma/schema.prisma` to `db/schema.ts` (Drizzle). The tables
   and columns map 1:1.
4. Rewrite every `db.<model>.<method>()` call in `src/app/api/*/route.ts`
   to the Drizzle query builder (e.g. `db.project.count()` → `db.select({ count: count() }).from(projects)`).
5. Replace `src/lib/db.ts` with:
   ```ts
   import { drizzle } from "drizzle-orm/neon-http";
   import { neon } from "@neondatabase/serverless";
   const sql = neon(process.env.DATABASE_URL!);
   export const db = drizzle({ client: sql });
   ```
6. Add `export const runtime = "edge"` to every API route. (Drizzle + Neon
   is edge-native — no driver adapter needed.)
7. `bunx drizzle-kit push` to create the tables on Neon, then re-seed.

This path is a real rewrite — budget a few hours of work for it. Once
done, Cloudflare Pages builds will pass cleanly with no D1 binding
required.

---

## 🛠 Troubleshooting

| Symptom | Fix |
|---|---|
| `PrismaClientValidationError: ... edge runtime` | The route is missing `export const runtime = 'edge'`, OR `src/lib/db.ts` couldn't find the D1 binding. Make sure you're running through `wrangler pages dev` or on Cloudflare itself, not plain `next dev`. |
| `Cannot find module 'node:...'` | You imported a Node core module (`fs`, `path`, `crypto`) in a route that's now edge-only. Replace with a Web-API equivalent (`crypto.subtle`, `URL`, etc.). The Baby Seven app does not currently use any. |
| `404 on page refresh` | The `public/_redirects` file (`/* /index.html 200`) handles this. If it still happens, add the explicit redirect block to `wrangler.toml` (see Troubleshooting #10 in the original prompt). |
| `Build fails with "Next.js version mismatch"` | Confirm `@cloudflare/next-on-pages@1.13.15` is the installed version (not 1.13.16 or newer). The version is pinned in `package.json`. |
| `DATABASE_URL` not picked up | Set it via `npx wrangler secret put DATABASE_URL` (CLI) or in the Cloudflare dashboard under Project → Settings → Environment Variables. |

---

## ✅ Migration checklist

- [x] Install `@cloudflare/next-on-pages@1.13.15`
- [x] Create `wrangler.toml`
- [x] Update `package.json` scripts
- [x] Update `next.config.ts`
- [ ] Add `export const runtime = 'edge'` to all API routes *(Phase 2 — would break local `next dev` until you also switch to `wrangler pages dev`)*
- [x] Update `src/lib/db.ts` with edge-compatible driver adapter
- [x] Create `/public/_headers` and `/public/_redirects`
- [ ] Set `DATABASE_URL` in Cloudflare dashboard
- [ ] Push to GitHub
- [ ] Connect repo to Cloudflare Pages
- [ ] Run `bun run pages:build` locally to test
- [ ] Deploy and verify the live site

---

## 📞 What to expect post-migration

- **Local dev:** `bun run dev` still works exactly as before (Node + SQLite).
  No Phase 2 changes are required just to keep developing locally.
- **Cloudflare preview:** `bun run preview` runs the Cloudflare build
  locally in the Workers runtime.
- **Production:** Deployed to Cloudflare's global edge network (330+ cities).
- **Speed:** The site will load faster globally — important for the MiniPay
  users in Africa who the Support page is built for.
- **Cost:** Cloudflare Pages free tier gives unlimited bandwidth — no
  surprise bills.
