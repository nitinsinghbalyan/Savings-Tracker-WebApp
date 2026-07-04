# Architecture

**Last updated:** 2026-06-23 (v0.18)

## Tech stack

| Layer | Choice |
|-------|--------|
| UI | React 19 + Vite 8 |
| Language | JavaScript (JSX) |
| Styling | Tailwind CSS v3 |
| Routing | react-router-dom |
| Icons | lucide-react |
| Dates | date-fns |
| Backend | Supabase (Postgres + REST via supabase-js) |
| Auth | Supabase Auth — email/password + Google OAuth; JWT session in client |

## Environment variables

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Folder structure

```
src/
├── components/   # AppShell, BottomNav, PageHeader, GoalCard, TransactionForm, AccountForm, CategoryManager, …
├── pages/        # Dashboard.jsx, LoginPage.jsx, TransactionsPage, SummaryPage, SettingsPage
├── hooks/        # useGoals, useAuth, useToast, useProfile, useAccounts, useCategories, useTransactions
├── context/      # AuthContext, ToastContext
├── lib/          # supabase, auth, account, goals, contributions, backup, profile, accounts, categories, transactions, monthlySummary, …
├── assets/
├── App.jsx       # AuthProvider + AppShell routes (/goals, /transactions, /summary, /settings)
├── main.jsx
└── index.css     # Tailwind + shared component classes
public/
├── manifest.webmanifest
├── favicon.svg
supabase/
├── schema.sql              # full schema (fresh install, includes auth)
├── add_currency_color.sql  # currency + color columns
├── add_auth.sql                      # user_id, RLS, claim_device_data RPC
├── fix_contribution_select_rls.sql   # optional: SELECT contributions via goal ownership
└── phase2_finance.sql                # user_profiles, accounts, categories, transactions
```

## Data access pattern

Authenticated users only. Every Supabase query filters by `user_id` from the current session (`requireUserId()` in `src/lib/auth.js`).

```js
// Implemented in src/lib/goals.js and src/lib/contributions.js
const userId = await requireUserId()
const { data } = await supabase
  .from('goals')
  .select('*, contributions(*)')
  .eq('user_id', userId)
```

RLS policies enforce `user_id = auth.uid()` for the `authenticated` role. Anon role has no table access after `add_auth.sql`.

### Legacy `device_id`

`src/lib/device.js` still generates a local UUID. Used only by `claim_device_data(p_device_id)` on sign-in to attach pre-auth rows to the new account. Not used for routine queries.

### Auth flow

1. `LoginPage` → **Continue with Google** (`signInWithOAuth`) or email `signInWithPassword` / `signUp`
2. Google OAuth redirects to `window.location.origin`; Supabase client restores session from URL
3. `AuthProvider` holds session; sets `authReady` after `claimDeviceData()`; `AppRoutes` shows `Dashboard` or `LoginPage`
4. `useGoals({ enabled: user && authReady })` — no fetch until auth + claim complete
5. On `SIGNED_IN` / initial session, `claimDeviceData()` RPC links orphan `device_id` rows to `auth.uid()`
6. `AppRoutes` toast if `claimNotice > 0` (linked pre-auth goals)
7. Sign out via **Settings** → Session → `supabase.auth.signOut()`

### App navigation (v0.6)

| Route | Page | Purpose |
|-------|------|---------|
| `/` | redirect | → `/goals` |
| `/goals` | `Dashboard` | Savings goals (existing) |
| `/transactions` | `TransactionsPage` | Expense/income/transfer list |
| `/summary` | `SummaryPage` | Monthly cash-flow summary |
| `/settings` | `SettingsPage` | Profile, preferences, accounts, categories, backup, sign out |

- `AppShell` wraps authenticated routes; `BottomNav` fixed at bottom with safe-area padding
- Login page has no bottom nav
- FABs on Goals and Activity sit above bottom nav (`bottom-[calc(4.5rem+...)]`)

### Finance data layer (v0.6)

| Module | Role |
|--------|------|
| `src/lib/profile.js` | `user_profiles` get/upsert |
| `src/lib/accounts.js` | Account CRUD; balance via `get_account_balances()` RPC |
| `src/lib/categories.js` | Spending category CRUD; seeds defaults on first load |
| `src/lib/transactions.js` | Transaction CRUD; `create_transfer()` RPC for transfers |
| `src/lib/monthlySummary.js` | Pure aggregation for Summary page |
| `src/hooks/useProfile.js` | Settings preferences state |
| `src/hooks/useAccounts.js` | Accounts with balances |
| `src/hooks/useCategories.js` | Expense/income categories |
| `src/hooks/useTransactions.js` | Month-filtered transaction list |

**Balance formula (computed in RPC):**

```
balance = opening_balance + income − expenses − outgoing_transfers + incoming_transfers
```

**Spending categories vs goal categories:** Goal form uses `CATEGORY_PRESETS` in `constants.js` (Home, Travel, …). Finance uses `categories` table (Food, Rent, Salary, …).

### Google OAuth setup (Supabase dashboard)

- Enable Google provider; paste Google Cloud OAuth client ID + secret
- Redirect URI in Google Console: `https://<project-ref>.supabase.co/auth/v1/callback`
- Site redirect URLs: `http://localhost:5173`, `https://savings-tracker-azure.vercel.app`

## Currency & formatting

- `formatCurrency(amount, currency)` — `INR` (default, `en-IN`) or `USD` (`en-US`)
- `formatCurrencyCompact(amount, currency)` — compact notation for summary on small screens
- Constants: `src/lib/constants.js` — `CURRENCIES`, `ACCOUNT_TYPES`, goal `CATEGORIES`, spending category seeds, `COLOR_PALETTES`, `PRIORITIES`

## Goal form UX (current)

- Chip selectors: currency, priority, category (toggle off), color palette
- No starting-balance field (removed; use Add money after create)
- Modal / bottom-sheet pattern shared with `AddMoneyModal`

## PWA

- `public/manifest.webmanifest` + meta tags in `index.html`
- Requires HTTPS (or localhost) for install prompt

## Windows dev note

- PowerShell may block `npm.ps1` — use `npm.cmd run dev`, `.\dev.cmd`, or set terminal to Command Prompt (`.vscode/settings.json`)

## Database indexes

- `goals(user_id)`, `contributions(user_id)`
- `goals(device_id)`, `contributions(device_id)` — legacy / claim only
- `accounts(user_id)`, `categories(user_id, kind)`, `transactions(user_id, transaction_date)`

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local dev server (default `http://localhost:5173`) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |
| `npm.cmd run dev` | Dev server on Windows when PS execution policy blocks `npm.ps1` |
| `.\dev.cmd` / `.\build.cmd` | Wrapper scripts in project root |

## Deployment (Vercel)

| Setting | Value |
|---------|-------|
| Platform | Vercel |
| Project | `singhnitin-6610s-projects/savings-tracker` |
| Production URL | [https://savings-tracker-azure.vercel.app](https://savings-tracker-azure.vercel.app) |
| Framework | Vite (auto-detected) |
| Build command | `npm run build` |
| Output directory | `dist` |
| SPA routing | `vercel.json` rewrites `/(.*)` → `/index.html` |

### Env vars on Vercel

Same as local — set in Vercel project settings (or via `npx vercel env add`):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

`VITE_*` vars are embedded in the client bundle at build time (expected for Supabase anon key).

### Git

- Repo root: `savings-tracker/` (not parent `Goals App/`)
- Branch: `master` (rename to `main` optional before GitHub push)
- `.env` is **not** committed; use `.env.example` as template
- `.vercel/` is gitignored (local link metadata)

### Redeploy

```bash
npx vercel --prod          # CLI production deploy
# OR push to connected GitHub repo once linked in Vercel dashboard
```

### GitHub (pending)

No `git remote` yet. After creating a GitHub repo:

```bash
git remote add origin <repo-url>
git branch -M main
git push -u origin main
```

Then connect the repo under Vercel → Project Settings → Git.

---

## App data cache & persistent tabs (v0.7)

**Last updated:** 2026-06-14

### Provider tree

```
AuthProvider → AppDataProvider → ToastProvider → BrowserRouter
```

### `AppDataContext` (`src/context/AppDataContext.jsx`)

| Resource | Cache | Notes |
|----------|-------|-------|
| profile, accounts, categories, goals | In-memory state | Bootstrap once when `user && authReady` |
| transactions | `txCache` Map keyed by `year-month-monthStartDay-type-accountId` | `txCacheVersion` bumps on invalidate |
| Flags | `bootstrapping`, `refreshingCore` | `loading` in hooks only when cache empty |

Mutations call existing lib functions then patch/refresh cache. `runTransactionsMutation` also calls `refreshAccounts()`.

### Persistent tabs (`src/components/PersistentTabs.jsx`)

- Always mounts `Dashboard`, `TransactionsPage`, `SettingsPage`
- Inactive: `className="hidden"`, `inert`, `aria-hidden`
- Passes `isTabActive` to pages — gates FABs and modals

### Navigation (v0.7)

| Route | Page | Purpose |
|-------|------|---------|
| `/` | redirect | → `/goals` |
| `/goals` | `Dashboard` | Goals + `SummarySection` (monthly summary + balances) |
| `/transactions` | `TransactionsPage` | Activity; `?month=YYYY-MM` URL sync |
| `/summary` | redirect | → `/goals` (legacy URL) |
| `/settings` | `SettingsPage` | Profile, accounts, categories, backup, sign out |

`BottomNav`: Goals (`Target`) · Activity (`RupeeIcon`) · Settings (`Settings`)

### Icons (`src/components/icons/`)

- ~~`rupeeMark.jsx`~~ — removed session 20; use Lucide via `RupeeIcon.jsx`
- `RupeeIcon.jsx` — Lucide `IndianRupee` (`currentColor`)
- `public/icon-source.svg` + `favicon.svg` — `#4f46e5` rounded rect + white Lucide ₹ strokes
- `npm run generate-icons` → `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`

### Category loading (v0.7)

- `ensureCategories()` — seed defaults only if count = 0
- `pruneDuplicateCategories()` — once per session, background after first `getCategories()`
- `refreshCategories()` — `getCategories()` only (no prune)
- `dedupeCategoriesForDisplay()` + `categoryDedupeKey()` in `categories.js`

### Monthly summary aggregation (v0.7)

- `monthlySummary.js` — `resolveCategoryBucket()` prefers `tx.category` embed
- Groups by `categoryDedupeKey` (kind + normalized name) so duplicate rows merge
- `CategoryBreakdownChart` — stacked horizontal bar + per-category horizontal bars

### Scripts (added)

| Command | Purpose |
|---------|---------|
| `npm run generate-icons` | Regenerate PWA PNGs from `public/icon-source.svg` via `sharp` |

---

## Modal system (v0.7.1)

**Last updated:** 2026-06-14

### Components & hooks

| File | Role |
|------|------|
| `src/components/ModalShell.jsx` | Shared overlay (`z-50`), backdrop (`touch-none`), `align` bottom/center |
| `src/hooks/useBodyScrollLock.js` | Module-level ref-count; `lockBody()` / `unlockBody()`; restores scroll Y |
| `src/hooks/useModalEscape.js` | `Escape` → `onClose` when open |

### Scroll lock behavior

1. First open modal: save scroll Y + inline styles; set `body { position: fixed; top: -scrollY }` and `html/body overflow: hidden`
2. Register `touchmove` listener (`passive: false`) — `preventDefault` unless target inside `[data-modal-panel]`
3. Last close: remove listener, restore styles, `window.scrollTo(0, savedScrollY)`

### CSS (`index.css`)

- `.modal-panel` — `overflow-hidden` flex column; children set `data-modal-panel`
- `.modal-scroll` — `overflow-y-auto overscroll-contain` for form body only

### Consumers

`TransactionForm`, `AccountForm`, `GoalForm`, `GoalDetailModal`, `AddMoneyModal`, `ImportBackupModal`

---

## Shell chrome & bottom nav (v0.8)

**Last updated:** 2026-06-14

### Provider

`AppShell` → `ShellChromeProvider` → `PersistentTabs` + `BottomNav`

### Hooks

| File | Role |
|------|------|
| `useShellChrome.js` | Read `bottomNavHidden`; push/pop hide ref-count |
| `useBottomNavAutoHide.js` | Used by `ModalShell` when `hideBottomNav` |

Goal/transaction add forms pass `hideBottomNav` so nav slides off-screen during entry.

---

## Routing (v0.8 PWA fix)

**Last updated:** 2026-06-14

Authenticated routes in `App.jsx`:

```
/           → Navigate → /goals
/summary    → Navigate → /goals
/*          → AppShell (PersistentTabs + BottomNav)
```

`PersistentTabs` uses `normalizeTabPath()` — unknown paths default to Goals and `navigate('/goals', { replace: true })`.

---

## Icons (updated v0.8)

- `RupeeIcon.jsx` — Lucide `IndianRupee` (stroke, `currentColor`)
- `public/icon-source.svg` + `favicon.svg` — Lucide ₹ paths on `#4f46e5` rounded rect
- ~~`rupeeMark.jsx`~~ — removed (session 20)

---

## Monthly summary Net (v0.8)

> **Superseded by v0.8.2 section below** — Net is now `balances` only, not `balances + income − expenses`.

Per currency in `groupSummariesByCurrency(transactions, categories, accounts)`:

- `balances` — sum of active account balances for currency
- `net` — `balances + income − expenses`
- `savingsRate` — still based on monthly flow (`income − expenses`) / income
- Expenses in `is_savings` categories excluded from `expenses` and breakdown

---

## Transaction → goal link (v0.8)

> **Extended in v0.8.2** — expense transactions now support the same optional goal link as income.

- `transactionGoal.js` — `buildGoalContributionFromTransaction()` with optional FX
- Income `TransactionForm` optional goal chips → `addContribution` after `createTransaction`
- No DB FK between transactions and contributions (ledger + goals remain separate)

---

## SQL migrations (append)

| File | Purpose |
|------|---------|
| `add_category_is_savings.sql` | `categories.is_savings` for savings expense categories |

---

## Monthly summary formulas (v0.8.2)

> **Superseded by v0.9 section below** — see current Total balance, split Savings/Goals, no offset, no savings rate in UI.

**Last updated:** 2026-06-14

Per currency in `groupSummariesByCurrency(transactions, categories, accounts, { goals, year, month, monthStartDay })`:

| Field | Formula |
|-------|---------|
| **Income / Expenses** | Monthly ledger activity (expenses exclude `is_savings` categories) |
| **Savings** | Savings-category expenses + goal contributions in selected month |
| **Savings rate** | savings ÷ income (0% if no income) |
| **Balances** | Sum of active account balances for currency |
| **Net** | `balances` (not income − expenses) |

### One-time Net offset

- Constant: `NET_ONE_TIME_BALANCE_EXCLUSION = 15000` (INR)
- Storage key: `savings-lite-net-offset-15000-{userId}` in `localStorage`
- Applied in `SummarySection` when `shouldApplyOneTimeNetOffset()` — first view with real INR summary data after load
- Display: `withOneTimeNetExclusion()` sets `net = balances − exclusion` for INR only; shows “₹15,000 excluded from balance” hint

### Superseded (session 21)

- `net = balances + income − expenses` — do not use; replaced session 24

---

## Transaction → goal link (v0.8.2)

**Last updated:** 2026-06-14

- `transactionGoal.js` — `buildGoalContributionFromTransaction({ goal, amount, accountCurrency, note, transactionType })`
- `TransactionForm` — optional goal chips on new **expense** and **income** (not transfer, not edit)
- `TransactionsPage` — after `createTransaction`, optionally `addContribution` with FX when goal currency differs
- Contribution notes: `From expense transaction` / `From income transaction` (+ user note if present)
- No DB FK between `transactions` and `contributions` (ledger + goals remain separate rows)

---

## SQL migrations (status)

| File | Status |
|------|--------|
| `phase2_finance.sql` | Required |
| `fix_contribution_select_rls.sql` | Optional |
| `add_category_is_savings.sql` | **Applied** on production Supabase (`qmdkituqyogwtadderck`) |
| `add_net_balance_adjustment.sql` | **Applied** on production; `net_balance_adjustment_inr` unused after session 29 offset removal |
| `add_category_budget.sql` | **Applied** on production; `categories.monthly_budget` for category budgets (session 34) |

### SQL migrations (status — append session 47)

| File | Status |
|------|--------|
| `add_subcategories_recurring_bank.sql` | **Required** for v0.13 — `parent_id`, `recurring_transactions`, `accounts.bank`, `transactions.recurring_id`, `get_account_balances()` with `bank`; run after `phase2_finance.sql`; uses `DROP FUNCTION IF EXISTS get_account_balances()` before recreate |
| `add_recurring_daily_frequency.sql` | **Optional** if `recurring_transactions` already exists without `daily` — widens `frequency` CHECK to include `daily` |

---

## Monthly summary (v0.9 — current)

**Last updated:** 2026-06-14

Per currency in `groupSummariesByCurrency(transactions, categories, accounts, { goals, year, month, monthStartDay })`:

| Field | Formula / UI |
|-------|----------------|
| **Income / Expenses** | Monthly ledger activity (expenses exclude `is_savings` categories) |
| **Savings** | Savings-category expenses in selected month (`categorySavings`) |
| **Goals** | Goal contributions in selected month (`goalSavings`); **Goals this month** list |
| **Total balance** | Sum of active account balances for currency — matches Settings → Balances |
| **Savings rate** | Not shown in UI (session 31); still computed internally as optional |

### Spending-by-category chart (v0.9.1)

- `CategoryBreakdownChart.jsx` — **vertical bar charts**: each expense category is a bar scaled to the top spender (`CHART_HEIGHT` px, `MIN_BAR_HEIGHT` floor), compact amount label above, name below, light grid lines, horizontal scroll when many categories; legend list (amount + %) below
- Input unchanged: `{ items: byExpenseCategory, total: expenses, currency }`
- Superseded: horizontal stacked + per-category horizontal bars (v0.7)

### Category budgets (v0.10)

- Schema: `categories.monthly_budget numeric NOT NULL DEFAULT 0 CHECK (>= 0)` (`add_category_budget.sql`, applied on prod)
- Set per expense category in **Settings → Budgets** (`BudgetManager.jsx` → `updateCategory`); savings categories excluded
- `buildMonthlySummary` — `expenseBudgets` map keyed by `categoryDedupeKey`; each `byExpenseCategory` item gets a `budget`; returns `expenseBudgetTotal`
- `CategoryBreakdownChart` extra prop `budgetTotal`; renders dashed target line per bar (scale max = `max(total, budget)`), rose bar when over, legend `spent / budget` + "over by X", header total spent / total budget
- Limitation: budget compared within each currency group as a plain number (single-currency INR is typical); categories with a budget but no spend don't draw a bar but count in `expenseBudgetTotal`

### Summary default currency only (v0.10.1)

- `groupSummariesByCurrency(..., { preferredCurrency })` — when set, returns one summary row for that currency only (not all currencies from tx/accounts/goals)
- `SummarySection` passes `profile.default_currency ?? 'INR'`; filters `summaryAccounts` for the balance list to the same currency
- USD/other-currency goals and accounts remain visible elsewhere (Goals grid, Activity, Settings → Balances)

### v0.10.1 production deploy (session 37)

- `npx vercel --prod --yes` — `dpl_3vXo8iDvn63rboSRJ5ZLwWY5DMrT` (latest production)

### Goals load + mutation (v0.10.2, session 38)

- `getGoalsWithContributions` — goals query + contributions query by `goal_id`, merged in JS
- `AppDataContext.runGoalsMutation` — merges create/update/delete/contribution into local `goals` state immediately; background `refreshGoals` failure does not fail the user action
- Prod migration `fix_contribution_rls_and_backfill` — backfill `contributions.user_id`; SELECT policy allows goal ownership OR matching `user_id`

### Desktop-first shell (v0.11, session 40)

- `lg` (1024px): `SidebarNav` + `app-main`; `BottomNav` hidden; no bottom padding on main
- Below `lg`: existing mobile PWA shell (bottom nav, FABs, bottom-sheet modals)
- `page-container` → `max-w-content` (90rem) with `lg:px-8`
- Goals page: 12-col grid — summary sticky left (5/4 cols), goals right (7/8 cols)
- `ModalShell`: bottom sheet below `lg`, centered dialog on `lg+`; toasts top-right on desktop

### Chart overflow + in-app tab flash (v0.11.1, session 41)

- `CategoryBreakdownChart` — `compact` prop for Goals sidebar; fluid bars; scroll contained in card
- `PersistentTabs` — inactive tabs `absolute inset-0` (not `h-0`); preserves scroll position
- Transaction cache entry shape: `{ data, loading, refreshing, error, stale }`
- `invalidateTransactions` marks entries `stale` instead of deleting keys
- `loadTransactions` skips fetch when cache has data and `!stale`
- Production: `dpl_G63rco3hVp95zEB9Bscz5MpCiPhh`

### Browser tab / Chrome focus flash (v0.11.2, session 42)

- `AuthContext` — `sessionRef`; `TOKEN_REFRESHED` updates session only; same-user `SIGNED_IN` skips `establishSession`
- `AppDataContext` — `clearAll()` when `!user` (not `!enabled`)
- Data hooks (`useGoals`, `useAccounts`, `useCategories`, `useProfile`, `useTransactions`) — return cached data when `user` present
- Cold browser quit still requires bootstrap (no sessionStorage hydrate yet)
- Production: `dpl_D6Jdkdj5bMfYmXLvyPhSSDEVKmeq` (latest)

### Superseded summary behavior

- **Net** label → **Total balance** (session 30)
- `net = balances − monthly expenses` — wrong (double-counts ledger); use balances only
- One-time ₹15k offset (localStorage / profile) — removed session 29
- Combined Savings column (categories + goals) — split session 28

### Finance feature pack (v0.12, session 43)

- **Full history:** `AppDataContext.history` + `loadHistory()` / `getHistoryEntry()`; `useTransactionHistory` hook; marked `stale` in `invalidateTransactions`
- **Net worth:** `src/lib/netWorth.js` — `buildNetWorthTimeline()` walks ledger backward from current account balances per currency; `getNetWorthCurrencies()`
- **Insights:** `src/lib/insights.js` — `buildInsights()` compares this month vs last via `buildMonthlySummary`
- **Forecast:** `src/lib/forecast.js` — `getForecast(goal)` from trailing 3-month contribution pace
- **Components:** `LineChart.jsx`, `NetWorthCard.jsx`, `InsightCards.jsx` on Activity `TransactionsPage` Overview section
- **Activity filters:** client-side search/account/amount on loaded month (no extra cache keys)
- **Production:** `dpl_12u4qX5Q7gNcmSTN6PsHGFo3VdSd`

### Goals progress bars (v0.12.1, session 44)

- **`GoalsProgressBars.jsx`** — single sidebar card; each goal = name + horizontal bar + % + saved/target; sorted ascending by `percentComplete`
- **`SummarySection`** — goals bars at top (after month picker); removed "Goals this month" list
- **`Dashboard`** — removed aggregate `ProgressPieChart` "Overall progress" block (`ProgressPieChart.jsx` retained but unused)
- Filters goals by `preferredCurrency` when matches exist; falls back to all goals
- **Production:** `dpl_CV9D4vX2mQn83gWEN7ajfB4egr1X`

### Transaction add reliability (v0.12.2, session 45)

- **`getPeriodForDate(dateStr, monthStartDay)`** — maps a transaction date to the MonthPicker year/month bucket (respects custom month start day)
- **`transactionMatchesCacheFilters()`** — checks if a tx belongs in a given cache key (date range, type, account)
- **`mergeTransactionIntoCache()`** in `AppDataContext` — inserts created tx into matching stale cache entries immediately after mutation
- **`runTransactionsMutation`** — invalidates `${period.year}-${period.month}-` from transaction date (not just viewed month); passes `monthStartDay` + `transactionDate` from `useTransactions`
- **`TransactionForm`** — `resetKey` includes expense/income category ids; falls back to `categories[0]` on submit
- **`TransactionsPage.handleSubmit`** — after create, switches month if needed; clears type/account filters that would hide the new row
- **Transfer create** — single-row select by id (replaces full `getTransactions()` refetch)
- **Production:** `dpl_asdLrUn7GsVKVUNEX7YmQhbHtwk9` (latest)

### Activity overview removed (v0.12.3, session 46)

- **Removed** Overview block from `TransactionsPage` (net worth chart + insight cards)
- **Deleted** `NetWorthCard`, `InsightCards`, `LineChart`, `netWorth.js`, `insights.js`, `useTransactionHistory`, `ProgressPieChart.jsx`
- **Removed** `AppDataContext.history`, `loadHistory`, `getHistoryEntry`
- **Tx cache keys** — `buildTransactionsCacheKey` uses `|` separator; `parseTransactionsCacheKey()` + `buildTransactionsCachePrefix()` in `app-data-context.js`
- Activity loads month-scoped transactions only (faster, no full-ledger fetch on tab open)

### Categories, recurring, banks (v0.13, session 47)

- **`add_subcategories_recurring_bank.sql`** — `categories.parent_id`, `recurring_transactions`, `accounts.bank`, `transactions.recurring_id`
- **`CategoriesPage`** at `/settings/categories` — tree, sub-categories, delete all, starter pack
- **`RecurringTransactionsPage`** at `/settings/recurring` — `processDueRecurring()` on bootstrap; pause/skip
- **Bank icons** — `src/components/icons/banks/`; `BANKS` in constants
- **Backup v3** — `parent_name`, `bank`, `recurring_transactions`
- **Migration idempotency** — `DROP FUNCTION IF EXISTS get_account_balances()`; `DROP POLICY IF EXISTS` on recurring RLS policies before recreate
- **Production:** `dpl_FeHGJsUPndg94gMdPag3xoXZW8wD` (latest)

### Goals list + detail modal (v0.14, session 48)

- **`GoalsProgressBars`** — days left via `getDaysRemaining` / `formatDaysRemaining`; `onGoalClick` opens modal
- **`Dashboard`** — goals in main column only; `GoalCard` grid removed (component file retained, unused)
- **`GoalDetailModal`** — forecast + required monthly; add money / edit / delete / contributions
- **`SummarySection`** — no longer embeds goals bars (avoids duplicate list)

### Daily recurring (v0.14.1, session 49)

- **`advanceNextRunDate`** — `case 'daily': addDays(from, intervalCount)`
- **`RecurringTransactionForm`** — Daily chip in `FREQUENCIES`
- **`add_recurring_daily_frequency.sql`** — alters `recurring_transactions_frequency_check`

### Activity pagination (v0.14.2, session 50)

- **`TransactionsPage`** — `pageSize` 10|50|100, `page` state; slice `filteredTransactions` before `groupTransactionsByDate`
- Pagination bar top + bottom; resets on month/filter change
- **`TransactionRow`** — amount + Edit/Delete inline (text buttons)

### Horizontal category chips (v0.14.3, session 51)

- **`CategoryTreeManager`** — `flex flex-wrap` chip groups per parent family (parent + subs in one row)

### Production (session 52)

- **Latest:** `dpl_35QfDCM9dFrooiG4DYNYDF6kvT81` — https://savings-tracker-azure.vercel.app

### Full-width chart + label fix (v0.14.4–5, sessions 53–55)

- **`CategoryBreakdownChart`** — `large` prop; fixed-height bar column; labels outside bar area (session 54)
- Brief interim: chart on Goals via `goalsSlot` in `SummarySection` (session 53; superseded session 56)
- **Production:** `dpl_9aMD9x3TVwRBRNeFkkPWhgvfiYz2`

### Home + Summary tabs (v0.15, session 56)

- **`HomePage.jsx`** — goals section + `TransactionsPage` `embedded={true}`
- **`SummaryPage.jsx`** — `SummarySection` only (stats, large chart, income, balances)
- **`PersistentTabs`** — `/goals` (Home), `/summary`, `/settings`; no `/transactions` tab
- **`App.jsx`** — `/transactions` → `/goals` redirect (preserves query)
- **`Dashboard.jsx`** — re-exports `HomePage`
- Nav labels: Home · Summary · Settings

### Category pie chart (v0.16, session 57)

- **`CategoryBreakdownChart.jsx`** — hand-built **SVG pie chart** (no chart library): slices from cumulative angles; `describeSlice()` arc paths; single-category full-circle edge case
- **`COLOR_PALETTES`** — each palette has `fill` hex for SVG; over-budget slices override to rose `#f43f5e`
- **Props:** `items`, `total`, `currency`, `budgetTotal`, `large` (responsive `h/w` classes); **`compact` removed**
- **Legend:** list below pie unchanged — color swatch via inline `backgroundColor: item.fill`, amount, %, budget overage badge
- **Supersedes:** vertical bar chart (sessions 32, 54) and `compact` sidebar mode (session 41)

### Chart settings (v0.17, session 58)

- **`src/lib/chartPreferences.js`** — defaults: `{ style: 'pie', showLegend: true, sortBy: 'amount' }`; persisted in `localStorage` key `savings-lite-chart-preferences`
- **`src/hooks/useChartPreferences.js`** — `prefs`, `updatePrefs`, `resetPrefs`
- **`CategoryBreakdownChart`** — `Settings2` gear opens popover (click-outside / Escape to close); **donut** uses `describeDonutSlice()` + center total text

### Slice hover tooltip (v0.17.1, session 60)

- **`SliceTooltip`** — positioned at slice midpoint via `getTooltipPosition()` (% of 200×200 viewBox)
- Hover state dims other slices (`opacity: 0.45`); active slice `strokeWidth: 2.5`
- Slices focusable for keyboard tooltip; chart container `onMouseLeave` clears hover

### Production (v0.17, session 59)

- **Latest:** `dpl_JAuw2D4fW8sw1RnA1KUFG6mtmx62` — https://savings-tracker-azure.vercel.app (pie + settings; sessions 60–61 pending redeploy)

### Resizable chart + summary trim (v0.18, session 61)

- **`chartPreferences.js`** — adds `size` (default `CHART_SIZE_DEFAULT` 380, clamp 200–560)
- **`CategoryBreakdownChart`** — inline `width: min(size, 100%)` + `aspect-ratio: 1`; center-aligned; SE drag handle with pointer listeners
- **Settings popover** — range input for chart size
- **`SummarySection`** — no `renderIncomeList`; expense pie chart only below stat cards
