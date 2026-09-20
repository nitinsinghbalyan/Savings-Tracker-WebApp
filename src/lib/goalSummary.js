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

  for (const goal of goals) {
    if ((goal.currency ?? 'INR') !== currency) continue
    const goalSaved = savedAmount(goal)
    const goalTarget = Number(goal.target_amount) || 0

    saved += goalSaved
    target += goalTarget
    if (goalSaved > 0) funded += 1
    else notStarted += 1
  }

  return {
    saved,
    target,
    funded,
    notStarted,
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
