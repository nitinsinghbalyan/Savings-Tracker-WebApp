# Software Requirements Specification — Savings Tracker

**Version:** 0.7  
**Last updated:** 2026-06-14 (v0.7 polish — prior spec v0.6 Phase 2 finance still applies)

> **Version history:** v0.3 anonymous `device_id` · v0.4 Supabase Auth · v0.6 Phase 2 finance · **v0.7** shared data cache, persistent tabs, summary on Goals, rupee icon, horizontal category chart

## 1. Purpose

A personal finance and savings tracker web app. Users define savings goals and log contributions, track income and expenses by category across bank accounts, view monthly cash-flow summaries, and manage preferences — with sign-in (email or Google) so data syncs across browsers and devices.

> **v0.3 and earlier:** anonymous `device_id` scoping. **v0.4+** Supabase Auth + `user_id`. **v0.6+** Phase 2 finance (accounts, transactions, summary, settings). **v0.7+** App-level cache, persistent tabs, summary embedded in Goals tab.

## 2. Scope

### In scope

- Create, edit, and delete savings goals
- Log contributions against goals
- View progress toward target amounts
- Persist data in Supabase, scoped per authenticated user via `user_id`
- Sign in / sign up with email and password (Supabase Auth)
- Sign in with Google (Supabase OAuth)
- Export and import goals as JSON backup
- **Phase 2 (v0.6):** Bank accounts with ledger balances
- **Phase 2:** Expense and income tracking by user-defined spending categories
- **Phase 2:** Transfers between same-currency accounts
- **Phase 2:** Monthly summary (income, expenses, net surplus, savings rate)
- **Phase 2:** Settings page (preferences, accounts, categories, backup, sign out)
- **Phase 2:** Bottom navigation across Goals, Activity, Summary, Settings
- **v0.7:** Bottom navigation — Goals, Activity, Settings (Summary merged into Goals tab; `/summary` redirects)
- **v0.7:** Instant tab switching via shared `AppDataProvider` cache (no per-tab cold fetch)
- **v0.7:** Monthly summary and account balances on Goals tab (`SummarySection`)
- **v0.7:** Horizontal category breakdown chart (expense bifurcation by deduped category name)
- **v0.7:** PWA / favicon — rupee icon on brand purple background
- Responsive UI built with React, Vite, and Tailwind CSS
- Hosted on Vercel as a static SPA (production: `savings-tracker-azure.vercel.app`)

### Out of scope (v0)

- ~~User authentication / multi-device sync via accounts~~ — **In scope as of v0.4**
- Shared goals between users
- Payment integrations
- Native mobile apps
- **Phase 2 defer:** Linking goal contributions to account transactions automatically
- **Phase 2 defer:** Recurring transactions, budgets, receipt attachments, bank feed (Plaid)

## 3. Users

| User type | Description |
|-----------|-------------|
| Signed-in user | Authenticated via Supabase Auth (email/password or Google); goals tied to `user_id` |
| Anonymous visitor (legacy) | Pre-auth model; superseded — must sign in after `add_auth.sql` |

## 4. Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | Generate and persist a unique `device_id` in local storage on first visit | Must |
| FR-02 | Create a goal with name, target amount, optional end date, priority, and category | Must |
| FR-03 | List all goals for the current `device_id` | Must |
| FR-04 | Edit and delete goals owned by the current `device_id` | Must |
| FR-05 | Add a contribution (amount, optional note) to a goal | Must |
| FR-06 | Display total contributed vs target per goal | Must |
| FR-07 | Filter or sort goals (e.g. by priority, date) | Should |
| FR-08 | Show contribution history per goal | Should |
| FR-09 | Select goal currency (INR default, USD optional) | Must |
| FR-10 | Select goal color palette for visual identity | Should |
| FR-11 | Chip UI for priority, category, currency, color on goal form | Should |
| FR-12 | Sign in and sign up with email/password | Must |
| FR-13 | List goals for the signed-in user across browsers | Must |
| FR-14 | Export goals and contributions as JSON | Should |
| FR-15 | Import JSON backup (merge or replace) | Should |
| FR-16 | Sign out | Must |
| FR-17 | Open goal detail modal from card click | Should |
| FR-18 | Sign in with Google OAuth | Should |
| FR-19 | Manage bank accounts (name, type, currency, opening balance) | Must |
| FR-20 | Record expenses with category and account | Must |
| FR-21 | Record income with category and account | Must |
| FR-22 | Transfer funds between same-currency accounts | Must |
| FR-23 | View monthly income, expenses, net, and savings rate | Must |
| FR-24 | Manage spending categories (expense + income) | Should |
| FR-25 | User preferences (default currency, month start day) | Should |
| FR-26 | Navigate app via bottom tab bar | Must |
| FR-27 | Export/import v2 backup (goals + finance data) | Should |

> **FR-01–FR-04 (device_id):** historical; replaced by FR-12–FR-13 after auth migration.

## 5. Non-functional requirements

| ID | Requirement |
|----|-------------|
| NFR-01 | Authenticated API access — Supabase JWT; RLS enforces `user_id = auth.uid()` |
| NFR-02 | All API queries filter by `user_id` in application code |
| NFR-03 | Page load and interactions should feel snappy on modern browsers |
| NFR-04 | Works on mobile viewport widths |
| NFR-05 | Production deploy via Vercel; HTTPS required for PWA install |

## 6. Data model

### `goals`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, default `gen_random_uuid()` |
| user_id | uuid | FK → `auth.users(id)`; scopes row to account — migration: `supabase/add_auth.sql` |
| device_id | text | Optional; legacy pre-auth identifier; used by `claim_device_data` |
| name | text | Required |
| target_amount | numeric | Required |
| start_date | date | Default `now()` |
| end_date | date | Optional |
| priority | text | `high` \| `medium` \| `low`, default `medium` |
| category | text | Optional |
| currency | text | `INR` \| `USD`, default `INR` — migration: `supabase/add_currency_color.sql` |
| color | text | `indigo` \| `rose` \| `emerald` \| `amber` \| `violet` \| `cyan`, default `indigo` |
| created_at | timestamptz | Default `now()` |

### `contributions`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| goal_id | uuid | FK → `goals(id)` ON DELETE CASCADE |
| user_id | uuid | FK → `auth.users(id)`; same as goal owner |
| device_id | text | Optional; legacy |
| amount | numeric | Required |
| note | text | Optional |
| created_at | timestamptz | Default `now()` |

### `user_profiles` (v0.6 — migration: `phase2_finance.sql`)

| Column | Type | Notes |
|--------|------|-------|
| user_id | uuid | PK, FK → `auth.users(id)` |
| default_currency | text | `INR` \| `USD`, default `INR` |
| month_start_day | smallint | 1–28, default `1` |
| created_at | timestamptz | |

### `accounts` (v0.6)

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → `auth.users(id)` |
| name | text | Required |
| account_type | text | `checking` \| `savings` \| `cash` \| `credit` |
| currency | text | `INR` \| `USD` |
| opening_balance | numeric | Default 0 |
| color | text | Palette id (same set as goals) |
| is_archived | boolean | Soft-hide; history preserved |
| created_at | timestamptz | |

Balance computed via `get_account_balances()` RPC (not stored).

### `categories` (v0.6 — spending categories, separate from goal categories)

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK |
| name | text | Required |
| kind | text | `expense` \| `income` |
| color | text | Palette id, optional |
| sort_order | int | |
| is_system | boolean | Seeded defaults |
| is_archived | boolean | Hidden from pickers |
| created_at | timestamptz | |

### `transactions` (v0.6)

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK |
| account_id | uuid | FK → `accounts` (source) |
| category_id | uuid | FK → `categories`, null for transfers |
| type | text | `expense` \| `income` \| `transfer` |
| amount | numeric | Always positive |
| transfer_to_account_id | uuid | Required for transfers |
| note | text | Optional |
| transaction_date | date | User-selected date |
| created_at | timestamptz | |

## 7. Security model

- Row Level Security enabled on all tables
- **Current (v0.6):** `authenticated` role only; policies require `user_id = auth.uid()` on goals, contributions, user_profiles, accounts, categories, transactions
- `claim_device_data(p_device_id)` — SECURITY DEFINER RPC to attach legacy anonymous rows on first sign-in
- **Historical (pre-auth):** permissive anon policies — removed by `add_auth.sql`

## 8. Assumptions & dependencies

- Supabase project provisioned with schema + `add_auth.sql` + **`phase2_finance.sql`** applied
- Email provider enabled in Supabase Authentication settings
- Google provider enabled with OAuth client (for Google sign-in)
- `.env` contains `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- User accepts email-based account for cross-device sync
- Vercel project provisioned with `VITE_SUPABASE_*` env vars at build time
- `.env.example` documents required vars; contributors copy to local `.env`

## 9. Open questions

- [ ] Should `device_id` be regenerated on demand (reset data)?
- [x] Export / import goals as JSON? — **Resolved:** `backup.js` v2 includes finance data; v1 backward compatible
- [x] Multi-device sync? — **Resolved:** Supabase Auth + `user_id` (v0.4)
- [x] Currency formatting locale? — **Resolved:** INR default, USD per goal/account; `formatCurrency(amount, currency)`
- [x] Personal expense tracking? — **Resolved:** Phase 2 transactions + categories (v0.6)
- [ ] Mixed-currency summary totals — separate KPI rows per currency (no FX conversion)
- [ ] GitHub remote + auto-deploy on push — local git only; Vercel CLI deploy works today

## 10. v0.7 additions (append — does not replace §2–9)

### Performance & UX

- Shared in-memory cache (`AppDataContext`) for profile, accounts, categories, goals, and month-keyed transactions
- Persistent tab mounting — no unmount on bottom-nav switch; scroll and form state preserved
- Loading skeletons only on true first load (empty cache), not on every navigation
- Auth cold-start gate only (`initialLoading`); re-auth does not replace full UI

### Summary & charts

- Monthly summary lives on **Goals** tab (not a separate Summary page)
- Activity month synced via URL query `?month=YYYY-MM`
- Category breakdown: horizontal stacked bar + per-category bars; groups by `kind:name` dedupe key
- Account balances refresh after transaction mutations (`get_account_balances()` RPC)

### Icons & branding

- App short name: **Savings Lite** (PWA manifest)
- Rupee glyph shared across PWA icons, favicon, and Activity nav tab

### Removed in v0.7

- Per-field amount/email masking (`RevealableMoney` removed — all values visible)
- Separate `/summary` page (redirects to `/goals`)

## 11. v0.7.1 additions (append — does not replace §2–10)

### Modal UX (mobile)

- All modals use shared `ModalShell` with body scroll lock (`useBodyScrollLock`)
- Background page must not scroll when interacting with modal forms or CTAs on touch devices
- Form modals: fixed header/footer; scrollable middle region only (`.modal-scroll`)
- Escape key closes modals (`useModalEscape`)
- Nested modals supported via ref-counted lock (unlock only when last modal closes)

### Production

- Latest deploy: `dpl_GmRJxcUV5vnoNf7NtXjM1Gegzz3c` at [savings-tracker-azure.vercel.app](https://savings-tracker-azure.vercel.app)
- Prior v0.7 bundle: `dpl_9G76wuEeYGzRS8YUTSJeZ4vpkBEt`

## 12. v0.8 additions (append — does not replace §2–11)

### Settings UX

- Default currency and month-start on single rows with icon toggles
- Categories displayed as chips; increased Expense/Income tab padding
- Account section shows email only
- Optional **Savings category** flag on new expense categories (`is_savings`)

### Icons

- Lucide `IndianRupee` stroke in nav, Settings, and PWA/favicon SVG art
- Custom `rupeeMark.jsx` removed

### Navigation & PWA

- Bottom nav auto-hides when adding a goal or transaction (`ShellChromeProvider`)
- PWA cold start: `/` redirects to `/goals`; `PersistentTabs` fallback prevents blank shell

### Summary & ledger

- **Net** = account balances + income − expenses (per currency)
- Savings-tagged expense categories excluded from monthly spending totals
- Optional: new income transaction can also add a goal contribution (with FX if needed)

### Migrations

- Optional: `supabase/add_category_is_savings.sql` after `phase2_finance.sql`

### Production

- Latest deployed: `dpl_7dAcpAxeSrYu56Qm8vL23NXrxjzP`
- Sessions 21–23 (Net, PWA routing, tx→goal, savings category): built locally, deploy pending

## 13. v0.13 additions (append — does not replace §2–12)

**Last updated:** 2026-06-23

### Categories

- Optional `parent_id` on `categories` for sub-categories
- User-managed tree at `/settings/categories` — no forced defaults; delete any category or all; optional starter pack

### Recurring transactions

- `recurring_transactions` table — weekly / monthly / yearly rules with pause, skip-next, and end date
- Auto-post due rules on app open (`processDueRecurring`); link posted tx via `transactions.recurring_id`
- UI at `/settings/recurring`

### Accounts

- Optional `bank` slug (`icici`, `sbi`, `hdfc`, `axis`, `other`) with icons on account form and cards

### Backup

- Export/import v3 adds `parent_name`, `bank`, and `recurring_transactions` (v2 import still supported)

### Migrations

- `supabase/add_subcategories_recurring_bank.sql` after `phase2_finance.sql`
- Must drop `get_account_balances()` before recreating when adding `bank` to RPC return type

### Production

- Latest deployed: `dpl_FeHGJsUPndg94gMdPag3xoXZW8wD` — https://savings-tracker-azure.vercel.app
- Prior: `dpl_UESw1RoWFExdYPKfvyNsSaQzQS1a` (v0.12.3 overview removal)

## 14. v0.14 additions (append — does not replace §2–13)

**Last updated:** 2026-06-23

### Goals UX

- Main Goals column: clickable `GoalsProgressBars` with days left; tap opens `GoalDetailModal`
- No inline goal card grid; summary sidebar no longer duplicates goals list

### Activity

- Client-side pagination: 10 / 50 / 100 transactions per page on filtered month list
- Edit and Delete actions inline with amount on each row

### Recurring

- Daily frequency option (`add_recurring_daily_frequency.sql` for existing databases)

### Categories UI

- Manage categories: horizontal flex-wrap chip groups per parent family

### Production

- Latest deployed: `dpl_35QfDCM9dFrooiG4DYNYDF6kvT81` — https://savings-tracker-azure.vercel.app
- Prior: `dpl_FeHGJsUPndg94gMdPag3xoXZW8wD` (v0.13.1)

## 15. v0.15 additions (append — does not replace §2–14)

**Last updated:** 2026-06-23

### Navigation

- Three main tabs: **Home** (`/goals`), **Summary** (`/summary`), **Settings**
- `/transactions` redirects to `/goals` (month query preserved)

### Home page

- Goals: `GoalsProgressBars` with days left; tap → `GoalDetailModal`
- Activity: embedded `TransactionsPage` (filters, pagination, add/edit/delete)

### Summary page

- Monthly stat cards, full-width spending-by-category chart, income breakdown, account balances
- Link to Home with `?month=` for transactions

### Chart fix

- Category bar chart: labels no longer overlap tall bars (session 54)

### Production

- Latest deployed: `dpl_9aMD9x3TVwRBRNeFkkPWhgvfiYz2` — chart width + label fix
- Session 56 tab merge: built locally; redeploy to ship on production alias

## 16. v0.16 additions (append — does not replace §2–15)

**Last updated:** 2026-06-23

### Summary chart

- **Spending by category** renders as an **SVG pie chart** on the Summary tab
- Slice size = category share of monthly expense total
- Category color from palette `fill`; over-budget categories use rose slice
- Legend list below chart: amount, %, `spent / budget`, over-budget badge (unchanged from bar era)

### Constants

- `COLOR_PALETTES` entries include `fill` hex for chart rendering

### Removed

- Vertical bar chart for category breakdown
- `CategoryBreakdownChart` `compact` prop

### Production

- Local build verified; shipped in v0.17 — `dpl_JAuw2D4fW8sw1RnA1KUFG6mtmx62`

## 17. v0.17 additions (append — does not replace §2–16)

**Last updated:** 2026-06-23

### Chart customization

- **Settings gear** on spending chart header — pie vs donut, sort legend by amount/name, toggle category list
- Preferences stored in browser `localStorage` (not Supabase profile)

### Production

- Latest deployed: `dpl_JAuw2D4fW8sw1RnA1KUFG6mtmx62` — https://savings-tracker-azure.vercel.app
- Includes v0.16 pie chart + v0.17 settings; no GitHub push (Vercel CLI only)

## 18. v0.17.1 additions (append — does not replace §2–17)

**Last updated:** 2026-06-23

### Slice hover tooltip

- Hover or keyboard-focus a chart slice to see category name, spent amount, % of total, budget, and over-budget amount
- Other slices dim while one is active

### Production

- Local build verified; hover tooltip not yet on production alias (redeploy pending)

## 19. v0.18 additions (append — does not replace §2–18)

**Last updated:** 2026-06-23

### Resizable spending chart

- Default chart size **380px**; user can resize **200–560px**
- **Drag handle** at bottom-right of chart, or **size slider** in settings gear menu
- Size saved in `localStorage` with other chart prefs
- Chart is **center aligned** on Summary tab

### Summary page

- **Removed:** “Income by category” breakdown list
- **Unchanged:** Income total in monthly stat cards; expense pie chart; balances

### Production

- Local build verified; not yet deployed (bundle includes v0.17.1 tooltip + v0.18 resize)
