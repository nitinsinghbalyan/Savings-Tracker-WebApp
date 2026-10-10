import { format } from 'date-fns'
import { categoryDedupeKey, dedupeCategoriesForDisplay } from './categories'
import { getMonthRange } from './transactions'
import { resolveTransactionCategory } from './transactionCategory'
import { buildGoalLinkedTransactionIds, countsAsCategorySavings } from './transactionGoal'

/**
 * Tiles are keyed by kind + name with `parent_id` forced to root, so a
 * sub-category merges into its name-mate rather than splitting out. That
 * flattening is deliberate and long-standing — but it must be applied to
 * BUDGETS as well, or a budget set on a child never finds its tile. See
 * `flattenedBudgetKey` below; the two must stay in step.
 *
 * `parentId` / `parentName` ride along as metadata (never in the key) so a
 * future rollup view can group without changing today's grouping. They are
 * null for snapshot-only transactions: `resolveTransactionCategory` prefers
 * the frozen category_name/color, which carries no parent.
 */
function resolveCategoryBucket(tx, categoryMap) {
  const resolved = resolveTransactionCategory(tx)
  if (resolved?.name) {
    const live = resolved.id ? categoryMap?.get(resolved.id) : null
    const parent = live?.parent_id ? categoryMap?.get(live.parent_id) : null
    return {
      categoryId: flattenedCategoryKey(
        resolved.kind ?? (tx.type === 'income' ? 'income' : 'expense'),
        resolved.name,
      ),
      name: resolved.name,
      color: resolved.color ?? 'indigo',
      // Live row first (current icon), then the join; null → name default at render.
      icon: live?.icon ?? resolved.icon ?? null,
      isSavings: Boolean(resolved.is_savings),
      parentId: live?.parent_id ?? null,
      parentName: parent?.name ?? null,
    }
  }

  return {
    categoryId: 'uncategorized',
    name: 'Uncategorized',
    color: 'indigo',
    icon: 'tag',
    isSavings: false,
    parentId: null,
    parentName: null,
  }
}

/** The single key shape tiles and budgets must both use. */
function flattenedCategoryKey(kind, name) {
  return categoryDedupeKey({ kind, name, parent_id: null })
}

/** Dedupe key for expense heatmap tiles (excludes savings categories). */
export function getTransactionExpenseCategoryKey(tx) {
  if (tx.type !== 'expense') return null
  // No category map here — the key never depends on parent metadata.
  const bucket = resolveCategoryBucket(tx, null)
  if (bucket.isSavings) return null
  return bucket.categoryId
}

export function filterTransactionsForHeatmapCategory(transactions, categoryKey, currency) {
  return transactions
    .filter((tx) => {
      if ((tx.account?.currency ?? 'INR') !== currency) return false
      return getTransactionExpenseCategoryKey(tx) === categoryKey
    })
    .sort((a, b) => {
      const dateCmp = b.transaction_date.localeCompare(a.transaction_date)
      if (dateCmp !== 0) return dateCmp
      return new Date(b.created_at ?? 0) - new Date(a.created_at ?? 0)
    })
}

function addToBucket(map, bucket, amount) {
  const existing = map.get(bucket.categoryId) ?? {
    categoryId: bucket.categoryId,
    name: bucket.name,
    color: bucket.color,
    icon: bucket.icon,
    total: 0,
  }
  existing.total += amount
  map.set(bucket.categoryId, existing)
}

export function buildMonthlySummary(
  transactions,
  categories,
  { currency, includeBudgets = true, goals = [] } = {},
) {
  const categoryMap = new Map(categories.map((c) => [c.id, c]))

  // Keyed with the SAME flattening the tiles use. Previously this used the
  // category's real parent_id, so a budget on a sub-category silently never
  // attached to its tile while still counting toward expenseBudgetTotal.
  // Where two categories flatten to one tile their transactions merge, so
  // summing their budgets is the consistent choice.
  const expenseBudgets = new Map()
  for (const cat of dedupeCategoriesForDisplay(categories)) {
    if (cat.kind !== 'expense' || cat.is_savings) continue
    const budget = Math.max(0, Number(cat.monthly_budget) || 0)
    if (budget <= 0) continue
    const key = flattenedCategoryKey(cat.kind, cat.name)
    expenseBudgets.set(key, (expenseBudgets.get(key) ?? 0) + budget)
  }

  let filtered = transactions

  if (currency) {
    filtered = transactions.filter((tx) => tx.account?.currency === currency)
  }

  const goalLinkedTxIds = buildGoalLinkedTransactionIds(filtered, goals)

  let income = 0
  let expenses = 0
  let categorySavings = 0
  const byExpenseCategory = new Map()
  const byIncomeCategory = new Map()
  const bySavingsCategory = new Map()

  for (const tx of filtered) {
    const amount = Number(tx.amount) || 0
    if (tx.type === 'income') {
      income += amount
      addToBucket(byIncomeCategory, resolveCategoryBucket(tx, categoryMap), amount)
    } else if (tx.type === 'expense') {
      const bucket = resolveCategoryBucket(tx, categoryMap)
      if (bucket.isSavings) {
        if (countsAsCategorySavings(tx, goalLinkedTxIds)) {
          categorySavings += amount
          addToBucket(bySavingsCategory, bucket, amount)
        }
      } else {
        expenses += amount
        addToBucket(byExpenseCategory, bucket, amount)
      }
    }
  }

  const sortByTotal = (a, b) => b.total - a.total

  const expenseItems = [...byExpenseCategory.values()]
    .map((item) => ({
      ...item,
      budget: includeBudgets ? (expenseBudgets.get(item.categoryId) ?? 0) : 0,
    }))
    .sort(sortByTotal)

  let expenseBudgetTotal = 0
  if (includeBudgets) {
    for (const budget of expenseBudgets.values()) expenseBudgetTotal += budget
  }

  return {
    income,
    expenses,
    categorySavings,
    expenseBudgetTotal,
    byExpenseCategory: expenseItems,
    byIncomeCategory: [...byIncomeCategory.values()].sort(sortByTotal),
    bySavingsCategory: [...bySavingsCategory.values()].sort(sortByTotal),
  }
}

function sumGoalContributionsInRange(goals, currency, startDate, endDate) {
  let total = 0
  const byGoal = []

  for (const goal of goals) {
    if ((goal.currency ?? 'INR') !== currency) continue

    let goalTotal = 0
    for (const contribution of goal.contributions ?? []) {
      if (!contribution.created_at) continue
      const dateKey = format(new Date(contribution.created_at), 'yyyy-MM-dd')
      if (dateKey < startDate || dateKey > endDate) continue
      const amount = Number(contribution.amount) || 0
      goalTotal += amount
      total += amount
    }

    if (goalTotal > 0) {
      byGoal.push({ goalId: goal.id, name: goal.name, total: goalTotal })
    }
  }

  byGoal.sort((a, b) => b.total - a.total)
  return { total, byGoal }
}

function sumAllGoalContributions(goals, currency) {
  let total = 0
  const byGoal = []

  for (const goal of goals) {
    if ((goal.currency ?? 'INR') !== currency) continue

    let goalTotal = 0
    for (const contribution of goal.contributions ?? []) {
      goalTotal += Number(contribution.amount) || 0
    }

    if (goalTotal > 0) {
      byGoal.push({ goalId: goal.id, name: goal.name, total: goalTotal })
      total += goalTotal
    }
  }

  byGoal.sort((a, b) => b.total - a.total)
  return { total, byGoal }
}

function sumBalancesForCurrency(accounts, currency) {
  return accounts
    .filter((a) => !a.is_archived && (a.currency ?? 'INR') === currency)
    .reduce((sum, a) => sum + (Number(a.balance ?? a.opening_balance ?? 0) || 0), 0)
}

export function groupSummariesByCurrency(
  transactions,
  categories,
  accounts = [],
  { goals = [], year, month, monthStartDay = 1, preferredCurrency, allTime = false } = {},
) {
  const { start, end } =
    !allTime && year && month ? getMonthRange(year, month, monthStartDay) : { start: null, end: null }

  const currencies = new Set()
  for (const tx of transactions) {
    if (tx.type === 'transfer') continue
    if (tx.account?.currency) currencies.add(tx.account.currency)
  }
  for (const account of accounts) {
    if (!account.is_archived) currencies.add(account.currency ?? 'INR')
  }
  for (const goal of goals) {
    currencies.add(goal.currency ?? 'INR')
  }

  const currencyList = preferredCurrency
    ? [preferredCurrency]
    : currencies.size > 0
      ? [...currencies]
      : ['INR']

  return currencyList.map((currency) => {
    const summary = buildMonthlySummary(transactions, categories, {
      currency,
      includeBudgets: !allTime,
      goals,
    })
    const balances = sumBalancesForCurrency(accounts, currency)
    const goalContributions = allTime
      ? sumAllGoalContributions(goals, currency)
      : start && end
        ? sumGoalContributionsInRange(goals, currency, start, end)
        : { total: 0, byGoal: [] }
    const goalSavings = goalContributions.total
    const savings = summary.categorySavings + goalSavings
    const savingsRate =
      summary.income > 0 ? Math.min(100, Math.max(0, (savings / summary.income) * 100)) : 0

    return {
      currency,
      ...summary,
      goalSavings,
      byGoalSavings: goalContributions.byGoal,
      savings,
      balances,
      net: balances,
      // Income − spent for the period. Savings are not spending, so they are
      // not subtracted; savingsRate says how much of income was put away.
      cashFlow: summary.income - summary.expenses,
      savingsRate,
    }
  })
}

/**
 * Today's entries for the Overview screen (artboard 1a "Today").
 *
 * Reads only the transactions already in the context cache for the visible
 * month — it must never trigger a fetch of its own. Transfers are excluded:
 * they move money between the user's own accounts and would read as spending.
 */
export function buildTodayRows(transactions = [], currency = 'INR', todayKey) {
  const rows = []
  let net = 0

  for (const tx of transactions) {
    if (tx.type === 'transfer') continue
    if ((tx.account?.currency ?? 'INR') !== currency) continue
    if (tx.transaction_date?.slice(0, 10) !== todayKey) continue

    const bucket = resolveCategoryBucket(tx, null)
    const amount = Number(tx.amount) || 0
    const signed = tx.type === 'income' ? amount : -amount
    net += signed

    rows.push({
      id: tx.id,
      name: tx.note?.trim() || bucket.name,
      color: bucket.color,
      icon: bucket.icon,
      categoryName: bucket.name,
      signed,
      isIncome: tx.type === 'income',
      createdAt: tx.created_at ?? null,
    })
  }

  rows.sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))
  return { rows, net }
}

/**
 * Month-over-month change as a percentage, or null when there is no usable
 * baseline. Returning null (rather than 0 or Infinity) lets the caller hide
 * the badge instead of showing a meaningless "▲ 0%" or "▲ ∞".
 */
export function percentDelta(current, previous) {
  const prev = Number(previous) || 0
  const curr = Number(current) || 0
  if (prev <= 0) return null
  if (curr === prev) return 0
  return ((curr - prev) / prev) * 100
}

/**
 * Per-day expense totals for the Ledger's "Spent by day" chart (artboard 1e).
 * Operates on the month already in the cache — no fetch, no widening.
 */
export function buildSpendByDay(transactions = [], currency = 'INR', daysInMonth = 31) {
  const byDay = new Map()
  let total = 0

  for (const tx of transactions) {
    if (tx.type !== 'expense') continue
    if ((tx.account?.currency ?? 'INR') !== currency) continue
    const day = Number(tx.transaction_date?.slice(8, 10))
    if (!day) continue
    const amount = Number(tx.amount) || 0
    byDay.set(day, (byDay.get(day) ?? 0) + amount)
    total += amount
  }

  const max = Math.max(...byDay.values(), 0)
  const bars = []
  for (let day = 1; day <= daysInMonth; day += 1) {
    const amount = byDay.get(day) ?? 0
    bars.push({ day, amount, ratio: max > 0 ? amount / max : 0 })
  }

  return { bars, total, max }
}

/** Signed net for one day's rows, for the Ledger day headers. */
export function dayNet(items = [], currency = 'INR') {
  let net = 0
  for (const tx of items) {
    if (tx.type === 'transfer') continue
    if ((tx.account?.currency ?? 'INR') !== currency) continue
    const amount = Number(tx.amount) || 0
    net += tx.type === 'income' ? amount : -amount
  }
  return net
}

/**
 * Day × category matrix for the real heatmap (rows = categories, columns =
 * days, cell darkness = spend).
 *
 * `ratio` is against the GLOBAL max cell, not each row's own max, so one
 * sequential ramp reads consistently across rows — a dark cell means the same
 * amount wherever it appears. Per-row normalisation would make a small
 * category's busiest day look like the biggest spend on the chart.
 *
 * Reads only the transactions already passed in. No fetch, nothing widened.
 */
export function buildCategoryDayMatrix(
  transactions = [],
  categories = [],
  { currency = 'INR', daysInMonth = 31, periodDays = null } = {},
) {
  // Columns are the period's real dates. Keying by day-of-month (the old
  // behaviour) broke whenever month_start_day ≠ 1: a 25 Oct → 24 Nov period
  // folded 1–24 Nov onto 1–24 Oct's columns.
  const columns =
    periodDays ??
    Array.from({ length: daysInMonth }, (_, i) => ({
      key: null,
      day: i + 1,
      label: String(i + 1),
    }))
  const columnByKey = new Map()
  columns.forEach((col, i) => {
    if (col.key) columnByKey.set(col.key, i)
  })

  const categoryMap = new Map(categories.map((c) => [c.id, c]))
  const rows = new Map()
  let max = 0
  let total = 0

  for (const tx of transactions) {
    if (tx.type !== 'expense') continue
    if ((tx.account?.currency ?? 'INR') !== currency) continue
    const dateKey = tx.transaction_date?.slice(0, 10)
    let day
    if (periodDays) {
      const index = columnByKey.get(dateKey)
      if (index == null) continue
      day = index + 1
    } else {
      day = Number(tx.transaction_date?.slice(8, 10))
      if (!day || day < 1 || day > daysInMonth) continue
    }

    const bucket = resolveCategoryBucket(tx, categoryMap)
    if (bucket.isSavings) continue

    let row = rows.get(bucket.categoryId)
    if (!row) {
      row = {
        categoryId: bucket.categoryId,
        name: bucket.name,
        color: bucket.color,
        icon: bucket.icon,
        parentName: bucket.parentName,
        byDay: new Map(),
        total: 0,
      }
      rows.set(bucket.categoryId, row)
    }

    const amount = Number(tx.amount) || 0
    const next = (row.byDay.get(day) ?? 0) + amount
    row.byDay.set(day, next)
    row.total += amount
    total += amount
    if (next > max) max = next
  }

  const out = [...rows.values()]
    .sort((a, b) => b.total - a.total)
    .map((row) => ({
      categoryId: row.categoryId,
      name: row.name,
      color: row.color,
      icon: row.icon,
      parentName: row.parentName,
      total: row.total,
      share: total > 0 ? (row.total / total) * 100 : 0,
      cells: columns.map((col, i) => {
        const amount = row.byDay.get(i + 1) ?? 0
        return {
          index: i + 1,
          day: col.day,
          key: col.key ?? String(i + 1),
          label: col.label,
          amount,
          ratio: max > 0 ? amount / max : 0,
        }
      }),
    }))

  return { rows: out, max, total, daysInMonth: columns.length, columns }
}

/**
 * Every date in the visible period, honouring month_start_day — the same range
 * `getMonthRange` fetches, so the day strip and heatmap columns line up with
 * the data. `day` is the calendar day number; `label` is "25 Oct".
 */
export function buildPeriodDays(year, month, monthStartDay = 1) {
  const { start, end } = getMonthRange(year, month, monthStartDay)
  const [sy, sm, sd] = start.split('-').map(Number)
  const cursor = new Date(sy, sm - 1, sd)
  const days = []
  // Hard cap: a period is at most 31 days; guards against a malformed range.
  while (days.length < 31) {
    const key = format(cursor, 'yyyy-MM-dd')
    days.push({ key, day: cursor.getDate(), label: format(cursor, 'd MMM') })
    if (key >= end) break
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

/**
 * Per-category daily series for the sparklines — the same buckets as the
 * matrix, reshaped to bare values so the SVG path code stays trivial.
 */
export function buildCategorySeries(transactions, categories, options) {
  const { rows, daysInMonth } = buildCategoryDayMatrix(transactions, categories, options)
  return rows.map((row) => ({
    categoryId: row.categoryId,
    name: row.name,
    color: row.color,
    icon: row.icon,
    total: row.total,
    share: row.share,
    values: row.cells.map((c) => c.amount),
    max: Math.max(...row.cells.map((c) => c.amount), 0),
    daysInMonth,
  }))
}

/**
 * Join this period's categories against the previous period's.
 *
 * Categories present in only one period must survive: a category that just
 * appeared (`isNew`) and one that stopped (`isGone`, total 0) are exactly the
 * changes worth seeing, and an inner join would hide both.
 */
export function joinCategoryComparison(current = [], previous = []) {
  const prevById = new Map(previous.map((p) => [p.categoryId, p]))
  const seen = new Set()

  const joined = current.map((item) => {
    seen.add(item.categoryId)
    const prev = prevById.get(item.categoryId)
    const prevTotal = prev ? prev.total : 0
    return {
      ...item,
      prevTotal,
      delta: percentDelta(item.total, prevTotal),
      isNew: !prev,
      isGone: false,
    }
  })

  for (const prev of previous) {
    if (seen.has(prev.categoryId)) continue
    joined.push({
      ...prev,
      total: 0,
      share: 0,
      prevTotal: prev.total,
      delta: null,
      isNew: false,
      isGone: true,
    })
  }

  return joined
}

/**
 * The categories whose spending moved most against the comparison period, by
 * absolute amount (a ₹40 → ₹120 jump is +200% but rarely the story). Built on
 * `joinCategoryComparison`, so a category that appeared or vanished counts.
 * Reads summaries already computed — no fetch.
 */
export function buildTopMovers(current = [], previous = [], limit = 3) {
  return joinCategoryComparison(current, previous)
    .map((item) => ({ ...item, change: (item.total ?? 0) - (item.prevTotal ?? 0) }))
    .filter((item) => item.change !== 0)
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, limit)
}
