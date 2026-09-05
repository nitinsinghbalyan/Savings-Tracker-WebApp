---
name: ship
description: Ship a change in the savings-tracker app end to end — read the project-memory context, verify the change against this repo's known failure modes, update the project-memory docs, commit to git, and deploy to Vercel production. Use this whenever work in this repo is finished and needs to go live, and also when the user says any of "ship it", "deploy this", "push to production", "commit and deploy", "update project memory", or asks to record what changed in the changelog or error history. Prefer this skill over running vite/git/vercel commands ad hoc, because this repo keeps a detailed memory of bugs that have already been shipped once and the workflow exists to stop them recurring.
---

# Ship a change in savings-tracker

React + Vite + Tailwind + Supabase, deployed to Vercel at
`savings-tracker-azure.vercel.app`. This skill covers the last mile: proving a
change works, writing it down, committing it, and putting it live.

The thing that makes shipping here different from any other repo is
`project-memory/` — 5,000 lines of accumulated context that already records
most of the ways this app breaks. **This skill is a set of pointers into that
folder, not a replacement for it.** The memory is the source of truth and it is
updated every session; anything restated here can drift out of date, so read the
files rather than trusting a summary.

## Phase 0 — read the memory first

`project-memory/README.md` sets the policy: skim before starting, append after.
Read at minimum:

| File | Read it for |
|---|---|
| `error-history.md` | The **Prevention** column. 45+ incidents, each with the root cause and how to avoid a repeat. Short enough to read whole — do that. |
| `architecture.md` | **SQL migrations (status)** — which migrations are applied on production Supabase. Stack, schema, env vars, folder layout. |
| `features.md` | Whether the thing you changed is `planned` · `in-progress` · `done` · `deferred`. |
| `test-cases.md` | The existing TC rows covering the area you touched, and the **Deployment (Vercel)** section (TC-50…TC-56). |
| `decisions.md` | Whether your change contradicts a decision already made and why the alternative was rejected. |
| `changelog.md` | The last few session entries — the tail carries "Not done (manual follow-up)" items that may still be open. |

If a change contradicts a logged decision, raise it with the user before
shipping rather than quietly reversing it.

## Phase 1 — verify, aimed at how this app actually breaks

Run the production build, but understand its limits: `vite build` type-checks
nothing and renders no component. `error-history.md` is full of changes that
compiled cleanly and still shipped a blank screen. Check the specific classes
below — they are drawn from incidents this repo has already had.

### The blank-screen classes (all recorded, all repeats)

**Declaration order.** "Settings page crash (blank) — `categoryTab` used before
`useState` declaration." "PWA white screen after deploy — `useState` removed
from `SummarySection` imports during refactor." A `useMemo` or helper placed
above the hook supplying its data throws
`Cannot access 'X' before initialization` at render, the component returns
nothing, and the tab is blank while the build stays green. After adding any
derived value, confirm its inputs are declared *above* it. The memory's own
prevention line: *declare state before hooks that depend on it*.

**First paint specifically.** "Summary tab blank after perf pass" — the default
route and its above-the-fold chart were moved behind `lazy()`. "Activity blank
until a filter chip was toggled" — a data effect keyed on filter values instead
of the cache slot. Prevention, verbatim: *never lazy-load the default route or
its above-the-fold chart*, and *verify the first paint, not only
post-interaction states*. Loading a screen and clicking around is not enough;
the bug is often in the very first render.

**A missing Supabase migration.** Repeatedly the cause of a broken tab:
`phase2_finance.sql`, `add_auth.sql`, `add_transaction_category_snapshot.sql`,
`add_goal_category_link.sql` have each done it. Check
`architecture.md` → **SQL migrations (status)** before assuming code is at
fault. If your change needs a migration, the app should degrade gracefully
without it (see F-138) and the migration must be called out in the changelog as
manual follow-up — you cannot apply DDL with only the anon key.

**Stale caches after a mutation.** "Account balances unchanged after expense",
"Add money to a goal does not appear in Activity". Prevention: *invalidate the
period the Activity tab actually uses* (honour the profile's `monthStartDay`,
not a default of 1), and *never skip overall keys in the merge*.

### Practical checks

A vite dev server usually runs on `127.0.0.1:5173` (`pgrep -fl vite`; otherwise
`preview_start` — `.claude/launch.json` has `autoPort`). Asking it for each
changed module surfaces parse damage in seconds instead of waiting on a build,
which matters because **builds in this repo have taken 4–14 minutes**:

```bash
for f in <changed files>; do
  R=$(curl -s "http://127.0.0.1:5173/$f")
  echo "$R" | grep -q "PARSE_ERROR\|Transform failed" && echo "FAIL  $f" || echo "ok    $f"
done
```

Worth doing after any scripted edit (`sed`, `python`) that moved a block —
those silently eat closing braces.

Then load it in the browser and read the console with
`read_console_messages({onlyErrors: true})`.

**Never type the user's credentials.** Everything past sign-in needs their
login. If the change touches Month, Goals, Ledger or Settings, ask them to sign
in on the preview tab so you can drive it, and never call an authenticated
screen "tested" when you only saw the login page. Say which screens you
verified and which you could not.

Where the memory names a device, honour it: iOS Safari for the modal scroll
lock and the FAB under the install banner; 1280px with 8+ categories for the
Goals chart overflow.

Finally the build itself — **background it**, because a foreground call will hit
the tool timeout, get killed midway, and leave damage:

```bash
npx vite build > /tmp/build.log 2>&1; echo "EXIT:$?" >> /tmp/build.log
```

Read the log for `✓ built` and `EXIT:0`. The wrapping shell can report exit 0
while the command inside failed, so read the log rather than trusting the
notification. If the build dies on a missing Rolldown binding or a
non-executable `.bin/vite`, that is the recorded `node_modules` corruption:
`rm -rf node_modules && npm install`.

## Phase 2 — write it down

Policy from `project-memory/README.md`: **append, never delete**; bump the
`Last updated` line in every file you edit; dates `YYYY-MM-DD`; mark superseded
items with a note instead of removing them.

| What happened | File | Shape |
|---|---|---|
| Anything notable | `changelog.md` | Dated session heading with `### Added` / `### Changed` / `### Fixed` / `### Deployed` / `### Not done (manual follow-up)` |
| Feature shipped or changed | `features.md` | Status `planned` · `in-progress` · `done` · `deferred` |
| **A bug was fixed** | `error-history.md` | `\| Date \| What the user saw \| Why it happened \| What we changed \| How to avoid next time \|` |
| A design or architecture call | `decisions.md` | `\| Date \| Decision \| Why \| Alternatives \|` |
| Stack, schema, folders, env vars, migrations | `architecture.md` | Keep **SQL migrations (status)** current |
| New or re-run manual test | `test-cases.md` | TC row; result `pass` · `fail` · `blocked` · `not-run` |

Two of these carry most of the value.

**`error-history.md` is the highest-leverage file in the repo.** Its last column
is what stops a repeat, so write a prevention that would have caught *this* bug
before it shipped — a check someone can actually perform, not "be careful".
Compare against the existing rows: they are specific enough to act on.

**The changelog is for what a diff cannot show** — why the change was made, what
was tried and rejected, what is still open, and any migration the user must run
by hand in Supabase. Record the Vercel deployment id (`dpl_…`) and the live
alias once Phase 4 finishes; the file has done this consistently and it is how
a past deploy gets traced. Be honest in "Not done" — that section is what makes
the next session trustworthy.

## Phase 3 — commit

**Stage specific paths. Never `git add -A` or `git add .`** — the memory records
`.env` being staged exactly that way before `.gitignore` took effect, and a
stale untracked `dist/` sits in this repo. TC-55 is the standing check:
`git log --all -- .env` must stay empty.

```bash
git add <the files you actually changed>
git diff --cached --stat
```

Commit in the background — commits here have exceeded a 6-minute foreground
timeout:

```bash
git commit -F /tmp/commit-msg.txt > /tmp/commit.log 2>&1; echo "EXIT:$?" >> /tmp/commit.log
```

**A timed-out commit usually leaves a lock.** Check before retrying:

```bash
git log --oneline -1     # did it land?
ls .git/index.lock       # stale lock?
pgrep -fl "git commit"   # still working?
```

Lock present and no process running means the lock is dead — remove it and
retry. A live process means wait.

Explain the change and the reasoning in the message, and record trade-offs a
reader would otherwise rediscover. End with:

```
Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
```

## Phase 4 — deploy to production

```bash
npx --yes vercel --prod --yes > /tmp/deploy.log 2>&1; echo "EXIT:$?" >> /tmp/deploy.log
```

Background it. The folder is linked to the `savings-tracker` project via
`.vercel/project.json`. Success looks like:

```
Production   https://savings-tracker-<hash>-....vercel.app
▲ Aliased    https://savings-tracker-azure.vercel.app
"status": "ok"
```

**`▲ Aliased` is the line that proves it went live.** The CLI prints a generic
"Promote to production" hint in its `next` block even on a successful
production deploy — that hint is not evidence of a preview.

`"message": "Not authorized"` means the CLI is logged out (`npx vercel whoami`
confirms). You cannot fix that — it needs the user's browser. Tell them to run
`npx vercel login` and stop. The commit still stands; only the deploy is
blocked.

Then walk the **Deployment (Vercel)** rows in `test-cases.md`: production page
load, SPA routing on refresh (`vercel.json` rewrite), Supabase connectivity from
the deployed origin. Update the Result and Date columns with what you actually
observed.

## Phase 5 — push to GitHub

Remote `https://github.com/nitinsinghbalyan/Savings-Tracker-WebApp.git`, branch
`master`.

```bash
GIT_TERMINAL_PROMPT=0 git push origin master > /tmp/push.log 2>&1
```

`GIT_TERMINAL_PROMPT=0` matters: without it a missing credential blocks forever
on a username prompt nobody can answer non-interactively. With it you get an
immediate `could not read Username` — the signal to hand it back to the user.

This remote has held an unrelated project on `master` with no common ancestor,
which makes ordinary pushes and pulls fail confusingly. Never reach for
`--force` to clear a rejection. Diagnose first; if force is genuinely right, use
`--force-with-lease` pinned to the commit you expect the remote to be on, and
get explicit confirmation that discarding those commits is intended.

On Windows, PowerShell chains with `;` not `&&`, and `dev.cmd` / `build.cmd`
exist because the execution policy blocks `npm.ps1`.

## Closing out

Report only what is true:

- **Verified** — which screens you saw run, which you could not reach, which
  devices from the memory's checklist you exercised
- **Memory updated** — which files, and the new `error-history.md` prevention
- **Committed** — short SHA and what it contains
- **Deployed** — the live alias and `dpl_…` id, or why it did not go out
- **Pushed** — landed, or what blocks it
- **Outstanding** — Supabase migrations the user must run by hand, unverified
  screens, follow-ups

Never report a phase as done when it was skipped or blocked. If the deploy
failed, the honest line is that production still serves the previous build.
