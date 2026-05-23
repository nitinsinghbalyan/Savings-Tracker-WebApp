# RupeeRise

RupeeRise is a mobile-first, responsive web app for tracking INR savings across multiple plans. Log contributions and withdrawals, monitor progress toward goals, and review savings insights — all in one place.

This is a **responsive web app** hosted on Vercel. It is not a native iOS or Android application.

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4, shadcn/ui |
| Auth & database | Supabase (Auth + Postgres) |
| Charts | Recharts |
| Forms | react-hook-form, zod |
| Dates | date-fns |
| Toasts | Sonner |
| Deployment | Vercel |

## Features (V1)

- Email/password authentication
- Multiple savings plans with categories, priorities, and targets
- Contribution, withdrawal, and adjustment logging
- Dashboard with aggregates and monthly savings chart
- Plan detail with progress, projections, and transaction history
- Insights: health score, recommendations, simulator, allocation
- Settings: profile, CSV export, bulk delete, logout
- Mobile-optimized UI with bottom navigation and PWA manifest

## Excluded from V1

The following are **explicitly out of scope** for this release:

- Bank account linking
- UPI automation
- Account Aggregator integration
- Investment recommendations
- Expense tracking
- Credit score features
- Complex family sharing
- Native iOS or Android apps

## Prerequisites

- Node.js 20+
- npm
- A [Supabase](https://supabase.com) project

## Environment variables

Copy the example file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL (Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key (Settings → API) |
| `NEXT_PUBLIC_APP_URL` | No | Public app URL for metadata/Open Graph (e.g. `https://your-app.vercel.app`) |

Environment variables are validated at server startup via `src/lib/env.ts`. Missing or invalid values produce a clear error message.

## Supabase setup

1. Create a new project at [supabase.com](https://supabase.com).
2. Open **Settings → API** and copy the **Project URL** and **anon public** key into `.env.local`.
3. Apply the database migration (see [Database migration](#database-migration) below).
4. In **Authentication → Providers**, ensure **Email** is enabled.
5. In **Authentication → URL configuration**, set:
   - **Site URL**: your production URL (e.g. `https://your-app.vercel.app`)
   - **Redirect URLs**: add `http://localhost:3000/**` for local dev and your production URL

Row Level Security (RLS) policies are included in the migration — each user can only access their own data.

## Local development

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Unauthenticated users are redirected to `/auth/login`.

Other scripts:

```bash
npm run build   # Production build
npm run start   # Start production server locally
npm run lint    # ESLint
```

## Database migration

The initial schema lives in:

```
supabase/migrations/001_initial_schema.sql
```

### Option A — Supabase SQL Editor (recommended for first setup)

1. Open your Supabase project → **SQL Editor**.
2. Paste the contents of `supabase/migrations/001_initial_schema.sql`.
3. Run the script.

This creates `profiles`, `savings_plans`, and `savings_transactions` tables with RLS policies and triggers.

### Option B — Supabase CLI

If you use the [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase link --project-ref your-project-ref
supabase db push
```

## Deploy to Vercel

1. Push the repository to GitHub (or GitLab/Bitbucket).
2. Import the project in [Vercel](https://vercel.com/new).
3. Set environment variables in **Project Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (your Vercel deployment URL)
4. Deploy. Vercel auto-detects Next.js — no extra config required.
5. Update Supabase **Authentication → URL configuration** with your Vercel URL.

After deployment, run the database migration against your production Supabase project if you have not already.

## Project structure

```
src/
  app/              # Next.js App Router pages and layouts
  components/       # UI components (layout, forms, dashboard, etc.)
  lib/              # Data fetching, calculations, Supabase, env validation
  config/           # Navigation, plan/transaction options
supabase/
  migrations/       # SQL migration files
public/             # Static assets, manifest, icons
project-memory/     # Product docs and conventions (internal reference)
```

## Amounts

All monetary values are stored internally in **paise** (1 rupee = 100 paise). Display helpers live in `src/lib/format-inr.ts`:

- `formatINR(amountPaise)` — full INR formatting (₹1,23,456.78)
- `formatCompactINR(amountPaise)` — compact lakh/crore formatting

## Additional documentation

Product context, architecture notes, and feature specs are in [`project-memory/`](./project-memory/README.md).

## License

Private project — not licensed for public distribution.
