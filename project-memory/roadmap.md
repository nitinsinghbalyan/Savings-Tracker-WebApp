# Roadmap

## Phase 0 — Base scaffold ✅ (complete)

**Goal:** Project structure, theme, routes, shared components, utilities.

- [x] Next.js App Router + TypeScript + Tailwind + shadcn
- [x] All routes with placeholder content
- [x] AppShell, MobileHeader, BottomNav, EmptyState, FAB
- [x] Dark fintech theme
- [x] INR format utilities (paise)
- [x] Supabase client stubs
- [x] README and Vercel-ready build

---

## Phase 1 — Auth and database (MVP foundation) 🔄 in progress

**Goal:** Real users and persisted data.

- [x] Supabase project setup (Auth + Postgres) — _Auth wired; migration file ready_
- [x] Migrations: `profiles`, `savings_plans`, `savings_transactions`, `monthly_snapshots`
- [x] RLS policies — _in 001_initial_schema.sql_
- [x] Wire login/signup to Supabase Auth
- [x] Auth middleware: protect `(app)` routes
- [ ] Apply migration to hosted Supabase project
- [ ] Profile row created on signup _(partial: `updateProfile` upsert on first settings save)_
- [x] App queries DB — _plans, transactions, profiles via settings_

**Exit criteria:** User can sign up, log in, and only see their own data.

**Auth details:** See [auth.md](./auth.md). **Schema:** See [schema.md](./schema.md).

---

## Phase 2 — Plans CRUD 🔄 in progress

**Goal:** Full savings plan lifecycle.

- [x] List plans from database — tabs, `getPlansWithStats`, `PlanCard`
- [x] Create plan — full metadata at `/plans/new` via `createPlan`
- [x] Plan detail with real progress — `getPlanDetail`, ring, stats, history
- [ ] Edit plan (Supabase update) — form shell only
- [ ] Delete plan (with confirmation)
- [x] Empty state when no plans (show list when plans exist)

**Exit criteria:** User manages plans end-to-end.

**Plan details:** See [plans.md](./plans.md).

---

## Phase 3 — Contributions 🔄 in progress

**Goal:** Log and manage savings entries.

- [x] Log transaction — CONTRIBUTION / WITHDRAWAL / ADJUSTMENT at `/transactions/new`
- [x] Plan balance derived from transactions (no denormalized column)
- [x] Contribution history on plan detail — `PlanTransactionList`
- [ ] Edit/delete transaction
- [x] Dashboard reflects transaction-driven totals

**Exit criteria:** Contributions drive dashboard and plan progress.

**Details:** See [transactions.md](./transactions.md).

---

## Phase 4 — Dashboard and insights ✅ (MVP scope shipped)

**Goal:** Meaningful overview and charts.

- [x] Dashboard aggregates — [dashboard.md](./dashboard.md)
- [x] Insights: health score, chart, simulator, allocation — [insights.md](./insights.md)
- [ ] Per-plan breakdown chart on insights (dashboard has aggregate chart only)
- [x] Projection: `projectCompletionDate` on detail, dashboard insights, insights simulator

**Exit criteria:** User gains actionable view of savings behavior.

---

## Phase 5 — Polish and production 🔄 in progress

**Goal:** Ship-quality MVP on Vercel.

- [x] Settings page — profile, CSV export, danger zone ([settings.md](./settings.md))
- [x] Loading and error states — `PageSkeleton`, route `loading.tsx`, root + `(app)` error boundaries, `not-found`
- [x] Toast notifications for actions — Sonner on CRUD/export/delete
- [x] Mobile polish — safe-area, 44px targets, bottom nav, `page-content` spacing ([changelog](./changelog.md))
- [x] PWA manifest + placeholder icons — RupeeRise, `#0B1120`
- [x] Env validation — `src/lib/env.ts`, `.env.example`
- [x] Vercel deployment docs — root `README.md`, [deploy.md](./deploy.md)
- [ ] Form validation edge cases (NaN amounts) — partial; profile form uses resolver cast
- [ ] SEO metadata per page — root metadata shipped; per-route titles mostly via `AppShell` title prop only
- [ ] Production Supabase migration applied on hosted project — _operator task_
- [ ] Smoke test on mobile devices — _operator task_
- [ ] Production PNG app icons (SVG placeholders only)

**Exit criteria:** Production deploy with real users.

---

## Future (post-MVP)

- Plan categories and icons
- Recurring contribution reminders (email)
- Export CSV
- Light theme toggle
- Multi-currency (unlikely near-term)

Not planned — see [out-of-scope.md](./out-of-scope.md).

---

## Phase 6 — Expenses & cash flow (planned)

**Goal:** Manual expense logging + unified monthly cash-flow view alongside existing savings MVP.

**Status:** Not started in code (docs only as of 2026-05-23).

### 6.0 — Product & schema docs

- [x] [expenses.md](./expenses.md), [cashflow.md](./cashflow.md)
- [ ] Draft `supabase/migrations/002_expenses.sql`
- [ ] Update `project-memory` scope sections

### 6.1 — Expense MVP

- [ ] Migration `002` applied to Supabase
- [ ] `src/lib/expenses/` — fetch, create, month aggregate
- [ ] `/expenses`, `/expenses/new` — list + log form
- [ ] Dashboard `CashFlowCard` — income / spent / saved / leftover
- [ ] Bottom nav: Add → `/expenses/new`; protect `/expenses/*` in middleware
- [ ] Toasts + empty states for expense routes

**Exit criteria:** User logs expenses and sees monthly spent + surplus on dashboard.

### 6.2 — Expense polish

- [ ] Edit/delete expense (`/expenses/[id]`)
- [ ] Category breakdown chart (month)
- [ ] Export expenses CSV in settings
- [ ] Optional: custom categories in settings

### 6.3 — Cash-flow insights

- [ ] `src/lib/cashflow/` — surplus, savings rate, spend rate
- [ ] Insights narrative includes spend vs income
- [ ] Simulator: reduce category X → surplus impact
- [ ] Allocation nudges when surplus &gt; 0

**Exit criteria:** User understands full money picture (spend + save) in one app.

**Still excluded:** See [out-of-scope.md](./out-of-scope.md) v2 section (bank sync, budgets, native apps).
