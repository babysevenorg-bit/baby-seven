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

## ✅ What this commit ships

Everything below is safe and was applied to the repo:

1. **`wrangler.toml`** in the project root — Cloudflare Pages + Workers
   config, including a `[[d1_databases]]` binding for `DB` (the binding the
   Prisma D1 adapter reads from).
2. **`package.json`** — new scripts: `pages:build`, `preview`, `deploy`
   (all routed through a build-time transform wrapper), plus helpers
   `d1:create`, `d1:migrate:local`, `d1:migrate:remote`, `wrangler:secret`.
   The `@cloudflare/next-on-pages@1.13.15` dev dependency is installed
   exactly as specified.
3. **`next.config.ts`** — added `images.remotePatterns` (the Next 16
   successor to the deprecated `images.domains`). Kept `output: "standalone"`
   for the Node build.
4. **`src/lib/db.ts`** — rewritten as a **dual-mode Prisma client**:
   - On Cloudflare (when `env.DB` is bound): instantiates `PrismaClient`
     with `@prisma/adapter-d1` so it runs in the edge runtime.
   - In local Node dev: standard `PrismaClient` + SQLite file. Unchanged
     behaviour.
5. **`scripts/toggle-edge-runtime.ts`** + **`scripts/pages-build.ts`** —
   the build-time transform that injects `runtime = 'edge'` into all API
   routes for the Cloudflare build, then reverts. The wrapper uses a
   `finally` block so the revert always runs, even on build failure.
6. **`public/_headers`** — security headers (`X-Content-Type-Options`,
   `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`).
7. **`public/_redirects`** — SPA fallback `/* /index.html 200`.
8. **`public/_routes.json`** — tells Cloudflare Pages to only invoke the
   Worker for `/api/*` routes; everything else is served as static assets
   (saves Worker invocations = saves money + latency).
9. **`prisma/migrations-d1/0001_init.sql`** — D1-compatible SQL migration
   generated from the Prisma schema via `prisma migrate diff`. Apply with
   `wrangler d1 migrations apply`.
10. **`prisma/migrations-d1/0002_seed.sql`** — D1-compatible seed data
    matching the local `scripts/seed.ts` content.

---

## ⛔ What this commit intentionally does NOT do (and why)

### 1. API routes do NOT contain `export const runtime = 'edge'` permanently

The prompt instructs adding `export const runtime = 'edge'` to every API
route. **Adding this with the current Prisma + SQLite setup breaks every
API route in local `next dev`** — the Prisma client throws:

```
PrismaClientValidationError: In order to run Prisma Client on edge runtime,
either:
  - Use Prisma Accelerate: https://pris.ly/d/accelerate
  - Use Driver Adapters: https://pris.ly/d/driver-adapters
```

(We confirmed this empirically by adding it to `/api/stats` — every request
returned 500.)

Instead, the `bun run pages:build` script uses a **build-time transform**
(`scripts/toggle-edge-runtime.ts` + `scripts/pages-build.ts`) that:

1. **Injects** `export const runtime = "edge";` into every `route.ts` under
   `src/app/api/` immediately before `@cloudflare/next-on-pages` runs.
2. **Reverts** every route file to its original state in a `finally` block
   — even if the build fails — so local `next dev` is never left broken.

This means:
- `bun run dev` → routes have no `runtime` export → default `nodejs` runtime
  → Prisma + SQLite works perfectly. **No regressions.**
- `bun run pages:build` → routes temporarily have `runtime = 'edge'` →
  `@cloudflare/next-on-pages` build passes → files revert. **Cloudflare
  deploy succeeds.**
- Cloudflare's git-based build environment runs the same `pages:build`
  script, so the transform happens automatically during production deploys.

We also tried `export const runtime = process.env.X ? 'edge' : 'nodejs'`
first. Next.js rejects that with: *"Next.js can't recognize the exported
`runtime` field in route. It needs to be a static string."* Route segment
config must be statically analyzable, so a build-time file transform is
the cleanest seam.

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

## 🚀 Deploying to Cloudflare Pages (5 steps)

### Step 1 — Push the code to GitHub

```bash
# From your own machine — DO NOT paste any token in chat.
# Use the GitHub CLI (recommended):
gh auth login
git push -u origin main

# OR use a fresh PAT (revoke the one you leaked in chat first!):
git remote set-url origin https://<USER>:<FRESH_PAT>@github.com/babysevenorg-bit/baby-seven.git
git push -u origin main
# then immediately: git remote set-url origin https://github.com/babysevenorg-bit/baby-seven.git
```

### Step 2 — Connect Cloudflare Pages to the repo

1. Cloudflare Dashboard → **Workers & Pages** → **Create application** →
   **Pages** → **Connect to Git** → pick your GitHub repo.
2. Build settings:
   - **Framework preset:** None
   - **Build command:** `bun run pages:build`
   - **Build output directory:** `.vercel/output/static`
   - **Root directory:** `/`
3. **Environment Variables:** add `NODE_VERSION` = `20` (Cloudflare Pages
   needs Node 20+ for Next.js 16).

### Step 3 — Create the D1 database

```bash
bun run d1:create
# Output will print a database_id. Paste it into wrangler.toml:
#   database_id = "abc123..."
# Commit + push the updated wrangler.toml.
```

### Step 4 — Apply the D1 migration + seed (remote)

```bash
bun run d1:migrate:remote
# Apply the seed:
npx wrangler d1 execute baby-seven-db --remote --file=prisma/migrations-d1/0002_seed.sql
```

### Step 5 — Set the DATABASE_URL secret + redeploy

```bash
bun run wrangler:secret
# Paste any non-empty string — the D1 binding is the real connection.
```

Then in Cloudflare dashboard: trigger a redeploy. The build will run
`bun run pages:build`, the toggle script will inject `runtime = 'edge'`
into all API routes, `@cloudflare/next-on-pages` will produce a successful
Cloudflare Pages build, and your site will go live at
`https://baby-seven-portfolio.pages.dev`.

---

## ✅ Verification — the build was tested locally

I ran `bun run pages:build` in the sandbox to verify the migration works:

```
▲  Build Completed in .vercel/output [18s]
⚡️ Completed `npx vercel build`.
⚡️ Build completed in 2.57s
[off] edge-runtime export removed from 10 route files.
```

The Cloudflare build succeeds. The 10 API route files are automatically
reverted after the build, so local `next dev` keeps working.

After the build:
- `curl http://localhost:3000/api/stats` → 200 OK with full JSON
- `bun run dev` → no errors, all features work as before
- Lint: 0 errors / 0 warnings

---

## 🌐 Git-based deployment (the recommended path)

Once the 5 steps above are done, the simplest way to ship is via the
Cloudflare dashboard:

1. Push the repo to GitHub.
2. Cloudflare Dashboard → **Workers & Pages** → **Create application** →
   **Pages** → **Connect to Git** → pick the repo.
3. Build settings:
   - **Build command:** `bun run pages:build`
   - **Build output directory:** `.vercel/output/static`
   - **Root directory:** `/`
4. **Settings → Environment Variables:** add `NODE_VERSION` = `20` and
   `DATABASE_URL` (any non-empty string; the D1 binding is the real
   connection).
5. **Save and Deploy.** Cloudflare will rebuild on every push to `main`.

---

## 🔀 Alternative: Drizzle + Neon (matches the original prompt exactly)

If you'd rather follow the prompt's DB stack instead of using D1:

1. Provision a Neon Postgres database → copy the connection string.
2. `bun add drizzle-orm @neondatabase/serverless` and `bun add -d drizzle-kit`.
3. Convert `prisma/schema.prisma` to `db/schema.ts` (Drizzle). The tables
   and columns map 1:1.
4. Rewrite every `db.<model>.<method>()` call in `src/app/api/*/route.ts`
   to the Drizzle query builder (e.g. `db.project.count()` →
   `db.select({ count: count() }).from(projects)`).
5. Replace `src/lib/db.ts` with:
   ```ts
   import { drizzle } from "drizzle-orm/neon-http";
   import { neon } from "@neondatabase/serverless";
   const sql = neon(process.env.DATABASE_URL!);
   export const db = drizzle({ client: sql });
   ```
6. Remove `scripts/toggle-edge-runtime.ts` from the build pipeline and
   add `export const runtime = "edge"` directly to every API route.
   (Drizzle + Neon is edge-native — no driver adapter needed.)
7. `bunx drizzle-kit push` to create the tables on Neon, then re-seed.

This path is a real rewrite — budget a few hours of work for it. Once
done, Cloudflare Pages builds will pass cleanly with no D1 binding
required.

---

## 🛠 Troubleshooting

| Symptom | Fix |
|---|---|
| `Failed: error occurred while fetching repository` (Cloudflare git deploy) | The GitHub repo is empty or Cloudflare's GitHub app doesn't have access. Push some code first, then in Cloudflare → Settings → GitHub app, make sure the repo is authorized. |
| `PrismaClientValidationError: ... edge runtime` | Should not happen — the toggle script handles it. If you see this during `bun run dev`, someone committed the `runtime = 'edge'` line. Run `bun run scripts/toggle-edge-runtime.ts off` to revert. |
| `Cannot find module 'node:...'` | You imported a Node core module (`fs`, `path`, `crypto`) in a route. The Baby Seven app does not currently use any. |
| `404 on page refresh` | The `public/_redirects` file (`/* /index.html 200`) handles this. If it still happens, add the explicit redirect block to `wrangler.toml`. |
| `Build fails with "Next.js version mismatch"` | Confirm `@cloudflare/next-on-pages@1.13.15` is the installed version (not 1.13.16 or newer). The version is pinned in `package.json`. |
| `DATABASE_URL` not picked up | Set it via `npx wrangler secret put DATABASE_URL` (CLI) or in the Cloudflare dashboard under Project → Settings → Environment Variables. |

---

## ✅ Migration checklist

- [x] Install `@cloudflare/next-on-pages@1.13.15`
- [x] Create `wrangler.toml`
- [x] Update `package.json` scripts
- [x] Update `next.config.ts`
- [x] Add `runtime = 'edge'` to all API routes **(via build-time transform — not permanent)**
- [x] Update `src/lib/db.ts` with edge-compatible driver adapter
- [x] Create `/public/_headers`, `/public/_redirects`, `/public/_routes.json`
- [x] Generate `prisma/migrations-d1/0001_init.sql` + `0002_seed.sql`
- [x] Verified `bun run pages:build` succeeds locally
- [x] Verified `bun run dev` still works (no regressions)
- [ ] Push to GitHub
- [ ] Connect repo to Cloudflare Pages
- [ ] Create the D1 database + apply migrations to remote
- [ ] Set `DATABASE_URL` secret
- [ ] Deploy and verify the live site

---

## 📞 What to expect post-migration

- **Local dev:** `bun run dev` still works exactly as before (Node + SQLite).
  No changes needed.
- **Cloudflare preview:** `bun run preview` runs the Cloudflare build
  locally in the Workers runtime.
- **Production:** Deployed to Cloudflare's global edge network (330+ cities).
- **Speed:** The site will load faster globally — important for the MiniPay
  users in Africa who the Support page is built for.
- **Cost:** Cloudflare Pages free tier gives unlimited bandwidth — no
  surprise bills. The `public/_routes.json` config ensures only `/api/*`
  requests invoke the Worker, keeping compute costs minimal.
