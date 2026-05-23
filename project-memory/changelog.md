# Changelog

Append-only log of meaningful project memory updates. Do not delete prior entries.

---

## 2026-05-23 — Savings plan creation

**Phase:** 2 (partial)

### Added

- `src/app/(app)/plans/actions.ts` — `createPlan` server action
- `src/config/plan-options.ts` — categories, priorities, color presets
- Full `PlanForm` — all 8 fields (react-hook-form + zod + shadcn Card)

### Behavior

- Converts `targetAmountRupees` → `target_amount_paise`
- Inserts into `savings_plans` with authenticated `user_id`
- Redirects to `/plans` on success

### Still pending

- List plans on `/plans` from database
- Edit plan wired to Supabase (`/plans/[id]/edit`)

---

## 2026-05-23 — Savings calculations library

**Phase:** 1–2 (foundation for plans/insights)

### Added

- `src/lib/calculations/types.ts` — transaction and health types
- `src/lib/calculations/savings.ts` — balance, progress, pace, health status (7 functions)
- `src/lib/calculations/projections.ts` — `projectCompletionDate()`

### Notes

- Pure functions; date-fns for month math; amounts in paise
- Not yet imported by dashboard/plan/insights pages

---

## 2026-05-23 — Initial Supabase schema migration

**Phase:** 1 (database)

### Added

- `supabase/migrations/001_initial_schema.sql`

### Schema

- Tables: `profiles`, `savings_plans`, `savings_transactions`, `monthly_snapshots`
- RLS on all tables; plan-ownership check on transactions
- Indexes on `user_id`, `plan_id`, `transaction_date`
- `handle_updated_at()` trigger on profiles and savings_plans

### Apply

Run in Supabase SQL Editor or via Supabase CLI. App inserts into `savings_plans` on plan create.

### Still pending

- Profile auto-create on signup
- List/fetch plans and transactions CRUD from UI

---

## 2026-05-23 — Supabase Auth wired

**Phase:** 1 (partial)

### Added

- `src/middleware.ts` — session refresh + route guards
- `src/lib/supabase/middleware.ts` — `updateSession()` helper
- `src/lib/auth/routes.ts` — protected/auth path helpers
- `src/app/(app)/settings/actions.ts` — `logout()` server action

### Changed

- Login form calls `signInWithPassword`; redirects to `/dashboard`
- Signup form calls `signUp`; redirects if session returned, else shows email confirmation message
- Settings sign-out uses server action → `/auth/login`

### Route protection

- Unauthenticated: `/`, `/dashboard`, `/plans/*`, `/transactions/*`, `/insights`, `/settings` → `/auth/login`
- Authenticated: `/auth/login`, `/auth/signup` → `/dashboard`

### Still pending (Phase 1)

- ~~Postgres migrations~~ → migration file added; apply to Supabase project
- ~~RLS policies~~ → included in migration
- Profile row on signup trigger

---

## 2026-05-23 — Base scaffold (v0.1.0)

- Next.js App Router project initialized
- All placeholder routes, shared components, dark theme, INR utilities
- Supabase client stubs (browser + server)
