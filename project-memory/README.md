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
| [plans.md](./plans.md) | Plan create form, server actions, categories |
| [changelog.md](./changelog.md) | Append-only history of project changes |

## How to use

1. **Before starting work** — read `context.md`, `features.md`, and the relevant section of `srs.md`.
2. **When adding a feature** — update `features.md` and `roadmap.md` status.
3. **When changing schema or APIs** — update `data-model.md` and `architecture.md`.
4. **When refining rules** — update `conventions.md`.
5. **After shipping a feature** — append to `changelog.md`; update status sections (do not rewrite whole docs).

## Current status

- **Phase:** 2 in progress (create plan shipped; list/detail/edit pending)
- **Version:** 0.1.0+
- **Auth:** Email/password login, signup, logout, middleware route protection
- **Database:** Migration file ready; app **inserts** into `savings_plans` on create
- **Plans:** `/plans/new` wired to Supabase via `createPlan`
- **Calculations:** Pure TS library in `src/lib/calculations/` (not wired to UI)
- **Deploy target:** Vercel

Last updated: 2026-05-23
