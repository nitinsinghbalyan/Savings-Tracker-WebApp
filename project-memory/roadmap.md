# Roadmap

## Phase 0 — Base scaffold ✅ (complete)

**Goal:** Project structure, theme, routes, shared components, utilities.

- [x] Next.js App Router + TypeScript + Tailwind + shadcn
- [x] All routes with placeholder content
- [x] AppShell, MobileHeader, BottomNav, EmptyState, StatCard, FAB
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
- [ ] Profile row created on signup
- [x] App queries DB — _partial: `createPlan` inserts into `savings_plans`_

**Exit criteria:** User can sign up, log in, and only see their own data.

**Auth details:** See [auth.md](./auth.md). **Schema:** See [schema.md](./schema.md).

---

## Phase 2 — Plans CRUD 🔄 in progress

**Goal:** Full savings plan lifecycle.

- [ ] List plans from database
- [x] Create plan — full metadata at `/plans/new` via `createPlan`
- [ ] Plan detail with real progress
- [ ] Edit plan (Supabase update)
- [ ] Delete plan (with confirmation)
- [ ] Empty state when no plans (show list when plans exist)

**Exit criteria:** User manages plans end-to-end.

**Plan details:** See [plans.md](./plans.md).

---

## Phase 3 — Contributions

**Goal:** Log and manage savings entries.

- [ ] Log contribution (plan select, amount, date, note)
- [ ] Update plan saved total on contribution CRUD
- [ ] Contribution list on plan detail
- [ ] Edit/delete contribution
- [ ] Dashboard recent activity

**Exit criteria:** Contributions drive dashboard and plan progress.

---

## Phase 4 — Dashboard and insights

**Goal:** Meaningful overview and charts.

- [ ] Dashboard aggregates (total saved, this month, active plans)
- [ ] Insights: monthly savings trend (Recharts)
- [ ] Per-plan breakdown chart
- [ ] Basic projection: months to target at current pace

**Exit criteria:** User gains actionable view of savings behavior.

---

## Phase 5 — Polish and production

**Goal:** Ship-quality MVP on Vercel.

- [ ] Loading and error states
- [ ] Toast notifications for actions
- [ ] Form validation edge cases (NaN amounts)
- [ ] SEO metadata per page
- [ ] Production Supabase + Vercel env
- [ ] Smoke test on mobile devices

**Exit criteria:** Production deploy with real users.

---

## Future (post-MVP)

- Plan categories and icons
- Recurring contribution reminders (email)
- Export CSV
- Light theme toggle
- Multi-currency (unlikely near-term)

Not planned — see [out-of-scope.md](./out-of-scope.md).
