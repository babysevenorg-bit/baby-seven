# baby-seven

> The cinematic personal-brand web app for **Baby Seven** — #1 ranking Novelist (*Blood Disaster*), Pro Video Director, Reels Editor, and Scriptwriter.

A Next.js 16 single-page experience with a dark/light theme system, an SEO-driven Google Search bar, a Reel Editors & Makers collaboration hub, and a hidden admin studio for managing the applicant pipeline.

---

## ✨ Features

### Theme system
- **Dark mode (default):** Deep void `#080808`, cards `#121212`, gold `#F5B041` + cyber cyan `#00FFFF` accents.
- **Light mode:** `#F4F6F9` background, white cards with soft shadow, deep gold `#B8860B` + cobalt blue `#0047AB` accents.
- Theme toggle (FaSun / FaMoon) in the header. Persists across reloads via `next-themes`.
- Browser `theme-color` meta tag switches with the active theme.

### Homepage
- Cinematic hero with mouse-parallax gradient orbs and a rotating tagline (Novelist → Director → Story Architect → Reels Editor → Scriptwriter).
- **Automated Google Search Bar** — types a query → opens a branded modal → redirects to `https://www.google.com/search?q=<query>+Baby+Seven+Novel`. Forces real-world Google verification of the #1 ranking.
- **Live Collaborator Counter** — `🔥 Join 50+ creators already collaborating with Baby Seven.` The `+` count is pulled live from the database (collaborations + reel-editor applicants).
- Featured-work scroll-snap carousel with *Blood Disaster* pinned at #1 (golden glow + `#1 SEARCH RESULT` ribbon).
- **Expertise Radar Chart** (chart.js) — Writing 100, Directing 95, Reels Editing 100, Scriptwriting 90, SEO Ranking 100.
- **Auto-scrolling testimonials marquee** with hover-to-pause and edge fades.

### Portfolio
- Filter pills: All / Writing / Video Editing / Scriptwriting (cyan underline on the active filter).
- Masonry 3-column grid (1-col on mobile).
- *Blood Disaster* is pinned to the top of the Writing filter with a golden glow + rotated `#1 SEARCH RESULT` corner ribbon.

### Collaboration Portal
- Top-level tab switcher: **General Collab** (3-step tier → pitch → contact wizard) vs **Apply as a Reel Editor**.
- Reel Editor form (`react-hook-form`): name, email, portfolio link, editing style (Fast-Paced / Cinematic / Story-driven / Viral/Hook), sample reel URL.
- Public **Talent Pool** directory grid of all applicants.
- Server-side validation + auto-reply email simulation (console log).

### Support
- 2-second loading screen (`useEffect` + `setTimeout(2000)`) with a spinning film reel and bouncing dots.
- **🔥 Maintenance Mode (`IS_LIVE = false` by default).** When the page is in maintenance mode, the Support page shows a cinematic "Support Hub Upgrade" holding page with:
  - Branded copy: "🚀 Baby Seven is currently upgrading the Support Hub to serve you better… integrating Binance Pay, PayPal, and MiniPay to make supporting the #1 'Blood Disaster' creator as smooth as possible."
  - An "Estimated Launch: Coming Soon" badge.
  - A **"Notify Me"** email capture form — subscribes visitors to the launch alert list (persisted in the `NotifySubscriber` table; idempotent via a `unique` email constraint).
  - Action buttons: "Browse My Work" (→ Portfolio), "Collaborate Instead" (→ Collaboration Portal).
- **Magic Switch.** A single `const IS_LIVE = false;` at the top of `src/components/baby-seven/support-view.tsx`. When you flip it to `true`, the page instantly renders the full Smart Payment Card dashboard (no other code changes needed).
- Smart Payment Card (live, when `IS_LIVE = true`): glass-morphism 2×2 grid of peer-to-peer payment tiles — Binance (Copy ID), PayPal (Pay Now link), MiniPay/Celo (live QR code via `next/dynamic` ssr:false), USDT BEP-20 (Copy Address).
- Security footer with the exact lock/security messages from the spec.

> 💡 The hidden Admin Studio (footer "Studio Access" link, PIN `babyseven`) shows the live subscriber count and a "SUPPORT HUB: MAINTENANCE MODE" banner so you can see the switch state at a glance.

### Hidden admin studio
- Access via the discreet "Studio Access" link in the footer or the URL hash `#admin`.
- PIN-gated (`babyseven` for demo — replace with NextAuth in production).
- Two tabs: **Reel Editors** and **Collaborations**.
- Pipeline actions: advance an editor through `Pending → Shortlisted → Hired`, or delete either record.

### UX niceties
- Floating "Support" FAB (pulses every 3s).
- Scroll-to-top button (appears after 300px scroll).
- Sticky footer (sticks to viewport bottom on short pages, pushes down naturally on long pages).
- Framer Motion page transitions + staggered card animations throughout.

---

## 🛠 Tech Stack

| Layer | Choice |
|---|---|
| Framework | **Next.js 16** (App Router) + TypeScript |
| Styling | **Tailwind CSS 4** + shadcn/ui + custom theme tokens |
| Animation | **Framer Motion** |
| Charts | **chart.js** + **react-chartjs-2** |
| Forms | **react-hook-form** |
| Theme | **next-themes** |
| Database | **Prisma ORM** + SQLite (portable to Neon Postgres by changing the datasource in `prisma/schema.prisma`) |
| QR codes | **qrcode.react** (dynamic import, ssr:false) |
| Icons | **lucide-react** + **react-icons** (Fa, Si) |

> The original v2.0 spec asked for **Next.js 14 + Neon + Drizzle**. This build targets the local environment which is locked to **Next.js 16 + Prisma + SQLite**. The schema in `prisma/schema.prisma` is portable: switch the `datasource` block to `postgresql` + your Neon URL and run `bun run db:push` to deploy on Neon.

---

## 🚀 Getting started

```bash
# 1. Install deps
bun install

# 2. Set up the database
bun run db:push        # sync the Prisma schema
bun run scripts/seed.ts  # seed 8 projects, 4 testimonials, 5 reel editors

# 3. Start the dev server
bun run dev
# → http://localhost:3000
```

### Environment
Create a `.env` file in the project root (it's already gitignored):

```bash
# SQLite (current — local file)
DATABASE_URL="file:/home/z/my-project/db/custom.db"

# OR Neon Postgres (production) — swap to this when deploying to Vercel
# DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/babyseven?sslmode=require"
```

---

## 📂 Project structure

```
prisma/
  schema.prisma                  # Collaboration, ReelEditor, Project, Testimonial, PageView, NotifySubscriber
scripts/
  seed.ts                        # Cinematic starter content
  reset-db.ts                    # Wipe all tables (for idempotent re-seeds)
src/
  app/
    api/
      collaborations/             # GET list, [id] DELETE
      editors/                    # GET list, POST apply, [id] PATCH status + DELETE
      notify/                     # GET count, POST subscribe (idempotent)
      projects/                   # GET (filter by category, featured, pin #1 first)
      stats/                      # Aggregate counts for the homepage
      testimonials/               # GET all
    layout.tsx                    # Orbitron + Inter + ThemeProvider + SEO meta + theme-color
    page.tsx                      # SPA shell + Framer Motion page transitions
    globals.css                   # Cinematic dark/light theme tokens
  components/baby-seven/         # All custom Baby Seven UI components
  lib/
    db.ts                         # Prisma client
    nav.ts                        # Zustand SPA view store (incl. hidden admin)
    utils.ts                      # cn(), copyToClipboard, truncateAddress, formatBudget, categoryLabel
```

---

## 🔌 API

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/projects?category=Writing&featured=true` | List projects; pin Blood Disaster first |
| `POST` | `/api/collaborate` | Submit a general collaboration request |
| `GET` | `/api/collaborations` | (admin) list all collab requests |
| `DELETE` | `/api/collaborations/[id]` | (admin) remove a collab request |
| `GET` | `/api/editors?status=Pending` | List reel-editor applicants |
| `POST` | `/api/editors` | Submit a reel-editor application |
| `PATCH` | `/api/editors/[id]` | (admin) update editor status (`Pending`/`Shortlisted`/`Hired`) |
| `DELETE` | `/api/editors/[id]` | (admin) remove an editor |
| `GET` | `/api/notify` | (admin) get launch-alert subscriber count |
| `POST` | `/api/notify` | Subscribe an email to the Support Hub launch alert (idempotent) |
| `GET` | `/api/stats` | Aggregate counts: collaborations, reelEditors, notifySubscribers, projects, featured, testimonials, pageViews |
| `GET` | `/api/testimonials` | List all testimonials |

---

## 🔐 Security notes

- This repo **never** contains API keys, tokens, or `DATABASE_URL` — they live in `.env` which is gitignored.
- The admin PIN (`babyseven`) is for demo only. Replace the `PinGate` with **NextAuth.js** before going to production.
- The Binance/PayPal/USDT addresses shown on the Support page are placeholders for the demo — replace `PAYMENT` in `src/components/baby-seven/support-view.tsx` with your real addresses.

---

## 🌐 Deploying to Cloudflare Pages

This project is configured for **Cloudflare Pages** deployment via
`@cloudflare/next-on-pages@1.13.15`. The full migration guide lives in
[`MIGRATION.md`](./MIGRATION.md) — read it for the complete walkthrough.

**Quick start:**

1. Push the repo to GitHub (do NOT use any token you've previously leaked in chat).
2. Cloudflare Dashboard → Workers & Pages → Create application → Pages →
   Connect to Git → pick the repo.
3. Build settings:
   - **Build command:** `bun run pages:build`
   - **Build output directory:** `.vercel/output/static`
   - **Root directory:** `/`
4. Add `NODE_VERSION = 20` + `DATABASE_URL` env vars in the dashboard.
5. Save and Deploy.

**How the build works:** The `pages:build` script runs
`scripts/pages-build.ts`, which uses a build-time transform
(`scripts/toggle-edge-runtime.ts`) to inject `export const runtime = "edge";`
into every API route file before `@cloudflare/next-on-pages` runs, then
reverts the files in a `finally` block. This means:

- Local `bun run dev` keeps using the Node runtime + Prisma + SQLite (no
  regressions, no `PrismaClientValidationError`).
- Cloudflare's build gets the edge-runtime export it needs, produces a
  successful Cloudflare Pages output, then reverts the working tree.

Production database: **Cloudflare D1** (SQLite-compatible). The Prisma
client in `src/lib/db.ts` auto-detects the `env.DB` binding on Cloudflare
and uses `@prisma/adapter-d1` to run in the edge runtime. D1 migrations
live in `prisma/migrations-d1/`. Apply with
`npx wrangler d1 migrations apply baby-seven-db --remote`.

---

## 📝 License

© Baby Seven Studio. All rights reserved.
