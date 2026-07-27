# Error History

Log bugs, incidents, and fixes so the same issues are not re-debugged from scratch.

| Date | Symptom | Root cause | Fix | Prevention |
|------|---------|------------|-----|------------|
| 2026-06-14 | `npx tailwindcss init -p` failed | Tailwind v4 installed by default; v4 CLI differs from v3 `init` | Pinned `tailwindcss@3` and created config files manually | Use `tailwindcss@3` when following classic `tailwind.config.js` + `@tailwind` setup |
| 2026-06-14 | PowerShell `&&` chain failed | Older PowerShell does not support `&&` | Use `;` to separate commands on Windows | Prefer `;` or run commands individually in PowerShell |
| 2026-06-14 | `npm run dev` SecurityError in PowerShell | Execution policy blocks `npm.ps1` | Use `npm.cmd`, `.\dev.cmd`, or Command Prompt terminal | `.vscode/settings.json` sets default terminal to cmd; see `dev.cmd` / `build.cmd` |
| 2026-06-14 | Goal create/edit fails: "could not find color columns" | `currency` / `color` columns missing in live Supabase schema | Run `supabase/add_currency_color.sql` in Supabase SQL editor | Run migration after base schema; document in setup steps |
| 2026-06-14 | `.env` staged for initial git commit | `git add .` included secrets file before `.gitignore` took effect | `git rm --cached .env` before commit | Never `git add .` without confirming `.env` is ignored |
| 2026-06-14 | `git commit` failed: author identity unknown | No global/local `user.name` / `user.email` configured | One-off commit: `git -c user.name=… -c user.email=… commit` | Set git identity locally or globally before committing |
| 2026-06-14 | Vercel preview env add prompts for Git branch | Preview env vars require branch context when no Git repo linked | Set production + development first; add preview after GitHub connect | Link GitHub repo before configuring preview env vars |
| 2026-06-14 | No goals visible on Vercel (pre-auth) | Each origin has its own `device_id` in localStorage; queries filtered by it | Expected until sign-in (session 7) or export/import | Document cross-browser behavior; prefer account sync |
| 2026-06-14 | Google OAuth `redirect_uri_mismatch` | Redirect URI in Google Cloud did not match Supabase callback URL | Add `https://<project-ref>.supabase.co/auth/v1/callback` in Google Console | Always use Supabase callback URL, not Vercel URL |
| 2026-06-14 | After Google login, redirect to localhost | Supabase Site URL set to `http://localhost:5173` | Set Site URL to production Vercel URL; add localhost + Vercel to Redirect URLs | Check Supabase URL Configuration after deploy |
| 2026-06-14 | `column goals.user_id does not exist` | `add_auth.sql` not run in Supabase | Run full `supabase/add_auth.sql` in SQL Editor | Run auth migration before using signed-in app |
| 2026-06-14 | Mobile login: goals not syncing | (1) Different auth provider = different user; (2) desktop goals still `user_id` null; (3) goals fetched before claim finished | Account label in header; `authReady` gate; sign in on desktop to claim; export/import fallback; optional `fix_contribution_select_rls.sql` | Use same sign-in method on all devices; claim on origin browser |
| 2026-06-14 | Activity/Summary/Settings errors after deploy | `phase2_finance.sql` not run in Supabase | Run `supabase/phase2_finance.sql` in SQL Editor | Document migration order in README + Settings empty states |
| 2026-06-14 | Settings page crash (blank) | `categoryTab` used before `useState` declaration | Move `categoryTab` state above `useCategories` | Declare state before hooks that depend on it |
| 2026-06-14 | Tab switch skeleton flash / refetch burst | Per-page hooks cold-fetch on every mount (`<Outlet />`) | `AppDataProvider` + `PersistentTabs` + SWR loading rules | Keep tabs mounted; shared cache |
| 2026-06-14 | Account balances unchanged after expense | `runTransactionsMutation` did not call `refreshAccounts()` | Await `refreshAccounts({ background: true })` after tx mutations | Invalidate related caches on mutation |
| 2026-06-14 | Mobile: Add goal / Add transaction FAB not tappable | Install prompt full-width `z-40` overlay; inactive tab fixed layers | `pointer-events-none` on prompt wrapper; FAB `z-[60]` + `isTabActive` | Test FAB with install banner visible on iOS Safari |
| 2026-06-14 | Settings categories very slow | `refreshCategories` ran `ensureCategories()` → prune + double fetch every time | `refreshCategories` = `getCategories()` only; prune once in background at bootstrap | Never run prune on routine refresh |
| 2026-06-14 | Summary category breakdown wrong | Grouped by `category_id`; duplicates split; map missed archived IDs | `categoryDedupeKey` + prefer `tx.category` embed in `monthlySummary.js` | Use transaction join data for display labels |
| 2026-06-14 | `Dashboard.jsx` build failure | Bad merge left orphaned `setEditingGoal` lines | Restore `openCreateForm`; remove duplicate `claimNotice` refetch | Verify `npm run build` after large refactors |
| 2026-06-14 | Mobile: page scrolls when tapping modal CTA | Background not locked on iOS; touch events hit page under overlay | `useBodyScrollLock` + `ModalShell`; `touchmove` guard outside panel; inner `.modal-scroll` only | Test Add transaction Save on iOS Safari with long form |
| 2026-06-14 | PWA opens with nav only, blank content | Path `/` matched no tab; nested `<Navigate>` didn't mount (no `<Outlet />`) | Top-level redirects + `PersistentTabs` fallback to `/goals` | Test cold start from home screen at `/` and `/goals` |
| 2026-06-14 | Custom rupee icon unclear at small size | Filled custom SVG in 20px nav/settings buttons | Lucide `IndianRupee` stroke everywhere | Match icon family to adjacent Lucide icons |
| 2026-06-14 | One-time ₹15k Net offset stuck / wrong timing | Offset applied during empty loading state before real balances loaded | `shouldApplyOneTimeNetOffset()` waits for `!loading` and non-zero INR summary signals | Never write localStorage flags from placeholder/empty cache |
| 2026-06-14 | Web vs PWA different Net | `localStorage` offset separate per browser/PWA context | `net_balance_adjustment_inr` on profile (later removed session 29) | Store user prefs on server when cross-context sync matters |
| 2026-06-14 | PWA white screen after deploy | `useState` removed from `SummarySection` imports during refactor | Restored `useState` import | Run app / `npm run build` after hook refactors; test PWA cold start |
| 2026-06-14 | Summary Net ≠ Settings balance total | Net used `balances − monthly expenses` but balances already reflect all expenses | Total balance = `balances` only | Do not subtract monthly flow from cumulative ledger balance |
| 2026-06-16 | Desktop Goals: spending chart overflows page | Inline `minWidth` + `lg:overflow-visible` in narrow sticky column | `compact` chart mode; `min-w-0`; contained scroll (session 41) | Test Goals with 8+ categories at 1280px |
| 2026-06-16 | App tab switch skeleton flash | `invalidateTransactions` deleted cache; `PersistentTabs` `h-0` collapse | Stale-while-revalidate tx cache; off-screen tabs without height collapse (session 41) | Switch Goals ↔ Activity without edits |
| 2026-06-16 | Browser tab switch / Chrome restore skeleton flash | `SIGNED_IN` reset `authReady` → `clearAll()` wiped cache | Silent token refresh; `clearAll` on sign-out only; hooks keep data (session 42) | Switch Chrome tabs; minimize/restore |
| 2026-06-23 | New transactions not appearing / add fails | Empty `category_id` when categories loaded after form open; cache not updated for tx month/type; transfer create re-fetched all tx | Category ids in form resetKey; optimistic cache merge; `getPeriodForDate` invalidation; switch month/filters after add (session 45) | Include category signature in form reset; merge tx into cache on mutation |
| 2026-06-23 | Activity Overview not loading / stuck skeleton | `loadHistory()` fetches entire ledger with no pagination; errors not surfaced in UI; `LineChart` SVG gradient issues | Removed Overview section + full history cache (session 46) | Avoid unbounded fetches for dashboard widgets; show errors when analytics fail |
| 2026-06-23 | Chart amount labels overlapped by tall bars | Outer flex container height 200px but `large` bars 300px with `items-end` | Fixed bar column layout + reserved label height in `CategoryBreakdownChart` (session 54) | Keep labels outside fixed-height bar area |
| 2026-06-23 | `add_subcategories_recurring_bank.sql` fails: `42P13 cannot change return type` | `CREATE OR REPLACE FUNCTION get_account_balances()` cannot add `bank` to `RETURNS TABLE` when function already exists | `DROP FUNCTION IF EXISTS get_account_balances()` then `CREATE FUNCTION` in migration (session 47) | Drop RPC before changing OUT/return row shape; document in migration file |
| 2026-07-04 | Daily recurring rule fails on save | `recurring_transactions` CHECK allowed only `weekly`/`monthly`/`yearly` on DBs created before session 49; `CREATE TABLE IF NOT EXISTS` does not alter existing constraints | Run `add_recurring_daily_frequency.sql` (or re-run frequency block at end of `add_subcategories_recurring_bank.sql`); `normalizeRecurringSchedule()` + `assertRecurringNoError()` in app (session 62) | Append idempotent frequency CHECK fix to migrations; map Postgres `23514` to user-facing migration hint |
| 2026-07-04 | `npm run build` — Permission denied / Rolldown native binding missing | Stale/corrupt `node_modules` (non-executable `.bin/vite`; missing `@rolldown/binding-darwin-arm64`) | `rm -rf node_modules && npm install`; build via `npm run build` | Reinstall deps after permission or optional-dep install failures |
| 2026-07-04 | USD goal (e.g. Indmoney) missing on Goals tab | `GoalsProgressBars` filtered by `preferredCurrency` (profile default INR); fallback to all goals only when zero INR matches | Removed currency filter; Goals tab lists all goals regardless of currency (session 63) | Do not filter goals list by default currency; reserve currency scoping for Summary |
| 2026-07-04 | Past transactions lose/wrong category after category delete or rename | Transactions stored only `category_id`; `ON DELETE SET NULL`; display used live category join | Snapshot columns on `transactions`; freeze on delete; `resolveTransactionCategory()` prefers snapshot (session 63) | Denormalize display labels at write time; backfill before category delete |
| 2026-07-05 | Activity page broken (add/edit tx fails) | App wrote `category_name`/`category_color`/`category_is_savings` on insert; columns missing if `add_transaction_category_snapshot.sql` not run | Retry without snapshot fields via `isMissingSnapshotColumnError()` (session 70 — F-131) | Run migration for frozen labels; app degrades gracefully without it |
| 2026-07-06 | Savings + goal double count on Summary | Savings-category expense with goal chip counted in category Savings and Goals | `countsAsCategorySavings()` excludes goal-linked txs (session 72 — F-133) | Store `goal_id` on transaction at create time |
| 2026-07-06 | Goal unchanged after deleting linked transaction | `source_transaction_id` FK `ON DELETE SET NULL`; contribution not deleted | `deleteContributionsForTransaction()` before tx delete (session 74 — F-134) | Use `ON DELETE CASCADE` alone; legacy txs still need app match |

## Template (copy for new entries)

```markdown
| YYYY-MM-DD | What the user saw | Why it happened | What we changed | How to avoid next time |
```

## Known risks (not yet errors)

- ~~**Open RLS policies**~~ — **Addressed in `add_auth.sql`** (authenticated-only policies). Must run migration in Supabase.
- ~~**No auth / device_id orphaning**~~ — **Mitigated:** Supabase Auth + `claim_device_data`; export/import still available.
- **Email confirmation** — if enabled in Supabase, sign-up may require email confirm before session is active.
- **`add_auth.sql` not applied** — app will fail to load/create goals (anon blocked, no `user_id` column yet).
- **Google provider not configured** — "Continue with Google" fails until OAuth client is set in Supabase + Google Cloud.
- **Google vs email duplicate users** — same email via Google and email/password are different `auth.users` rows; data will not sync across them.
- **Contribution RLS strict SELECT** — if `contribution.user_id` was not backfilled, nested contributions may be empty until `fix_contribution_select_rls.sql` is applied.
- **`phase2_finance.sql` not applied** — finance pages fail (missing tables/RPCs); goals still work. Run migration after `add_auth.sql`.
- **Cross-currency transfer** — blocked by `create_transfer()` RPC; user must use same-currency accounts.
- **Inactive persistent tab overlays** — mitigated: `isTabActive` gates FABs/modals; `inert` on hidden tabs (session 14).
- **Category prune on every refresh** — mitigated: background one-time prune at bootstrap (session 16).
- **Modal background scroll on mobile** — mitigated: `ModalShell` + `useBodyScrollLock` + confined `.modal-scroll` (session 17).
- **PWA cold start blank tab** — mitigated: route redirects + `PersistentTabs` fallback (session 21).
- **`add_category_is_savings.sql` not applied** — savings category create/select may fail until migration run (session 23). **Applied on production Supabase** as of session 23 follow-up.
- **`net_balance_adjustment_inr` column** — exists on production after session 26 migration; app no longer writes it (offset removed session 29). Safe to ignore.
- **Full transaction history fetch** — **removed session 46** (overview removed); Activity uses month-scoped `loadTransactions` only.
- **`add_subcategories_recurring_bank.sql` not applied** — categories sub-tree, recurring rules, and bank slugs fail at runtime; `get_account_balances` RPC missing `bank` column until migration runs.
- **`add_recurring_daily_frequency.sql` not applied** — creating a daily recurring rule fails CHECK constraint on existing DBs migrated before session 49. **Mitigated session 62:** migration uses `DO` block to drop any frequency CHECK; same block appended to `add_subcategories_recurring_bank.sql`; app shows migration hint on `23514`.
- **`add_transaction_category_snapshot.sql` not applied** — **mitigated session 70:** create/update retries without snapshot columns; category delete freeze skipped. **Still recommended** for frozen labels on past transactions.
- **`add_transaction_goal_link.sql` not applied** — **mitigated session 72:** inserts omit `goal_id` / `source_transaction_id` on column error; legacy note matching for highlight/exclusion. **Recommended** for reliable goal↔tx linking.
- **GitHub push without credentials** — `git push origin master` fails in non-interactive environments; configure `gh auth login`, SSH key, or HTTPS credential helper locally.
- **Local vs remote `master` divergence** — GitHub `master` may be at `3b3344f` while local is `b1a24b3`; push may require merge/rebase or force (avoid force to main without explicit request).
