# Decision Log

| Date | Decision | Rationale | Alternatives considered |
|------|----------|-----------|-------------------------|
| 2026-06-14 | No authentication | Faster MVP; personal single-device use case | Supabase Auth, magic links |
| 2026-06-14 | `device_id` in localStorage | Simple anonymous identity without sign-up | Fingerprinting, cookies |
| 2026-06-14 | Permissive RLS for `anon` | App filters by `device_id`; no JWT claims available | RLS policies checking `device_id` header (not native in Supabase REST) |
| 2026-06-14 | Tailwind CSS v3 | Matches requested `tailwind.config.js` + `@tailwind` directives setup | Tailwind v4 CSS-first config |
| 2026-06-14 | JavaScript (not TypeScript) | Explicit user request for JS template | TypeScript Vite template |
| 2026-06-14 | `project-memory/` folder for agent context | Keeps SRS, tests, and history versioned with the repo | External wiki, Cursor rules only |
| 2026-06-14 | Per-goal currency (not global) | Mixed goals may use INR or USD; no FX conversion | Single app-wide currency setting |
| 2026-06-14 | INR default, USD optional | Primary user locale India; USD for international goals | More currencies, locale auto-detect |
| 2026-06-14 | Chip UI for form selects | Mobile-friendly 44px targets; faster tap selection | Dropdowns (previous GoalForm) |
| 2026-06-14 | Color stored as palette id string | Simple CHECK constraint; maps to Tailwind classes in `constants.js` | Hex color picker |
| 2026-06-14 | No starting balance on create | Simpler form; users add money via AddMoneyModal | Initial contribution on goal create |
| 2026-06-14 | Mixed-currency dashboard totals | Separate progress row per currency; no false combined % | Single blended total (misleading) |
| 2026-06-14 | Deploy on Vercel (not Supabase Hosting) | Zero-config Vite support; SPA rewrites; team already on Vercel | Netlify, Cloudflare Pages, static S3 |
| 2026-06-14 | `vercel.json` SPA rewrite | `react-router-dom` client routes need fallback to `index.html` | Hash router (no server config) |
| 2026-06-14 | `.env.example` committed, `.env` gitignored | Contributors know required vars; secrets never in git | Committing `.env` with real keys (rejected during deploy prep) |
| 2026-06-14 | CLI deploy before GitHub connect | Faster first production URL; Git integration deferred | Block deploy until GitHub repo exists |
| 2026-06-14 | Git repo at `savings-tracker/` root | App is self-contained; Vercel root = repo root | Monorepo with parent `Goals App` as root |
| 2026-06-14 | JSON export/import | Manual backup and one-time migration between browsers before auth | Cloud sync only |
| 2026-06-14 | Goal detail on card click | Full details in modal; card stays compact summary | Separate detail route |
| 2026-06-14 | Supabase Auth (email/password) | Goals follow account on any browser; RLS via `auth.uid()` | Continued `device_id`-only scoping |
| 2026-06-14 | `claim_device_data` RPC on sign-in | One-time link of pre-auth `device_id` rows without insecure open UPDATE policies | Force users to re-import only |
| 2026-06-14 | Authenticated-only RLS | Drop permissive anon policies; DB enforces ownership | App-only `device_id` filtering |
| 2026-06-14 | Google OAuth via Supabase | One-click sign-in; same `user_id` sync as email | Custom Google SDK, Firebase Auth |
| 2026-06-14 | `authReady` before goals fetch | Prevents empty dashboard on mobile OAuth when claim/session not settled | Fetch immediately on `user` only |
| 2026-06-14 | Show account email + provider in header | Users can self-diagnose sync issues (Google vs email) | Hidden auth state, support-only debugging |
| 2026-06-14 | Contribution SELECT via goal ownership (optional SQL) | Backfilled goals may have contributions with null `user_id` | Re-run backfill on all contribution rows |
| 2026-06-14 | Bottom navigation (4 tabs) | Mobile-first primary chrome; persistent across authenticated pages | Top nav only, hamburger menu |
| 2026-06-14 | Unified `transactions` table | Single ledger for expense, income, transfer; simpler monthly summary | Separate expenses/income tables |
| 2026-06-14 | `create_transfer()` RPC | Atomic same-currency transfer; avoids partial client writes | Two separate client inserts |
| 2026-06-14 | Computed account balance (RPC) | Consistent balance everywhere; no drift from stored column | Store running balance on account row |
| 2026-06-14 | Spending categories in DB (not constants) | User can add/archive; separate from goal categories | Reuse goal `CATEGORIES` presets |
| 2026-06-14 | Settings hub for sign-out + backup | Cleaner Goals header; all account management in one place | Keep export/sign-out in Goals header |
| 2026-06-14 | Goals and finance ledger separate (Phase 2) | Simpler scope; no double-entry when adding goal contributions | Auto-debit account on contribution |
| 2026-06-14 | Backup v2 with finance payload | Full cross-device restore of accounts + transactions | Goals-only v1 forever |
| 2026-06-14 | Allow negative account balances | Credit cards and overdraft; warn in UI only | Hard block on insufficient funds |
| 2026-06-14 | `AppDataProvider` shared cache (no React Query) | Eliminate tab-switch refetch/skeleton flash; single bootstrap | `@tanstack/react-query` (deferred) |
| 2026-06-14 | Persistent tabs (`hidden` + `inert`) | Preserve scroll/month state; avoid route unmount | Plain `<Outlet />` per route |
| 2026-06-14 | `initialLoading` only on cold auth start | Keep shell mounted during token refresh | Full-page gate on every `SIGNED_IN` |
| 2026-06-14 | Summary merged into Goals tab | One less nav tab; summary visible with goals | Separate `/summary` page |
| 2026-06-14 | Remove all amount/email masking | User request; simpler UI | Per-field `RevealableMoney` toggles |
| 2026-06-14 | Goals amounts always visible | Goal targets are not sensitive bank data | Mask goals like balances |
| 2026-06-14 | Category prune once at bootstrap (background) | Settings categories were slow (prune + double fetch every refresh) | Prune on every `ensureCategories()` |
| 2026-06-14 | Summary group by `categoryDedupeKey` | Fix split/uncategorized buckets when duplicate category rows | Group by raw `category_id` only |
| 2026-06-14 | Prefer `tx.category` embed in summary | Correct name/color even when ID not in deduped list | Lookup categories map only |
| 2026-06-14 | Horizontal bar chart for spending breakdown | User request; clearer than donut showing only top % | Pie/donut + list |
| 2026-06-14 | Rupee glyph for PWA + Activity nav | Consistent brand icon across install and nav | Vite default favicon / lucide stroke |
| 2026-06-14 | FAB `z-[60]` + `isTabActive` gate | Mobile taps blocked by install banner and inactive tabs | `z-40` FAB under bottom nav |
| 2026-06-14 | Refresh accounts after transaction mutations | Balances in summary stayed stale until reload | Re-fetch only transactions |
| 2026-06-14 | `ModalShell` for all modals | Consistent overlay, scroll lock, escape; one place to fix mobile bleed | Per-modal `fixed inset-0` duplicates |
| 2026-06-14 | Body `position: fixed` scroll lock (not `overflow: hidden` only) | iOS Safari still scrolls background with overflow-only lock | `overflow: hidden` on body alone |
| 2026-06-14 | Ref-counted scroll lock | Nested modals (e.g. goal detail → add money) must not unlock early | Single boolean lock per modal |
| 2026-06-14 | `touchmove` prevent outside `[data-modal-panel]` | Taps on modal CTAs propagated scroll to page behind | Rely on `overscroll-behavior` only |
| 2026-06-14 | Modal panel `overflow-hidden`; scroll in inner region | Keeps header/footer fixed; scroll bleed isolated to `.modal-scroll` | Whole modal panel scrollable |
| 2026-06-14 | Lucide `IndianRupee` for in-app + PWA icon | Custom filled glyph unreadable at small sizes; matches `$` stroke style | Custom `rupeeMark.jsx` filled paths |
| 2026-06-14 | Bottom nav hide during add goal/transaction | More modal space; less accidental nav taps | Keep nav visible under modals |
| 2026-06-14 | Net = balances + income − expenses | User wants summary Net to reflect total position, not monthly flow only | Net as income − expenses only |
| 2026-06-14 | Savings categories excluded from spending | Money moved to savings shouldn't inflate "Expenses" | Count all expenses in breakdown |
| 2026-06-14 | Income transaction optional goal link | Record ledger + goal progress in one step; goals/ledger still separate rows | Auto-link transaction FK to contribution |
| 2026-06-14 | PWA route fallback in `PersistentTabs` | Layout `<Navigate>` without `<Outlet />` never ran; `/` showed empty tabs | Rely on nested index redirect only |
| 2026-06-14 | `AppShell` on `/*` with top-level redirects | Single shell instance; explicit `/` → `/goals` redirect that actually mounts | Nested layout routes without Outlet |
| 2026-06-14 | Net = account balances only | User wants Net to show total position (balances), not monthly cash-flow | Net as `balances + income − expenses` (session 21; superseded) |
| 2026-06-14 | One-time ₹15k INR Net offset per user | Adjust opening position once without editing account rows; device-local flag | Permanent account adjustment or global offset |
| 2026-06-14 | Apply Net offset only after real data loads | Avoid marking offset applied during empty bootstrap / loading flash | Apply on first mount unconditionally |
| 2026-06-14 | Savings = savings categories + goal contributions | Monthly savings metric should include money moved to goals, not only tagged expenses | Expenses-only or income−expenses savings rate |
| 2026-06-14 | Expense tx optional goal link (same as income) | Record spending + goal progress in one step; ledger and goals stay separate | Income-only goal picker |
| 2026-06-14 | Net offset on user profile | Sync adjustment across web + PWA (same account) | Device-only `localStorage` (superseded — offset removed session 29) |
| 2026-06-14 | Split Savings vs Goals in summary | User wants goals visible separately from category savings | Single combined Savings column |
| 2026-06-14 | Total balance = sum of account balances | Must match Settings balances; ledger already includes expenses | `balances − monthly expenses` (double-counted) |
| 2026-06-14 | Remove one-time ₹15k Net offset | User request; no exclusions from total balance | Profile/localStorage adjustment |
| 2026-06-14 | Hide savings rate in summary UI | User request; simplify summary row | Show computed rate in grid |
| 2026-06-16 | Category budgets on `categories.monthly_budget` | Mirrors `is_savings`; budget naturally belongs to the category row | Separate `budgets` table keyed by month |
| 2026-06-16 | Budget per category, not per month row | Simple recurring monthly cap; no per-month storage | Month-specific budget rows (rollover) |
| 2026-06-16 | Budgets edited in dedicated Settings section | Keeps Categories add-form simple; clean list of caps | Inline budget field on each category chip |
| 2026-06-16 | Budget compared within currency group as plain number | Most users single-currency (INR); avoids FX complexity | Per-currency budget columns |
| 2026-06-16 | Summary shows default currency only | User does not need separate USD (or multi-currency) summary blocks | Show all currencies from tx/accounts/goals |
| 2026-06-16 | Optimistic goal cache on mutation | Save should succeed in UI even if background refresh fails | Always block on refresh failure |
| 2026-06-16 | Two-query goals+contributions load | Avoids fragile PostgREST nested embed with strict contribution RLS | Single `contributions(*)` embed |
| 2026-06-16 | lg breakpoint for desktop shell | Sidebar + multi-column at 1024px; mobile PWA unchanged below | Bottom nav on all sizes |
| 2026-06-16 | FABs mobile-only | Desktop primary actions in page header | FAB on all viewports |
| 2026-06-16 | Tx cache stale-while-revalidate | Invalidate marks `stale`; keep data visible during refetch | Delete cache keys on mutation |
| 2026-06-16 | `clearAll` on sign-out only | Brief `authReady` dip must not wipe in-memory cache | Clear when `!enabled` |
| 2026-06-16 | Silent same-user auth events | `TOKEN_REFRESHED` / repeat `SIGNED_IN` should not re-bootstrap | Reset `authReady` on every `SIGNED_IN` |
| 2026-06-16 | Hooks show data while user signed in | Read path uses `user`; fetch gated on `authReady` | Zero arrays when `!enabled` |
| 2026-06-23 | Net worth reconstructed from ledger | No snapshot table; `current − Σ(income−expense after month end)` per currency | Monthly balance snapshots table |
| 2026-06-23 | Finance insights on Activity tab | User chose Activity over new Insights tab; reuses history fetch | Separate `/insights` route |
| 2026-06-23 | Activity filters client-side | Month already cached; avoids extra Supabase queries per filter combo | Server-side filter params |
| 2026-06-23 | Goal forecast from 3-month pace | Simple avg of recent contributions; no ML | Time-weighted regression |
| 2026-06-23 | Hand-built SVG line chart | No new chart dependency; matches existing bar chart approach | recharts / chart.js |
| 2026-06-23 | Goals bars sorted ascending by % | Lowest completion on top — surfaces goals needing attention | Descending (completed first) |
| 2026-06-23 | Per-goal bars replace aggregate pie | Sidebar shows each goal at a glance; pie duplicated summary | Keep pie + monthly goals list |
| 2026-06-23 | Goals bars at top of SummarySection | Goals are primary mental model for this app | Bars below financial stats |
| 2026-06-23 | Optimistic tx cache merge on create | New transactions visible immediately without waiting for refetch | Invalidate-only + background refetch |
| 2026-06-23 | Invalidate tx cache by transaction date period | Custom month-start day can put tx outside viewed month bucket | Invalidate viewed month only |
| 2026-06-23 | Clear mismatched filters after add | Type/account filters hid successfully created transactions | Leave filters unchanged |
| 2026-06-23 | Remove Activity overview (net worth + insights) | Full-ledger fetch slow, buggy UI, stuck skeletons | Keep month-scoped Activity only |
| 2026-06-23 | `DROP FUNCTION` before RPC return-type change | Postgres `42P13` blocks `CREATE OR REPLACE` when `RETURNS TABLE` columns change | Alter function in place |
| 2026-06-23 | No auto-seed categories | User owns category tree from scratch; optional starter pack button | Seed defaults on first login |
| 2026-06-23 | Recurring post on app bootstrap | No Supabase cron/edge function; `processDueRecurring()` when `AppDataProvider` loads | pg_cron or Vercel cron |
| 2026-06-23 | Settings sub-routes for categories/recurring | `/settings/categories`, `/settings/recurring`; budgets stay on main settings | Inline managers on settings page |
| 2026-06-23 | Bank slug enum on accounts | `icici` / `sbi` / `hdfc` / `axis` / `other` + stylized SVG icons | Fetch logos from CDN |
| 2026-06-23 | Goals detail in modal only | Compact progress-bar list saves space; full actions in `GoalDetailModal` | Inline `GoalCard` grid on Dashboard |
| 2026-06-23 | Goals bars in main column (not summary sidebar) | Single goals list; summary sidebar for monthly stats only | Duplicate bars in `SummarySection` + Dashboard |
| 2026-06-23 | Client-side Activity pagination | Month already loaded; slice filtered list — no extra API calls | Server-side page/limit params |
| 2026-06-23 | Horizontal category chip groups | Parent + subs on one wrap row; less vertical scroll | Indented vertical tree list |
| 2026-06-23 | Daily recurring via `addDays` | Same interval_count pattern as weekly/monthly | Separate cron per day |
| 2026-06-23 | Charts on dedicated Summary tab | Full-width chart + stats without crowding goals/activity | Charts embedded on Home tab |
| 2026-06-23 | Merge goals + activity into Home | One tab for daily workflow; fewer nav switches | Separate Goals and Activity tabs |
| 2026-06-23 | Keep `/goals` route for Home | Avoid breaking bookmarks; `/transactions` redirects | Rename route to `/home` |
| 2026-06-23 | Pie chart for spending breakdown | User request; proportional share clearer than vertical bars | Keep vertical bars; add recharts |
| 2026-06-23 | Hand-built SVG pie (no dependency) | Matches prior chart approach; zero bundle cost | recharts / chart.js |
| 2026-06-23 | Chart prefs in localStorage | Device-local UI prefs; no migration or profile column | Save in `user_profiles` JSON |
| 2026-06-23 | Chart settings popover (not modal) | Quick toggles; stays in chart context | Full Settings page section |
| 2026-06-23 | Tooltip at slice midpoint | Stable position; readable without following cursor | Cursor-following tooltip |
| 2026-06-23 | Drag handle + slider for chart size | Direct manipulation on chart; slider for precision | Fixed Tailwind size classes only |
| 2026-06-23 | Chart always center aligned | User request; consistent Summary layout | Left-aligned on desktop (session 53) |
| 2026-06-23 | Remove Income by category list | Reduce Summary clutter; Income total stays in stat grid | Keep income breakdown card |
| 2026-07-04 | Shared `normalizeRecurringSchedule()` for recurring CRUD | Ensures `day_of_month` cleared for daily/weekly/yearly; consistent `next_run_date` on create and schedule edits | Duplicate logic in form vs lib; update-only patch without recalc |
| 2026-07-04 | Idempotent frequency CHECK via SQL `DO` block | `CREATE TABLE IF NOT EXISTS` leaves old CHECK on existing DBs; dynamic drop finds any frequency constraint by name | Manual constraint rename hunt; app-only workaround |
| 2026-07-04 | Phase 2 finance as single git commit on `master` | One reviewable bundle before GitHub remote; 114 files auth + ledger + UI | Multiple partial commits without remote |
| 2026-07-04 | Restore separate Goals and Activity tabs | User request; merged Home tab crowded daily workflow | Keep merged Home tab (session 56) |
| 2026-07-04 | Show all goals on Goals tab (no currency filter) | USD goals hidden when INR goals exist and default currency is INR | Filter goals by `profile.default_currency` in progress list |
| 2026-07-04 | Snapshot category label on transactions | Category delete/rename must not alter past transaction display | Live join only; `ON DELETE SET NULL` without snapshot |
| 2026-07-04 | Shared grid for Activity table header + rows | Column headers must align with cell values on desktop | Mismatched `grid-cols` on header vs row; account duplicated in description column |
| 2026-07-04 | Icon buttons for tx edit/delete | Consistent with GoalCard/GoalDetailModal; compact actions column | Text "Edit"/"Delete" links |
| 2026-07-04 | Pagination bar bottom-only on Activity | Less clutter; user scans filters → list → page controls | Top + bottom duplicate pagination bars |
| 2026-07-04 | GoalCard grid on Goals tab | User request; card actions visible at a glance; up to 6 cols on xl | `GoalsProgressBars` list (session 48–64) |
| 2026-07-04 | Days left only on goal cards | Save space; full date in detail modal | End date + days row on card |
| 2026-07-04 | No track-status badge on goal cards | Reduce noise on compact cards | On track / slightly behind chips on `GoalCard` |
| 2026-07-04 | New goal CTA below card grid | Natural add flow after scanning goals | Header button + mobile FAB |
| 2026-07-04 | Summary first in nav + default route | Summary as home dashboard | Goals first; `/` → `/goals` |
| 2026-07-04 | Activity full-width table | More room for Description / Account columns | Sidebar filter column (25% width) |
| 2026-07-04 | Activity type chips only | Simpler filter UX | Search + account + amount range filters |
| 2026-07-04 | Rupee icon for Activity nav | Consistent with INR-first app branding | Lucide `Receipt` icon |
| 2026-07-04 | Flat wrap row for tx category chips | Saves vertical space in add-tx modal | Grouped vertical category sections |
| 2026-07-04 | Remove Budgets from Settings UI | Settings declutter; budgets rarely edited | In-app `BudgetManager` on Settings page |
| 2026-07-04 | Settings single-column layout | Clear vertical scan | 2-col grid on lg+ |

### Superseded (historical — do not delete rows)

| Date | Decision | Superseded by |
|------|----------|---------------|
| 2026-06-14 | No authentication | Supabase Auth (session 7) |
| 2026-06-14 | `device_id` as primary scope | `user_id` + optional claim (session 7) |
| 2026-06-14 | Permissive RLS for `anon` | Authenticated RLS policies in `add_auth.sql` |
| 2026-06-14 | Bottom navigation (4 tabs) | 3 tabs; Summary merged into Goals (session 13) |
| 2026-06-14 | Per-field `RevealableMoney` masking | All masking removed (session 14) |
| 2026-06-14 | Net = balances + income − expenses | Net = balances only (session 24) |
| 2026-06-14 | One-time ₹15k INR Net offset | Removed entirely (session 29) |
| 2026-06-14 | Net = balances − monthly expenses | Total balance = balances only (session 30) |
| 2026-06-14 | Savings rate in summary grid | Hidden from UI (session 31) |
| 2026-06-14 | "Goals this month" per-goal dollar list | Lifetime % bars in sidebar (session 44) |
| 2026-06-14 | Aggregate ProgressPieChart on Dashboard | Per-goal `GoalsProgressBars` in summary (session 44) |
| 2026-06-23 | Net worth tracker on Activity | Removed session 46 — unbounded history fetch |
| 2026-06-23 | Month-over-month insights on Activity | Removed session 46 — same overview block |
| 2026-06-23 | Recurring transactions deferred | Implemented session 47 — F-97 |
| 2026-06-23 | Finance insights on Activity tab | Overview removed session 46; forecasting remains on goal cards only |
| 2026-06-23 | Goals bars in SummarySection sidebar | Moved to Dashboard main column session 48 — F-99 |
| 2026-06-23 | Inline GoalCard grid on Dashboard | Replaced by clickable `GoalsProgressBars` + modal session 48; **restored** `GoalCard` compact grid session 65 — F-117 |
| 2026-06-23 | Separate Goals and Activity tabs | Merged into Home tab session 56 — F-104 |
| 2026-07-04 | Merged Home tab (goals + activity) | Separate Goals + Activity tabs restored session 63 — F-112 |
| 2026-07-04 | Goals tab uses `GoalsProgressBars` | `GoalCard` compact grid session 65 — F-117 |
| 2026-07-04 | Settings Budgets section | Removed from Settings UI session 65 — F-126; DB/chart budgets kept |
| 2026-07-04 | Default route `/goals` | `/summary` session 65 — F-120 |
| 2026-07-04 | Activity nav `Receipt` icon | `RupeeIcon` session 65 — F-123 |
| 2026-06-23 | Charts on Goals/Home page | Moved to Summary tab session 56 — F-105 |
| 2026-06-23 | Summary tab redirected to Goals (v0.12) | Restored as charts page session 56 |
| 2026-06-23 | Vertical bar chart for category breakdown | Pie chart session 57 — F-107 |
| 2026-06-23 | Category chart `compact` sidebar mode | Chart Summary-only; prop removed session 57 |
| 2026-06-23 | Native SVG `<title>` only for chart hover | Rich HTML tooltip session 60 — F-109 |
| 2026-06-23 | Fixed responsive Tailwind chart sizes | User-resizable `prefs.size` session 61 — F-110 |
| 2026-06-23 | Income by category list on Summary | Removed session 61 — F-111; stat grid Income column kept |

## Template

```markdown
| YYYY-MM-DD | What we decided | Why | What we didn't pick |
```
