import { lazy, memo, Suspense, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useAppData } from '../context/AppDataContext'
import { useAccounts } from '../hooks/useAccounts'
import { useCategories } from '../hooks/useCategories'
import { useTransactions } from '../hooks/useTransactions'
import { useGoals } from '../hooks/useGoals'
import { groupSummariesByCurrency } from '../lib/monthlySummary'
import { formatMoney } from '../lib/format'
import MonthPicker from './MonthPicker'
import AccountCard from './AccountCard'

const CategoryBreakdownChart = lazy(() => import('./CategoryBreakdownChart'))

const SUMMARY_VIEWS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'overall', label: 'Overall' },
]

function SummarySection({ profile, isTabActive = true }) {
  const { user, authReady } = useAuth()
  const { bootstrapping } = useAppData()
  const now = new Date()
  // Monthly first: avoids unbounded all-time fetch on the default landing tab.
  const [view, setView] = useState('monthly')
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const isMonthly = view === 'monthly'

  // Artboard 1e puts a per-day spend sparkline inside the balance card.
  const spendByDay = useMemo(() => {
    const byCurrency = new Map()
    for (const tx of transactions ?? []) {
      if (tx.type !== 'expense') continue
      const day = tx.transaction_date?.slice(0, 10)
      if (!day) continue
      const currency = tx.account?.currency ?? 'INR'
      if (!byCurrency.has(currency)) byCurrency.set(currency, new Map())
      const days = byCurrency.get(currency)
      days.set(day, (days.get(day) ?? 0) + (Number(tx.amount) || 0))
    }
    return byCurrency
  }, [transactions])

  const buildDayBars = (currency) => {
    const days = spendByDay.get(currency) ?? new Map()
    const dayCount = new Date(year, month, 0).getDate()
    const today = new Date()
    const isCurrentMonth =
      today.getFullYear() === year && today.getMonth() + 1 === month
    const bars = []
    for (let day = 1; day <= dayCount; day += 1) {
      const key = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      bars.push({ day, amount: days.get(key) ?? 0 })
    }
    const max = bars.reduce((peak, bar) => Math.max(peak, bar.amount), 0)
    return bars.map((bar) => ({
      ...bar,
      height: max > 0 && bar.amount > 0 ? `${Math.max(6, (bar.amount / max) * 100)}%` : '2px',
      isToday: isCurrentMonth && bar.day === today.getDate(),
    }))
  }
  const dataReady = Boolean(user) && authReady && !bootstrapping && Boolean(profile)
  const monthStartDay = profile?.month_start_day ?? 1

  const { accounts } = useAccounts({ enabled: dataReady })
  const { categories } = useCategories({ enabled: dataReady })
  const { goals } = useGoals({ enabled: dataReady })
  const { transactions, initialLoading, error } = useTransactions({
    // Pause fetches while the tab is hidden; cached rows still render from context.
    enabled: dataReady && isTabActive,
    allTime: !isMonthly,
    year: isMonthly ? year : undefined,
    month: isMonthly ? month : undefined,
    monthStartDay,
  })

  const activeAccounts = useMemo(
    () => accounts.filter((a) => !a.is_archived),
    [accounts],
  )

  const preferredCurrency = profile?.default_currency ?? 'INR'

  const summaryAccounts = useMemo(
    () => activeAccounts.filter((a) => (a.currency ?? 'INR') === preferredCurrency),
    [activeAccounts, preferredCurrency],
  )

  const summaries = useMemo(
    () =>
      groupSummariesByCurrency(transactions, categories, summaryAccounts, {
        goals,
        year: isMonthly ? year : undefined,
        month: isMonthly ? month : undefined,
        monthStartDay,
        preferredCurrency,
        allTime: !isMonthly,
      }),
    [
      transactions,
      categories,
      summaryAccounts,
      goals,
      isMonthly,
      year,
      month,
      monthStartDay,
      preferredCurrency,
    ],
  )

  const monthKey = `${year}-${String(month).padStart(2, '0')}`

  const renderChart = (summary) => {
    if (!summary.byExpenseCategory.length || summary.expenses <= 0) return null

    return (
      <section className="card min-w-0 overflow-hidden p-4 lg:p-6">
        <Suspense
          fallback={<div className="h-64 animate-pulse rounded-xl bg-slate-100" aria-hidden="true" />}
        >
          <CategoryBreakdownChart
            items={summary.byExpenseCategory}
            total={summary.expenses}
            currency={summary.currency}
            budgetTotal={isMonthly ? summary.expenseBudgetTotal : 0}
            transactions={transactions}
            large
          />
        </Suspense>
      </section>
    )
  }

  const isEmpty = summaries.every(
    (s) =>
      s.income === 0 &&
      s.expenses === 0 &&
      s.categorySavings === 0 &&
      s.goalSavings === 0 &&
      s.balances === 0,
  )

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-paper-rail p-[3px] sm:w-56">
          {SUMMARY_VIEWS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setView(option.value)}
              className={`rounded-md px-3 py-[7px] text-xs transition ${
                view === option.value
                  ? 'bg-paper-card font-medium text-ink shadow-[0_1px_2px_rgba(22,19,15,.07)]'
                  : 'font-normal text-ink-soft'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {isMonthly && (
          <MonthPicker
            year={year}
            month={month}
            onChange={(y, m) => {
              setYear(y)
              setMonth(m)
            }}
          />
        )}
      </div>

      <h2 className="text-sm font-semibold text-slate-900 lg:text-base">
        {isMonthly ? 'Monthly summary' : 'Overall summary'}
      </h2>

      {error && <p className="alert-error">{error}</p>}

      {!dataReady || initialLoading ? (
        <div className="card h-64 animate-pulse" aria-busy="true" aria-label="Loading summary" />
      ) : isEmpty ? (
        <section className="card py-8 text-center">
          <p className="text-sm text-slate-500">
            {isMonthly
              ? 'No income or expenses recorded this month.'
              : 'No income or expenses recorded yet.'}
          </p>
          <Link
            to={isMonthly ? `/transactions?month=${monthKey}` : '/transactions'}
            className="btn-primary mt-4 inline-flex px-5"
          >
            Add transaction
          </Link>
        </section>
      ) : (
        summaries.map((summary) => (
          <div key={summary.currency} className="space-y-4">
            {summaries.length > 1 && (
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {summary.currency}
              </p>
            )}

            <section className="overflow-hidden rounded-xl border border-ink-rule bg-paper-card p-4">
              <p className="text-[10px] font-medium uppercase tracking-[.1em] text-ink-faint">
                Balance
              </p>
              <p
                className={`n mt-1.5 text-[29px] font-medium leading-none tracking-[-.02em] ${
                  summary.balances >= 0 ? 'text-ink' : 'text-negative'
                }`}
              >
                {formatMoney(summary.balances, summary.currency)}
              </p>

              {isMonthly && (
                <div
                  className="mt-3.5 flex h-11 items-end gap-[2px]"
                  aria-label="Daily spending this month"
                >
                  {buildDayBars(summary.currency).map((bar) => (
                    <div
                      key={bar.day}
                      className={`min-h-[2px] flex-1 rounded-t-sm ${
                        bar.isToday ? 'bg-accent' : 'bg-accent/25'
                      }`}
                      style={{ height: bar.height }}
                      title={`${bar.day}: ${formatMoney(bar.amount, summary.currency)}`}
                    />
                  ))}
                </div>
              )}

              <div className="mt-2 flex justify-between border-t border-ink-hairline pt-[11px]">
                <div>
                  <p className="text-[10.5px] text-ink-faint">Spent</p>
                  <p className="n mt-0.5 text-sm font-medium text-ink">
                    {formatMoney(summary.expenses, summary.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-[10.5px] text-ink-faint">In</p>
                  <p className="n mt-0.5 text-sm font-medium text-positive">
                    {formatMoney(summary.income, summary.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-[10.5px] text-ink-faint">To goals</p>
                  <p className="n mt-0.5 text-sm font-medium text-ink">
                    {formatMoney(summary.goalSavings, summary.currency)}
                  </p>
                </div>
              </div>
            </section>

            {renderChart(summary)}
          </div>
        ))
      )}

      <div className="space-y-2">
        <h3 className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Balances
        </h3>
        <div className="card divide-y divide-slate-100 p-0">
          {summaryAccounts.length === 0 ? (
            <p className="px-4 py-4 text-sm text-slate-500">Add balances in Settings.</p>
          ) : (
            summaryAccounts.map((account) => <AccountCard key={account.id} account={account} />)
          )}
        </div>
      </div>

      <Link
        to={isMonthly ? `/transactions?month=${monthKey}` : '/transactions'}
        className="btn-secondary flex w-full justify-center"
      >
        {isMonthly ? 'View transactions this month' : 'View all transactions'}
      </Link>
    </section>
  )
}

export default memo(SummarySection)
