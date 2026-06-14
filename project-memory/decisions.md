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

## Template

```markdown
| YYYY-MM-DD | What we decided | Why | What we didn't pick |
```
