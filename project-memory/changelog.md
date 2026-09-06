# Changelog

**Last updated:** 2026-09-06 (v0.32)

## 2026-06-14

### Added

- React + Vite project (`savings-tracker`) with JavaScript template
- Tailwind CSS v3 (`tailwind.config.js`, `postcss.config.js`, `@tailwind` in `index.css`)
- Dependencies: `@supabase/supabase-js`, `react-router-dom`, `lucide-react`, `date-fns`
- `src/lib/supabase.js` — Supabase client from env vars
- Folder scaffold: `src/components`, `src/pages`, `src/hooks`, `src/lib`
- `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` placeholders
- SQL schema for `goals` and `contributions` tables (RLS + indexes)
- `project-memory/` documentation folder

### Verified

- `npm run dev` — Vite ready at `http://localhost:5173/`

---

## 2026-06-14 (session 2)

### Added

- Supabase data layer: `goals.js`, `contributions.js`, `useGoals` hook
- `GoalForm` — create/edit modal with validation
- `GoalCard` — progress, on-track badge, required monthly, contribution list
- `Dashboard` page at `/` — summary, FAB, grid, skeleton, empty state
- `AddMoneyModal` + `Celebration` on goal completion
- Toast system (`ToastContext`, `Toast.jsx`)
- PWA: `manifest.webmanifest`, meta tags
- Theme polish: shared Tailwind classes, brand palette, 44px targets
- `dev.cmd` / `build.cmd` for Windows PowerShell execution policy workaround

### Changed

- `GoalForm`: chip selectors for currency, priority, category, color; removed starting balance
- `formatCurrency(amount, currency)` — INR default, USD support
- `goals` schema extension: `currency`, `color` (`supabase/add_currency_color.sql`)
- `src/lib/constants.js` — currencies, categories, color palettes

### Verified

- `npm run lint` and `npm run build` pass (use `npm.cmd` on Windows if PS blocks scripts)

---

## 2026-06-14 (session 3 — deployment)

### Added

- `vercel.json` — SPA rewrite to `/index.html` for client-side routing
- `.env.example` — placeholder env vars for contributors (real keys stay in local `.env`)
- `.vercel` in `.gitignore` — local Vercel link metadata not committed
- Git repo initialized in `savings-tracker` (2 commits on `master`)

### Changed

- `.gitignore` — `.env` and `.env.*` ignored; `!.env.example` allowed

### Deployed

- Vercel project linked: `singhnitin-6610s-projects/savings-tracker`
- Supabase env vars set on Vercel for **production** and **development**
- Production URL: [https://savings-tracker-azure.vercel.app](https://savings-tracker-azure.vercel.app)
- Vercel build: `npm run build` → `dist` (succeeded on iad1)

### Not done (manual follow-up)

- GitHub remote not configured (`gh` CLI unavailable; no `git remote`)
- Preview env vars on Vercel need Git branch context once repo is connected
- Connect GitHub in Vercel dashboard for auto-deploy on push

### Verified

- `npm run build` passes locally (Vite 8, ~870ms)
- Production site loads at `savings-tracker-azure.vercel.app`

---

## 2026-06-14 (session 4 — UI polish)

### Changed

- `GoalCard`: edit/delete are icon-only; delete styled red; removed redundant Saved/Remaining stat boxes
- `GoalCard`: on-track badge moved next to priority chip in header
- `GoalCard`: card click opens `GoalDetailModal`; action buttons use `stopPropagation`
- `src/lib/goalDisplay.js` — shared date/status helpers for card + modal

### Added

- `GoalDetailModal` — full goal details, contributions list, actions (add/edit/delete)

---

## 2026-06-14 (session 5 — export / import)

### Added

- `src/lib/backup.js` — JSON export, parse/validate, import (merge or replace)
- `ImportBackupModal` — file picker, import mode, summary preview
- Dashboard header: Download / Upload icons; empty-state Import backup button
- `deleteAllGoals()` in `goals.js` for replace-mode import

---

## 2026-06-14 (session 6 — Vercel redeploy)

### Deployed

- Production redeploy with UI + backup features (`npx vercel --prod`)
- Alias unchanged: [savings-tracker-azure.vercel.app](https://savings-tracker-azure.vercel.app)

### Noted

- Production showed empty goals for new browsers — expected with pre-auth `device_id` scoping (see session 7)

---

## 2026-06-14 (session 7 — Supabase Auth)

### Added

- `supabase/add_auth.sql` — `user_id` columns, authenticated RLS, `claim_device_data()` RPC
- `src/lib/auth.js` — sign in/up/out, `requireUserId()`, device data claim
- `AuthContext` / `useAuth` — session state via `supabase.auth.onAuthStateChange`
- `LoginPage` — email/password sign in and sign up tabs
- Sign out button (LogOut icon) in Dashboard header

### Changed

- `goals.js` / `contributions.js` — filter and insert by `user_id` (not `device_id`)
- `useGoals({ enabled })` — only fetches when user is signed in
- `App.jsx` — `AuthProvider` gates routes; unauthenticated users see `LoginPage`
- `schema.sql` — fresh installs include auth model
- `backup.js` — import writes `user_id` for signed-in user
- `ImportBackupModal` copy — refers to account, not browser

### Superseded (still in git history)

- Anonymous-only access and permissive anon RLS — replaced after `add_auth.sql` is applied

### Manual setup required

1. Run `supabase/add_auth.sql` in Supabase SQL editor
2. Enable **Authentication → Providers → Email**
3. Redeploy: `npx vercel --prod` (auth UI not yet confirmed deployed in this session)

### Verified

- `npm run lint` and `npm run build` pass after auth changes

---

## 2026-06-14 (session 8 — Google sign-in)

### Added

- `signInWithGoogle()` in `src/lib/auth.js` — `supabase.auth.signInWithOAuth({ provider: 'google' })`
- **Continue with Google** button on `LoginPage` (above email form, with divider)
- `signInGoogle` exposed via `AuthContext` / `useAuth`
- `claimNotice` in `AuthContext` — toast when pre-auth goals linked after any `SIGNED_IN` (incl. OAuth redirect)
- `App.jsx` — shows claim toast via `useToast` when `claimNotice > 0`

### Changed

- `AuthContext` — `claimDeviceData()` runs on `SIGNED_IN` event (covers Google redirect return, not only email submit)
- Email `signIn` / `signUp` no longer return claimed count inline; claim handled centrally on `SIGNED_IN`
- `add_auth.sql` header comments — Google provider + redirect URL setup notes

### Manual setup required

1. Supabase → **Authentication → Providers → Google** → Enable
2. Google Cloud Console → OAuth client (Web) → redirect URI from Supabase
3. Add redirect URLs in Supabase URL Configuration (localhost + Vercel)
4. Redeploy: `npx vercel --prod` (Google UI not confirmed on production yet)

### Verified

- `npm run lint` passes after Google auth changes

---

## 2026-06-14 (session 9 — overall progress pie chart)

### Added

- `ProgressPieChart.jsx` — SVG donut chart in Dashboard overall progress section
- `src/lib/goalDisplay.js` — shared display helpers (if not already noted)

### Changed

- Dashboard overall progress — pie chart replaces or augments prior summary layout

### Deployed

- Production via `npx vercel --prod` (pie chart live on alias)

---

## 2026-06-14 (session 10 — mobile sync diagnostics)

### Added

- `src/lib/account.js` — `getSignInMethod()`, `getAccountLabel()` (email + provider)
- `supabase/fix_contribution_select_rls.sql` — SELECT contributions via goal ownership when `contribution.user_id` missing
- `authReady` in `AuthContext` — goals fetch waits until session + `claimDeviceData()` complete
- Dashboard header — “Signed in as {email} · {Google|Email}”
- Empty state — sync troubleshooting copy (same account, export/import fallback)
- Explicit Supabase client auth options: `persistSession`, `autoRefreshToken`, `detectSessionInUrl`

### Changed

- `useGoals({ enabled: Boolean(user) && authReady })` — avoids race on mobile OAuth return
- `AuthContext` — serialized `establishSession()`; claim on initial `getSession` and `SIGNED_IN`
- Dashboard `useEffect` — refetch when `claimNotice > 0`

### Noted (user troubleshooting)

- Google vs email = separate Supabase users even with same email
- Pre-auth goals only link via `claim_device_data` on the browser that created them
- Desktop must sign in once to attach orphan goals before mobile sync works

### Verified

- `npm run build` passes

---

## 2026-06-14 (session 11 — Vercel production deploy)

### Deployed

- `npx vercel --prod` from `savings-tracker/`
- Deployment: `dpl_Ggv36XGF4mPPvb9JDSCyBchWqCgP`
- Inspect: https://vercel.com/singhnitin-6610s-projects/savings-tracker/Ggv36XGF4mPPvb9JDSCyBchWqCgP
- Production alias unchanged: [savings-tracker-azure.vercel.app](https://savings-tracker-azure.vercel.app)
- Includes: pie chart, mobile sync fixes, Google auth, export/import

---

## 2026-06-14 (session 12 — Phase 2 finance)

### Added

- `supabase/phase2_finance.sql` — `user_profiles`, `accounts`, `categories`, `transactions`, RLS, `get_account_balances()`, `create_transfer()`
- Bottom navigation: Goals · Activity · Summary · Settings (`AppShell`, `BottomNav`, routes)
- `TransactionsPage` — expense/income/transfer list with month filter + FAB
- `SummaryPage` — income, expenses, net, savings rate, category breakdown, account balances
- `SettingsPage` — account info, preferences, bank accounts, spending categories, backup, sign out
- Data layer: `profile.js`, `accounts.js`, `categories.js`, `transactions.js`, `monthlySummary.js` + hooks
- Backup v2 — exports/imports goals + finance data; v1 import still supported

### Changed

- `App.jsx` — authenticated routes under `AppShell`; `/` redirects to `/goals`
- `Dashboard.jsx` — slim header via `PageHeader`; export/import/sign-out moved to Settings
- `backup.js` — `BACKUP_VERSION = 2`, `fetchFullBackupData()`, finance import on replace/merge

### Manual setup required

1. Run `supabase/phase2_finance.sql` in Supabase SQL Editor (after `add_auth.sql`)

### Verified

- `npm run lint` and `npm run build` pass

### Deployed

- `npx vercel --prod` — deployment `dpl_8wdpUKN1mdGTHur37Kxc9iCq1F1A`
- [savings-tracker-azure.vercel.app](https://savings-tracker-azure.vercel.app)

---

## 2026-06-14 (session 13 — smooth tab rendering)

### Added

- `src/context/AppDataContext.jsx` + `app-data-context.js` — shared cache for profile, accounts, categories, goals; transaction cache keyed by month/type/account
- `src/components/PersistentTabs.jsx` — Goals / Activity / Settings stay mounted; toggle via `hidden` + `inert`
- Stale-while-revalidate: `loading` only when cache empty; background `refreshing` keeps prior UI visible

### Changed

- All finance hooks (`useGoals`, `useProfile`, `useAccounts`, `useCategories`, `useTransactions`) — thin wrappers over `AppDataContext`
- `App.jsx` — `AppDataProvider` inside `AuthProvider`; `initialLoading` gates cold start only
- `AuthContext.jsx` — split `initialLoading` vs session refresh; `SIGNED_IN` no longer full-page blocks
- `AppShell.jsx` — `PersistentTabs` replaces `<Outlet />`
- `SummarySection.jsx` — receives `profile` prop; skeleton only on first load
- `TransactionsPage.jsx` — URL `?month=YYYY-MM` sync; single `useCategories` read
- `GoalCard.jsx`, `TransactionRow.jsx` — `React.memo`

### Verified

- `npm run build` passes

### Deployed

- `npx vercel --prod` — `dpl_859p1N6QEu7i6TLV4CJKWRL6ztxw`

---

## 2026-06-14 (session 14 — privacy, balances, mobile FABs)

### Removed

- All financial/email masking — deleted `RevealableMoney.jsx`; amounts and email always visible
- `maskFinancialAmount`, `maskFinancialPercent` (`format.js`); `maskEmail` (`account.js`)

### Changed

- `AccountCard`, `TransactionRow`, `SummarySection`, `CategoryBreakdownChart`, `UserAccountInfo` — plain `formatMoney()` / full email
- `AppDataContext` — `refreshAccounts()` after transaction create/update/delete (balances update in Goals summary)
- `InstallPrompt.jsx` — `pointer-events-none` on full-width wrapper; `pointer-events-auto` on card only
- `Dashboard.jsx`, `TransactionsPage.jsx` — FABs only when `isTabActive`; `z-[60]`; `touch-manipulation`
- `PersistentTabs.jsx` — pass `isTabActive`; modals mount only on active tab

### Fixed

- Mobile: Add goal / Add transaction FAB taps blocked by install prompt overlay and inactive tab layers

---

## 2026-06-14 (session 15 — rupee icon)

### Added

- `src/components/icons/rupeeMark.jsx` — shared ₹ glyph (filled style)
- `public/icon-source.svg`, `public/favicon.svg` — brand purple rounded square + white rupee
- `npm run generate-icons` — PNGs from `icon-source.svg` (`icon-192.png`, `icon-512.png`, `apple-touch-icon.png`)

### Changed

- `RupeeIcon.jsx` — uses same glyph as app icon (not lucide stroke)
- `BottomNav` Activity tab — `RupeeIcon` (unchanged route, updated art)

---

## 2026-06-14 (session 16 — categories perf + summary chart)

### Changed

- `categories.js` — `ensureCategories()` seeds only if empty; `pruneDuplicateCategories()` exported, not run on every refresh
- `AppDataContext` bootstrap — parallel fetch; prune once in background after first `getCategories()`
- `refreshCategories()` — single `getCategories()` (no `ensureCategories` + prune)
- `SettingsPage.jsx` — all categories from cache; expense/income tab filters client-side; skeleton only on first load
- `CategoryBreakdownChart.jsx` — horizontal stacked bar + per-category horizontal bars (pie/donut removed)
- `monthlySummary.js` — group by `categoryDedupeKey`; prefer embedded `tx.category` from join; exclude transfers from currency detection

### Fixed

- Settings categories section slow (redundant prune + double fetch on every refresh)
- Summary category bifurcation wrong when duplicate category IDs or missing map entries

### Verified

- `npm run build` passes

### Deployed (follow-up)

- `npx vercel --prod` — `dpl_9G76wuEeYGzRS8YUTSJeZ4vpkBEt` (bundle: sessions 13–16)

---

## 2026-06-14 (session 17 — mobile modal scroll lock)

### Added

- `src/hooks/useBodyScrollLock.js` — `position: fixed` body lock, ref-count for nested modals, `touchmove` prevention outside panel
- `src/hooks/useModalEscape.js` — Escape key closes open modal
- `src/components/ModalShell.jsx` — shared overlay/backdrop, scroll lock, escape handler
- `index.css` — `.modal-panel`, `.modal-scroll` (`overscroll-contain`)

### Changed

- `TransactionForm`, `AccountForm`, `GoalForm`, `GoalDetailModal`, `AddMoneyModal`, `ImportBackupModal` — use `ModalShell`; panel `overflow-hidden`, scroll only in `data-modal-scroll` region
- Transaction/Account forms restructured: fixed header/footer, scrollable body

### Fixed

- Mobile: background page scrolls when tapping modal CTAs (e.g. Add transaction Save) — touch propagated to page behind overlay

### Verified

- `npm run build` passes

### Deployed

- `npx vercel --prod --yes` — `dpl_GmRJxcUV5vnoNf7NtXjM1Gegzz3c`
- [savings-tracker-azure.vercel.app](https://savings-tracker-azure.vercel.app)

---

## 2026-06-14 (session 18 — Settings UI polish)

### Changed

- `SettingsPage.jsx` — Default currency / Month starts on: single-line rows with icons; currency toggles use ₹ / $ icon buttons
- `UserAccountInfo.jsx` — email only (Sign-in method row removed)
- `CategoryManager.jsx` — categories as colored chips; Expense/Income tab padding increased

---

## 2026-06-14 (session 19 — bottom nav autohide in modals)

### Added

- `ShellChromeContext.jsx`, `shell-chrome-context.js`, `useShellChrome.js`, `useBottomNavAutoHide.js`

### Changed

- `ModalShell.jsx` — `hideBottomNav` prop; slides nav away during goal/transaction forms
- `GoalForm.jsx`, `TransactionForm.jsx` — pass `hideBottomNav`
- `BottomNav.jsx` — `translate-y-full` + `pointer-events-none` when hidden
- `AppShell.jsx` — wraps `ShellChromeProvider`

### Deployed

- `npx vercel --prod --yes` — `dpl_9cMTc1xvgNFSTP9JHS65KiK2JH1w`

---

## 2026-06-14 (session 20 — unified Lucide rupee icon)

### Changed

- `RupeeIcon.jsx` — Lucide `IndianRupee` stroke (matches `$` / `DollarSign` style in Settings)
- `public/icon-source.svg`, `public/favicon.svg` — Lucide ₹ strokes on brand purple (replaces custom filled glyph)
- Regenerated PWA PNGs via `npm run generate-icons`

### Removed

- `src/components/icons/rupeeMark.jsx` — obsolete custom glyph

### Deployed

- Included in `dpl_9cMTc1xvgNFSTP9JHS65KiK2JH1w` and follow-up `dpl_7dAcpAxeSrYu56Qm8vL23NXrxjzP`

---

## 2026-06-14 (session 21 — summary Net + PWA cold start)

### Changed

- `monthlySummary.js` — **Net** = account balances + income − expenses (per currency); `balances` field added
- `SummarySection.jsx` — passes `activeAccounts` into summary; empty state when no activity unless balances exist
- `App.jsx` — top-level `/` and `/summary` redirects; `AppShell` on `/*` (fixes nested `<Navigate>` without `<Outlet />`)
- `PersistentTabs.jsx` — fallback active tab to `/goals` + redirect unknown paths

### Fixed

- PWA standalone: app opened with bottom nav only until tapping a tab (pathname `/` did not match any tab)

---

## 2026-06-14 (session 22 — income transaction → goal)

### Added

- `src/lib/transactionGoal.js` — build goal contribution from transaction (FX conversion via `exchangeRate.js`)

### Changed

- `TransactionForm.jsx` — optional **Add to goal** chips on new **income** transactions
- `TransactionsPage.jsx` — after `createTransaction`, optionally `addContribution` with converted amount/note

---

## 2026-06-14 (session 23 — savings category)

### Added

- `supabase/add_category_is_savings.sql` — `categories.is_savings boolean NOT NULL DEFAULT false`

### Changed

- `CategoryManager.jsx` — **Savings category** checkbox when adding expense categories; **Savings** badge on chips
- `categories.js` — persist `is_savings` on create (expense only)
- `monthlySummary.js` — exclude `is_savings` expenses from spending totals and breakdown chart
- `transactions.js` — embed `is_savings` in category join
- `backup.js` — export/import `is_savings`

### Manual setup required

1. Run `supabase/add_category_is_savings.sql` in Supabase SQL Editor

### Verified

- `npm run build` passes (local; sessions 21–23 not yet deployed)

---

## 2026-06-14 (session 24 — Net = balances + one-time offset)

### Changed

- `monthlySummary.js` — **Net** = account `balances` only (not `balances + income − expenses`)
- `monthlySummary.js` — **Savings** = savings-category expenses + goal contributions in month; **savings rate** = savings ÷ income
- `SummarySection.jsx` — one-time INR ₹15,000 exclusion from Net on first summary view with real data per user (`localStorage` key `savings-lite-net-offset-15000-{userId}`); applies after load (not during empty/loading state)

### Superseded

- Session 21 formula: `net = balances + income − expenses` — replaced by Net = balances (session 24)

### Deployed

- `npx vercel --prod --yes` — `dpl_48F1c9qrJvjbAKDimti8vA2WqvbG` (Net = balances fix)
- [savings-tracker-azure.vercel.app](https://savings-tracker-azure.vercel.app)

### Verified

- `npm run build` passes

---

## 2026-06-14 (session 25 — expense transaction → goal)

### Changed

- `TransactionForm.jsx` — optional **Add to goal** chips on new **expense** transactions (same UI as income); `goal_id` preserved when switching expense ↔ income
- `transactionGoal.js` — contribution note labels `From expense transaction` / `From income transaction`
- `TransactionsPage.jsx` — passes `transactionType: data.type` to `buildGoalContributionFromTransaction`

### Noted

- Expense with selected goal: ledger expense + separate goal contribution (same pattern as income; no transaction FK)

### Verified

- `npm run build` passes (local; session 25 not yet deployed)

---

## 2026-06-14 (session 23 follow-up — savings migration applied)

### Applied (Supabase production)

- `supabase/add_category_is_savings.sql` on project `qmdkituqyogwtadderck`

---

## 2026-06-14 (session 26 — Net offset synced to profile)

### Added

- `supabase/add_net_balance_adjustment.sql` — `user_profiles.net_balance_adjustment_inr`
- Net offset moved from `localStorage` to profile so web + PWA show same Net

### Changed

- `monthlySummary.js` — `getNetBalanceAdjustment`, profile-backed offset; legacy localStorage migration
- `SummarySection.jsx` — `saveProfile` on first offset apply

### Applied (Supabase production)

- `add_net_balance_adjustment` migration on `qmdkituqyogwtadderck`

### Deployed

- `dpl_2tnWRr47czMcA4FuPmkNLAgGnrvA` (expense→goal bundle)

---

## 2026-06-14 (session 27 — PWA white screen)

### Fixed

- `SummarySection.jsx` — restored missing `useState` import (runtime crash on Goals tab → blank PWA)

### Deployed

- `dpl_4561DtfyVqRpxwRxn3SoeWgerzon`

---

## 2026-06-14 (session 28 — summary goals separate + Net formula)

### Changed

- `SummarySection.jsx` — separate **Savings** (categories) and **Goals** columns; **Goals this month** list
- `monthlySummary.js` — `byGoalSavings` per-goal breakdown; Net = `balances − expenses` (later superseded)

### Deployed

- `dpl_8k3xCQRZSM41LdHPWR4ZQt1aCjRq`

---

## 2026-06-14 (session 29 — remove one-time ₹15k Net offset)

### Removed

- All one-time Net offset logic (`NET_ONE_TIME_BALANCE_EXCLUSION`, localStorage helpers, profile sync in `SummarySection`)
- “₹15,000 excluded from balance” UI hint
- `net_balance_adjustment_inr` from backup export/import

### Deployed

- `dpl_3QkEXL59MChC2sfosB4GLvxugHjB`

---

## 2026-06-14 (session 30 — Total balance matches Settings)

### Fixed

- `monthlySummary.js` — Net/Total = sum of account balances only (was `balances − monthly expenses`, which double-counted expenses already in ledger balances)

### Changed

- `SummarySection.jsx` — label **Total balance** (replaces **Net**); displays `summary.balances`

### Deployed

- `dpl_5J4c9T2DgLnJkAugQg5RkgoY4wek`, `dpl_BM52w36dun6wQFhezYNoQJhwz4yY` (label)

---

## 2026-06-14 (session 31 — remove savings rate from summary)

### Removed

- **Savings rate** column from monthly summary grid (`lg:grid-cols-5`)

### Deployed

- `dpl_J8AYJzLDifXG1a5i8CVhrMQ72BZT` — latest production

---

## 2026-06-16 (session 32 — spending by category bar charts)

### Changed

- `CategoryBreakdownChart.jsx` — rewritten as **vertical bar charts**: per-category bars scaled to the top spender, compact amount labels above bars, category names below, light grid lines, horizontal scroll for many categories; legend list (amount + %) retained below
- Uses `formatCurrencyCompact` for bar labels; `formatMoney` for legend/title

### Deployed

- `npx vercel --prod --yes` — `dpl_4bydxU1xLQW6ph2pFbBTN2qWj3Fm` (latest production)

### Verified

- `npm run build` passes

---

## 2026-06-16 (session 33 — feature direction; budgets deferred)

### Decisions (no code change)

- Brainstormed next features (recurring transactions, category budgets, trend chart, goal forecasting, dark mode, insights, etc.)
- **Category budgets deferred** — user declined for now; plan drafted then set aside (`.cursor/plans/category_budgets_*.plan.md`)
- No feature selected for implementation yet

---

## 2026-06-16 (session 34 — category budgets)

> Reverses session 33 deferral — user chose to implement the drafted plan.

### Added

- `supabase/add_category_budget.sql` — `categories.monthly_budget numeric NOT NULL DEFAULT 0 CHECK (>= 0)` (**applied** on prod Supabase `qmdkituqyogwtadderck`)
- `src/components/BudgetManager.jsx` — per-expense-category monthly budget editor (deduped expense cats, excludes `is_savings`); Save calls `updateCategory`
- Settings **Budgets** section (after Categories) rendering `BudgetManager`

### Changed

- `categories.js` — `createCategory` persists `monthly_budget` (expense only; clamped ≥ 0)
- `monthlySummary.js` — `buildMonthlySummary` builds `expenseBudgets` map by `categoryDedupeKey`, attaches `budget` to each `byExpenseCategory` item, returns `expenseBudgetTotal`
- `CategoryBreakdownChart.jsx` — dashed budget target line per bar; bar turns rose when over budget; legend shows `spent / budget` + "over by X" tag; header shows total spent / total budget
- `SummarySection.jsx` — passes `budgetTotal={summary.expenseBudgetTotal}` to chart
- `backup.js` — export/import `monthly_budget`

### Notes

- Budgets are a plain number compared within each currency group (single-currency INR is the common case)
- Categories with a budget but no spending don't render a bar, but count in `expenseBudgetTotal`

### Deployed

- `npx vercel --prod --yes` — `dpl_6Ha3rUxhexj1KefwAZLsNLMpuvt3` (latest production)

### Verified

- `npm run build` passes

---

## 2026-06-16 (session 35 — production redeploy)

### Deployed

- `npx vercel --prod --yes` — `dpl_5omZmdhEkxa43YcojQAsjGs3oX2R` (latest production; no code changes since session 34)

### Verified

- `npm run build` passes locally and on Vercel (iad1)

---

## 2026-06-16 (session 36 — production redeploy)

### Deployed

- `npx vercel --prod --yes` — `dpl_H3ZAQPpHAcUPAv8RN2VbZfBnKWp5` (latest production; no code changes since session 35)

### Verified

- `npm run build` passes locally and on Vercel (iad1)

---

## 2026-06-16 (session 37 — summary default currency only)

### Changed

- `monthlySummary.js` — `groupSummariesByCurrency` accepts `preferredCurrency`; when set, returns a single summary for that currency only (no multi-currency blocks)
- `SummarySection.jsx` — uses `profile.default_currency ?? 'INR'` as `preferredCurrency`; **Balances** list under summary filtered to same currency

### Noted

- USD (or other) goals/accounts still work in Goals, Activity, and Settings; only the Goals-tab monthly summary + balance list are scoped to default currency

### Deployed

- `npx vercel --prod --yes` — `dpl_3vXo8iDvn63rboSRJ5ZLwWY5DMrT` (latest production)

### Verified

- `npm run build` passes locally and on Vercel (iad1)

---

## 2026-06-16 (session 38 — goal save / load fix)

### Bug

- Saving or editing a goal (reported on **IND Money** goal) showed **Failed to load goals** and the UI did not update — save often succeeded in Supabase but post-mutation refresh failed

### Root cause

- `getGoalsWithContributions` used nested `contributions(*)` embed; production contributions RLS only allowed `user_id = auth.uid()` while 4/6 contributions had null `user_id` (pre-auth orphans)
- `fix_contribution_select_rls.sql` existed but was **never applied** on prod
- `runGoalsMutation` treated refresh failure as mutation failure even when create/update/add already succeeded

### Changed

- `goals.js` — fetch goals and contributions in two queries, merge client-side (avoids fragile nested embed)
- `AppDataContext.jsx` — optimistic goal cache merge on create/update/delete/contribution mutations; refresh failure no longer fails the user action
- `errors.js` — include Supabase `details`/`hint` in thrown messages
- `supabase/fix_contribution_rls_and_backfill.sql` — backfill `contributions.user_id` from parent goal + apply goal-ownership SELECT policy

### Database (prod Supabase)

- Migration `fix_contribution_rls_and_backfill` applied on `qmdkituqyogwtadderck`

### Deployed

- `npx vercel --prod --yes` — `dpl_8bxRorY2gXGbBSMfTmLWeFX9rtwe` (latest production)

### Verified

- `npm run build` passes locally and on Vercel (iad1)

---

## 2026-06-16 (session 39 — edit transaction tab + tx→goal)

### Bugs

- Tapping **Edit** on Activity tab jumped to **Goals** tab with no edit modal (modal lived inside `display:none` inactive tab; `TransactionForm` gated on `isTabActive`)
- **IND Money** (USD goal) did not show money after adding an INR transaction with goal selected — FX fetch could fail on mobile/PWA; contribution refresh could wipe optimistic update

### Changed

- `ModalShell.jsx` — portal modals to `document.body` (not clipped by inactive tab)
- `PersistentTabs.jsx` — inactive tabs use off-screen visibility instead of `hidden` (`display:none`)
- `TransactionsPage.jsx` — keep form mounted when `formOpen`; force `/transactions` route while form open; clearer goal-contribution errors
- `exchangeRate.js` — INR↔USD fallback rates when Frankfurter unreachable
- `transactionGoal.js` / `contributions.js` — reject zero/invalid converted amounts
- `AppDataContext.jsx` — `preserveContributionsOnRefresh` so refresh does not drop contributions

### Deployed

- `npx vercel --prod --yes` — `dpl_4CxBcnXQ1yK6bfznUpV6DrBCFxu2` (latest production)

### Verified

- `npm run build` passes locally and on Vercel (iad1)

---

## 2026-06-16 (session 40 — desktop-first responsive redesign)

### Changed

- **Shell:** `SidebarNav.jsx` (lg+ left nav); `AppShell` flex layout; `BottomNav` mobile-only (`lg:hidden`); `.app-shell` / `.app-main` / `.page-container` utilities; `max-w-content` (90rem)
- **Goals:** two-column layout — sticky `SummarySection` left, goals grid right; header **New goal** button on lg+; FAB mobile-only
- **Activity:** xl sidebar for month + filters; table-style `TransactionRow` on lg+; header **Add transaction** on lg+
- **Settings:** two-column section grid; Categories | Budgets side-by-side on xl
- **Overlays:** `ModalShell` bottom-sheet below lg, centered on lg+; toasts top-right on desktop; `InstallPrompt` hidden on lg+
- **Charts / auth:** fluid category bars on desktop; `ProgressPieChart` horizontal on lg; `LoginPage` split branding panel on lg+

### Noted

- Breakpoint: **lg (1024px)** switches mobile shell ↔ desktop shell; mobile/PWA unchanged below lg

### Deployed

- `npx vercel --prod --yes` — `dpl_3bXvRfoZsDjq6FZJRfyFf1eSjYBz` (latest production)

### Verified

- `npm run build` passes locally and on Vercel (iad1)

---

## 2026-06-16 (session 41 — chart overflow + tab flash)

### Fixed

- `CategoryBreakdownChart` — `compact` mode for Goals sidebar; fluid bars with `min-w-0`; scroll contained in card on desktop
- `PersistentTabs` — inactive tabs no longer `h-0`; preserve scroll/layout when switching tabs
- Transaction cache — stale-while-revalidate (`stale` flag); no skeleton flash on tab switch or background refresh
- `useTransactions` — fetch only when cache empty or stale; removed `txCacheVersion` effect dependency

### Deployed

- `npx vercel --prod --yes` — `dpl_G63rco3hVp95zEB9Bscz5MpCiPhh` (latest production)

### Verified

- `npm run build` passes locally and on Vercel (iad1)

---

## 2026-06-16 (session 42 — browser tab / Chrome focus flash)

### Fixed

- `AuthContext` — silent `TOKEN_REFRESHED`; same-user `SIGNED_IN` no longer resets `authReady`
- `AppDataContext` — `clearAll()` only on sign-out (`!user`), not on brief `authReady` dip
- Data hooks — return cached data while user present; fetch still gated on `authReady`

### Deployed

- `npx vercel --prod --yes` — `dpl_D6Jdkdj5bMfYmXLvyPhSSDEVKmeq` (latest production)

### Verified

- `npm run build` passes locally and on Vercel (iad1)

---

## 2026-06-23 (session 43 — finance feature pack)

### Added

- **Net worth tracker** — `src/lib/netWorth.js` reconstructs monthly balance timeline from full ledger + current account balances (no DB migration); `NetWorthCard` + `LineChart` on Activity tab
- **Month-over-month insights** — `src/lib/insights.js` + `InsightCards` (spending/income/savings deltas, biggest category movers, over-budget alerts)
- **Goal forecasting** — `src/lib/forecast.js`; `GoalCard` shows estimated completion date and early/late vs deadline from trailing 3-month contribution pace
- **Activity search & filters** — text search (note/category/account), account dropdown, amount min/max; client-side on loaded month with result count + clear
- **Full history cache** — `loadHistory` / `getHistoryEntry` in `AppDataContext`; `useTransactionHistory` hook; marked stale on tx/account mutations

### Skipped (per user)

- Recurring transactions (needs new table — deferred)

### Verified

- `npm run build` passes locally and on Vercel (iad1)

### Deployed

- `npx vercel --prod --yes` — `dpl_12u4qX5Q7gNcmSTN6PsHGFo3VdSd` (latest production)
- Production alias: https://savings-tracker-azure.vercel.app

---

## 2026-06-23 (session 44 — goals summary bars)

### Changed

- **`GoalsProgressBars`** — new sidebar card showing all goals as horizontal progress bars, sorted lowest-% first
- **`SummarySection`** — goals bars placed at top of summary; removed redundant "Goals this month" list
- **`Dashboard`** — removed aggregate "Overall progress" pie chart (per-goal bars replace it)

### Verified

- `npm run build` passes locally

### Deploy status

- `npx vercel --prod --yes` — `dpl_CV9D4vX2mQn83gWEN7ajfB4egr1X` (latest production)
- Production alias: https://savings-tracker-azure.vercel.app

---

## 2026-06-23 (session 45 — transaction add fix)

### Fixed

- **`TransactionForm`** — category ids in `resetKey`; auto-fallback to first category when none selected
- **`AppDataContext`** — `mergeTransactionIntoCache()` after create; invalidate by transaction date period via `getPeriodForDate()`
- **`TransactionsPage`** — switch month picker to tx date month; clear type/account filters when they would hide new tx
- **`transactions.js`** — `getPeriodForDate()`, `transactionMatchesCacheFilters()`; transfer create loads single row (not full history)

### Deployed

- `npx vercel --prod --yes` — `dpl_BrDv9LqEZP25gdcTSULBYMu1b3AA` then `dpl_asdLrUn7GsVKVUNEX7YmQhbHtwk9` (latest production)
- Production alias: https://savings-tracker-azure.vercel.app

### Verified

- `npm run build` passes locally and on Vercel (iad1)

---

## 2026-06-23 (session 46 — remove Activity overview)

### Removed

- Activity **Overview** section (`NetWorthCard`, `InsightCards`, collapsible toggle) from `TransactionsPage`
- Full-ledger fetch path: `loadHistory`, `useTransactionHistory`, `AppDataContext.history` state
- Orphan files: `NetWorthCard.jsx`, `InsightCards.jsx`, `LineChart.jsx`, `netWorth.js`, `insights.js`, `useTransactionHistory.js`, `ProgressPieChart.jsx`

### Fixed

- **Tx cache keys** — `buildTransactionsCacheKey` uses `|` delimiter + `parseTransactionsCacheKey()` so UUID account ids parse correctly in `mergeTransactionIntoCache`
- **Invalidation prefixes** — `buildTransactionsCachePrefix(year, month)` for period-based stale marking

### Verified

- `npm run build` passes locally (bundle ~599 kB JS, down from overview/history code)

### Deployed

- `npx vercel --prod --yes` — `dpl_UESw1RoWFExdYPKfvyNsSaQzQS1a` (latest production)
- Production alias: https://savings-tracker-azure.vercel.app

---

## 2026-06-23 (session 47 — categories, recurring, bank icons)

### Added

- **Sub-categories** — `categories.parent_id`; tree UI on `/settings/categories`; grouped picker in `TransactionForm`
- **Category freedom** — no auto-seed; delete any category; bulk delete all; optional starter pack button
- **Recurring transactions** — `recurring_transactions` table; auto-post on app open; pause/skip; `/settings/recurring`
- **Bank icons** — `accounts.bank` slug; ICICI/SBI/HDFC/Axis stylized icons on `AccountForm` + `AccountCard`
- **Migration** — `supabase/add_subcategories_recurring_bank.sql`

### Changed

- **Settings** — Finance links replace inline category manager; budgets remain on main settings page
- **Backup** — v3 with `parent_name`, `bank`, `recurring_transactions`

### Fixed

- **`add_subcategories_recurring_bank.sql`** — `DROP FUNCTION IF EXISTS get_account_balances()` before recreate (Postgres `42P13` when return row type adds `bank` column); `DROP POLICY IF EXISTS` on recurring RLS for idempotent re-runs

### Deployed

- `npx vercel --prod --yes` — `dpl_FeHGJsUPndg94gMdPag3xoXZW8wD` (latest production)
- Production alias: https://savings-tracker-azure.vercel.app

### Verified

- `npm run build` passes locally and on Vercel (iad1)

---

## 2026-06-23 (session 48 — goals list + detail modal)

### Changed

- **`GoalsProgressBars`** — shows **days left** per goal (color-coded); rows clickable
- **`Dashboard`** — main “Your goals” column uses progress bars only; **`GoalCard` grid removed**
- **`GoalDetailModal`** — full goal detail on click (contributions, forecast, add/edit/delete); forecast + required monthly added to modal
- **`SummarySection`** — duplicate `GoalsProgressBars` removed (goals live in main column only)

### Verified

- `npm run build` passes locally

---

## 2026-06-23 (session 49 — daily recurring)

### Added

- **Daily recurring** — `frequency: 'daily'` in form + `advanceNextRunDate` via `addDays`
- **Migration** — `supabase/add_recurring_daily_frequency.sql` (widens CHECK constraint)

### Verified

- `npm run build` passes locally

---

## 2026-06-23 (session 50 — Activity pagination)

### Added

- **Activity pagination** — 10 / 50 / 100 per page; Previous/Next; range label; resets on filter/month change

### Changed

- **`TransactionRow`** — amount + **Edit** / **Delete** text buttons on one line (transfers: Delete only)

### Verified

- `npm run build` passes locally

---

## 2026-06-23 (session 51 — horizontal category chips)

### Changed

- **`CategoryTreeManager`** — parent + sub-categories in horizontal flex-wrap chip groups (replaces vertical indented list)

### Verified

- `npm run build` passes locally

---

## 2026-06-23 (session 52 — production deploy)

### Deployed

- `npx vercel --prod --yes` — `dpl_35QfDCM9dFrooiG4DYNYDF6kvT81` (latest production)
- Production alias: https://savings-tracker-azure.vercel.app

### Verified

- `npm run build` passes locally and on Vercel (iad1)

---

## 2026-06-23 (session 53 — full-width spending chart)

### Changed

- **`SummarySection`** + **`Dashboard`** — spending chart full desktop width via `goalsSlot` layout; stats row above chart; goals in right column
- **`CategoryBreakdownChart`** — `large` prop (300px desktop bar height)

### Verified

- `npm run build` passes locally

---

## 2026-06-23 (session 54 — chart label overlap fix)

### Fixed

- **`CategoryBreakdownChart`** — removed fixed 200px container vs 300px bars; amount labels above dedicated bar area (no overlap with tall bars)

### Verified

- `npm run build` passes locally

---

## 2026-06-23 (session 55 — production deploy)

### Deployed

- `npx vercel --prod --yes` — `dpl_9aMD9x3TVwRBRNeFkkPWhgvfiYz2` (latest production)
- Production alias: https://savings-tracker-azure.vercel.app

### Verified

- `npm run build` passes locally and on Vercel (iad1)

---

## 2026-06-23 (session 56 — merge Home + Summary tabs)

### Added

- **`HomePage.jsx`** — goals (`GoalsProgressBars` + modals) + embedded Activity (`TransactionsPage` with `embedded` prop)
- **`SummaryPage.jsx`** — dedicated charts/monthly breakdown page at `/summary`

### Changed

- **Navigation** — 3 tabs: **Home** (`/goals`), **Summary** (`/summary`), **Settings**; removed separate Goals / Activity tabs
- **`SummarySection`** — simplified; charts/stats/balances only (no `goalsSlot`)
- **`PersistentTabs`** — `/goals` → `HomePage`, `/summary` → `SummaryPage`; `/transactions` redirects to `/goals`
- **`BottomNav` / `SidebarNav`** — Home + Summary icons (`LayoutDashboard`, `BarChart3`)
- **`Dashboard.jsx`** — re-exports `HomePage` for compatibility

### Verified

- `npm run build` passes locally

---

## 2026-06-23 (session 57 — spending by category pie chart)

### Changed

- **`CategoryBreakdownChart.jsx`** — rewritten as **SVG pie chart**: slices proportional to category share of monthly spending; white stroke between slices; hover `<title>` with name, amount, budget; centered chart with responsive sizing via `large` prop
- **`constants.js`** — `fill` hex on each `COLOR_PALETTES` entry for SVG slice colors
- **Budget UX preserved** — header total spent / total budget; over-budget slices use rose (`#f43f5e`); legend shows `spent / budget`, %, and "over by X" badge

### Removed

- Vertical bar chart layout (bar height scaling, grid lines, horizontal scroll, dashed budget target lines per bar)
- **`compact` prop** — chart only rendered on Summary tab (`SummarySection`); sidebar bar mode no longer needed

### Superseded

- Session 32 vertical bar charts — replaced by pie chart (session 57)
- Session 54 bar label overlap fix — N/A for pie layout

### Verified

- `npm run build` passes locally

### Deploy status

- Shipped in v0.17 production deploy (`dpl_JAuw2D4fW8sw1RnA1KUFG6mtmx62`) — session 59

---

## 2026-06-23 (session 58 — chart settings menu)

### Added

- **`chartPreferences.js`** + **`useChartPreferences`** — load/save chart UI prefs in `localStorage` (`savings-lite-chart-preferences`)
- **Settings gear** (`Settings2`) top-right on `CategoryBreakdownChart` — popover panel with Done/Reset

### Changed

- **`CategoryBreakdownChart`** — supports **pie** and **donut** styles; donut shows total in center; legend sort by amount or name; toggle show/hide category list
- Slice order follows sort preference (amount default)

### Verified

- `npm run build` passes locally

---

## 2026-06-23 (session 59 — production deploy)

### Deployed

- `npx vercel --prod --yes` — `dpl_JAuw2D4fW8sw1RnA1KUFG6mtmx62` (latest production)
- Production alias: https://savings-tracker-azure.vercel.app
- Bundle includes: v0.15 Home + Summary tabs, v0.16 SVG pie chart, v0.17 chart settings

### Noted

- No GitHub remote configured — Vercel CLI deploy only
- PWA users may need force-close to pick up new bundle

### Verified

- `npm run build` passes locally and on Vercel (iad1)

---

## 2026-06-23 (session 60 — slice hover tooltip)

### Added

- **`SliceTooltip`** — rich HTML tooltip on slice hover/focus: category name, amount, % of spending, budget, over-by amount
- Tooltip positioned at slice midpoint above segment

### Changed

- **`CategoryBreakdownChart`** — slices `cursor-pointer`; dim non-hovered slices; thicker stroke on active slice; slices keyboard-focusable (`tabIndex={0}`)
- Native SVG `<title>` retained as screen-reader fallback

### Deploy status

- Not yet deployed to production (local only after session 60)

---

## 2026-06-23 (session 61 — resizable chart + summary trim)

### Added

- **Chart size preference** — `prefs.size` in `chartPreferences.js` (default 380px, min 200, max 560)
- **Drag resize handle** — bottom-right corner on chart; pointer drag updates size
- **Size slider** in chart settings popover

### Changed

- **`CategoryBreakdownChart`** — square chart sized via `prefs.size`; always center-aligned; responsive `min(size, 100%)` on narrow screens
- **`SummarySection`** — removed **Income by category** list card (Income stat in summary grid unchanged)

### Verified

- `npm run build` passes locally

### Deploy status

- Not yet deployed to production (local bundle includes sessions 60–61)

---

## 2026-07-04 (session 62 — Phase 2 commit + daily recurring fix)

### Added

- **Git commit on `master`** — `f912255` bundles Phase 2 finance app (114 files): auth, accounts, transactions, categories, budgets, recurring, PWA, desktop shell, Supabase migrations, project memory
- **`normalizeRecurringSchedule()`** in `recurringTransactions.js` — shared schedule normalization for create/update; clears `day_of_month` for non-monthly rules; recalculates `next_run_date`

### Changed

- **`add_recurring_daily_frequency.sql`** — idempotent `DO` block drops any existing frequency CHECK on `recurring_transactions` before re-adding with `daily`
- **`add_subcategories_recurring_bank.sql`** — appended same frequency CHECK fix at end (re-run safe for DBs created before session 49)
- **`RecurringTransactionForm`** — “Every” label shows unit (days/weeks/months/years) for selected frequency
- **`updateRecurringTransaction`** — recalculates schedule when frequency/start/interval/day fields change

### Fixed

- **Daily recurring create fails** — Postgres CHECK on `frequency` rejected `daily` on DBs migrated before session 49; migration + app error mapping (`assertRecurringNoError`) with actionable message
- **Local build** — `node_modules` missing Rolldown native binding + non-executable `vite` binary; fixed via `rm -rf node_modules && npm install`

### Verified

- `npm run build` passes locally (Vite 8.0.16, ~834ms–1.4s)

### Not done (manual follow-up)

- **Git push** — no `origin` remote configured; push blocked pending remote URL
- **Supabase** — run `add_recurring_daily_frequency.sql` (or re-run end of `add_subcategories_recurring_bank.sql`) on production if daily recurring still fails
- **Production deploy** — local fixes not yet on Vercel

---

## 2026-07-04 (session 63 — separate tabs, USD goals, category snapshots)

### Added

- **4-tab navigation restored** — Goals · Activity · Summary · Settings (`/goals`, `/transactions`, `/summary`, `/settings`)
- **`transactionCategory.js`** — `resolveTransactionCategory()`, `fetchCategorySnapshot()`, `categorySnapshotFromRow()`
- **Migration** — `supabase/add_transaction_category_snapshot.sql` — `category_name`, `category_color`, `category_is_savings` on `transactions`

### Changed

- **`HomePage`** — goals only; title “Goals”; removed embedded `TransactionsPage`
- **`PersistentTabs`** — `/transactions` is its own tab again; removed redirect to `/goals`
- **`BottomNav` / `SidebarNav`** — 4 columns; icons Target + Receipt; labels Goals / Activity
- **`SummarySection`** — “Add transaction” / “View transactions” links → `/transactions?month=…`
- **`TransactionsPage`** — removed `embedded` prop; month query stays on Activity tab
- **`deleteCategory` / `deleteAllCategories`** — freeze category label onto linked transactions before delete

### Fixed

- **USD goal hidden on Goals tab** — `GoalsProgressBars` filtered by `profile.default_currency`; INR goals caused USD goals (e.g. Indmoney) to be omitted; now shows all goals
- **Category delete/rename changed past transactions** — transactions only stored `category_id`; delete nullified link; rename changed joined label; snapshot fields + display prefer snapshot

### Verified

- `npm run build` passes locally

### Not done (manual follow-up)

- **Supabase** — run `add_transaction_category_snapshot.sql` for snapshot columns + backfill
- **Production deploy** — session 63 changes local only

---

## 2026-07-04 (session 64 — Activity table + pagination)

### Changed

- **Activity pagination** — controls only at bottom of transaction list (removed duplicate top bar)
- **`TransactionRow`** — shared `TRANSACTION_TABLE_GRID` aligns header + rows on desktop: Icon · Description · Account · Amount · Actions
- **`TransactionTableHeader`** — exported from `TransactionRow.jsx`; column headers match row grid
- **Edit/Delete actions** — Lucide `Pencil` / `Trash2` icon buttons with `aria-label` (replaces text links)

### Verified

- `npm run build` passes locally

---

## 2026-07-04 (session 65 — Goals cards, Activity polish, Settings trim)

### Changed

- **Goals tab** — `GoalCard` responsive grid (`1→2→3→6` cols on `xl`); `compact` mode hides track badge, contributions accordion, forecast; **days left** top-right only (no end date row)
- **`HomePage`** — “New goal” dashed CTA below card grid; removed header button and mobile FAB
- **Navigation order** — Summary first in `BottomNav` / `SidebarNav`; `/` and PWA `start_url` → `/summary`; unknown paths fallback to `/summary` in `PersistentTabs`
- **Activity nav icon** — `RupeeIcon` (₹) replaces Lucide `Receipt` on Activity tab
- **Activity layout** — filters in one card above list; transaction table full page width (removed desktop sidebar column layout)
- **Activity filters** — type chips only (All / Expense / Income / Transfer); removed search, account dropdown, min/max amount
- **`TransactionForm` / `RecurringTransactionForm`** — category chips in single `flex-wrap` row; compact `categoryChipBase`; subcategories labeled `Parent · Child`
- **`.chip-row`** — `flex-wrap` instead of `flex-nowrap` (global)
- **Settings** — removed **Budgets** section (`BudgetManager`); single vertical stack for Account, Preferences, Balances, Finance, Data, Sign out (no `lg:grid-cols-2`)

### Superseded

- **`GoalsProgressBars`** on Goals tab — replaced by `GoalCard` grid (session 65)
- **Settings Budgets UI** — removed from Settings page; `categories.monthly_budget` + chart budget display unchanged (F-76 data layer retained)
- **Default landing tab** — was `/goals`; now `/summary` (session 65)
- **Activity advanced filters** — search/account/amount removed (session 65)

### Verified

- `npm run build` passes locally

---

## 2026-07-04 (session 66 — Summary Overall / Monthly tabs)

### Added

- **Summary view toggle** — segmented **Overall** | **Monthly** tabs in `SummarySection`; default **Overall**
- **All-time transaction cache** — `buildOverallTransactionsCacheKey()`; `useTransactions({ allTime: true })` loads full history via `getTransactions()` without date bounds
- **`sumAllGoalContributions()`** — lifetime goal savings in Overall view

### Changed

- **`SummarySection`** — Overall shows all-time income/expenses/savings/goals + spending chart; Monthly keeps month picker and per-month stats
- **`groupSummariesByCurrency()`** — `allTime` flag; skips monthly budget lines on Overall chart (`includeBudgets: false`)
- **`AppDataContext.loadTransactions`** — supports `allTime` branch alongside month-scoped fetch
- **`SummaryPage`** subtitle — “Overall and monthly breakdown”

### Superseded

- **Summary monthly-only** — user picks Overall or Monthly tab (session 66)

### Verified

- `npm run build` passes locally

---

## 2026-07-04 (session 67 — category spending heatmap)

### Changed

- **`CategoryBreakdownChart`** — spending by category shown as a **heatmap** (flex tiles sized by share of total; color intensity by relative spend); replaces pie/donut SVG chart
- **Heatmap tiles** — category name, amount, % on each cell; hover/focus tooltip with budget/over-by; over-budget categories in rose
- **Chart settings** — sort tiles by amount/name; show/hide category list; removed pie/donut style toggle and resize handle/slider
- **`chartPreferences.js`** — prefs simplified to `{ showLegend, sortBy }`; legacy pie/donut/size keys ignored on load

### Superseded

- **Category pie/donut chart** — heatmap session 67 (F-129); pie code removed from `CategoryBreakdownChart.jsx`
- **Resizable chart size** — removed with heatmap (session 61 `prefs.size` no longer used)

### Verified

- `npm run build` passes locally

---

## 2026-07-04 (session 68 — heatmap category transactions modal)

### Added

- **`CategoryTransactionsModal.jsx`** — read-only modal listing transactions for a heatmap category; 10 per page with Previous/Next pagination
- **`getTransactionExpenseCategoryKey()` / `filterTransactionsForHeatmapCategory()`** in `monthlySummary.js` — same dedupe-key bucketing as heatmap aggregation

### Changed

- **`CategoryBreakdownChart`** — heatmap tiles clickable; opens modal with filtered transactions scoped to Summary currency and view (Overall all-time vs Monthly month)
- **`SummarySection`** — passes `transactions` prop into chart for modal filtering
- **Chart settings** — sort tiles by amount/name only; **removed** category list below heatmap (`showLegend` pref dropped from `chartPreferences.js`)

### Superseded

- **Category list under heatmap** — heatmap-only layout (session 68); v0.24 note about toggling list is obsolete

### Verified

- `npm run build` passes locally

---

## 2026-07-04 (session 69 — production deploy + git remote)

### Deployed

- **Production:** [savings-tracker-azure.vercel.app](https://savings-tracker-azure.vercel.app) — `dpl_7xNLvAb4tVxRCePmp1A88cM7S9hV` (heatmap + Overall/Monthly Summary + category tx modal)
- **Vercel build:** `npm run build` succeeded on iad1; Supabase env vars present for Production + Development

### Git

- **Commit:** `550a09e` on `master` — “Replace summary pie chart with heatmap and category transaction modal.”
- **Remote added:** `origin` → `https://github.com/nitinsinghbalyan/Savings-Tracker-WebApp.git`

### Not done (manual follow-up)

- **`git push -u origin master`** — blocked without GitHub credentials in non-interactive shell; run locally after auth
- **Remote divergence** — GitHub `master` at `3b3344f` may differ from local `550a09e`; reconcile before push if rejected
- **Supabase migrations** (if not applied): `add_recurring_daily_frequency.sql`, `add_transaction_category_snapshot.sql`

---

## 2026-07-05 (session 70 — Activity page fix)

### Fixed

- **Activity broken without snapshot migration** — create/update transaction failed when `category_name`/`category_color`/`category_is_savings` columns missing on `transactions`
- **`isMissingSnapshotColumnError()`** in `errors.js` — detects Postgres `42703` / PostgREST `PGRST204`
- **`createTransaction` / `updateTransaction`** — retry insert/update without snapshot fields when columns absent
- **`freezeTransactionSnapshotsForCategories`** — skip snapshot freeze on delete when columns absent
- **Empty month stuck loading** — tx cache entries track `loaded`; `useTransactions` refetches only when `!loaded || stale`
- **Invalid transaction dates** — `formatTransactionDateLabel()` guards null/invalid dates (no list crash)
- **`TransactionsPage`** — mount `TransactionForm` only when `formOpen` (not on every tab visit)

### Changed

- **`SidebarNav.jsx`** — fix malformed tabs array (Activity + Settings on separate lines)

### Verified

- `npm run build` passes locally

---

## 2026-07-06 (session 71 — production deploy)

### Deployed

- **Production:** [savings-tracker-azure.vercel.app](https://savings-tracker-azure.vercel.app) — `dpl_9Vx2e5VejXN4teqtWqYvvogPKu56` (Activity snapshot fallback)
- **Prior deploy:** `dpl_FL8ipthCHE6tsPMVBhRymfKvuEvq` (same fix bundle, session 70)
- **Vercel build:** `npm run build` succeeded on iad1

### Git

- **Commit:** `b1a24b3` on `master` — “Fix Activity page when category snapshot migration is missing.”
- **Push:** still pending GitHub auth in non-interactive shell

### Not done (manual follow-up)

- **`git push -u origin master`** — run locally after `gh auth login` or credential helper
- **Recommended migration:** `add_transaction_category_snapshot.sql` — fallback works but labels won’t freeze on category delete until applied

---

## 2026-07-06 (session 72 — savings/goal Activity highlight + no double count)

### Added

- **`supabase/add_transaction_goal_link.sql`** — `transactions.goal_id`; `contributions.source_transaction_id`
- **`transactionGoal.js`** — `buildGoalLinkedTransactionIds()`, `countsAsCategorySavings()`, `shouldHighlightSavingsOrGoal()`, `isSavingsCategoryTransaction()`
- **`isMissingGoalLinkColumnError()`** — graceful fallback when goal link columns absent

### Changed

- **Activity rows** — light green background (`bg-emerald-50`) for savings-category expenses and goal-linked transactions (`TransactionRow.highlightSavingsOrGoal`)
- **Summary savings** — goal-tagged transactions excluded from **category Savings** (counts only in **Goals** via contribution); fixes double count when savings category + goal chip used together
- **`createTransaction`** — stores optional `goal_id` when user tags a goal
- **`addContribution`** — stores optional `source_transaction_id` linking back to ledger tx
- **`buildMonthlySummary`** — uses `countsAsCategorySavings()` with goal-linked tx set from goals + transactions

### Verified

- `npm run build` passes locally

---

## 2026-07-06 (session 73 — production deploy)

### Deployed

- **Production:** [savings-tracker-azure.vercel.app](https://savings-tracker-azure.vercel.app) — `dpl_9aLjkrW34G3jPFw9j4drawmRLGcx` (savings/goal highlight + no double count)
- **Vercel build:** `npm run build` succeeded on iad1

### Not done (manual follow-up)

- **Git commit/push** — session 72 changes deployed from local working tree; not yet committed on `master`
- **Supabase migration:** run `add_transaction_goal_link.sql` for durable goal↔tx linking (app has column-missing fallback)

---

## 2026-07-06 (session 74 — delete tx syncs goal contributions)

### Fixed

- **Goal not updated on transaction delete** — deleting a goal-linked transaction left the contribution in place (`source_transaction_id` FK is `ON DELETE SET NULL`, not cascade)
- **`deleteContributionsForTransaction()`** — removes contributions linked by `source_transaction_id` or legacy note/date/amount match before deleting the tx
- **`findLinkedContributionIds()`** — resolves contribution ids for a ledger transaction
- **`deleteTransaction(id, { goals })`** — returns `{ id, deletedContributionIds }`; `AppDataContext` optimistically removes contributions and `refreshGoals()`

### Changed

- **`runTransactionsMutation`** — only merges create/update results into tx cache (`type` + `transaction_date` guard); delete result no longer corrupts cache

### Verified

- `npm run build` passes locally

### Not done (manual follow-up)

- **Production deploy** — session 74 local only
- **Git commit** — sessions 72–74 still uncommitted on `master` (at `b1a24b3`)

---

## 2026-07-27 (session 74 commit)

### Git

- **Commit:** `6aa65da` on `master` — “Fix Activity loading and sync goals with categories and ledger.” Bundles sessions 72–74 app changes, `src/lib/goalCategory.js`, and the project-memory updates through v0.28
- **Identity configured:** `user.name = Nitin Singh`, `user.email = nitinsinghbalyan@gmail.com` (global)

---

## 2026-07-28 (session 75 — performance optimization pass)

### Changed

- **`vite.config.js`** — manual chunk splitting (`react-vendor`, `supabase`, `react-router`, `date-fns`, `lucide`), build compression
- **`vercel.json`** — long-lived immutable cache headers for hashed assets
- **Route-level code splitting** — `AuthenticatedRoutes`, `SettingsRoutes`, `LoginPage`, modals, and `CategoryBreakdownChart` moved behind `lazy()` + `Suspense`
- **`PersistentTabs`** — idle-time route prefetch via `requestIdleCallback`
- **`AppDataContext`** — memoized context value; reduced re-render fan-out
- **`index.css`** — `content-visibility: auto` on transaction day groups (reverted in session 76)
- **`index.html`** — font/preconnect hints

### Deployed

- **Production:** `dpl_Cw75nJLjSKD9qxSM1BsCshFfup7c` (2026-07-28 10:22 IST)

### Git

- **Commit:** `100be5b` on `master` — “Enhance app performance and user experience with lazy loading and improved caching.”

---

## 2026-07-28 (session 76 — Summary + Activity first-load regressions)

### Fixed

- **Summary tab blank on first paint** — `SummaryPage` and `CategoryBreakdownChart` reverted to eager imports; lazy-loading the default tab flashed the `Suspense` fallback before any content. Added a skeleton (`!dataReady || initialLoading`) instead of rendering an empty summary
- **Activity blank until a filter chip was toggled** — `useTransactions` now fetches whenever the tab is mounted rather than gating on `isTabActive`; `cacheKey` added to the effect deps so the first "All" slot triggers a load; `initialLoading` simplified to `enabled && !entry.loaded`
- **`content-visibility` removed** from `.tx-day-group` — it suppressed rendering of the initial ledger paint
- **`PersistentTabs`** — active tab mounts during render instead of waiting on `useEffect`, which had delayed the first Activity fetch

### Changed

- **`AppDataContext.loadTransactions`** — `txCacheRef` for fresh cache reads plus `txInflightRef` request de-duplication; `clearAll` clears in-flight map

### Deployed

- **Production:** `dpl_5XqosPbkdVQa5cYhNucX4sWVEYoL` (10:32 IST), then `dpl_64jGvUsKvR2sgvAmFHp3WQb2vFK8` (10:39) and `dpl_ADKB9G2PiKnoRB9gSQg1xdzDJNcQ` (10:40) back-to-back

### Git

- **Commit:** `52f9984` on `master` — “Refactor transaction loading and caching for improved performance and user experience.”

---

## 2026-07-28 (session 77 — Add transaction modal layout)

### Changed

- **`TransactionForm`** — Save moved into the modal header next to Close (reachable without scrolling the form)
- **Category chips horizontal** — `categoryRows` merges unlabeled root categories into a single scrollable row per group; each row scrolls on the x-axis instead of wrapping into tall vertical stacks

### Deployed

- **Production:** `dpl_4XwD9zKTXek2f6xQuqdBwob3LAQ6` (10:54 IST) — current live bundle

### Not done (manual follow-up)

- **Git commit** — session 77 deployed from the working tree; still uncommitted

---

## 2026-08-01 (session 78 — goal↔category migration fallback + explicit goal picker)

### Fixed

- **“Could not link this goal to a category. Run the goal-category migration in Supabase, then try again.”** — `HomePage.handleAddMoney` threw whenever `ensureGoalCategory()` returned null. It now tolerates a null category, recording the transaction with `category_id: null` and still writing `goal_id` + the contribution. Adding money to a goal no longer depends on the migration
- **No way to attach an expense to a goal from the Add transaction modal** — goal linking was only reachable by selecting a goal-linked savings category, and those categories cannot exist while `categories.goal_id` is missing, so the option was invisible

### Added

- **Explicit “Add to goal (optional)” chip row** in `TransactionForm` — horizontal scrollable `None` + one chip per goal; writes `values.goal_id` straight through to the existing `onSubmit(..., { goalId })` path, which relies only on `transactions.goal_id` and `contributions.source_transaction_id`
- **`effectiveGoal`** — explicit pick wins, then a goal implied by the chosen category (`category.goal_id`, then `goals.linked_category_id`); drives the "Counts toward goal" hint including the cross-currency conversion note
- **Edit mode** — read-only "Counts toward goal … Delete and re-add to change this" line, replacing the hint lost when the picker was scoped to new transactions

### Verified

- **Live schema audit** against production Supabase via PostgREST (`select=<column>&limit=1`; `42703` ⇒ column absent): `categories.goal_id` and `goals.linked_category_id` **missing**; `transactions.goal_id`, `contributions.source_transaction_id`, `transactions.category_name`, `categories.is_savings`, `categories.monthly_budget`, `categories.parent_id`, `recurring_transactions.frequency` all **present**
- `npx vite build` passes (~500ms); no lint errors in touched files

### Deployed

- **Production:** `dpl_CP8Ma31JRgHr3G1zFGmqJEuBgvLo` (2026-08-01 11:28 IST) — alias `savings-tracker-azure.vercel.app` verified resolving to it, HTTP 200
- **Prior production:** `dpl_4XwD9zKTXek2f6xQuqdBwob3LAQ6` (session 77 modal layout)

### Not done (manual follow-up)

- **Run `supabase/add_goal_category_link.sql`** in the Supabase SQL Editor — only the anon key is available locally, so DDL cannot be applied from the repo. Until then there are no auto-created goal categories and no **Goals** group in the category picker
- **Git commit** — sessions 77–78 deployed from the working tree; still uncommitted on `master` (at `52f9984`)

---

## 2026-08-02 (session 79 — add-to-goal missing from Activity)

### Fixed

- **Add money to a goal did not show up in Activity** — cache merge skipped overall keys (`parseTransactionsCacheKey` required numeric year/month); month invalidation used `monthStartDay = 1` even when the profile used a custom start; uncategorized goal expenses labeled **"Transfer"**; `isMissingGoalLinkColumnError` was broad enough to strip `goal_id` on unrelated FK errors
- **`runTransactionsMutation`** — always functional-merge into matching slots **and** invalidate the transaction’s month prefix + `overall|` so Activity/Summary refetch even when no slot existed to merge into
- **`HomePage.handleAddMoney`** — passes `monthStartDay` from profile; stamps `category_name` / `category_color` / `category_is_savings` from the goal when the category link is missing; refuses to continue without a returned tx id
- **`TransactionRow`** — uncategorized expense/income titles are "Expense"/"Income", not "Transfer"
- **`ensureGoalCategory`** — link failures are best-effort; still returns the created category

### Changed

- **`parseTransactionsCacheKey` / `transactionMatchesCacheFilters`** — support `overall|…` all-time cache keys
- **`createTransaction`** — accepts optional snapshot overrides from the caller
- **`isMissingGoalLinkColumnError`** — only treats true missing-column / schema-cache misses, not FK `23503`

### Deployed

- **Production:** `dpl_FjzAXxKSDgG3cfKUMf9G5pQ6ZZJb` (2026-08-02 20:31 IST)
- **Prior production:** `dpl_CP8Ma31JRgHr3G1zFGmqJEuBgvLo` (session 78)

### Note

- **`add_goal_category_link.sql`** — by session 79 the columns were present on production (user applied the migration after session 78). App still degrades if they are missing.

---

## 2026-08-02 (session 80 — two-step add transaction journey)

### Changed

- **`TransactionForm`** create flow is a two-step wizard:
  1. **Amount** — type toggle + large amount display + on-screen numeric keypad (no native number input); Continue when amount &gt; 0
  2. **Details** — tappable amount summary (back to step 1); wrapping account chips; categories above optional goals (both `flex-wrap`, no horizontal scroll); date; note; **Make recurring** checkbox with Daily/Weekly/Monthly/Yearly (default monthly)
- **No goal selected by default**; tap again to clear; submit uses **only** explicit `goal_id` (no category→goal auto-link)
- **Goal-linked categories** filtered out of the Category section (they belong under Goals)
- **Edit mode** remains a single scrolled form (no keypad wizard); transfers hide recurring
- **`TransactionsPage.handleSubmit`** — when `options.recurring` is set, also calls `createRecurringTransaction` with the same type/amount/account/category/note and schedule (`start_date` = tx date)

### Deployed

- **Production:** `dpl_8dmxQz1Gv8bRBauLzGDKxEFhqVRU` (2026-08-02 20:37 IST) — current live bundle
- **Prior production:** `dpl_FjzAXxKSDgG3cfKUMf9G5pQ6ZZJb` (session 79)

### Verified

- `npx vite build` passes; no lint errors in touched files

### Not done (manual follow-up)

- **Git commit** — sessions 77–80 still uncommitted on `master` (at `52f9984`); GitHub push pending auth
- **Project memory** — this entry (session 80)

---

## 2026-09-05 (session 81 — paper-and-ink redesign, mobile)

Implements artboards **1e (mobile)** and **1f (settings)** from the Claude Design
canvas "Goal Tracker App Redesign"
(`a2ce9821-42c4-41f2-a8bd-7cde6523c259`), imported via the design MCP.

### Added

- **Design system** — Outfit (headings), DM Sans (text), DM Mono (all numbers, so
  ledger columns align). `.n` class in `index.css` carries `font-feature-settings: 'tnum'`
- **Tailwind tokens** — `paper` (DEFAULT/card/sunk/rail/line), `ink`
  (DEFAULT/muted/soft/faint/rule/hairline), `accent`, `positive`, `negative`
- **`SegmentedTabs.jsx`** — Month / Goals / Ledger / More as a top segmented
  control on the `#EDE7DC` track
- **Per-day spend sparkline** in the Summary balance card, bucketed from
  `transactions` by `transaction_date` per currency, scaled to the month peak,
  today highlighted

### Changed

- **`PageHeader`** — Outfit title on paper with the segmented tabs beneath;
  desktop keeps a card ground and hairline rule since the sidebar still carries nav
- **`AppShell`** — `BottomNav` removed (nav moved to the top on mobile);
  `.app-main` 4.5rem bottom padding reservation dropped
- **`GoalCard`** — paper ground, 3px goal-colour **top** edge replacing the left
  stripe, days-left as a mono chip, amounts in tabular figures
- **`HomePage`** — goals split into **In progress** and **Not started**; unfunded
  goals collapse to a plain colour-bar list instead of padding the grid with
  empty cards. This was the stated point of the redesign: a card is the wrong
  container for six numbers
- **`SummarySection`** — leads with Balance, then the sparkline, then
  Spent / In / To goals beneath a hairline. Monthly/Overall toggle restyled
- **`SettingsSection` / `SettingsRow`** — plain hairline-ruled list instead of
  cards nested in cards; signed-in address beside the title
- **Body and shell** moved off `slate-50` onto cream paper

### Fixed

- **Month tab blank after first deploy** — see `error-history.md` 2026-09-05.
  A `useMemo` was placed above the `useTransactions` call it read from

### Deployed

- **Production:** `dpl_8CZUT64NbMQy8U5pV1xHRM7v1Chz` (2026-09-05) — aliased to
  `savings-tracker-azure.vercel.app`; carries the Month tab fix
- **Superseded same day:** `dpl_EDTP4ht9osSyhkTgwVcEix9ASirC` — the redesign deploy that shipped the
  Month tab crash. Production was broken between the two
- **Prior production:** `dpl_8dmxQz1Gv8bRBauLzGDKxEFhqVRU` (session 80)

### Git

- **Commit:** `e70899e` on `master` — the redesign (12 files, +338/−114)
- **GitHub:** `origin/master` force-updated `3b3344f...e70899e`. The remote had
  held an unrelated Next.js rewrite ("RupeeRise") with **no common ancestor**;
  that history survives on `origin/cursor/setup-dev-environment-cb6b` at `6ff908b`
- A stray duplicate branch `vite-app` was created at the same SHA during this
  session and should be deleted

### Decisions deferred

- **Desktop direction not chosen.** The canvas offers 1a/1b (Safe — sidebar +
  cards, fixed hierarchy) and 1c/1d (Radical — top ribbon, month spread with
  per-day bars). These are alternatives for the same screens, so only mobile was
  built. Desktop still renders the pre-redesign layout

### Not done (manual follow-up)

- **Authenticated screens never visually verified.** Sign-in blocks agent
  testing; only the login page was confirmed to render with a clean console.
  Month / Goals / Ledger / Settings need a human pass on a real device
- **`BottomNav.jsx` is now dead code** — nothing imports it;
  `ModalShell`'s `useBottomNavAutoHide` is inert
- **Desktop artboards** 1a/1b/1c/1d unimplemented pending the direction call
- **"Today" ledger rows** from 1e (coloured dot + name + amount) not done

---

## 2026-09-06 (session 82 — Savings restored on Summary, with breakdown)

Session 81's redesign dropped the `categorySavings` figure to match artboard
1e's three-cell row. This restores savings as a **combined** total and itemises
where it went.

### Added

- **`SavingsBreakdownList.jsx`** — presentational, two hairline-separated
  sections each with its own subtotal: **By category** (`bySavingsCategory`,
  subtotal `categorySavings`) and **To goals** (`byGoalSavings`, subtotal
  `goalSavings`). The subtotals add to the Savings cell, so the headline is
  verifiable by reading down
- **`goalColors`** lookup in `SummarySection` — `byGoalSavings` entries carry no
  colour, so each goal's palette is resolved by id from `goals`

### Changed

- **Summary balance card** — the third cell is now **Savings** (`summary.savings`)
  instead of **To goals** (`summary.goalSavings`). Row stays three cells

### Notes

- **No calculation was added.** `savings`, `bySavingsCategory`, `goalSavings` and
  `byGoalSavings` were all already computed in `monthlySummary.js` and had zero
  consumers repo-wide. This was pure wiring — the data layer needed no edit,
  which is the signal the design matched it
- **No `isMonthly` branching** in the new UI; Monthly vs Overall is fully
  absorbed upstream by `useTransactions` and `groupSummariesByCurrency`

### Verified

- Both changed modules transform cleanly via the vite dev server
- Declaration order checked: `goals` (38) → `summaries` (94) → `goalColors` (120)
  → `renderSavingsBreakdown` (125) → use (287). No TDZ, the failure mode that
  blanked the Month tab in session 81
- **Logic proven against synthetic fixtures** by importing `monthlySummary.js`
  through the dev server and running it in the browser (its import chain needs
  `import.meta.env`, so bare node cannot load it). With a savings-category
  expense of ₹1,000, a goal-linked savings expense of ₹2,000, an ordinary ₹500
  expense and ₹5,000 income, **in both Monthly and Overall**:
  `categorySavings=1000`, `goalSavings=2000`, `savings=3000`,
  `categorySavings + goalSavings === savings`, `expenses=500`, and the
  goal-linked "Silver" row appears **only** under goals — not double counted
- App boots with a clean console

### Not done (manual follow-up)

- **Not seen rendering with real data.** The Summary tab is behind sign-in and
  agent testing stops at the login page. TC-193…TC-196 are `not-run`
- `savingsRate` and a standalone combined `savings` stat remain unsurfaced
  (F-72 superseded; still computed)

