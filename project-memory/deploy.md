# Deployment (Vercel + Supabase)

> Operator checklist for production. App is a **responsive web app**, not native iOS/Android.

## Prerequisites

- Supabase project with Auth (email) enabled
- Git repository pushed to GitHub/GitLab/Bitbucket
- Vercel account

## 1. Database (Supabase)

1. Open Supabase → **SQL Editor**
2. Run full script: [`supabase/migrations/001_initial_schema.sql`](../supabase/migrations/001_initial_schema.sql)
3. Confirm tables: `profiles`, `savings_plans`, `savings_transactions`, `monthly_snapshots`

## 2. Supabase Auth URLs

**Authentication → URL configuration:**

| Field | Value |
|-------|--------|
| Site URL | `https://your-app.vercel.app` |
| Redirect URLs | `http://localhost:3000/**`, `https://your-app.vercel.app/**` |

## 3. Environment variables

Required (validated by `src/lib/env.ts`):

| Variable | Where to get it |
|----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public |

Optional:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_APP_URL` | `metadataBase`, Open Graph absolute URLs |

Set in:

- **Local:** `.env.local` (copy from `.env.example`)
- **Vercel:** Project → Settings → Environment Variables (Production + Preview)

Never commit `.env.local` to Git.

## 4. Vercel deploy

1. [vercel.com/new](https://vercel.com/new) → Import Git repo
2. Framework: **Next.js** (auto-detected)
3. Add env vars (step 3)
4. Deploy — build runs `npm run build`
5. Set `NEXT_PUBLIC_APP_URL` to deployment URL; redeploy if added after first deploy

No `vercel.json` required for default Next.js 16 App Router.

## 5. Post-deploy verification

- [ ] `/` redirects to login or dashboard
- [ ] Sign up / log in works
- [ ] Create plan → log transaction → dashboard updates
- [ ] Mobile: bottom nav, safe-area, Add to Home Screen (PWA manifest)
- [ ] Icons show ₹ (not ``) — `public/icons/*.svg` use `&#8377;`

## 6. Common failures

| Symptom | Fix |
|---------|-----|
| Build fails: invalid env | Add both `NEXT_PUBLIC_SUPABASE_*` on Vercel |
| Auth redirect error | Add production URL to Supabase Redirect URLs |
| DB errors / empty data | Run migration 001 on the same Supabase project as env vars |
| `/transactions/new` server error | Ensure `parseTransactionType` imported from `@/lib/transactions/parse-transaction-type`, not client form |

## Excluded from V1 (not deployment blockers)

See [out-of-scope.md](./out-of-scope.md): bank linking, UPI automation, Account Aggregator, investment advice, expense tracking, credit score, complex family sharing, native apps.

## Related docs

- Root [`README.md`](../README.md) — full setup and local dev
- [architecture.md](./architecture.md) — env and folder structure
- [changelog.md](./changelog.md) — deployment prep entry (2026-05-23)
