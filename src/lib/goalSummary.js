import { format, parseISO, startOfMonth, subMonths } from 'date-fns'
import { percentComplete, savedAmount } from './contributions'

/**
 * Aggregate across goals for the Goals header (artboard 1c):
 * "15% · ₹1,20,000 of ₹7,75,000 · 3 funded · 3 not started".
 *
 * Grouped per currency, like every other total in this app — blending INR and
 * USD into one percentage would be meaningless (decisions.md 2026-06-14).
 */
export function buildGoalsOverview(goals = [], currency = 'INR') {
  let saved = 0
  let target = 0
  let funded = 0
  let notStarted = 0
  let completed = 0

  for (const goal of goals) {
    if ((goal.currency ?? 'INR') !== currency) continue
    const goalSaved = savedAmount(goal)
    const goalTarget = Number(goal.target_amount) || 0

    saved += goalSaved
    target += goalTarget
    if (goalSaved > 0) funded += 1
    else notStarted += 1
    if (goalTarget > 0 && goalSaved >= goalTarget) completed += 1
  }

  return {
    saved,
    target,
    funded,
    notStarted,
    completed,
    percent: target > 0 ? Math.min(100, (saved / target) * 100) : 0,
    hasGoals: funded + notStarted > 0,
  }
}

/**
 * Contributions bucketed by calendar month for the goal-detail chart
 * (artboard 1d "Funding by month"). Reads the contributions already loaded
 * with the goal — no fetch.
 */
export function buildFundingByMonth(goal, { months = 6, now = new Date() } = {}) {
  const buckets = []
  const index = new Map()

  for (let i = months - 1; i >= 0; i -= 1) {
    const d = startOfMonth(subMonths(now, i))
    const key = format(d, 'yyyy-MM')
    const bucket = { key, label: format(d, 'MMM'), total: 0 }
    buckets.push(bucket)
    index.set(key, bucket)
  }

  for (const c of goal?.contributions ?? []) {
    if (!c.created_at) continue
    let key
    try {
      key = format(parseISO(c.created_at), 'yyyy-MM')
    } catch {
      continue
    }
    const bucket = index.get(key)
    if (bucket) bucket.total += Number(c.amount) || 0
  }

  const withMoney = buckets.filter((b) => b.total > 0)
  const average =
    withMoney.length > 0
      ? withMoney.reduce((s, b) => s + b.total, 0) / withMoney.length
      : 0

  return {
    buckets,
    average,
    max: Math.max(...buckets.map((b) => b.total), 0),
    hasAny: withMoney.length > 0,
  }
}

/** Percent funded for one goal, clamped — thin wrapper so callers stay tidy. */
export function goalPercent(goal) {
  return Math.min(100, Math.max(0, percentComplete(goal)))
}

/** Saved ≥ target (and a real target). Derived — there is no status column. */
export function isGoalComplete(goal) {
  const target = Number(goal?.target_amount) || 0
  return target > 0 && savedAmount(goal) >= target
}

/**
 * When the goal crossed its target: the date of the contribution that took the
 * running total to ≥ target, walking oldest → newest. Null if not complete.
 */
export function goalCompletedAt(goal) {
  const target = Number(goal?.target_amount) || 0
  if (target <= 0) return null
  const ordered = [...(goal?.contributions ?? [])]
    .filter((c) => c.created_at)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  let running = 0
  for (const c of ordered) {
    running += Number(c.amount) || 0
    if (running >= target) return c.created_at
  }
  return null
}

/** One overview per currency present, in first-seen order (never blended). */
export function buildGoalsOverviewByCurrency(goals = []) {
  const currencies = []
  for (const goal of goals) {
    const code = goal.currency ?? 'INR'
    if (!currencies.includes(code)) currencies.push(code)
  }
  return currencies.map((currency) => ({ currency, ...buildGoalsOverview(goals, currency) }))
}

/** Sum of target_amount per currency: [{ currency, total }]. */
export function targetTotalsByCurrency(goals = []) {
  const totals = new Map()
  for (const goal of goals) {
    const code = goal.currency ?? 'INR'
    totals.set(code, (totals.get(code) ?? 0) + (Number(goal.target_amount) || 0))
  }
  return [...totals.entries()].map(([currency, total]) => ({ currency, total }))
}

export const GOAL_SORTS = [
  { value: 'deadline', label: 'Deadline' },
  { value: 'progress', label: 'Progress' },
  { value: 'priority', label: 'Priority' },
  { value: 'name', label: 'Name' },
]

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 }

/** Stable sort; ties fall back to deadline, then name. */
export function sortGoals(goals = [], sortBy = 'deadline') {
  const byDeadline = (a, b) => String(a.end_date ?? '').localeCompare(String(b.end_date ?? ''))
  const byName = (a, b) => String(a.name ?? '').localeCompare(String(b.name ?? ''))
  const compare = {
    deadline: (a, b) => byDeadline(a, b) || byName(a, b),
    progress: (a, b) => percentComplete(b) - percentComplete(a) || byDeadline(a, b),
    priority: (a, b) =>
      (PRIORITY_RANK[a.priority] ?? 1) - (PRIORITY_RANK[b.priority] ?? 1) || byDeadline(a, b),
    name: (a, b) => byName(a, b) || byDeadline(a, b),
  }[sortBy] ?? ((a, b) => byDeadline(a, b) || byName(a, b))
  return [...goals].sort(compare)
}
