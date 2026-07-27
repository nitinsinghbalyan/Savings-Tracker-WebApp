import { memo, useMemo, useState } from 'react'
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
import CategoryBreakdownChart from './CategoryBreakdownChart'
import AccountCard from './AccountCard'

const SUMMARY_VIEWS = [
  { value: 'overall', label: 'Overall' },
  { value: 'monthly', label: 'Monthly' },
]

function SummarySection({ profile }) {
  const { user, authReady } = useAuth()
  const { bootstrapping } = useAppData()
  const now = new Date()
  const [view, setView] = useState('overall')
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const isMonthly = view === 'monthly'
  const dataReady = Boolean(user) && authReady && !bootstrapping && Boolean(profile)
  const monthStartDay = profile?.month_start_day ?? 1

  const { accounts } = useAccounts({ enabled: dataReady })
  const { categories } = useCategories({ enabled: dataReady })
  const { goals } = useGoals({ enabled: dataReady })
  const { transactions, initialLoading, error } = useTransactions({
    enabled: dataReady,
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
        <CategoryBreakdownChart
          items={summary.byExpenseCategory}
          total={summary.expenses}
          currency={summary.currency}
          budgetTotal={isMonthly ? summary.expenseBudgetTotal : 0}
          transactions={transactions}
          large
        />
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
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 sm:w-56">
          {SUMMARY_VIEWS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setView(option.value)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                view === option.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
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

      {initialLoading ? (
        <div className="card animate-pulse h-64" />
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

            <section className="card grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <div>
                <p className="text-xs text-slate-500">Income</p>
                <p className="text-lg font-bold text-emerald-600">
                  {formatMoney(summary.income, summary.currency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Expenses</p>
                <p className="text-lg font-bold text-rose-600">
                  {formatMoney(summary.expenses, summary.currency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Savings</p>
                <p className="text-lg font-bold text-brand-600">
                  {formatMoney(summary.categorySavings, summary.currency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Goals</p>
                <p className="text-lg font-bold text-violet-600">
                  {formatMoney(summary.goalSavings, summary.currency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Total balance</p>
                <p
                  className={`text-lg font-bold ${summary.balances >= 0 ? 'text-slate-900' : 'text-rose-600'}`}
                >
                  {formatMoney(summary.balances, summary.currency)}
                </p>
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
