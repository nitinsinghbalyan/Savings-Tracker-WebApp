# SavingIt — Project Memory

This folder is the **single source of truth** for product context, requirements, architecture, and conventions. Use it to onboard contributors and to give AI assistants durable project memory across sessions.

## Documents

| File | Purpose |
|------|---------|
| [context.md](./context.md) | Vision, problem statement, target users, product boundaries |
| [features.md](./features.md) | Feature inventory: shipped, in progress, planned |
| [srs.md](./srs.md) | Software Requirements Specification |
| [architecture.md](./architecture.md) | Tech stack, folder structure, layout patterns, data flow |
| [data-model.md](./data-model.md) | Planned Supabase schema and domain entities |
| [conventions.md](./conventions.md) | Coding, UI, INR, and form conventions |
| [roadmap.md](./roadmap.md) | Phased delivery plan |
| [out-of-scope.md](./out-of-scope.md) | Explicit non-goals |
| [glossary.md](./glossary.md) | Domain terms and abbreviations |
| [auth.md](./auth.md) | Supabase Auth flows, files, and route protection |
| [schema.md](./schema.md) | Postgres tables, RLS, indexes (migration 001) |
| [calculations.md](./calculations.md) | Pure TS savings math and health status |
| [plans.md](./plans.md) | Plan CRUD, list, detail, `lib/plans` enrichment |
| [transactions.md](./transactions.md) | Log contributions/withdrawals/adjustments |
| [dashboard.md](./dashboard.md) | Dashboard aggregates, chart, quick actions |
| [insights.md](./insights.md) | Health score, simulator, allocation |
| [settings.md](./settings.md) | Profile, CSV export, danger zone, logout |
| [changelog.md](./changelog.md) | Append-only history of project changes |
| [deploy.md](./deploy.md) | Vercel + Supabase deployment checklist |
| [expenses.md](./expenses.md) | v2 expense logging (planned) |
| [cashflow.md](./cashflow.md) | v2 income / spent / saved / surplus metrics (planned) |

## How to use

1. **Before starting work** — read `context.md`, `features.md`, and the relevant section of `srs.md`.
2. **When adding a feature** — update `features.md` and `roadmap.md` status.
3. **When changing schema or APIs** — update `data-model.md` and `architecture.md`.
4. **When refining rules** — update `conventions.md`.
5. **After shipping a feature** — append to `changelog.md`; update status sections (do not rewrite whole docs).

## Current status

- **Shipped (v1):** Savings MVP — auth, plans, savings transactions, dashboard, insights, settings, mobile/PWA, Vercel deploy prep (Phases 2–5 largely complete; see [roadmap.md](./roadmap.md))
- **Planned (v2):** Manual **expense + cash-flow** layer — [expenses.md](./expenses.md), [cashflow.md](./cashflow.md); Phase 6 not started in code
- **Version:** 0.1.0+
- **Brand (UI):** RupeeRise — metadata, manifest, auth layout (repo package name may still be `savingit`)
- **Database:** Migration `001_initial_schema.sql` shipped in repo; apply to hosted Supabase if not done; `002_expenses` planned
- **Plans:** List, detail, create; edit still stub (`updatePlan` not wired)
- **Savings log:** `/transactions/new` — CONTRIBUTION / WITHDRAWAL / ADJUSTMENT
- **Deploy:** Vercel-ready — [deploy.md](./deploy.md)

Last updated: 2026-05-23 (memory sync: expense + savings direction, stale doc fixes)
