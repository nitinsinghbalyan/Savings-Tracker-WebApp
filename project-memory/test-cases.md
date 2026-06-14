# Test Cases

**Last updated:** 2026-06-14 (evening)

## Setup

| Step | Action |
|------|--------|
| 1 | Copy `.env` placeholders with real Supabase URL and anon key |
| 2 | Run goals/contributions SQL in Supabase SQL editor |
| 3 | Run `supabase/add_currency_color.sql` for currency + color columns |
| 4 | `npm install` then `npm.cmd run dev` (or `.\dev.cmd` on Windows) |

---

## Infrastructure

| ID | Test | Steps | Expected | Result | Date |
|----|------|-------|----------|--------|------|
| TC-01 | Dev server starts | Run `npm run dev` | Vite ready on localhost:5173 | pass | 2026-06-14 |
| TC-02 | Tailwind loads | Inspect page / use utility class | Tailwind styles apply | not-run | |
| TC-03 | Supabase client init | Import `supabase` with valid `.env` | No throw on import | not-run | |

---

## Device ID (planned)

_Implemented in `src/lib/device.js`; tests below still need manual verification._

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

## Regression log

_Add a row here after each release or bug fix._

| Date | Area | What was verified |
|------|------|-------------------|
| 2026-06-14 | Scaffold | `npm run dev` succeeds |
| 2026-06-14 | Data layer + lint | `npm run lint` passes after goals/contributions hooks |
