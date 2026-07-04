# Features

**Last updated:** 2026-06-23 (v0.18)

| ID | Feature | Status | Notes |
|----|---------|--------|-------|
| F-01 | Project scaffold (React + Vite + JS) | done | `savings-tracker` template |
| F-02 | Tailwind CSS v3 configured | done | `tailwind.config.js`, `@tailwind` in `index.css` |
| F-03 | Supabase client (`src/lib/supabase.js`) | done | Reads `VITE_SUPABASE_*` env vars |
| F-04 | Folder structure (`components`, `pages`, `lib`, `hooks`) | done | Placeholder `.gitkeep` files |
| F-05 | Database schema (goals + contributions) | done | SQL provided; run in Supabase editor |
| F-06 | `device_id` generation & persistence | done | `src/lib/device.js` — **legacy:** used for `claim_device_data` on sign-in only |
| F-07 | Goals CRUD UI | done | `GoalForm` modal + `GoalCard` + Dashboard |
| F-08 | Contributions UI | done | `AddMoneyModal`, expandable list on card |
| F-09 | Progress display | done | Bar, %, saved/remaining, on-track badge |
| F-10 | Routing (`react-router-dom`) | done | `/` → `Dashboard` |
| F-11 | Priority / category filters | deferred | Post-MVP |
| F-12 | Data export / import | done | `backup.js`, header Download/Upload, `ImportBackupModal`; merge or replace |
| F-13 | Supabase data layer | done | `goals.js`, `contributions.js`, `useGoals` |
| F-14 | Dashboard page | done | Summary, FAB, grid, skeleton, empty state |
| F-15 | Add money flow | done | Modal, celebration on 100%+, contribution delete |
| F-16 | App polish | done | Theme, toasts, PWA manifest, 44px targets |
| F-17 | Per-goal currency (INR / USD) | done | Chips in form; `formatCurrency(amount, code)` |
| F-18 | Per-goal color palette | done | 6 palettes; card border + progress bar |
| F-19 | Chip-based GoalForm fields | done | Priority, category, currency, color chips |
| F-20 | Vercel production deployment | done | [savings-tracker-azure.vercel.app](https://savings-tracker-azure.vercel.app); `vercel.json` SPA rewrite |
| F-21 | Git repository (local) | done | 2 commits on `master`; no remote yet |
| F-22 | GitHub + Vercel Git integration | planned | Requires GitHub repo + dashboard connect |
| F-23 | Custom domain on Vercel | deferred | Optional; default `*.vercel.app` works |
| F-24 | Goal detail modal | done | Card click → `GoalDetailModal` |
| F-25 | GoalCard action polish | done | Icon-only edit/delete (red delete); on-track badge by priority |
| F-26 | Supabase Auth (email/password) | done | `LoginPage`, `AuthContext`, `user_id` scoping, sign out |
| F-27 | Cross-browser sync via account | done | Same login = same goals; no import required for normal use |
| F-28 | `add_auth.sql` migration | planned | **User must run** in Supabase SQL editor + enable Email provider |
| F-29 | Google OAuth sign-in | done | `signInWithGoogle`, Continue with Google on `LoginPage`; requires Supabase + Google Cloud setup |
| F-30 | Google provider dashboard setup | planned | **User must enable** Google in Supabase; OAuth client + redirect URLs |
| F-31 | Overall progress pie chart | done | `ProgressPieChart.jsx` in Dashboard summary |
| F-32 | Account label in header | superseded | Moved to Settings → Account section (Phase 2); was in Goals header |
| F-33 | Auth-ready data gate | done | `authReady` in `AuthContext`; `useGoals` waits for claim to finish |
| F-34 | Mobile sync empty-state guidance | done | Explains same-account rule + import backup fallback |
| F-35 | Contribution SELECT RLS fix (SQL) | planned | **User may run** `fix_contribution_select_rls.sql` if goals show without amounts |
| F-36 | Bottom navigation (4 tabs) | superseded | Was Goals, Activity, Summary, Settings; now 3 tabs (Summary merged into Goals) |
| F-37 | Bank accounts (ledger) | done | `accounts` table, opening balance + computed balance RPC |
| F-38 | Expense/income tracking | done | `transactions` table; categories per user |
| F-39 | Transfers between accounts | done | `create_transfer()` RPC; same-currency only |
| F-40 | Monthly summary | done | Income, expenses, net, savings rate; horizontal category bars on Goals tab |
| F-41 | Settings page | done | Profile, preferences, accounts, categories, data, sign out |
| F-42 | `phase2_finance.sql` migration | planned | **User must run** in Supabase SQL Editor |
| F-43 | Backup v2 (goals + finance) | done | `fetchFullBackupData`; v1 import backward compatible |
| F-44 | App-level data cache (`AppDataProvider`) | done | Bootstrap once; keyed transaction cache; mutation helpers |
| F-45 | Persistent tabs (no unmount on nav) | done | `PersistentTabs`; scroll/state preserved per tab |
| F-46 | Stale-while-revalidate loading | done | Skeletons only when cache empty; no flash on tab switch |
| F-47 | Summary on Goals tab | done | `SummarySection` in `Dashboard`; `/summary` → `/goals` |
| F-48 | Activity month URL sync | done | `?month=YYYY-MM` on `/goals` (was `/transactions`; session 56 redirect) |
| F-49 | INR→USD on goal contributions | done | `exchangeRate.js`, `AddMoneyModal` conversion when goal is USD |
| F-50 | Rupee app + nav icon | done | Lucide `IndianRupee`; `icon-source.svg`, `favicon.svg`, `RupeeIcon` |
| F-51 | Horizontal category breakdown chart | done | Stacked bar + per-category bars in `CategoryBreakdownChart` |
| F-52 | Category summary dedupe grouping | done | `monthlySummary.js` uses `categoryDedupeKey` + embedded `tx.category` |
| F-53 | Fast category load (Settings) | done | No prune on refresh; parallel bootstrap; background prune once |
| F-54 | Balance refresh after transactions | done | `refreshAccounts()` in `runTransactionsMutation` |
| F-55 | Mobile FAB tap reliability | done | `z-[60]`, `isTabActive`, install prompt pointer-events fix |
| F-56 | Financial masking removed | done | Deleted `RevealableMoney`; all amounts visible |
| F-57 | 3-tab bottom nav | done | Goals · Activity · Settings (Summary tab removed) |
| F-58 | PWA icon generation script | done | `npm run generate-icons` (`scripts/generate-pwa-icons.mjs`) |
| F-59 | Shared modal shell (`ModalShell`) | done | Overlay, backdrop, escape; used by all finance/goal modals |
| F-60 | Mobile body scroll lock for modals | done | `useBodyScrollLock` — fixed body + ref-count + touchmove guard |
| F-61 | Modal internal scroll regions | done | `.modal-panel` / `.modal-scroll`; CTA taps don't scroll page behind |
| F-62 | Settings inline preferences | done | Currency/month on one row; icon toggles; email-only account |
| F-63 | Category chips in Settings | done | Colored chips + padding on Expense/Income tabs |
| F-64 | Bottom nav autohide in forms | done | `ShellChromeProvider`; `hideBottomNav` on Goal/Transaction forms |
| F-65 | Lucide rupee icon (app + PWA) | done | `IndianRupee`; `icon-source.svg` stroke art; deleted `rupeeMark.jsx` |
| F-66 | Summary total balance | done | **Superseded labels:** was “Net”; now **Total balance** = sum of active account balances per currency |
| F-67 | PWA cold-start tab routing | done | `App.jsx` redirects; `PersistentTabs` fallback to `/goals` |
| F-68 | Income tx → goal contribution | done | Optional goal chips in `TransactionForm`; `transactionGoal.js` |
| F-69 | Savings expense category | done | `is_savings` flag; excluded from spending summary; migration applied on prod Supabase |
| F-70 | One-time Net balance offset (₹15k) | superseded | Removed session 29; was localStorage then profile `net_balance_adjustment_inr` |
| F-71 | Expense tx → goal contribution | done | Same optional goal chips as income; note `From expense transaction` |
| F-72 | Savings rate in summary | superseded | Removed from UI session 31; still computed in `monthlySummary.js` if needed later |
| F-73 | Goals separate in summary | done | **Goals** column + “Goals this month” list; **Savings** = category savings only |
| F-74 | Total balance matches Settings | done | Summary total = sum of `get_account_balances()` per currency (not balances − expenses) |
| F-75 | Spending-by-category bar charts | superseded | Was vertical bars (session 32); **pie chart** session 57 — see F-107 |
| F-76 | Category budgets | done | `categories.monthly_budget`; Settings Budgets section; chart target line + over-budget tag (session 34) |
| F-77 | Summary scoped to default currency | done | `preferredCurrency` in `groupSummariesByCurrency`; summary + balance list use `profile.default_currency` (session 37) |
| F-77 deploy | Summary default currency live | done | Production `dpl_3vXo8iDvn63rboSRJ5ZLwWY5DMrT` (session 37 deploy) |
| F-78 | Goal save resilience | done | Two-query load; optimistic merge; contribution RLS backfill (session 38) |
| F-79 | Activity edit modal stable | done | Modal portal + tab route lock; inactive tabs not `display:none` (session 39) |
| F-80 | Tx → cross-currency goal | done | INR↔USD FX fallback; zero-amount guard; preserve contributions on refresh (session 39) |
| F-81 | Desktop sidebar navigation | done | `SidebarNav` lg+; `BottomNav` mobile-only (session 40) |
| F-82 | Desktop multi-column layouts | done | Goals 2-col, Activity filter rail, Settings grid (session 40) |
| F-83 | Desktop header actions | done | New goal / Add transaction in `PageHeader` on lg+; FABs mobile-only (session 40) |
| F-84 | Category chart sidebar containment | superseded | `compact` prop removed — chart only on Summary tab (session 57) |
| F-85 | In-app tab switch stability | done | `PersistentTabs` no `h-0`; tx stale-while-revalidate cache (session 41) |
| F-86 | Browser tab / focus stability | done | Silent `TOKEN_REFRESHED`; `clearAll` on sign-out only; hooks keep cache (session 42) |
| F-87 | Net worth tracker | removed | Was on Activity Overview (session 43); removed session 46 — full-ledger fetch slow/buggy |
| F-88 | Month-over-month insights | removed | Was `InsightCards` on Activity Overview (session 43); removed session 46 |
| F-89 | Goal forecasting | done | `getForecast()` — pace from last 3 months; est. completion on `GoalCard` (session 43) |
| F-90 | Activity search & filters | done | Text search, account filter, amount range; client-side on loaded month (session 43) |
| F-91 | Full transaction history cache | removed | `loadHistory` / `useTransactionHistory` (session 43); removed with overview session 46 |
| F-92 | Goals progress bars in summary | done | Originally sidebar in `SummarySection` (session 44); **moved to Dashboard main column** with days left + modal (session 48, F-99) |
| F-93 | Transaction add reliability | done | Optimistic cache merge; period-based invalidation; form category reset; filter/month auto-adjust (session 45) |
| F-94 | Tx cache key UUID safety | done | `|` delimiter + `parseTransactionsCacheKey` (session 46) |
| F-95 | Sub-categories | done | `parent_id` + tree on `/settings/categories` (session 47) |
| F-96 | Deletable categories (no defaults) | done | No auto-seed; delete all/any; starter pack optional (session 47) |
| F-97 | Recurring transactions | done | Auto-post + pause/skip; `/settings/recurring` (session 47) |
| F-98 | Bank icons on accounts | done | ICICI/SBI/HDFC/Axis on `AccountCard` (session 47) |
| F-99 | Goals list with days left + detail modal | done | On **Home** tab via `HomePage` (session 48; moved session 56) |
| F-100 | Daily recurring frequency | done | `daily` in `recurringTransactions.js` + `add_recurring_daily_frequency.sql` (session 49) |
| F-101 | Activity pagination | done | 10/50/100 per page on filtered month list (session 50) |
| F-102 | Inline tx Edit/Delete | done | Amount + text actions on one row in `TransactionRow` (session 50) |
| F-103 | Horizontal category chips | done | `CategoryTreeManager` flex-wrap groups (session 51) |
| F-104 | Merged Home tab (goals + activity) | done | `HomePage.jsx`; `TransactionsPage` `embedded` mode (session 56) |
| F-105 | Summary tab (charts page) | done | `SummaryPage.jsx` at `/summary`; `SummarySection` charts-only (session 56) |
| F-106 | Full-width spending chart | done | `CategoryBreakdownChart` `large` on Summary page (sessions 53–54) |
| F-107 | Spending-by-category pie chart | done | SVG pie in `CategoryBreakdownChart`; `COLOR_PALETTES.fill`; over-budget rose slices (session 57) |
| F-108 | Chart customization (settings gear) | done | Pie/donut, legend sort, show/hide list; `chartPreferences.js` + `localStorage` (session 58) |
| F-109 | Slice hover tooltip | done | Rich tooltip on hover/focus; dim other slices (session 60) |
| F-110 | Resizable spending chart | done | Drag handle + settings slider; `prefs.size` 200–560px default 380 (session 61) |
| F-111 | Summary income list removed | done | “Income by category” card removed; Income total remains in stat grid (session 61) |

## Backlog ideas

- Dark mode toggle
- Goal completion celebration / badge — **partial:** `Celebration` component on 100%+ contribution
- Recurring contribution reminders (requires notifications — likely out of scope)
- Charts (monthly savings trend) — **partial:** Summary tab has category **pie chart** (session 57; was bar charts session 32)
- Dashboard sort/filter (deadline, priority, %) — was in early dashboard spec; not in current UI
- More currencies beyond INR/USD
- Custom category (free text) in addition to chips

### Candidate features (2026-06-16 brainstorm — not committed)

- Spending/income trend chart (multi-month) — low effort, no schema change
- Recurring transactions (rent/salary/SIP) — needs new table + due-date logic
- Goal forecasting (projected completion date / required monthly) — computation only
- Month-over-month insight cards; savings streaks; top movers
- Net worth over time (monthly balance snapshots)
- Activity search & filters; split transaction; quick-add presets; receipt photo
- Round-up saving; goal milestones (25/50/75%); deadlines & reminders
- Offline support; Web Push reminders; CSV export/import
- Shared/household goals; bank statement import; AI auto-categorization
- ~~Category budgets — deferred (session 33)~~ **implemented session 34 (F-76)**
- Budget follow-ups: month-to-month rollover, income-category targets, near-cap push notifications

### Candidate features — status after session 43–44 (append-only)

| Idea | Status |
|------|--------|
| Goal forecasting | **Done** — F-89, session 43 |
| Month-over-month insight cards | **Done** — F-88, session 43 |
| Net worth over time | **Done** — F-87, session 43 (ledger reconstruction, not snapshots) |
| Activity search & filters | **Done** — F-90, session 43 |
| Recurring transactions | **Done** — F-97, session 47 |
| Spending/income trend chart | **Partial** — net worth timeline on Activity |
| Dashboard sort/filter | Still not in UI |

### Candidate features — status after session 47 (append-only)

| Idea | Status |
|------|--------|
| Spending/income trend chart | **Removed** — Activity overview (net worth timeline) removed session 46; no replacement chart |
| Sub-categories | **Done** — F-95 |
| Recurring transactions | **Done** — F-97 (was deferred session 43) |

### Candidate features — status after session 48–52 (append-only)

| Idea | Status |
|------|--------|
| Goals detail modal (not inline cards) | **Done** — F-99 |
| Daily recurring | **Done** — F-100 |
| Activity pagination | **Done** — F-101 |

### Candidate features — status after session 53–56 (append-only)

| Idea | Status |
|------|--------|
| Full-width category chart | **Done** — F-106 on Summary tab |
| Merged goals + activity tab | **Done** — F-104 |
| Separate charts/summary page | **Done** — F-105 |
| Category pie chart | **Done** — F-107, session 57 |
| Chart settings menu | **Done** — F-108, session 58 |
| Slice hover tooltip | **Done** — F-109, session 60 (deploy pending) |
| Resizable chart | **Done** — F-110, session 61 (deploy pending) |
