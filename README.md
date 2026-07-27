# Lifestyle

A personal, single-user Progressive Web App — one place for the different
parts of life that used to live in separate apps and spreadsheets.
**Phase 1: Finance.** Log income and expenses, see your balance and this
month's spending by category, and browse recent transactions. Built
mobile-first so it installs straight to your phone's home screen.

More sections (health, home, goals, whatever comes next) can be added the
same way as Finance was: a Supabase table, a couple of Server Actions, and
a page under `app/(app)/`.

## Stack

- **Next.js 16** (App Router, TypeScript) + Tailwind CSS
- **Supabase** — Postgres only (no Supabase Auth)
- **Vercel** for hosting

## Access model

This is a single-user app, so there's no signup/login flow — just a PIN.
`proxy.ts` (Next.js 16's replacement for `middleware.ts`) blocks every route
until a signed session cookie is present; `/login` sets that cookie once you
enter the correct PIN. All Supabase reads/writes happen server-side with the
**service role key**, which bypasses Row Level Security entirely — this is
safe here specifically because the PIN gate is the only way to reach any of
that server code in the first place.

## 1. Supabase

You already have a Supabase project called **Lifestyle** running. From it
you'll need, under **Project Settings → Data API / API Keys**:

- The **Project URL**
- The **service_role** key (⚠️ not the anon/public key — this one bypasses
  RLS, so never expose it to the browser or commit it anywhere)

Then, in the Supabase SQL Editor, run `supabase/migrations/0001_finance.sql`
from this repo — it creates the `finance_transactions` table.

## 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in:

```
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
APP_PIN=your-pin
SESSION_SECRET=a-long-random-string   # e.g. `openssl rand -hex 32`
CRON_SECRET=a-long-random-string      # e.g. `openssl rand -hex 32`
```

## 3. Run it locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll land on the PIN
screen first.

## 4. Deploy to Vercel

1. Push this repo to GitHub (already done if you're reading this from the
   repo).
2. In Vercel, **Add New → Project**, import the repo — Next.js is
   auto-detected.
3. Add the five environment variables from step 2 under **Environment
   Variables**.
4. Deploy.
5. On your phone, open the URL and use **Add to Home Screen** (iOS Safari)
   or the install prompt (Android Chrome) to install it as an app.

Every push to the branch Vercel is tracking redeploys automatically.

`vercel.json` also registers a daily Vercel Cron job (`/api/cron/subscriptions`)
that posts any due subscription payments automatically — no setup needed
beyond the `CRON_SECRET` env var above.

## Project structure

```
app/
  login/                    PIN entry
  (app)/                    Authenticated shell (header + bottom nav)
    page.tsx                Home — a hub linking into each section
    finance/                Finance: Overview, Transactions, Analytics,
                             Budgets, Goals, Accounts, Categories,
                             Subscriptions, Forecast, Profile
  actions/                  Server Actions (all writes go through these)
  api/cron/subscriptions/   Daily job that posts due subscription payments
proxy.ts                    PIN-gate route protection (Next 16's "middleware")
vercel.json                 Registers the subscriptions cron schedule
lib/
  supabase/server.ts        Server-only Supabase client (service role key)
  session.ts                Signed session cookie for the PIN gate
  icons.ts                  Curated icon set shared by categories/accounts/goals
  subscriptions.ts          Billing-cycle date math shared by the cron job
                             and the manual "pay now" action
  types.ts                  Hand-written Supabase Database types
supabase/migrations/        SQL schema
public/                     manifest.json, icons, service worker (PWA)
```
