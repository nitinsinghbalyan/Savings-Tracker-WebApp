import { lazy, memo, Suspense, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { useAuth } from '../hooks/useAuth'
import { useAppData } from '../context/AppDataContext'
import { useAccounts } from '../hooks/useAccounts'
import { useCategories } from '../hooks/useCategories'
import { useTransactions } from '../hooks/useTransactions'
import { useGoals } from '../hooks/useGoals'
import {
  buildPeriodDays,
  buildTodayRows,
  buildTopMovers,
  filterTransactionsForHeatmapCategory,
  groupSummariesByCurrency,
  percentDelta,
} from '../lib/monthlySummary'
import { getColorPalette } from '../lib/constants'
import { formatMoney } from '../lib/format'
import MonthPicker from './MonthPicker'
import AccountCard from './AccountCard'
import SavingsBreakdownList from './SavingsBreakdownList'
import NetWorthCard from './netWorth/NetWorthCard'
import TodayList from './TodayList'
import DeltaBadge from './DeltaBadge'
import CategoryMovers from './CategoryMovers'
import CollapsibleSection from './CollapsibleSection'
import CategoryIcon from './CategoryIcon'
import { useNetWorth } from '../hooks/useNetWorth'
import { useTheme } from '../hooks/useTheme'

const CategoryBreakdownChart = lazy(() => import('./CategoryBreakdownChart'))
// Opened only on tap — keep it out of the default tab's first paint.
const CategoryTransactionsModal = lazy(() => import('./CategoryTransactionsModal'))

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
  const [selectedMover, setSelectedMover] = useState(null)

  const isMonthly = view === 'monthly'

  const dataReady = Boolean(user) && authReady && !bootstrapping && Boolean(profile)
  const monthStartDay = profile?.month_start_day ?? 1

  const { accounts } = useAccounts({ enabled: dataReady })
  const { categories } = useCategories({ enabled: dataReady })
  const { goals } = useGoals({ enabled: dataReady })
  // enabled:false — read whatever the Worth tab has already cached, never
  // fetch from here. The default tab must not gain a sixth startup request.
  const { summary: netWorthSummary, loaded: netWorthLoaded } = useNetWorth({ enabled: false })
  // Settings → Compare with. Either way it stays one bounded month query.
  const { comparePeriod, resolved: resolvedTheme } = useTheme()
  const { transactions, initialLoading, error } = useTransactions({
    // Pause fetches while the tab is hidden; cached rows still render from context.
    enabled: dataReady && isTabActive,
    allTime: !isMonthly,
    year: isMonthly ? year : undefined,
    month: isMonthly ? month : undefined,
    monthStartDay,
  })

  // Artboard 1a shows month-over-month deltas, which need the previous period.
  // Deliberately month-scoped: a second bounded query, never an all-time fetch
  // (F-87 was removed in session 46 for exactly that).
  const prevPeriod = useMemo(() => {
    if (!isMonthly) return null
    if (comparePeriod === 'year') return { year: year - 1, month }
    return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 }
  }, [isMonthly, year, month, comparePeriod])

  const { transactions: prevTransactions, loaded: prevLoaded } = useTransactions({
    // Only after the visible month is on screen, so the default tab's first
    // paint never waits on a comparison that lives below the headline figure.
    enabled: dataReady && isTabActive && isMonthly && !initialLoading && Boolean(prevPeriod),
    year: prevPeriod?.year,
    month: prevPeriod?.month,
    monthStartDay,
  })

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

  // The period's real dates (honours month_start_day). Keying bars by calendar
  // day 1..N dropped every day past the month boundary when the period starts
  // on, say, the 25th.
  const periodDays = useMemo(
    () => (isMonthly ? buildPeriodDays(year, month, monthStartDay) : []),
    [isMonthly, year, month, monthStartDay],
  )

  const todayKey = format(now, 'yyyy-MM-dd')
  const periodHasToday = periodDays.some((d) => d.key === todayKey)

  const buildDayBars = (currency) => {
    const days = spendByDay.get(currency) ?? new Map()
    const bars = periodDays.map((d) => ({ ...d, amount: days.get(d.key) ?? 0 }))
    const max = bars.reduce((peak, bar) => Math.max(peak, bar.amount), 0)
    return bars.map((bar) => ({
      ...bar,
      height: max > 0 && bar.amount > 0 ? `${Math.max(6, (bar.amount / max) * 100)}%` : '2px',
      isToday: bar.key === todayKey,
    }))
  }

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

  const prevSummaries = useMemo(() => {
    if (!isMonthly || !prevLoaded || !prevPeriod) return []
    return groupSummariesByCurrency(prevTransactions ?? [], categories, activeAccounts, {
      goals,
      year: prevPeriod.year,
      month: prevPeriod.month,
      monthStartDay,
      preferredCurrency,
      allTime: false,
    })
  }, [
    isMonthly,
    prevLoaded,
    prevPeriod,
    prevTransactions,
    categories,
    activeAccounts,
    goals,
    monthStartDay,
    preferredCurrency,
  ])

  const deltasFor = (currency) => {
    const prev = prevSummaries.find((p) => p.currency === currency)
    if (!prev) return null
    return {
      expenses: percentDelta(
        summaries.find((x) => x.currency === currency)?.expenses ?? 0,
        prev.expenses,
      ),
      income: percentDelta(
        summaries.find((x) => x.currency === currency)?.income ?? 0,
        prev.income,
      ),
      savings: percentDelta(
        summaries.find((x) => x.currency === currency)?.savings ?? 0,
        prev.savings,
      ),
      cashFlow: percentDelta(
        summaries.find((x) => x.currency === currency)?.cashFlow ?? 0,
        prev.cashFlow,
      ),
    }
  }

  // Heatmap columns follow the visible period, not a fixed 31.
  const daysInMonth = periodDays.length || new Date(year, month, 0).getDate()

  const compareLabel = prevPeriod
    ? comparePeriod === 'year'
      ? format(new Date(prevPeriod.year, prevPeriod.month - 1, 1), 'MMM yyyy')
      : 'last month'
    : ''

  const moversFor = (summary) => {
    if (!isMonthly || !prevLoaded) return []
    const prev = prevSummaries.find((p) => p.currency === summary.currency)
    if (!prev) return []
    return buildTopMovers(summary.byExpenseCategory, prev.byExpenseCategory)
  }

  const selectedMoverTransactions = useMemo(
    () =>
      selectedMover
        ? filterTransactionsForHeatmapCategory(
            transactions ?? [],
            selectedMover.categoryId,
            selectedMover.currency,
          )
        : [],
    [selectedMover, transactions],
  )

  const todayFor = (currency) => buildTodayRows(transactions ?? [], currency, todayKey)

  const monthKey = `${year}-${String(month).padStart(2, '0')}`

  // byGoalSavings carries no colour, so resolve each goal's palette by id.
  const goalColors = useMemo(
    () => Object.fromEntries((goals ?? []).map((g) => [g.id, g.color])),
    [goals],
  )

  const renderSavingsBreakdown = (summary) => {
    const hasRows = summary.bySavingsCategory.length > 0 || summary.byGoalSavings.length > 0
    if (!hasRows || summary.savings <= 0) return null

    return (
      <SavingsBreakdownList
        categoryItems={summary.bySavingsCategory}
        goalItems={summary.byGoalSavings}
        categoryTotal={summary.categorySavings}
        goalTotal={summary.goalSavings}
        currency={summary.currency}
        goalColors={goalColors}
      />
    )
  }

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
            categories={categories}
            daysInMonth={daysInMonth}
            periodDays={isMonthly ? periodDays : null}
            dark={resolvedTheme === 'dark'}
            prevItems={
              prevSummaries.find((p) => p.currency === summary.currency)?.byExpenseCategory ?? []
            }
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
              {/* Headline answers "how did this period go": income − spent,
                  with the savings rate beside it. The account balance is a
                  stock figure, so it drops to a supporting line. */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-[.1em] text-ink-faint">
                    {isMonthly ? 'Net this month' : 'Net all time'}
                  </p>
                  <p
                    className={`n mt-1.5 text-[29px] font-medium leading-none tracking-[-.02em] ${
                      summary.cashFlow >= 0 ? 'text-ink' : 'text-negative'
                    }`}
                  >
                    {summary.cashFlow >= 0 ? '+' : '−'}
                    {formatMoney(Math.abs(summary.cashFlow), summary.currency)}
                  </p>
                  <p className="mt-1 text-[11px] text-ink-faint">
                    Income − spent
                    {isMonthly && (
                      <>
                        {' '}
                        <DeltaBadge delta={deltasFor(summary.currency)?.cashFlow} />
                      </>
                    )}
                  </p>
                </div>
                {summary.income > 0 && (
                  <div className="shrink-0 rounded-lg bg-paper-sunk px-2.5 py-1.5 text-right">
                    <p className="text-[10px] text-ink-faint">Savings rate</p>
                    <p className="n text-base font-medium text-accent">
                      {Math.round(summary.savingsRate)}%
                    </p>
                  </div>
                )}
              </div>

              {isMonthly && periodDays.length > 0 && (
                <div
                  className="mt-3.5 flex h-11 items-end gap-[2px]"
                  aria-label="Daily spending this period"
                >
                  {buildDayBars(summary.currency).map((bar) => (
                    <div
                      key={bar.key}
                      className={`min-h-[2px] flex-1 rounded-t-sm ${
                        bar.isToday ? 'bg-accent' : 'bg-accent/25'
                      }`}
                      style={{ height: bar.height }}
                      title={`${bar.label}: ${formatMoney(bar.amount, summary.currency)}`}
                    />
                  ))}
                </div>
              )}

              {isMonthly && periodDays.length > 0 && (
                <div className="mt-1.5 flex justify-between">
                  <span className="n text-[9.5px] text-ink-faint">{periodDays[0].label}</span>
                  {/* Only when the period actually contains today. */}
                  {periodHasToday && <span className="n text-[9.5px] text-accent">today</span>}
                  <span className="n text-[9.5px] text-ink-faint">
                    {periodDays[periodDays.length - 1].label}
                  </span>
                </div>
              )}

              <div className="mt-3 grid grid-cols-3 gap-2.5 border-t border-ink-hairline pt-[11px]">
                <div>
                  <p className="text-[10.5px] text-ink-faint">Spent</p>
                  <p className="n mt-0.5 text-sm font-medium text-ink">
                    {formatMoney(summary.expenses, summary.currency)}
                  </p>
                  {isMonthly && (
                    <DeltaBadge
                      delta={deltasFor(summary.currency)?.expenses}
                      higherIsBetter={false}
                    />
                  )}
                </div>
                <div>
                  <p className="text-[10.5px] text-ink-faint">Income</p>
                  <p className="n mt-0.5 text-sm font-medium text-positive">
                    {formatMoney(summary.income, summary.currency)}
                  </p>
                  {isMonthly && <DeltaBadge delta={deltasFor(summary.currency)?.income} />}
                </div>
                <div>
                  {/* "Saved", not "To goals": this is category savings + goal
                      contributions, and the breakdown below has its own
                      "To goals" subtotal — one label, one number. */}
                  <p className="text-[10.5px] text-ink-faint">Saved</p>
                  <p className="n mt-0.5 text-sm font-medium text-accent">
                    {formatMoney(summary.savings, summary.currency)}
                  </p>
                  {isMonthly && <DeltaBadge delta={deltasFor(summary.currency)?.savings} />}
                </div>
              </div>

              <p className="mt-3 flex items-baseline justify-between gap-2 border-t border-ink-hairline pt-2.5 text-[11px] text-ink-faint">
                <span>Account balance</span>
                <span
                  className={`n text-[12.5px] font-medium ${
                    summary.balances >= 0 ? 'text-ink' : 'text-negative'
                  }`}
                >
                  {formatMoney(summary.balances, summary.currency)}
                </span>
              </p>
            </section>

            {isMonthly &&
              (() => {
                const today = todayFor(summary.currency)
                return (
                  <TodayList
                    rows={today.rows}
                    net={today.net}
                    currency={summary.currency}
                  />
                )
              })()}

            <CategoryMovers
              movers={moversFor(summary)}
              currency={summary.currency}
              compareLabel={compareLabel}
              onSelect={(item) =>
                setSelectedMover({
                  categoryId: item.categoryId,
                  name: item.name,
                  icon: item.icon,
                  currency: summary.currency,
                })
              }
            />

            {renderChart(summary)}

            {renderSavingsBreakdown(summary)}

            {summary.byIncomeCategory.length > 0 && (
              <CollapsibleSection
                title="Income by category"
                meta={formatMoney(summary.income, summary.currency)}
              >
                {summary.byIncomeCategory.map((item) => (
                  <div
                    key={item.categoryId}
                    className="flex items-center gap-[11px] border-b border-ink-hairline px-3.5 py-3 last:border-b-0"
                  >
                    <span
                      className="h-[18px] w-[3px] shrink-0 rounded-sm"
                      style={{ background: getColorPalette(item.color).fill }}
                      aria-hidden="true"
                    />
                    <CategoryIcon category={item} className="h-4 w-4 text-ink-soft" />
                    <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{item.name}</span>
                    <span className="n shrink-0 text-[11.5px] text-ink-faint">
                      {summary.income > 0 ? `${Math.round((item.total / summary.income) * 100)}% · ` : ''}
                      {formatMoney(item.total, summary.currency)}
                    </span>
                  </div>
                ))}
              </CollapsibleSection>
            )}
          </div>
        ))
      )}

      {netWorthLoaded && <NetWorthCard summary={netWorthSummary} />}

      {/* Collapsed by default: Settings and the Ledger already list accounts. */}
      <CollapsibleSection title="Balances" meta={summaryAccounts.length ? String(summaryAccounts.length) : null}>
        <div className="divide-y divide-ink-hairline">
          {summaryAccounts.length === 0 ? (
            <p className="px-4 py-4 text-sm text-ink-soft">Add balances in Settings.</p>
          ) : (
            summaryAccounts.map((account) => <AccountCard key={account.id} account={account} />)
          )}
        </div>
      </CollapsibleSection>

      <Link
        to={isMonthly ? `/transactions?month=${monthKey}` : '/transactions'}
        className="btn-secondary flex w-full justify-center"
      >
        {isMonthly ? 'View transactions this month' : 'View all transactions'}
      </Link>

      {selectedMover && (
        <Suspense fallback={null}>
          <CategoryTransactionsModal
            open
            onClose={() => setSelectedMover(null)}
            categoryName={selectedMover.name}
            categoryIcon={selectedMover.icon ?? null}
            transactions={selectedMoverTransactions}
            currency={selectedMover.currency}
          />
        </Suspense>
      )}
    </section>
  )
}

export default memo(SummarySection)
