# Project Memory

Persistent context for the **savings-tracker** app. Use this folder so agents and contributors can pick up where the last session left off.

## Files

| File | Purpose |
|------|---------|
| [srs.md](./srs.md) | Software requirements — scope, users, constraints |
| [features.md](./features.md) | Feature list with status and notes |
| [architecture.md](./architecture.md) | Stack, schema, folder layout, env vars |
| [test-cases.md](./test-cases.md) | Manual and automated test checklist |
| [error-history.md](./error-history.md) | Bugs, fixes, and lessons learned |
| [decisions.md](./decisions.md) | Architecture and product decision log |
| [changelog.md](./changelog.md) | Notable changes by date |

## Update policy

- **Append** new entries; do not delete historical rows unless factually wrong.
- Bump **Last updated** dates when editing a file.
- Mark superseded items with a note rather than removing them.

## How to use

1. **Before starting work** — skim `features.md`, `architecture.md`, and recent `error-history.md` entries.
2. **After shipping a feature** — update `features.md` and `changelog.md`.
3. **After fixing a bug** — add a row to `error-history.md`.
4. **After a design choice** — log it in `decisions.md`.

## Conventions

- Dates: `YYYY-MM-DD`
- Feature status: `planned` · `in-progress` · `done` · `deferred`
- Test result: `pass` · `fail` · `blocked` · `not-run`

## Current snapshot (2026-06-14, Google auth)

- **Live:** [savings-tracker-azure.vercel.app](https://savings-tracker-azure.vercel.app)
- **Stack:** React + Vite + Tailwind + Supabase Auth (email/password + Google OAuth)
- **Auth:** Sign in required; `LoginPage` with **Continue with Google** + email; sign out in header
- **Migrations to run in Supabase (if not done):** `add_currency_color.sql`, then `add_auth.sql`
- **Supabase providers to enable:** Email + **Google** (OAuth client in Google Cloud Console)
- **Redirect URLs:** `http://localhost:5173`, `https://savings-tracker-azure.vercel.app`
- **Git:** local repo on `master`; GitHub remote not connected
- **Sync:** Same account (email or Google) = same goals on any browser; export/import still available

## Current snapshot (2026-06-14, Phase 2 finance)

- **Live:** [savings-tracker-azure.vercel.app](https://savings-tracker-azure.vercel.app) — deployment `dpl_8wdpUKN1mdGTHur37Kxc9iCq1F1A`
- **App type:** Personal finance + savings goals (Phase 2)
- **Navigation:** Bottom tabs — Goals · Activity · Summary · Settings
- **Routes:** `/goals`, `/transactions`, `/summary`, `/settings` (login has no nav)
- **Stack:** React 19 + Vite 8 + Tailwind v3 + Supabase Auth + finance tables
- **Auth:** Email/password + Google OAuth; sign out in **Settings** (not Goals header)
- **Finance:** Bank accounts (ledger), expense/income/transfer transactions, monthly summary, user spending categories
- **Backup:** v2 JSON — goals + accounts + categories + transactions + profile preferences
- **Migrations (run in order in Supabase SQL Editor):**
  1. `add_currency_color.sql` (if needed)
  2. `add_auth.sql`
  3. **`phase2_finance.sql`** (required for Activity/Summary/Settings finance sections)
  4. Optional: `fix_contribution_select_rls.sql`
- **Supabase providers:** Email + Google; redirect URLs: `http://localhost:5173`, production Vercel URL
- **Git:** local repo on `master`; GitHub remote not connected
- **Deploy:** `npx vercel --prod` from `savings-tracker/`

## Current snapshot (2026-06-14, v0.7 polish)

- **Live:** [savings-tracker-azure.vercel.app](https://savings-tracker-azure.vercel.app) — latest deploy `dpl_859p1N6QEu7i6TLV4CJKWRL6ztxw` (smooth rendering session)
- **App name (PWA):** Savings Tracker Lite / Savings Lite
- **Navigation:** Bottom tabs — **Goals** · **Activity** · **Settings** (3 tabs; `/summary` redirects to `/goals`)
- **Goals tab:** Goals grid + **Monthly summary** section (`SummarySection`) with account balances
- **Data cache:** `AppDataProvider` — shared bootstrap cache; persistent tabs via `PersistentTabs`; stale-while-revalidate loading
- **Icons:** Rupee glyph (`rupeeMark.jsx`) — PWA `icon-source.svg`, `favicon.svg`, Activity nav `RupeeIcon`
- **Privacy:** All amount/email masking removed (no `RevealableMoney`)
- **Summary chart:** Horizontal stacked + per-category bars (`CategoryBreakdownChart`); category grouping by `kind:name` dedupe key
- **Categories:** Fast load — `refreshCategories()` is single `getCategories()`; prune runs once in background at bootstrap
- **Balances:** `get_account_balances()` RPC; refreshed after transaction create/update/delete
- **Mobile FABs:** `z-[60]`, `touch-manipulation`, render only when tab active; install prompt uses `pointer-events-none` wrapper
- **Git:** local repo; GitHub remote not connected
- **Deploy:** `npx vercel --prod --yes` from `savings-tracker/`

## Current snapshot (2026-06-14, v0.7.1 modal UX)

- **Live:** [savings-tracker-azure.vercel.app](https://savings-tracker-azure.vercel.app) — latest deploy `dpl_GmRJxcUV5vnoNf7NtXjM1Gegzz3c` (modal scroll-lock session)
- **Prior bundle deploy:** `dpl_9G76wuEeYGzRS8YUTSJeZ4vpkBEt` (sessions 13–16 polish)
- **Modals:** Shared `ModalShell` + `useBodyScrollLock` — body `position: fixed`, ref-counted lock, `touchmove` blocked outside `[data-modal-panel]`
- **Modal forms:** Panel `overflow-hidden`; scroll confined to `.modal-scroll` / `data-modal-scroll` region (`overscroll-contain`)
- **Modal consumers:** `TransactionForm`, `AccountForm`, `GoalForm`, `GoalDetailModal`, `AddMoneyModal`, `ImportBackupModal`
- **Everything in v0.7 polish snapshot still applies** (cache, persistent tabs, rupee icon, horizontal chart, no masking, FAB fixes)

## Current snapshot (2026-06-14, v0.8 finance polish)

- **Live:** [savings-tracker-azure.vercel.app](https://savings-tracker-azure.vercel.app) — latest **deployed** `dpl_7dAcpAxeSrYu56Qm8vL23NXrxjzP`
- **Prior deploy:** `dpl_9cMTc1xvgNFSTP9JHS65KiK2JH1w` (settings UI, bottom nav autohide, Lucide rupee)
- **Local-only (post-deploy):** Net = balances + income − expenses; PWA cold-start fix; income → goal on transaction; savings category
- **Settings:** Inline currency/month prefs; category chips; email-only account; savings category toggle (expense tab)
- **Icons:** Lucide `IndianRupee` in-app + PWA/favicon SVG (stroke ₹ on `#4f46e5`)
- **Modals:** Bottom nav auto-hides via `ShellChromeProvider` + `hideBottomNav` on goal/transaction forms
- **Summary Net:** `balances + income − expenses` per currency
- **Migrations:** `phase2_finance.sql` then optional `add_category_is_savings.sql`
- **Deploy:** `npx vercel --prod --yes` from `savings-tracker/`

## Current snapshot (2026-06-14, v0.8.2 finance polish)

- **Live:** [savings-tracker-azure.vercel.app](https://savings-tracker-azure.vercel.app) — latest **deployed** `dpl_48F1c9qrJvjbAKDimti8vA2WqvbG` (Net = balances)
- **Local-only (post-deploy):** expense → goal on transaction (session 25)
- **Navigation:** Bottom tabs — **Goals** · **Activity** · **Settings** (3 tabs; `/summary` redirects to `/goals`)
- **Summary formulas:** Income/Expenses = monthly activity; Savings = savings-category expenses + goal contributions; Net = account balances; one-time INR ₹15k offset per user on first summary view (`localStorage`)
- **Transaction → goal:** Optional goal chips on new expense **and** income transactions (`transactionGoal.js`)
- **Savings categories:** `categories.is_savings`; migration **applied** on production Supabase
- **Settings:** Inline currency/month prefs; category chips; email-only account; savings category toggle
- **Icons:** Lucide `IndianRupee` in-app + PWA/favicon SVG
- **Data cache:** `AppDataProvider` + `PersistentTabs`; stale-while-revalidate loading
- **Migrations (order):** `phase2_finance.sql` → optional `fix_contribution_select_rls.sql` → `add_category_is_savings.sql` (applied)
- **Git:** local repo; GitHub remote not connected
- **Deploy:** `npx vercel --prod --yes` from `savings-tracker/`

## Current snapshot (2026-06-14, v0.9 summary polish)

- **Live:** [savings-tracker-azure.vercel.app](https://savings-tracker-azure.vercel.app) — latest **deployed** `dpl_J8AYJzLDifXG1a5i8CVhrMQ72BZT`
- **Navigation:** Bottom tabs — **Goals** · **Activity** · **Settings** (3 tabs; `/summary` redirects to `/goals`)
- **Monthly summary metrics:** Income · Expenses · Savings (categories) · Goals · **Total balance** (no savings rate)
- **Total balance** = sum of active account balances per currency (matches Settings → Balances)
- **Goals this month** — per-goal contribution list below summary cards
- **Transaction → goal:** Optional goal chips on new expense and income transactions
- **No Net offset** — one-time ₹15k adjustment removed (session 29)
- **PWA:** Force-close after deploy to pick up new bundle; white-screen fix session 27 (`useState` import)
- **Migrations:** `phase2_finance.sql` required; `add_category_is_savings.sql` applied; `add_net_balance_adjustment.sql` applied (column unused after offset removal)
- **Git:** local repo; GitHub remote not connected
- **Deploy:** `npx vercel --prod --yes` from `savings-tracker/`

## Current snapshot (2026-06-16, v0.9.1 category bar charts)

- **Live:** [savings-tracker-azure.vercel.app](https://savings-tracker-azure.vercel.app) — latest **deployed** `dpl_4bydxU1xLQW6ph2pFbBTN2qWj3Fm`
- **Spending by category:** `CategoryBreakdownChart` now renders **vertical bar charts** (per-category bars + compact labels + legend), replacing horizontal stacked/per-category bars
- **Everything in v0.9 snapshot still applies** (3 tabs, summary metrics, total balance, goals split, no savings rate, no Net offset)
- **No new migrations** since v0.9
- **Next features:** none committed; budgets deferred (session 33). See `features.md` candidate list
- **Deploy:** `npx vercel --prod --yes` from `savings-tracker/`

## Current snapshot (2026-06-16, v0.10 category budgets)

- **Live:** [savings-tracker-azure.vercel.app](https://savings-tracker-azure.vercel.app) — latest **deployed** `dpl_6Ha3rUxhexj1KefwAZLsNLMpuvt3`
- **Category budgets:** monthly cap per expense category (`categories.monthly_budget`); set in **Settings → Budgets**
- **Summary chart:** dashed budget target line on each bar; bar turns rose when over budget; legend shows `spent / budget` + "over by X"; header shows total spent / total budget
- **Aggregation:** `monthlySummary.buildMonthlySummary` returns `expenseBudgetTotal` and per-item `budget`
- **Migrations:** `phase2_finance.sql` required; `add_category_is_savings.sql` applied; `add_category_budget.sql` **applied**; `add_net_balance_adjustment.sql` applied (unused)
- **Everything in v0.9.1 still applies** (vertical category bar charts, 3 tabs, total balance, goals split)
- **Deploy:** `npx vercel --prod --yes` from `savings-tracker/`

## Current snapshot (2026-06-16, v0.10 deploy)

- **Live:** [savings-tracker-azure.vercel.app](https://savings-tracker-azure.vercel.app) — latest **deployed** `dpl_5omZmdhEkxa43YcojQAsjGs3oX2R`
- **No code changes** since v0.10 category budgets (`dpl_6Ha3rUxhexj1KefwAZLsNLMpuvt3`); production redeploy session 35
- **Everything in v0.10 snapshot still applies**

## Current snapshot (2026-06-16, v0.10.2 deploy)

- **Live:** [savings-tracker-azure.vercel.app](https://savings-tracker-azure.vercel.app) — latest **deployed** `dpl_H3ZAQPpHAcUPAv8RN2VbZfBnKWp5`
- **No code changes** since v0.10 deploy session 35; production redeploy session 36

## Current snapshot (2026-06-16, v0.10.1 default-currency summary)

- **Local-only (not deployed):** monthly summary shows **default currency only** (`profile.default_currency`, usually INR); no separate USD summary block; balance list under summary matches same currency
- **Everything in v0.10.2 deploy snapshot still applies** (category budgets, vertical bar charts, etc.)
- **Deploy:** `npx vercel --prod --yes` from `savings-tracker/`

## Current snapshot (2026-06-16, v0.10.1 production)

- **Live:** [savings-tracker-azure.vercel.app](https://savings-tracker-azure.vercel.app) — latest **deployed** `dpl_3vXo8iDvn63rboSRJ5ZLwWY5DMrT`
- **Monthly summary:** default currency only (`profile.default_currency`, usually INR); no separate USD summary block; balance list under summary matches same currency
- **Everything in v0.10 snapshot still applies** (category budgets, vertical bar charts, 3 tabs, total balance, goals split)
- **Deploy:** `npx vercel --prod --yes` from `savings-tracker/`

## Current snapshot (2026-06-16, v0.10.2 goal save fix)

- **Live:** [savings-tracker-azure.vercel.app](https://savings-tracker-azure.vercel.app) — latest **deployed** `dpl_8bxRorY2gXGbBSMfTmLWeFX9rtwe`
- **Goal save fix:** two-query goals+contributions load; optimistic cache merge on mutations; contribution RLS backfill applied on prod Supabase
- **Everything in v0.10.1 snapshot still applies** (default-currency summary, category budgets, vertical bar charts)
- **Deploy:** `npx vercel --prod --yes` from `savings-tracker/`

## Current snapshot (2026-06-16, v0.10.3 tx edit + goal contribution)

- **Live:** [savings-tracker-azure.vercel.app](https://savings-tracker-azure.vercel.app) — latest **deployed** `dpl_4CxBcnXQ1yK6bfznUpV6DrBCFxu2`
- **Activity edit:** transaction modal portals to body; stays on Activity tab when editing
- **Tx → goal:** INR→USD fallback FX; zero-amount guard; contribution refresh no longer drops saved amounts
- **Everything in v0.10.2 snapshot still applies**
- **Deploy:** `npx vercel --prod --yes` from `savings-tracker/`

## Current snapshot (2026-06-16, v0.11.2 focus flash fix)

- **Live:** [savings-tracker-azure.vercel.app](https://savings-tracker-azure.vercel.app) — latest **deployed** `dpl_D6Jdkdj5bMfYmXLvyPhSSDEVKmeq`
- **No flash on browser tab switch:** silent token refresh; cache preserved until sign-out
- **Everything in v0.11.1 snapshot still applies** (chart containment, in-app tab SWR cache)
- **Deploy:** `npx vercel --prod --yes` from `savings-tracker/`

## Current snapshot (2026-06-16, v0.11.1 chart + tab flash fix)

- **Live:** [savings-tracker-azure.vercel.app](https://savings-tracker-azure.vercel.app) — latest **deployed** `dpl_G63rco3hVp95zEB9Bscz5MpCiPhh`
- **Chart overflow fix:** category bars contained in Goals sidebar on desktop
- **Tab flash fix:** stale-while-revalidate tx cache; PersistentTabs preserve scroll
- **Deploy:** `npx vercel --prod --yes` from `savings-tracker/`

## Current snapshot (2026-06-16, v0.11 desktop-first)

- **Live:** [savings-tracker-azure.vercel.app](https://savings-tracker-azure.vercel.app) — latest **deployed** `dpl_3bXvRfoZsDjq6FZJRfyFf1eSjYBz`
- **Desktop (lg+):** left sidebar nav; two-column Goals/Activity/Settings; header CTAs replace FABs; centered modals + top-right toasts
- **Mobile/PWA:** unchanged below 1024px (bottom nav, FABs, bottom sheets)
- **Deploy:** `npx vercel --prod --yes` from `savings-tracker/`

## Current snapshot (2026-06-23, v0.12 finance feature pack)

- **Live:** [savings-tracker-azure.vercel.app](https://savings-tracker-azure.vercel.app) — latest **deployed** `dpl_12u4qX5Q7gNcmSTN6PsHGFo3VdSd`
- **Activity tab Overview:** collapsible block with `NetWorthCard` (12-month reconstructed timeline) + `InsightCards` (month-over-month deltas, budget alerts)
- **Activity filters:** text search, account dropdown, amount min/max — client-side on loaded month
- **Goal forecasting:** `getForecast()` on `GoalCard` — trailing 3-month pace, est. completion vs deadline
- **Full history cache:** `loadHistory` / `useTransactionHistory` — all transactions for net worth + insights; stale on tx/account mutations
- **Net worth:** reconstructed from ledger + current balances per currency (no snapshot table / no migration)
- **Skipped:** recurring transactions (needs new table)
- **Everything in v0.11.2 snapshot still applies** (desktop shell, tab/focus stability, category budgets)
- **Deploy:** `npx vercel --prod --yes` from `savings-tracker/`

## Current snapshot (2026-06-23, v0.12.1 goals summary bars)

- **Live:** [savings-tracker-azure.vercel.app](https://savings-tracker-azure.vercel.app) — latest **deployed** `dpl_CV9D4vX2mQn83gWEN7ajfB4egr1X`
- **`GoalsProgressBars`** in `SummarySection` sidebar — all goals as horizontal bars, sorted lowest-% first
- **Removed:** aggregate `ProgressPieChart` on Goals main column; "Goals this month" dollar list in summary (monthly goal $ still in stat grid)
- **Deploy:** `npx vercel --prod --yes` from `savings-tracker/`

## Current snapshot (2026-06-23, v0.12.2 transaction add fix)

- **Live:** [savings-tracker-azure.vercel.app](https://savings-tracker-azure.vercel.app) — latest **deployed** `dpl_asdLrUn7GsVKVUNEX7YmQhbHtwk9`
- **Transaction add fix:** `TransactionForm` resets when categories load; optimistic merge into tx cache; `getPeriodForDate()` for correct month invalidation; auto-switch month / clear type·account filters after add
- **Transfer create:** fetches single row by id (no full-ledger refetch)
- **Prior deploys:** `dpl_BrDv9LqEZP25gdcTSULBYMu1b3AA` (same fix), `dpl_CV9D4vX2mQn83gWEN7ajfB4egr1X` (goals bars)
- **Everything in v0.12.1 snapshot still applies**
- **Deploy:** `npx vercel --prod --yes` from `savings-tracker/`

## Current snapshot (2026-06-23, v0.12.3 remove Activity overview)

- **Activity tab:** month picker, type chips, search/account/amount filters, transaction list only — no Overview / net worth / insights block
- **Removed:** `NetWorthCard`, `InsightCards`, `LineChart`, full-ledger `loadHistory` cache, `ProgressPieChart.jsx` (orphan)
- **Tx cache keys:** `|` delimiter + `parseTransactionsCacheKey()` for UUID-safe `mergeTransactionIntoCache`
- **Prior production:** `dpl_asdLrUn7GsVKVUNEX7YmQhbHtwk9` (v0.12.2)
- **Live:** `dpl_UESw1RoWFExdYPKfvyNsSaQzQS1a` — https://savings-tracker-azure.vercel.app
- **Everything in v0.12.2 snapshot still applies** (transaction add fix, goals bars, forecasting on goal cards)
- **Deploy:** `npx vercel --prod --yes` from `savings-tracker/`

## Current snapshot (2026-06-23, v0.13 categories recurring banks)

- **Migration required:** run `supabase/add_subcategories_recurring_bank.sql` in Supabase SQL Editor
- **Categories:** `/settings/categories` — parent + sub-categories, delete any/all, optional starter pack
- **Recurring:** `/settings/recurring` — weekly/monthly/yearly rules; auto-post on open; pause/skip
- **Bank icons:** ICICI, SBI, HDFC, Axis on account form and cards
- **Prior production:** `dpl_UESw1RoWFExdYPKfvyNsSaQzQS1a` (v0.12.3)
- **Deploy:** `npx vercel --prod --yes` from `savings-tracker/`

## Current snapshot (2026-06-23, v0.13.1 production + migration fix)

- **Live:** [savings-tracker-azure.vercel.app](https://savings-tracker-azure.vercel.app) — latest **deployed** `dpl_FeHGJsUPndg94gMdPag3xoXZW8wD`
- **Migration:** `supabase/add_subcategories_recurring_bank.sql` — must `DROP FUNCTION get_account_balances()` before recreate (included in file); run full script or function block only if schema parts already applied
- **Categories / recurring / banks:** same as v0.13 snapshot above — requires migration on Supabase before features work in production DB
- **Prior production:** `dpl_UESw1RoWFExdYPKfvyNsSaQzQS1a` (v0.12.3 — overview removal only)
- **Everything in v0.12.3 snapshot still applies** (no Activity overview, tx cache UUID fix, transaction add fix, goals bars, goal forecasting)
- **Deploy:** `npx vercel --prod --yes` from `savings-tracker/`

## Current snapshot (2026-06-23, v0.14 UX polish)

- **Live:** [savings-tracker-azure.vercel.app](https://savings-tracker-azure.vercel.app) — latest **deployed** `dpl_35QfDCM9dFrooiG4DYNYDF6kvT81`
- **Goals tab:** `GoalsProgressBars` in main column — days left, click opens `GoalDetailModal`; no inline `GoalCard` grid; not duplicated in summary sidebar
- **Activity:** pagination 10/50/100; Edit + Delete on same row as amount
- **Recurring:** daily frequency supported — run `add_recurring_daily_frequency.sql` if DB predates session 49
- **Categories:** `/settings/categories` — horizontal chip groups per parent (compact)
- **Prior production:** `dpl_FeHGJsUPndg94gMdPag3xoXZW8wD` (v0.13.1)
- **Everything in v0.13.1 snapshot still applies** (sub-categories, recurring, banks, migration DROP FUNCTION fix)
- **Deploy:** `npx vercel --prod --yes` from `savings-tracker/`

## Current snapshot (2026-06-23, v0.15 Home + Summary tabs)

- **Live:** [savings-tracker-azure.vercel.app](https://savings-tracker-azure.vercel.app) — latest **deployed** `dpl_9aMD9x3TVwRBRNeFkkPWhgvfiYz2` (full-width chart + label fix); session 56 tab merge built locally — redeploy to ship
- **Navigation (3 tabs):** **Home** `/goals` · **Summary** `/summary` · **Settings** `/settings`
- **Home:** goals (`GoalsProgressBars`, days left, detail modal) + Activity (transactions, filters, pagination) on one page
- **Summary:** monthly stats, full-width `CategoryBreakdownChart`, income by category, balances
- **Redirects:** `/transactions` → `/goals` (keeps `?month=YYYY-MM`)
- **Prior production:** `dpl_35QfDCM9dFrooiG4DYNYDF6kvT81` (v0.14)
- **Everything in v0.14 snapshot still applies** (modal goals, daily recurring, horizontal categories, etc.)
- **Deploy:** `npx vercel --prod --yes` from `savings-tracker/`

## Current snapshot (2026-06-23, v0.16 category pie chart)

- **Local-only (not deployed):** spending-by-category chart is an **SVG pie chart** (session 57)
- **`CategoryBreakdownChart`** — pie slices sized by share of monthly spending; category colors from `COLOR_PALETTES.fill`; over-budget slices rose; legend list unchanged (amount, %, budget overage)
- **`constants.js`** — each color palette includes `fill` hex for SVG
- **Removed:** vertical bar chart layout, `compact` prop (chart only on Summary tab)
- **Prior production:** `dpl_9aMD9x3TVwRBRNeFkkPWhgvfiYz2` (v0.15)
- **Everything in v0.15 snapshot still applies** (Home + Summary tabs, goals modal, pagination, etc.)
- **No new migrations**
- **Deploy:** `npx vercel --prod --yes` from `savings-tracker/`

## Current snapshot (2026-06-23, v0.17 chart settings + production)

- **Live:** [savings-tracker-azure.vercel.app](https://savings-tracker-azure.vercel.app) — latest **deployed** `dpl_JAuw2D4fW8sw1RnA1KUFG6mtmx62` (pie chart + chart settings; session 58–59)
- **Chart settings:** gear icon top-right on `CategoryBreakdownChart` — pie/donut, legend sort (amount/name), show/hide category list; prefs in `localStorage` (`savings-lite-chart-preferences`)
- **Donut mode:** center label shows monthly expense total
- **Prior production:** `dpl_9aMD9x3TVwRBRNeFkkPWhgvfiYz2` (v0.15); `dpl_DawZTmogb4sjHG6mPTgJDv36NNGR` (session 56 tab merge, if shipped before v0.17)
- **Everything in v0.16 snapshot still applies** (SVG pie, `COLOR_PALETTES.fill`, no bar chart)
- **Git:** local repo on `master`; no GitHub remote
- **Deploy:** `npx vercel --prod --yes` from `savings-tracker/`

## Current snapshot (2026-06-23, v0.17.1 slice hover tooltip)

- **Local-only (not deployed):** hover/focus on pie/donut slice shows rich tooltip (name, amount, %, budget, over-by)
- **UX:** non-hovered slices dim; hovered slice thicker stroke; tooltip anchored at slice midpoint; keyboard-focusable slices
- **Prior production:** `dpl_JAuw2D4fW8sw1RnA1KUFG6mtmx62` (v0.17 — pie + settings, no hover tooltip yet)
- **Everything in v0.17 snapshot still applies**
- **Deploy:** `npx vercel --prod --yes` from `savings-tracker/`

## Current snapshot (2026-06-23, v0.18 resizable chart + summary trim)

- **Local-only (not deployed):** bigger center-aligned pie; user-resizable; Income by category list removed from Summary
- **Chart size:** default **380px** (200–560); drag handle bottom-right **or** settings slider; persisted in `chartPreferences.size`
- **Layout:** chart always **center aligned** (removed desktop left align)
- **Summary tab:** stat grid still shows Income total; **no** separate “Income by category” card
- **Bundle also includes (unshipped):** v0.17.1 slice hover tooltip (session 60)
- **Prior production:** `dpl_JAuw2D4fW8sw1RnA1KUFG6mtmx62` (v0.17)
- **Everything in v0.17.1 snapshot still applies** (hover tooltip, chart settings, pie/donut)
- **Deploy:** `npx vercel --prod --yes` from `savings-tracker/`

## Current snapshot (2026-07-04, v0.19 Phase 2 commit + daily recurring fix)

- **Git:** `master` at `f912255` — Phase 2 finance app committed locally (114 files); **no GitHub remote** (`origin` not configured)
- **Daily recurring fix (session 62):** `normalizeRecurringSchedule()`; idempotent frequency CHECK in SQL migrations; form shows interval unit; friendly error if DB migration missing
- **Migration:** run `supabase/add_recurring_daily_frequency.sql` in Supabase SQL Editor if daily rules still fail (or re-run frequency block at end of `add_subcategories_recurring_bank.sql`)
- **Build:** `npm run build` passes after clean `npm install` if Rolldown/vite binary issues occur
- **Prior production:** `dpl_JAuw2D4fW8sw1RnA1KUFG6mtmx62` (v0.17 — pie + settings)
- **Everything in v0.18 snapshot still applies** (resizable chart, summary trim, hover tooltip)
- **Not deployed:** session 62 app + migration fixes local only
- **Deploy:** `npx vercel --prod --yes` from `savings-tracker/` after Supabase migration

## Current snapshot (2026-07-04, v0.20 separate tabs + category snapshots)

- **Navigation:** 4 tabs — **Goals** `/goals` · **Activity** `/transactions` · **Summary** `/summary` · **Settings** `/settings` (session 63; supersedes merged Home tab from session 56)
- **Goals tab:** all goals shown (INR + USD); no `preferredCurrency` filter on `GoalsProgressBars`
- **Activity tab:** standalone `TransactionsPage`; `?month=YYYY-MM` on `/transactions`
- **Category snapshots:** `add_transaction_category_snapshot.sql` required; past transactions keep label on category delete/rename
- **Prior snapshot:** v0.19 (Phase 2 commit `f912255`, daily recurring fix)
- **Not deployed:** session 62–63 local only
- **Migrations to run:** `add_recurring_daily_frequency.sql`, `add_transaction_category_snapshot.sql` (if not yet applied)
- **Deploy:** `npx vercel --prod --yes` after Supabase migrations

## Current snapshot (2026-07-04, v0.21 Activity table polish)

- **Activity pagination:** bottom of list only (session 64)
- **Activity table (desktop):** aligned columns — Description · Account · Amount · Actions via `TRANSACTION_TABLE_GRID`
- **Transaction actions:** Pencil/Trash2 icon buttons with accessible labels
- **Prior snapshot:** v0.20 (4-tab nav, category snapshots, all-currency goals)
- **Not deployed:** session 62–64 local only
- **Deploy:** `npx vercel --prod --yes` after Supabase migrations

## Current snapshot (2026-07-04, v0.22 Goals cards + Activity + Settings)

- **Navigation:** **Summary** · Goals · Activity · Settings — Summary is first tab and default route (`/` → `/summary`, PWA `start_url`)
- **Goals tab:** `GoalCard` compact grid (up to 6 cols on xl); days left top-right; “New goal” CTA below cards; detail via `GoalDetailModal`
- **Activity tab:** full-width table; month + type chip filters only; `RupeeIcon` in nav
- **Settings:** single vertical column; **Budgets section removed** (DB/chart budgets unchanged)
- **Prior snapshot:** v0.21 (Activity table polish)
- **Not deployed:** session 62–65 local only
- **Migrations to run:** `add_recurring_daily_frequency.sql`, `add_transaction_category_snapshot.sql` (if not yet applied)
- **Deploy:** `npx vercel --prod --yes` after Supabase migrations

## Current snapshot (2026-07-04, v0.23 Summary Overall / Monthly)

- **Summary tab:** **Overall** | **Monthly** segmented tabs; default **Overall** (all-time stats + chart)
- **Monthly view:** month picker, per-month stats, budget lines on chart when set
- **All-time data:** `useTransactions({ allTime: true })` + lifetime goal contributions
- **Prior snapshot:** v0.22 (GoalCard grid, Summary-first nav, Activity/Settings polish)
- **Git:** `master` at `3a07ec1` (session 65 commit) + session 66+ local changes uncommitted
- **Not deployed:** session 62–66 local only
- **Migrations to run:** `add_recurring_daily_frequency.sql`, `add_transaction_category_snapshot.sql` (if not yet applied)
- **Deploy:** `npx vercel --prod --yes` after Supabase migrations

## Current snapshot (2026-07-04, v0.24 category spending heatmap)

- **Summary chart:** spending by category as **heatmap tiles** (size + color intensity by spend share); replaces pie/donut
- **Chart settings:** sort tiles, toggle category list; no style/resize options
- **Prior snapshot:** v0.23 (Overall/Monthly Summary tabs, all-time data)
- **Not deployed:** session 62–67 local only
- **Migrations to run:** `add_recurring_daily_frequency.sql`, `add_transaction_category_snapshot.sql` (if not yet applied)
- **Deploy:** `npx vercel --prod --yes` after Supabase migrations

## Current snapshot (2026-07-04, v0.25 heatmap modal + production)

- **Live:** [savings-tracker-azure.vercel.app](https://savings-tracker-azure.vercel.app) — latest **deployed** `dpl_7xNLvAb4tVxRCePmp1A88cM7S9hV` (session 69)
- **Heatmap drill-down:** click tile → `CategoryTransactionsModal`; 10 txs/page; filtered by category dedupe key + currency (session 68 — F-130)
- **Chart UI:** heatmap tiles only; settings = sort by amount/name; no category list below chart (session 68)
- **Summary:** Overall (default) | Monthly tabs; all-time tx cache for Overall (session 66 — F-127/F-128)
- **Navigation:** Summary · Goals · Activity · Settings; `/` → `/summary` (session 65 — F-120)
- **Git:** `master` at `550a09e`; remote `origin` → `https://github.com/nitinsinghbalyan/Savings-Tracker-WebApp.git`; **push pending** GitHub auth
- **Prior snapshot:** v0.24 (heatmap only; not deployed)
- **Migrations to run:** `add_recurring_daily_frequency.sql`, `add_transaction_category_snapshot.sql` (if not yet applied)
- **Deploy:** `npx vercel --prod --yes` from `savings-tracker/`

## Current snapshot (2026-07-06, v0.26 Activity fix + production)

- **Live:** [savings-tracker-azure.vercel.app](https://savings-tracker-azure.vercel.app) — latest **deployed** `dpl_9Vx2e5VejXN4teqtWqYvvogPKu56` (session 71)
- **Activity fix:** tx create/update works without snapshot migration; empty months load; invalid dates don’t crash list (session 70 — F-131)
- **Heatmap drill-down:** click tile → `CategoryTransactionsModal`; 10 txs/page (session 68 — F-130)
- **Summary:** Overall (default) | Monthly tabs (session 66 — F-127/F-128)
- **Navigation:** Summary · Goals · Activity · Settings; `/` → `/summary` (session 65 — F-120)
- **Git:** `master` at `b1a24b3`; remote `origin` → `https://github.com/nitinsinghbalyan/Savings-Tracker-WebApp.git`; **push pending** GitHub auth
- **Prior snapshot:** v0.25 (`dpl_7xNLvAb4tVxRCePmp1A88cM7S9hV`)
- **Migrations recommended:** `add_transaction_category_snapshot.sql` (app works without; labels won’t freeze on category delete until applied); `add_recurring_daily_frequency.sql` if daily recurring needed
- **Deploy:** `npx vercel --prod --yes` from `savings-tracker/`

## Current snapshot (2026-07-06, v0.27 savings/goal highlight + production)

- **Live:** [savings-tracker-azure.vercel.app](https://savings-tracker-azure.vercel.app) — latest **deployed** `dpl_9aLjkrW34G3jPFw9j4drawmRLGcx` (session 73)
- **Activity highlight:** light green rows for savings-category expenses and goal-linked transactions (session 72 — F-132)
- **No double count:** goal-tagged txs excluded from Summary **Savings**; count only under **Goals** (session 72 — F-133)
- **Activity fix:** snapshot migration fallback (session 70 — F-131); heatmap modal (F-130); Overall/Monthly Summary (F-127/F-128)
- **Git:** `master` at `b1a24b3`; session 72 changes **deployed but uncommitted**; GitHub push pending auth
- **Prior snapshot:** v0.26 (`dpl_9Vx2e5VejXN4teqtWqYvvogPKu56`)
- **Migrations recommended:** `add_transaction_goal_link.sql` (goal↔tx link); `add_transaction_category_snapshot.sql`; `add_recurring_daily_frequency.sql`
- **Deploy:** `npx vercel --prod --yes` from `savings-tracker/`

## Current snapshot (2026-07-06, v0.28 goal delete sync)

- **Live:** [savings-tracker-azure.vercel.app](https://savings-tracker-azure.vercel.app) — production `dpl_9aLjkrW34G3jPFw9j4drawmRLGcx` (session 73); session 74 **not deployed**
- **Goal delete sync:** deleting a goal-linked transaction removes its contribution; goals refresh (session 74 — F-134)
- **Activity highlight:** light green rows for savings/goal txs (session 72 — F-132/F-133)
- **Git:** `master` at `b1a24b3`; sessions 72–74 **uncommitted**; GitHub push pending auth
- **Prior snapshot:** v0.27 (`dpl_9aLjkrW34G3jPFw9j4drawmRLGcx`)
- **Migrations recommended:** `add_transaction_goal_link.sql`; `add_transaction_category_snapshot.sql`; `add_recurring_daily_frequency.sql`
- **Deploy:** `npx vercel --prod --yes` from `savings-tracker/`
