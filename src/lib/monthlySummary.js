import { format } from 'date-fns'
import { categoryDedupeKey, dedupeCategoriesForDisplay } from './categories'
import { getMonthRange } from './transactions'
import { resolveTransactionCategory } from './transactionCategory'
import { buildGoalLinkedTransactionIds, countsAsCategorySavings } from './transactionGoal'

function resolveCategoryBucket(tx) {
  const resolved = resolveTransactionCategory(tx)
  if (resolved?.name) {
    return {
      categoryId: categoryDedupeKey({
        kind: resolved.kind ?? (tx.type === 'income' ? 'income' : 'expense'),
        name: resolved.name,
        parent_id: null,
      }),
      name: resolved.name,
      color: resolved.color ?? 'indigo',
      isSavings: Boolean(resolved.is_savings),
    }
  }

  return {
    categoryId: 'uncategorized',
    name: 'Uncategorized',
    color: 'indigo',
    isSavings: false,
  }
}

/** Dedupe key for expense heatmap tiles (excludes savings categories). */
export function getTransactionExpenseCategoryKey(tx) {
  if (tx.type !== 'expense') return null
  const bucket = resolveCategoryBucket(tx)
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

  const expenseBudgets = new Map()
  for (const cat of dedupeCategoriesForDisplay(categories)) {
    if (cat.kind !== 'expense' || cat.is_savings) continue
    const budget = Math.max(0, Number(cat.monthly_budget) || 0)
    if (budget > 0) expenseBudgets.set(categoryDedupeKey(cat), budget)
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
      addToBucket(byIncomeCategory, resolveCategoryBucket(tx), amount)
    } else if (tx.type === 'expense') {
      const bucket = resolveCategoryBucket(tx)
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

    const bucket = resolveCategoryBucket(tx)
    const amount = Number(tx.amount) || 0
    const signed = tx.type === 'income' ? amount : -amount
    net += signed

    rows.push({
      id: tx.id,
      name: tx.note?.trim() || bucket.name,
      color: bucket.color,
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
