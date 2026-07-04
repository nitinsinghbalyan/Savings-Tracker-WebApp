# Test Cases

**Last updated:** 2026-07-04 (v0.24)

## Setup

| Step | Action |
|------|--------|
| 1 | Copy `.env` placeholders with real Supabase URL and anon key |
| 2 | Run goals/contributions SQL in Supabase SQL editor |
| 3 | Run `supabase/add_currency_color.sql` for currency + color columns |
| 4 | `npm install` then `npm.cmd run dev` (or `.\dev.cmd` on Windows) |
| 5 | For production: confirm `VITE_SUPABASE_*` set in Vercel project env |
| 6 | Run `supabase/add_auth.sql`; enable Email + **Google** providers in Supabase Auth |
| 7 | Configure Google OAuth redirect URLs (localhost + Vercel production URL) |
| 8 | Run `supabase/phase2_finance.sql` for accounts, categories, transactions, settings |

---

## Infrastructure

| ID | Test | Steps | Expected | Result | Date |
|----|------|-------|----------|--------|------|
| TC-01 | Dev server starts | Run `npm run dev` | Vite ready on localhost:5173 | pass | 2026-06-14 |
| TC-02 | Tailwind loads | Inspect page / use utility class | Tailwind styles apply | not-run | |
| TC-03 | Supabase client init | Import `supabase` with valid `.env` | No throw on import | not-run | |

---

## Device ID (planned) — superseded

_See **Device ID (legacy — pre-auth)** below. Original pre-auth tests retained for history._

| ID | Test | Steps | Expected | Result | Date |
|----|------|-------|----------|--------|------|
| TC-10 | First visit generates ID | Clear localStorage, load app | `device_id` stored in localStorage | not-run | |
| TC-11 | Return visit reuses ID | Reload page | Same `device_id` as before | not-run | |

---

## Goals (planned — original checklist)

| ID | Test | Steps | Expected | Result | Date |
|----|------|-------|----------|--------|------|
| TC-20 | Create goal | Submit form with name + target | Row in `goals` with correct `device_id` | not-run | |
| TC-21 | List goals | Open goals page | Only current device’s goals shown | not-run | |
| TC-22 | Edit goal | Change name/target | Row updated in DB | not-run | |
| TC-23 | Delete goal | Delete a goal | Row removed; contributions cascade | not-run | |
| TC-24 | Priority validation | Set priority to invalid value | DB check constraint rejects (if sent) | not-run | |

---

## Goals (implemented — additional verify)

| ID | Test | Steps | Expected | Result | Date |
|----|------|-------|----------|--------|------|
| TC-25 | Priority chips | Select High/Medium/Low | Saved as `high`/`medium`/`low` | not-run | |
| TC-26 | Currency chips | Create INR and USD goals | Amounts display in correct symbol | not-run | |
| TC-27 | Color palette | Pick rose/emerald | Card border + bar match palette | not-run | |
| TC-28 | Category chips | Select then deselect | `category` null when deselected | not-run | |
| TC-29 | Two-tap goal delete | Tap Delete twice on card | Goal removed after confirm | not-run | |

---

## Contributions (implemented — verify)

| ID | Test | Steps | Expected | Result | Date |
|----|------|-------|----------|--------|------|
| TC-30 | Add contribution | Add money modal | Row in `contributions`; card refetches | not-run | |
| TC-31 | Progress calculation | Add contributions totaling 50% of target | UI shows 50% progress | not-run | |
| TC-32 | Contribution note | Add with optional note | Note persisted and displayed | not-run | |
| TC-33 | Celebration | Push goal to 100%+ | Celebration overlay/toast shown | not-run | |
| TC-34 | Delete contribution | Two-tap delete in expanded list | Contribution removed; totals update | not-run | |

---

## Edge cases (planned)

| ID | Test | Steps | Expected | Result | Date |
|----|------|-------|----------|--------|------|
| TC-40 | Empty state | No goals yet | Friendly empty-state message | not-run | |
| TC-41 | Over-target contribution | Contribute more than target | UI handles gracefully (e.g. 100%+ display) | not-run | |
| TC-42 | Missing env vars | Remove `.env` values, start app | Clear error or fallback message | not-run | |
| TC-43 | Mixed currencies summary | INR + USD goals | Dashboard shows separate progress per currency | not-run | |
| TC-44 | 360px layout | Resize to 360px width | No horizontal overflow; tap targets ≥ 44px | not-run | |
| TC-45 | PWA manifest | Check `manifest.webmanifest` + meta | Valid manifest linked from `index.html` | not-run | |

---

## Device ID (legacy — pre-auth)

_Still used for `claim_device_data` on sign-in; not primary data scope after auth._

| ID | Test | Steps | Expected | Result | Date |
|----|------|-------|----------|--------|------|
| TC-10 | First visit generates ID | Clear localStorage, load app | `device_id` stored in localStorage | not-run | |
| TC-11 | Return visit reuses ID | Reload page | Same `device_id` as before | not-run | |

---

## Auth (v0.4)

| ID | Test | Steps | Expected | Result | Date |
|----|------|-------|----------|--------|------|
| TC-60 | Unauthenticated gate | Open `/` while signed out | `LoginPage` shown, not Dashboard | not-run | |
| TC-61 | Sign up | Create account with email/password | Session active or confirm-email message | not-run | |
| TC-62 | Sign in | Log in on second browser | Same goals as first browser | not-run | |
| TC-63 | Sign out | Tap Sign out in **Settings** | Returns to `LoginPage`; data hidden | not-run | |
| TC-64 | Claim device data | Sign in on browser with pre-auth goals | Toast shows linked count; goals visible | not-run | |
| TC-65 | RLS blocks anon | Call goals API without JWT after `add_auth.sql` | No data returned / error | not-run | |

---

## Auth — Google OAuth (v0.5)

| ID | Test | Steps | Expected | Result | Date |
|----|------|-------|----------|--------|------|
| TC-66 | Google button visible | Open `LoginPage` | "Continue with Google" shown above email form | not-run | |
| TC-67 | Google sign-in | Click Continue with Google (provider configured) | Redirect to Google → back to app → Dashboard | not-run | |
| TC-68 | Google cross-browser sync | Sign in with Google on two browsers | Same goals on both | not-run | |
| TC-69 | Google claim device data | Google sign-in on browser with pre-auth goals | Claim toast; goals visible | not-run | |
| TC-74 | Google provider missing | Click Google before Supabase setup | Error toast; stays on login | not-run | |

---

## Export / import

| ID | Test | Steps | Expected | Result | Date |
|----|------|-------|----------|--------|------|
| TC-70 | Export backup | Settings → Download with data present | JSON file downloads | not-run | |
| TC-71 | Import merge | Import file with merge mode | Goals added alongside existing | not-run | |
| TC-72 | Import replace | Import file with replace mode | Old goals cleared; imported goals shown | not-run | |
| TC-73 | Invalid backup | Import malformed JSON | Error message in modal | not-run | |

---

## Phase 2 — Navigation (v0.6)

| ID | Test | Steps | Expected | Result | Date |
|----|------|-------|----------|--------|------|
| TC-90 | Bottom nav visible | Sign in; visit all tabs | 4 tabs: Goals, Activity, Summary, Settings | not-run | |
| TC-91 | Bottom nav hidden on login | Open app signed out | No bottom nav on `LoginPage` | not-run | |
| TC-92 | Active tab highlight | Tap each tab | Current route highlighted in brand color | not-run | |
| TC-93 | FAB above nav | Open Goals with goals / Activity | FAB not obscured by bottom nav | not-run | |
| TC-94 | SPA routes | Refresh on `/transactions`, `/settings` | No 404; `vercel.json` rewrite works | not-run | |

---

## Phase 2 — Accounts (v0.6)

| ID | Test | Steps | Expected | Result | Date |
|----|------|-------|----------|--------|------|
| TC-100 | Create account | Settings → Add account | Row in `accounts`; balance = opening_balance | not-run | |
| TC-101 | Edit account | Tap account row → save name/type/color | Row updated | not-run | |
| TC-102 | Archive account | Archive account with transactions | Hidden from pickers; history kept | not-run | |

---

## Phase 2 — Transactions (v0.6)

| ID | Test | Steps | Expected | Result | Date |
|----|------|-------|----------|--------|------|
| TC-110 | Add expense | Activity → FAB → Expense | Balance decreases; appears in list | not-run | |
| TC-111 | Add income | Activity → Income | Balance increases | not-run | |
| TC-112 | Transfer | Transfer between INR accounts | Both balances update correctly | not-run | |
| TC-113 | Cross-currency transfer | Transfer INR → USD account | Error; transfer blocked | not-run | |
| TC-114 | Month filter | Change month on Activity | Only that month's transactions shown | not-run | |
| TC-115 | Delete transaction | Delete from list | Removed; balance recalculated | not-run | |

---

## Phase 2 — Monthly summary (v0.6)

| ID | Test | Steps | Expected | Result | Date |
|----|------|-------|----------|--------|------|
| TC-120 | KPI totals | Add income + expenses in month | Summary shows correct income, expenses, net, savings rate | not-run | |
| TC-121 | Category breakdown | Expenses in multiple categories | Chart/list matches transaction totals | not-run | |
| TC-122 | Account balances | View Summary | Matches `get_account_balances()` | not-run | |
| TC-123 | Mixed currency | INR + USD transactions | Separate summary sections per currency | not-run | |

---

## Phase 2 — Settings (v0.6)

| ID | Test | Steps | Expected | Result | Date |
|----|------|-------|----------|--------|------|
| TC-130 | Default currency pref | Change to USD in Settings | Saved to `user_profiles` | not-run | |
| TC-131 | Month start day | Set to 15th | Summary month boundaries respect setting | not-run | |
| TC-132 | Custom category | Add expense category | Appears in transaction form + summary | not-run | |
| TC-133 | Archive category | Archive system category | Hidden from picker; old txns keep label | not-run | |

---

## Phase 2 — Backup v2 (v0.6)

| ID | Test | Steps | Expected | Result | Date |
|----|------|-------|----------|--------|------|
| TC-140 | Export v2 | Settings → Download backup | JSON includes goals, accounts, categories, transactions | not-run | |
| TC-141 | Import v2 merge | Import v2 on device with data | Finance + goals merged | not-run | |
| TC-142 | Import v2 replace | Replace mode | All finance + goals replaced | not-run | |
| TC-143 | Import v1 legacy | Import old goals-only backup | Goals import; no finance error | not-run | |

---

## Goal detail modal

| ID | Test | Steps | Expected | Result | Date |
|----|------|-------|----------|--------|------|
| TC-80 | Card opens modal | Click goal card body | `GoalDetailModal` with full details | not-run | |
| TC-81 | Actions don't open modal | Click Add money / edit / delete | Action runs; modal does not open | not-run | |

---

## Deployment (Vercel)

| ID | Test | Steps | Expected | Result | Date |
|----|------|-------|----------|--------|------|
| TC-50 | Production build | `npm run build` | `dist/` created without errors | pass | 2026-06-14 |
| TC-51 | Vercel deploy | `npx vercel --prod` | Deployment READY; alias assigned | pass | 2026-06-14 |
| TC-51b | Phase 2 deploy | `npx vercel --prod` after finance | `dpl_8wdpUKN1mdGTHur37Kxc9iCq1F1A` READY | pass | 2026-06-14 |
| TC-52 | Production page load | Open `savings-tracker-azure.vercel.app` | App shell loads; title "Savings Tracker" | pass | 2026-06-14 |
| TC-53 | SPA client routing | Refresh on `/` after deploy | No 404; `vercel.json` rewrite works | not-run | |
| TC-54 | Prod Supabase connect | Create goal on production URL | Goal persists in Supabase | not-run | |
| TC-55 | Env vars not in git | `git log --all -- .env` | No commits containing `.env` | pass | 2026-06-14 |
| TC-56 | GitHub auto-deploy | Push to connected `main` branch | Vercel preview/production build triggers | blocked | 2026-06-14 |

---

## v0.7 — Smooth rendering & cache

| ID | Test | Steps | Expected | Result | Date |
|----|------|-------|----------|--------|------|
| TC-150 | Tab switch no skeleton | Sign in → load Goals → switch Activity ↔ Settings 10× | No skeleton flash; cached UI instant | not-run | |
| TC-151 | Scroll preserved | Scroll Goals down → Activity → back Goals | Scroll position restored | not-run | |
| TC-152 | Month preserved on Activity | Change month → switch tab → return | Same month selected | not-run | |
| TC-153 | Summary month link | Goals summary → "View all transactions" | Activity opens with matching `?month=` | not-run | |
| TC-154 | Background refresh | Add transaction | List + Goals balances update without blank UI | not-run | |

---

## v0.7 — Mobile FABs & install prompt

| ID | Test | Steps | Expected | Result | Date |
|----|------|-------|----------|--------|------|
| TC-160 | Add goal FAB (mobile) | Goals tab, goals exist, tap + FAB | `GoalForm` opens | not-run | |
| TC-161 | Add transaction FAB (mobile) | Activity tab, tap + FAB | `TransactionForm` opens | not-run | |
| TC-162 | FAB with install banner | iOS Safari with install prompt visible | FAB still tappable (right side) | not-run | |

---

## v0.7 — Summary chart & categories

| ID | Test | Steps | Expected | Result | Date |
|----|------|-------|----------|--------|------|
| TC-170 | Horizontal breakdown | Expenses in 3+ categories | Stacked bar + per-category bars match totals | not-run | |
| TC-171 | Duplicate category merge | Txns on duplicate category rows (same name) | Single bucket in breakdown | not-run | |
| TC-172 | Settings categories speed | Open Settings → Categories | List appears without long wait (cached) | not-run | |
| TC-173 | Balance after expense | Add expense on Activity | Goals summary balance decreases | not-run | |

---

## v0.7 — Icons & PWA

| ID | Test | Steps | Expected | Result | Date |
|----|------|-------|----------|--------|------|
| TC-180 | Favicon | Browser tab | Rupee on purple rounded square | not-run | |
| TC-181 | Activity nav icon | Bottom nav Activity | Same rupee glyph as app icon | not-run | |
| TC-182 | PWA install icon | Add to home screen | `icon-192.png` / `icon-512.png` rupee art | not-run | |

---

## v0.7.1 — Modal scroll lock (mobile)

| ID | Test | Steps | Expected | Result | Date |
|----|------|-------|----------|--------|------|
| TC-190 | Add transaction — no background scroll | Mobile: open Add transaction → scroll form → tap Save | Page behind modal does not move; modal submits | not-run | |
| TC-191 | Add goal modal scroll | Mobile: Goals FAB → scroll long form → tap Create | Background locked; only modal body scrolls | not-run | |
| TC-192 | Nested modal lock | Goal detail → Add money → close inner → close outer | Scroll position restored; no double-unlock jump | not-run | |
| TC-193 | Account form on Activity | Mobile: Add account → scroll → Save | Same scroll-lock behavior as transaction form | not-run | |
| TC-194 | Import backup modal | Settings → Import → scroll JSON area | Background does not scroll on touch | not-run | |
| TC-195 | Escape closes modal | Desktop: open any modal → Escape | Modal closes; body scroll restored | not-run | |

---

## v0.8 — Settings & icons

| ID | Test | Steps | Expected | Result | Date |
|----|------|-------|----------|--------|------|
| TC-200 | Currency icon row | Settings → Default currency | ₹ and $ icon toggles on same line as label | not-run | |
| TC-201 | Category chips | Settings → Categories | Categories show as colored chips with padding | not-run | |
| TC-202 | Lucide rupee nav | Activity tab + PWA icon | Stroke ₹ matches Settings dollar style | not-run | |

---

## v0.8 — Bottom nav & PWA

| ID | Test | Steps | Expected | Result | Date |
|----|------|-------|----------|--------|------|
| TC-210 | Nav hides on add tx | Open Add transaction | Bottom nav slides away; returns on close | not-run | |
| TC-211 | PWA cold start | Launch installed PWA from home screen | Goals content visible immediately (not nav-only) | not-run | |
| TC-212 | Unknown path redirect | Navigate to `/` manually | Redirects to `/goals`; Goals tab active | not-run | |

---

## v0.8 — Summary & categories

| ID | Test | Steps | Expected | Result | Date |
|----|------|-------|----------|--------|------|
| TC-220 | Total balance matches Settings | Two accounts ₹10k + ₹5k | Summary **Total balance** shows ₹15k (not minus expenses) | not-run | |
| TC-221 | Savings category excluded | Expense in savings-tagged category | Not in Expenses total or breakdown | not-run | |
| TC-222 | Income → goal | Add income tx; pick goal | Transaction + contribution created | not-run | |
| TC-223 | Cross-currency income→goal | INR income; USD goal selected | Contribution converted with rate note | not-run | |

---

## v0.8.2 — Net offset & savings rate

| ID | Test | Steps | Expected | Result | Date |
|----|------|-------|----------|--------|------|
| TC-230 | One-time Net offset | Fresh user / clear `savings-lite-net-offset-15000-*`; INR balance ₹50k | Net shows ₹35k once; hint “₹15,000 excluded”; offset not reapplied on reload | superseded | 2026-06-14 |
| TC-231 | Offset waits for data | Sign in with empty accounts | Offset not applied during loading; no premature localStorage flag | not-run | |
| TC-232 | Savings includes goals | Add goal contribution in month | Savings total includes contribution; savings rate updates | not-run | |
| TC-233 | Expense → goal | Add expense tx; pick goal | Ledger expense + contribution; note says “From expense transaction” | not-run | |
| TC-234 | Expense/income goal switch | Select goal on expense; switch to income | Goal selection preserved | not-run | |
| TC-235 | Cross-currency expense→goal | INR expense; USD goal | Contribution converted with rate note | not-run | |

---

## v0.9 — Summary layout

| ID | Test | Steps | Expected | Result | Date |
|----|------|-------|----------|--------|------|
| TC-240 | Goals column separate | Add category savings + goal contribution same month | **Savings** and **Goals** show different amounts | not-run | |
| TC-241 | Goals this month list | Contributions to 2 goals in month | List shows each goal name + amount | not-run | |
| TC-242 | No savings rate | Open Goals → monthly summary | No savings rate column | not-run | |
| TC-243 | Total balance label | Open summary | Shows **Total balance**, not “Net” | not-run | |
| TC-244 | PWA loads after deploy | Cold-start installed PWA | Goals content visible (not white screen) | not-run | |
| TC-245 | Web/PWA same total balance | Same account on browser + PWA | Total balance matches | not-run | |

---

## v0.10 — Category budgets

| ID | Test | Steps | Expected | Result | Date |
|----|------|-------|----------|--------|------|
| TC-250 | Set budget | Settings → Budgets → set Food ₹10k → Save | Persists; reload shows ₹10,000 | not-run | |
| TC-251 | Budget target line | Spend ₹6k in Food (budget ₹10k) | Bar under dashed target line; legend `₹6k / ₹10k` | not-run | |
| TC-252 | Over budget | Spend ₹12k in Food (budget ₹10k) | Bar rose; "over by ₹2,000" tag | not-run | |
| TC-253 | Header totals | Multiple budgets set | Chart header shows total spent / total budget | not-run | |
| TC-254 | Savings cats excluded | Savings category in Budgets list | Not shown (only spending categories) | not-run | |
| TC-255 | Budget backup round-trip | Export then import backup | `monthly_budget` preserved | not-run | |

---

## v0.10.1 — Default-currency summary

| ID | Test | Steps | Expected | Result | Date |
|----|------|-------|----------|--------|------|
| TC-260 | Single-currency summary | Default INR; USD goal exists | Goals tab summary shows INR only (no USD header block) | not-run | |
| TC-261 | Balances list scoped | INR default; USD account in Settings | Summary balance list shows INR accounts only | not-run | |
| TC-262 | USD goal still on grid | USD goal with INR default | Goal card still visible on Goals tab | not-run | |

## v0.10.2 — Goal save / load fix

| ID | Test | Steps | Expected | Result | Date |
|----|------|-------|----------|--------|------|
| TC-270 | Edit IND Money goal | Edit target/name → Save | Goal updates; no "Failed to load goals" | not-run | |
| TC-271 | Add money to goal | Add contribution to any goal | Progress updates; no load error | not-run | |
| TC-272 | Orphan contribution visible | Goal with pre-auth contribution | Saved amount includes contribution after reload | not-run | |

---

## v0.11.1 — Chart overflow + in-app tab flash

| ID | Test | Steps | Expected | Result | Date |
|----|------|-------|----------|--------|------|
| TC-310 | Desktop category chart contained | Goals @ 1280px with 8+ expense categories | Chart stays inside card; no horizontal page scroll | not-run | |
| TC-311 | In-app tab switch no flash | Goals → Activity → Goals (no edits) | No skeleton pulse; scroll position preserved on Goals | not-run | |
| TC-312 | Tx mutation background refresh | Add transaction on Activity | Goals summary updates without blanking | not-run | |

---

## v0.11.2 — Browser tab / Chrome focus flash

| ID | Test | Steps | Expected | Result | Date |
|----|------|-------|----------|--------|------|
| TC-320 | Chrome tab switch | Switch to another tab, return to app | No skeleton; data unchanged | not-run | |
| TC-321 | Chrome minimize restore | Minimize window, restore | Same as TC-320 | not-run | |
| TC-322 | Sign out clears cache | Settings → Sign out | Login screen; no stale data on next sign-in | not-run | |

### Finance feature pack (session 43)

| ID | Area | Steps | Expected | Result | Notes |
|----|------|-------|----------|--------|-------|
| TC-323 | Net worth card | Activity → Overview | Current balance + 12-month line chart | not-run | |
| TC-324 | Net worth MoM | Activity Overview with 2+ months data | MoM delta shown vs prior month | not-run | |
| TC-325 | Insight cards | Activity Overview | Spending/income/savings vs last month chips | not-run | |
| TC-326 | Over-budget insight | Spend over category budget | Warning chip with over-by amount | not-run | |
| TC-327 | Activity search | Type in search box | Filters by note/category/account | not-run | |
| TC-328 | Activity account filter | Select account in filter | Only that account's tx shown | not-run | |
| TC-329 | Activity amount range | Set min/max | Tx outside range hidden | not-run | |
| TC-330 | Clear filters | Apply filters → Clear | All tx for month restored | not-run | |
| TC-331 | Goal forecast line | Goal with recent contributions | "At your pace, done by …" on GoalCard | not-run | |
| TC-332 | History cache refresh | Add tx → return to Activity Overview | Net worth/insights update after stale refresh | obsolete | Overview removed session 46 |

### Goals summary bars (session 44)

| ID | Area | Steps | Expected | Result | Notes |
|----|------|-------|----------|--------|-------|
| TC-333 | Goals progress bars | Goals tab → summary sidebar | All goals in one card with horizontal bars | obsolete | Moved to Home tab session 56 — see TC-360 |
| TC-334 | Bars sort order | Multiple goals at different % | Lowest % goal appears first | not-run | |
| TC-335 | No pie chart | Goals main column | No "Overall progress" donut | not-run | |
| TC-336 | No monthly goals list | Summary sidebar | No "Goals this month" dollar list | not-run | Monthly goal $ still in stat grid |

### Transaction add fix (session 45)

| ID | Area | Steps | Expected | Result | Notes |
|----|------|-------|----------|--------|-------|
| TC-337 | Add expense | Activity → Add transaction → save | Toast success; tx appears in list | not-run | |
| TC-338 | Category auto-select | Open form before categories warm | First category selected or submit succeeds | not-run | |
| TC-339 | Tx different month | Add tx dated in prior month | Month picker switches; tx visible | not-run | Custom month_start_day |
| TC-340 | Filter cleared on add | Type filter = Expense; add Income | Filter resets to All; income visible | not-run | |
| TC-341 | Transfer create | Add transfer between accounts | Saves without full-history fetch delay | not-run | |

### Remove Activity overview (session 46)

| ID | Area | Steps | Expected | Result | Notes |
|----|------|-------|----------|--------|-------|
| TC-342 | No overview block | Open Activity tab | Month picker + filters + list only; no net worth/insights | not-run | |
| TC-343 | No full history fetch | Activity tab open | Month-scoped load only; no `loadHistory` | not-run | |

### Categories, recurring, banks (session 47)

| ID | Area | Steps | Expected | Result | Notes |
|----|------|-------|----------|--------|-------|
| TC-344 | Sub-category create | Settings → Categories → add child under parent | Tree shows parent + child; picker groups by parent | not-run | Requires migration |
| TC-345 | Delete all categories | Categories → delete all | Empty list; optional starter pack | not-run | |
| TC-346 | Recurring auto-post | Create monthly rule with past `next_run_date` → reopen app | Transaction created; toast on Activity; rule advances | not-run | |
| TC-347 | Recurring pause/skip | Pause rule; set skip next | No post while paused; skip defers one cycle | not-run | |
| TC-348 | Bank icon on account | Settings → account → pick ICICI/SBI | Icon on card and form | not-run | |
| TC-349 | Migration SQL | Run `add_subcategories_recurring_bank.sql` in Supabase | No `42P13`; RPC returns `bank` column | not-run | DROP FUNCTION included |

### Goals list + modal (session 48)

| ID | Area | Steps | Expected | Result | Notes |
|----|------|-------|----------|--------|-------|
| TC-350 | Days left on bar | Goals tab → progress list | Each goal shows days left + % | not-run | |
| TC-351 | Open goal modal | Click a goal row | `GoalDetailModal` with contributions, forecast | not-run | |
| TC-352 | No duplicate goals | Goals tab layout | Bars in main column only; not in summary sidebar | not-run | |

### Daily recurring (session 49)

| ID | Area | Steps | Expected | Result | Notes |
|----|------|-------|----------|--------|-------|
| TC-353 | Daily rule create | Recurring → Daily → save | Rule saved; `next_run_date` advances by 1 day | not-run | Requires migration; session 62 adds idempotent SQL + app error hint |

### Daily recurring hardening (session 62)

| ID | Area | Steps | Expected | Result | Notes |
|----|------|-------|----------|--------|-------|
| TC-360 | Daily without migration | Save daily rule on DB with old frequency CHECK | Toast explains run `add_recurring_daily_frequency.sql` | not-run | `assertRecurringNoError` |
| TC-361 | Daily after migration | Run SQL then create daily rule | Rule saved; `day_of_month` null; next run computed | not-run | |
| TC-362 | Edit schedule to daily | Edit monthly rule → Daily → save | `day_of_month` cleared; `next_run_date` recalculated | not-run | `normalizeRecurringSchedule` on update |
| TC-363 | Interval unit label | Select Daily frequency in form | “Every (days)” shown | not-run | |
| TC-364 | Local production build | `npm run build` after clean install | Vite build succeeds | pass | session 62 |

### Separate tabs + goals + snapshots (session 63)

| ID | Area | Steps | Expected | Result | Notes |
|----|------|-------|----------|--------|-------|
| TC-365 | 4-tab nav | Open app on mobile/desktop | Goals, Activity, Summary, Settings visible | not-run | |
| TC-366 | Activity standalone | Tap Activity tab | `/transactions`; month picker; tx list | not-run | |
| TC-367 | USD goal visible | Goals tab with INR + USD goals, default INR | Both goals listed | not-run | F-113 |
| TC-368 | Category delete preserves tx | Delete category with past transactions | Activity still shows original category name | not-run | Requires snapshot migration |
| TC-369 | Category rename preserves tx | Rename category; view old transactions | Old txs keep name at time of snapshot | not-run | |
| TC-370 | Summary tx link | Summary → View transactions | Opens `/transactions?month=…` | not-run | |

### Activity table + pagination (session 64)

| ID | Area | Steps | Expected | Result | Notes |
|----|------|-------|----------|--------|-------|
| TC-371 | Pagination bottom only | Activity with 10+ transactions | Pagination below list only; none above | not-run | F-101 |
| TC-372 | Column alignment | Activity desktop @ lg+ | Headers align with Description, Account, Amount, Actions | not-run | F-115 |
| TC-373 | Icon edit/delete | View expense/income row | Pencil + Trash icons; aria-labels present | not-run | F-116; supersedes TC-355 text buttons |
| TC-374 | Transfer row actions | View transfer row | Delete icon only; no edit | not-run | |

### Goals cards + nav + Settings (session 65)

| ID | Area | Steps | Expected | Result | Notes |
|----|------|-------|----------|--------|-------|
| TC-386 | Goal card grid | Goals tab with 2+ goals | Cards in responsive grid; up to 6 cols on xl | not-run | F-117 |
| TC-387 | Days left on card | View goal card | Days left top-right; no calendar date row | not-run | F-118 |
| TC-388 | No track badge on card | View goal card | No on-track / behind chip on card | not-run | F-118 |
| TC-389 | New goal below grid | Scroll Goals tab | Dashed “New goal” CTA below cards; no FAB | not-run | F-119 |
| TC-390 | Summary first nav | Open app | Summary tab first; `/` lands on Summary | not-run | F-120 |
| TC-391 | Activity rupee icon | View bottom/sidebar nav | Activity shows ₹ icon | not-run | F-123 |
| TC-392 | Activity full-width table | Activity @ desktop | Table spans full content width | not-run | F-121 |
| TC-393 | Activity chip filters only | Activity filter bar | Month + type chips only; no search/amount | not-run | F-122 |
| TC-394 | Tx category chips wrap | Add transaction → Category | Chips side-by-side wrapping | not-run | F-124 |
| TC-395 | No Settings budgets | Settings page | No Budgets section | not-run | F-126 |
| TC-396 | Settings vertical | Settings @ desktop | Sections stacked vertically | not-run | F-125 |

### Summary Overall / Monthly tabs (session 66)

| ID | Area | Steps | Expected | Result | Notes |
|----|------|-------|----------|--------|-------|
| TC-397 | Default Overall tab | Open Summary | Overall tab selected; no month picker | not-run | F-127 |
| TC-398 | Switch to Monthly | Tap Monthly tab | Month picker appears; stats scoped to month | not-run | F-127 |
| TC-399 | Overall all-time stats | Overall with historical tx | Income/expenses reflect all transactions | not-run | F-128 |
| TC-400 | Overall goal total | Overall with goal contributions | Goals column shows lifetime contributions | not-run | F-128 |
| TC-401 | Overall chart no budget | Overall view with budgets set | Chart has no budget target lines | not-run | F-128 |
| TC-402 | Monthly chart budget | Monthly view with budgets | Budget lines/over-budget still shown | not-run | F-76 + F-127 |
| TC-403 | Footer link Overall | Overall tab | “View all transactions” → `/transactions` | not-run | |
| TC-404 | Footer link Monthly | Monthly tab | “View transactions this month” with `?month=` | not-run | |

### Category spending heatmap (session 67)

| ID | Area | Steps | Expected | Result | Notes |
|----|------|-------|----------|--------|-------|
| TC-405 | Heatmap renders | Summary with expense data | Colored tiles per category; no pie chart | not-run | F-129 |
| TC-406 | Tile size by spend | Categories with unequal amounts | Larger share → wider tile | not-run | F-129 |
| TC-407 | Over-budget tile | Category over monthly budget | Tile rose-colored; list badge | not-run | F-129 |
| TC-408 | Heatmap tooltip | Hover/focus a tile | Amount, %, budget details | not-run | F-129 |
| TC-409 | Chart settings | Gear → sort + list toggle | No pie/donut or size slider | not-run | F-108 update |
| TC-410 | Overall heatmap | Overall tab with history | Heatmap shows all-time category totals | not-run | F-127 + F-129 |

### Activity pagination (session 50)

| ID | Area | Steps | Expected | Result | Notes |
|----|------|-------|----------|--------|-------|
| TC-354 | Page size 50 | Activity → select 50 | Up to 50 tx per page | not-run | |
| TC-355 | Edit delete same line | View any expense row | Amount + icon Edit/Delete on one line | not-run | **Session 64:** Pencil/Trash2 icons |
| TC-356 | Page reset on filter | Change month or filter | Page returns to 1 | not-run | |

### Horizontal categories (session 51)

| ID | Area | Steps | Expected | Result | Notes |
|----|------|-------|----------|--------|-------|
| TC-357 | Chip groups | Settings → Categories | Parent + subs in horizontal wrap rows | not-run | |

### Full-width chart (session 53–54)

| ID | Area | Steps | Expected | Result | Notes |
|----|------|-------|----------|--------|-------|
| TC-358 | Chart full width | Summary tab desktop | Chart spans page width; bars not capped narrow | not-run | |
| TC-359 | Amount labels clear | Tall bars on Summary | Amount text above bars, no overlap | not-run | Session 54 fix |

### Home + Summary tabs (session 56)

| ID | Area | Steps | Expected | Result | Notes |
|----|------|-------|----------|--------|-------|
| TC-360 | Home tab | Open Home | Goals list + Activity transactions on one page | obsolete | **Session 63:** separate Goals + Activity tabs; `/goals` goals only |
| TC-361 | Summary tab | Open Summary | Stats + chart + balances; no goals list | not-run | Route `/summary` |
| TC-362 | Tx redirect | Visit `/transactions?month=2026-06` | Lands on Home with same month | obsolete | **Session 63:** `/transactions` is Activity tab; no redirect |
| TC-363 | Nav three tabs | Bottom/sidebar nav | Home · Summary · Settings only | obsolete | **Session 63:** 4 tabs — Goals · Activity · Summary · Settings |

### Category pie chart (session 57)

| ID | Area | Steps | Expected | Result | Notes |
|----|------|-------|----------|--------|-------|
| TC-364 | Pie renders | Summary tab with expense data | Centered pie; one slice per category | not-run | |
| TC-365 | Slice proportions | Multiple categories with known amounts | Slice angles match % of total spending | not-run | |
| TC-366 | Over-budget slice | Category over monthly budget | Slice rose; legend "over by X" badge | not-run | |
| TC-367 | Hover tooltip | Hover slice (desktop) | Rich tooltip: name, amount, %, budget | not-run | Updated session 60 — was native `<title>` only |
| TC-368 | Empty month | Summary with no expenses | "No spending breakdown this month" | not-run | |
| TC-369 | Large sizing | Summary @ desktop | Pie scales up with `large` prop | not-run | |

### Obsolete (bar chart era — session 57)

| ID | Area | Notes |
|----|------|-------|
| TC-358 | Full-width bars | Superseded — pie chart session 57 |
| TC-359 | Bar label overlap | N/A — no bar labels |

### Chart settings (session 58)

| ID | Area | Steps | Expected | Result | Notes |
|----|------|-------|----------|--------|-------|
| TC-370 | Settings gear | Summary → tap gear icon | Popover opens with style/sort/legend options | not-run | |
| TC-371 | Donut style | Settings → Donut | Ring chart with total in center | not-run | |
| TC-372 | Hide legend | Uncheck "Show category list" | List hidden; chart remains | not-run | |
| TC-373 | Prefs persist | Change settings → reload page | Same chart options restored | not-run | localStorage |
| TC-374 | Reset settings | Settings → Reset | Defaults: pie, amount sort, legend on, size 380 | not-run | |

### Slice hover tooltip (session 60)

| ID | Area | Steps | Expected | Result | Notes |
|----|------|-------|----------|--------|-------|
| TC-375 | Rich tooltip | Hover a slice | Tooltip shows name, amount, %, budget | not-run | |
| TC-376 | Slice dimming | Hover one slice | Other slices fade | not-run | |
| TC-377 | Keyboard tooltip | Tab to slice, focus | Same tooltip as hover | not-run | |
| TC-378 | Clear on leave | Move mouse off chart | Tooltip disappears | not-run | |

### Resizable chart + summary trim (session 61)

| ID | Area | Steps | Expected | Result | Notes |
|----|------|-------|----------|--------|-------|
| TC-379 | Default chart size | Open Summary with expenses | Chart ~380px, centered | not-run | |
| TC-380 | Drag resize | Drag bottom-right handle | Chart grows/shrinks; size persists on reload | not-run | |
| TC-381 | Size slider | Settings → adjust Chart size | Chart updates live | not-run | |
| TC-382 | Center aligned | Summary @ desktop | Chart centered, not left-aligned | not-run | |
| TC-383 | No income list | Summary with income tx | No "Income by category" card; Income stat still shown | not-run | |

---

## Regression log

_Add a row here after each release or bug fix._

| Date | Area | What was verified |
|------|------|-------------------|
| 2026-06-14 | Scaffold | `npm run dev` succeeds |
| 2026-06-14 | Data layer + lint | `npm run lint` passes after goals/contributions hooks |
| 2026-06-14 | Production build | `npm run build` succeeds locally |
| 2026-06-14 | Vercel deploy | Production alias live at `savings-tracker-azure.vercel.app` |
| 2026-06-14 | Auth + backup build | `npm run lint` and `npm run build` pass after Supabase Auth |
| 2026-06-14 | Google OAuth | `npm run lint` passes after Google sign-in UI |
| 2026-06-14 | Phase 2 finance | `npm run lint` and `npm run build` pass; deployed `dpl_8wdpUKN1mdGTHur37Kxc9iCq1F1A` |
| 2026-06-14 | v0.7 smooth rendering | `npm run build` pass; `AppDataProvider` + `PersistentTabs` |
| 2026-06-14 | v0.7 categories + chart | `npm run build` pass; horizontal bars + dedupe grouping |
| 2026-06-14 | v0.7 bundle deploy | `dpl_9G76wuEeYGzRS8YUTSJeZ4vpkBEt` — sessions 13–16 live |
| 2026-06-14 | v0.7.1 modal scroll lock | `npm run build` pass; `ModalShell` + `useBodyScrollLock`; deployed `dpl_GmRJxcUV5vnoNf7NtXjM1Gegzz3c` |
| 2026-06-14 | v0.8 settings + nav hide | Deployed `dpl_9cMTc1xvgNFSTP9JHS65KiK2JH1w` |
| 2026-06-14 | v0.8 Lucide PWA icon + padding | Deployed `dpl_7dAcpAxeSrYu56Qm8vL23NXrxjzP` |
| 2026-06-14 | v0.8 local features | `npm run build` pass; Net formula, PWA routing, tx→goal, savings category (not deployed) |
| 2026-06-14 | v0.8.1 Net = balances | Deployed `dpl_48F1c9qrJvjbAKDimti8vA2WqvbG`; one-time ₹15k offset |
| 2026-06-14 | v0.8.2 expense→goal | `npm run build` pass; goal chips on expense tx (local; not deployed) |
| 2026-06-14 | v0.9 summary polish | Deployed `dpl_J8AYJzLDifXG1a5i8CVhrMQ72BZT` — total balance, goals split, no savings rate |
| 2026-06-14 | v0.9 PWA white screen fix | Deployed `dpl_4561DtfyVqRpxwRxn3SoeWgerzon`; `useState` import restored |
| 2026-06-16 | v0.9.1 category bar charts | Deployed `dpl_4bydxU1xLQW6ph2pFbBTN2qWj3Fm` |
| 2026-06-16 | v0.10 category budgets | `npm run build` pass; migration applied; deployed `dpl_6Ha3rUxhexj1KefwAZLsNLMpuvt3` |
| 2026-06-16 | v0.10 production redeploy | `npm run build` pass; deployed `dpl_5omZmdhEkxa43YcojQAsjGs3oX2R` (no code delta) |
| 2026-06-16 | v0.10.2 production redeploy | `npm run build` pass; deployed `dpl_H3ZAQPpHAcUPAv8RN2VbZfBnKWp5` (no code delta) |
| 2026-06-16 | v0.10.1 default-currency summary | `npm run build` pass; preferredCurrency filter (local; not deployed) |
| 2026-06-16 | v0.10.1 production deploy | Deployed `dpl_3vXo8iDvn63rboSRJ5ZLwWY5DMrT` — default-currency summary live |
| 2026-06-16 | v0.10.2 goal save fix | Migration applied; deployed `dpl_8bxRorY2gXGbBSMfTmLWeFX9rtwe` |
| 2026-06-16 | v0.10.3 tx edit + goal contrib | Deployed `dpl_4CxBcnXQ1yK6bfznUpV6DrBCFxu2` |
| 2026-06-16 | v0.11 desktop-first UI | Deployed `dpl_3bXvRfoZsDjq6FZJRfyFf1eSjYBz` |
| 2026-06-16 | v0.11.1 chart + tab flash | Deployed `dpl_G63rco3hVp95zEB9Bscz5MpCiPhh` |
| 2026-06-16 | v0.11.2 browser focus flash | Deployed `dpl_D6Jdkdj5bMfYmXLvyPhSSDEVKmeq` |
| 2026-06-23 | v0.12 finance feature pack | `npm run build` pass; deployed `dpl_12u4qX5Q7gNcmSTN6PsHGFo3VdSd` |
| 2026-06-23 | v0.12.1 goals summary bars | `npm run build` pass; deployed `dpl_CV9D4vX2mQn83gWEN7ajfB4egr1X` |
| 2026-06-23 | v0.12.2 transaction add fix | `npm run build` pass; deployed `dpl_BrDv9LqEZP25gdcTSULBYMu1b3AA`, `dpl_asdLrUn7GsVKVUNEX7YmQhbHtwk9` |
| 2026-06-23 | v0.12.3 remove Activity overview | `npm run build` pass; deployed `dpl_UESw1RoWFExdYPKfvyNsSaQzQS1a` |
| 2026-06-23 | v0.13 categories recurring banks | `npm run build` pass; deployed `dpl_FeHGJsUPndg94gMdPag3xoXZW8wD`; migration `add_subcategories_recurring_bank.sql` updated with DROP FUNCTION |
| 2026-06-23 | v0.14 UX polish bundle | `npm run build` pass; deployed `dpl_35QfDCM9dFrooiG4DYNYDF6kvT81` — goals modal, daily recurring, Activity pagination, horizontal categories |
| 2026-06-23 | v0.14.5 full-width chart deploy | `npm run build` pass; deployed `dpl_9aMD9x3TVwRBRNeFkkPWhgvfiYz2` |
| 2026-06-23 | v0.15 Home + Summary tabs | `npm run build` pass; tab merge + SummaryPage (deploy pending) |
| 2026-06-23 | v0.16 category pie chart | `npm run build` pass; SVG pie in CategoryBreakdownChart (deploy pending) |
| 2026-06-23 | v0.17 production deploy | `npm run build` pass; deployed `dpl_JAuw2D4fW8sw1RnA1KUFG6mtmx62` — pie + chart settings |
| 2026-06-23 | v0.17.1 slice hover tooltip | `npm run build` pass; rich tooltip on slice hover (deploy pending) |
| 2026-06-23 | v0.18 resizable chart | `npm run build` pass; drag resize + remove income list (deploy pending) |
| 2026-07-04 | v0.19 Phase 2 commit + daily recurring fix | `npm run build` pass locally; git commit `f912255` on `master`; daily recurring migration + app hardening (deploy pending) |
| 2026-07-04 | v0.20 separate tabs + snapshots | `npm run build` pass locally; 4-tab nav; all-currency goals; category snapshot on transactions (deploy pending) |
| 2026-07-04 | v0.21 Activity table polish | `npm run build` pass locally; bottom-only pagination; aligned columns; icon edit/delete (deploy pending) |
| 2026-07-04 | v0.22 Goals cards + Activity + Settings | `npm run build` pass locally; GoalCard grid; Summary first nav; Activity full-width + chip filters; Settings budgets removed (deploy pending) |
| 2026-07-04 | v0.23 Summary Overall/Monthly tabs | `npm run build` pass locally; Overall default; all-time tx cache; lifetime goal totals (deploy pending) |
| 2026-07-04 | v0.24 category spending heatmap | `npm run build` pass locally; heatmap replaces pie; simplified chart prefs (deploy pending) |
