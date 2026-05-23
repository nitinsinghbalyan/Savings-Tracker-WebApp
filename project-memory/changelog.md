# Changelog

Append-only log of meaningful project memory updates. Do not delete prior entries.

---

## 2026-05-23 — Product direction: expense + savings (planned)

**Phase:** 6 (not started in code)

### Direction

- Extend RupeeRise from savings-only to manual **expense + savings cash-flow** tracker
- New docs: [expenses.md](./expenses.md), [cashflow.md](./cashflow.md)
- Separate `expenses` table (migration `002` planned); do not reuse `savings_transactions`

### Re-sync (memory only)

- [data-model.md](./data-model.md) — implementation status: migration 001 shipped
- [srs.md](./srs.md) — `StatCard` removed note
- [out-of-scope.md](./out-of-scope.md) — v2 scope-change section (manual expense logging in scope)

### Still excluded (v2 MVP slice)

- Bank linking, UPI automation, Account Aggregator, category budgets, native iOS/Android apps

---

## 2026-05-23 — Vercel deployment prep & bug fixes

**Phase:** 5 (production readiness)

### Added

- `src/lib/env.ts` — zod validation for `NEXT_PUBLIC_SUPABASE_*`
- `src/instrumentation.ts` — asserts env on Node.js server startup
- `.env.example` — placeholder Supabase vars + optional `NEXT_PUBLIC_APP_URL`
- `src/app/robots.ts` — disallow private routes; allow auth pages
- `src/app/error.tsx`, `src/app/not-found.tsx` — root error boundary and 404
- `src/app/(app)/*/loading.tsx` — route skeletons via `PageSkeleton`
- `src/lib/transactions/parse-transaction-type.ts` — server-safe type parser (moved out of client form)
- `project-memory/deploy.md` — Vercel + Supabase deployment checklist

### Changed

- Root `README.md` — RupeeRise overview, full setup/deploy/migration docs, excluded V1 scope
- `src/app/layout.tsx` — expanded metadata (Open Graph, Twitter, `metadataBase`, `robots`)
- Supabase clients/middleware use `getPublicEnv()` instead of non-null assertions
- `createPlan` / `createTransaction` return `{ success, redirectTo }` (no server `redirect`) for toast + client navigation
- `.env.local.example` — placeholders only (no real keys)
- PWA icons (`public/icons/*.svg`) — rupee glyph via `&#8377;` entity (fixes corrupted `` character)
- Auth layout branding: **RupeeRise**

### Removed (unused)

- `src/components/shared/StatCard.tsx`
- `src/components/insights/insights-chart-placeholder.tsx`
- `next-themes` dependency (app is dark-only; Sonner uses fixed `theme="dark"`)

### Fixed

- `/transactions/new` — server page no longer imports `parseTransactionType` from `"use client"` module

### Docs

- [deploy.md](./deploy.md)

---

## 2026-05-23 — Mobile polish (RupeeRise PWA)

**Phase:** 5 (UX)

### Added

- `src/components/providers/app-providers.tsx` — Sonner `Toaster`
- `src/components/shared/PageSkeleton.tsx`, `ErrorState.tsx`
- `src/lib/form-styles.ts` — `mobileSelectClassName`, `mobileTextareaClassName`
- `public/manifest.json` — `RupeeRise`, standalone, `#0B1120` theme/background
- `public/icons/` — SVG placeholder icons (192, 512, default)
- `globals.css` utilities: `page-content`, `safe-top`, `safe-bottom`, `app-main-padding`, `app-fab-bottom`
- Button `size="touch"` (min 44px height on mobile)

### Changed

- `BottomNav` — sticky, safe-area, 44px tap targets, `aria-current`
- `AppShell` / `MobileHeader` / `FloatingActionButton` — safe-area padding, tighter `px-3` at 360px
- `Input` — `h-11` on mobile, `h-8` on `md+`
- Cards — increased vertical gap/padding
- Toasts on create plan, create transaction, profile update, bulk delete, CSV export
- Page spacing: `page-content` (`gap-5`) on dashboard, insights, settings, plan detail
- App metadata title: **RupeeRise** (was SavingIt in early scaffold)

### Still pending

- Replace SVG icon placeholders with production PNGs for broader PWA support
- Per-route `error.tsx` for fetch failures (root + `(app)` boundaries exist)

---

## 2026-05-23 — Settings page

**Phase:** 5 (partial)

### Added

- `src/lib/settings/` — `getSettingsData`, CSV builders, types
- `src/components/settings/` — profile form, data management, danger zone, logout
- `src/components/ui/alert-dialog.tsx` — confirmation dialogs (shadcn)
- Extended `src/app/(app)/settings/actions.ts` — `updateProfile`, exports, bulk delete

### Behavior

- Profile upsert: full name, monthly income (paise), preferred saving day, currency INR
- CSV export for plans and transactions (client download)
- Delete all transactions or all plans with AlertDialog confirm
- Sign out unchanged (`logout`)

### Docs

- [settings.md](./settings.md)

### Still pending

- Auto-create profile on signup (trigger/hook); first save via settings upsert works

---

## 2026-05-23 — Insights page

**Phase:** 4 (partial)

### Added

- `src/lib/insights/` — health score, streak, simulate, allocate, narrative, `getInsightsData`
- `src/components/insights/` — score card, strengths/weaknesses, recommendations, at-risk, milestones, chart, simulator, allocation
- `PlanWithStats.priority` for allocation sorting

### Behavior

- Savings Health Score 0–100 (pace 30, emergency fund 25, consistency 20, on-track 15, low withdrawals 10)
- Client simulator: extra monthly savings → projected completion per active plan
- Client allocation: greedy split by Critical → Emergency Fund → target date → progress
- No investment advice; savings-plan framing only

### Docs

- [insights.md](./insights.md)

---

## 2026-05-23 — Dashboard page

**Phase:** 4 (partial)

### Added

- `src/lib/dashboard/` — `getDashboardData`, `aggregateDashboardMetrics`, `generateDashboardInsights`, `period-savings`
- `src/components/dashboard/` — greeting, hero, progress, month card, quick actions, chart, active plans, empty state

### Behavior

- Server-fetched plans + transactions; totals, month saved/required, at-risk count
- Recharts 6-month savings bar chart
- Empty state when user has no plans

### Docs

- [dashboard.md](./dashboard.md)

---

## 2026-05-23 — Transactions (log contribution / withdrawal / adjustment)

**Phase:** 3 (partial)

### Added

- `src/app/(app)/transactions/actions.ts` — `createTransaction`
- `src/config/transaction-options.ts` — types and source labels (UPI manual only)
- `src/lib/transactions/estimate-withdrawal-delay.ts`
- Full `TransactionForm` with withdrawal impact warning

### Behavior

- `?planId` / `?type` query prefill; redirect to plan detail when opened from plan
- Rupees → paise; zod validation (plan, amount &gt; 0, date)

### Docs

- [transactions.md](./transactions.md)

---

## 2026-05-23 — Plans list and plan detail

**Phase:** 2 (partial)

### Added

- `src/lib/plans/` — `enrichPlanWithStats`, `enrichPlanDetail`, `getPlansWithStats`, `getPlanDetail`, `filterPlansByTab`
- `src/components/plans/` — PlanCard, PlansView (tabs), detail sections (ring, stats, projection, actions, transaction list)
- `src/app/(app)/plans/[id]/not-found.tsx`
- shadcn `tabs` component

### Behavior

- `/plans` — Active / Completed / Paused tabs with live stats
- `/plans/[id]` — real progress, history, links to `/transactions/new?planId=…`

### Still pending

- `updatePlan` for `/plans/[id]/edit`
- Delete plan

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
