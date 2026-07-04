import { format } from 'date-fns'
import { categoryDedupeKey, dedupeCategoriesForDisplay } from './categories'
import { getMonthRange } from './transactions'

function resolveCategoryBucket(tx, categoryMap) {
  const embedded = tx.category
  if (embedded?.name) {
    return {
      categoryId: categoryDedupeKey(embedded),
      name: embedded.name,
      color: embedded.color ?? 'indigo',
      isSavings: Boolean(embedded.is_savings),
    }
  }

  const fromMap = tx.category_id ? categoryMap.get(tx.category_id) : null
  if (fromMap) {
    return {
      categoryId: categoryDedupeKey(fromMap),
      name: fromMap.name,
      color: fromMap.color ?? 'indigo',
      isSavings: Boolean(fromMap.is_savings),
    }
  }

  return {
    categoryId: 'uncategorized',
    name: 'Uncategorized',
    color: 'indigo',
    isSavings: false,
  }
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

export function buildMonthlySummary(transactions, categories, { currency } = {}) {
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
        categorySavings += amount
        addToBucket(bySavingsCategory, bucket, amount)
      } else {
        expenses += amount
        addToBucket(byExpenseCategory, bucket, amount)
      }
    }
  }

  const sortByTotal = (a, b) => b.total - a.total

  const expenseItems = [...byExpenseCategory.values()]
    .map((item) => ({ ...item, budget: expenseBudgets.get(item.categoryId) ?? 0 }))
    .sort(sortByTotal)

  let expenseBudgetTotal = 0
  for (const budget of expenseBudgets.values()) expenseBudgetTotal += budget

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

function sumBalancesForCurrency(accounts, currency) {
  return accounts
    .filter((a) => !a.is_archived && (a.currency ?? 'INR') === currency)
    .reduce((sum, a) => sum + (Number(a.balance ?? a.opening_balance ?? 0) || 0), 0)
}

export function groupSummariesByCurrency(
  transactions,
  categories,
  accounts = [],
  { goals = [], year, month, monthStartDay = 1, preferredCurrency } = {},
) {
  const { start, end } =
    year && month ? getMonthRange(year, month, monthStartDay) : { start: null, end: null }

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
    const summary = buildMonthlySummary(transactions, categories, { currency })
    const balances = sumBalancesForCurrency(accounts, currency)
    const goalContributions =
      start && end
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
