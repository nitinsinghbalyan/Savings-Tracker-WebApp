import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Search, X } from 'lucide-react'
import RupeeIcon from '../components/icons/RupeeIcon'
import { useAuth } from '../hooks/useAuth'
import { useAppData } from '../context/AppDataContext'
import { useProfile } from '../hooks/useProfile'
import { useAccounts } from '../hooks/useAccounts'
import { useCategories } from '../hooks/useCategories'
import { useTransactions } from '../hooks/useTransactions'
import { useToast } from '../hooks/useToast'
import { useGoals } from '../hooks/useGoals'
import { groupTransactionsByDate, formatTransactionDateLabel, getPeriodForDate } from '../lib/transactions'
import { buildGoalContributionFromTransaction } from '../lib/transactionGoal'
import PageHeader from '../components/PageHeader'
import MonthPicker from '../components/MonthPicker'
import TransactionRow from '../components/TransactionRow'
import TransactionForm from '../components/TransactionForm'

const FILTER_TYPES = [
  { value: '', label: 'All' },
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
  { value: 'transfer', label: 'Transfer' },
]

const PAGE_SIZES = [10, 50, 100]

function parseMonthParam(value) {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) return null
  const [year, month] = value.split('-').map(Number)
  if (!year || month < 1 || month > 12) return null
  return { year, month }
}

function matchesSearch(tx, query) {
  if (!query) return true
  const q = query.toLowerCase()
  const note = (tx.note ?? '').toLowerCase()
  const category = (tx.category?.name ?? '').toLowerCase()
  const account = (tx.account?.name ?? '').toLowerCase()
  return note.includes(q) || category.includes(q) || account.includes(q)
}

export default function TransactionsPage({ isTabActive = true, embedded = false }) {
  const toast = useToast()
  const navigate = useNavigate()
  const { user, authReady } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const now = new Date()

  const { consumeRecurringPosted } = useAppData()

  useEffect(() => {
    if (!isTabActive) return
    const posted = consumeRecurringPosted()
    if (posted > 0) {
      toast.success(`Posted ${posted} recurring transaction${posted === 1 ? '' : 's'}`)
    }
  }, [isTabActive, consumeRecurringPosted, toast])

  const monthFromUrl = parseMonthParam(searchParams.get('month'))
  const [year, setYear] = useState(monthFromUrl?.year ?? now.getFullYear())
  const [month, setMonth] = useState(monthFromUrl?.month ?? now.getMonth() + 1)
  const [filterType, setFilterType] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterAccountId, setFilterAccountId] = useState('')
  const [amountMin, setAmountMin] = useState('')
  const [amountMax, setAmountMax] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editingTx, setEditingTx] = useState(null)

  const { profile } = useProfile({ enabled: Boolean(user) && authReady })
  const { accounts } = useAccounts({ enabled: Boolean(user) && authReady })
  const { categories } = useCategories({ enabled: Boolean(user) && authReady })
  const { goals, addContribution } = useGoals({ enabled: Boolean(user) && authReady })

  const monthStartDay = profile?.month_start_day ?? 1
  const defaultCurrency = profile?.default_currency ?? 'INR'

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.kind === 'expense'),
    [categories],
  )
  const incomeCategories = useMemo(
    () => categories.filter((c) => c.kind === 'income'),
    [categories],
  )

  const {
    transactions,
    loading,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions({
    enabled: Boolean(user) && authReady,
    year,
    month,
    monthStartDay,
    type: filterType || undefined,
  })

  const filteredTransactions = useMemo(() => {
    const min = amountMin !== '' ? Number(amountMin) : null
    const max = amountMax !== '' ? Number(amountMax) : null

    return transactions.filter((tx) => {
      if (filterAccountId && tx.account_id !== filterAccountId) return false
      if (!matchesSearch(tx, searchQuery)) return false
      const amount = Number(tx.amount) || 0
      if (min !== null && !Number.isNaN(min) && amount < min) return false
      if (max !== null && !Number.isNaN(max) && amount > max) return false
      return true
    })
  }, [transactions, filterAccountId, searchQuery, amountMin, amountMax])

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize))

  const paginatedTransactions = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredTransactions.slice(start, start + pageSize)
  }, [filteredTransactions, page, pageSize])

  const groups = useMemo(
    () => groupTransactionsByDate(paginatedTransactions),
    [paginatedTransactions],
  )

  useEffect(() => {
    setPage(1)
  }, [year, month, filterType, searchQuery, filterAccountId, amountMin, amountMax, pageSize])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const hasAdvancedFilters =
    searchQuery || filterAccountId || amountMin !== '' || amountMax !== ''

  const clearAdvancedFilters = () => {
    setSearchQuery('')
    setFilterAccountId('')
    setAmountMin('')
    setAmountMax('')
  }

  useEffect(() => {
    const parsed = parseMonthParam(searchParams.get('month'))
    if (!parsed) return
    setYear(parsed.year)
    setMonth(parsed.month)
  }, [searchParams])

  useEffect(() => {
    if (!formOpen) return
    const path = window.location.pathname.replace(/\/+$/, '') || '/'
    if (path === '/goals' || path === '/transactions') return
    const month = searchParams.get('month')
    navigate(month ? `/goals?month=${month}` : '/goals', { replace: true })
  }, [formOpen, navigate, searchParams])

  const showTransactionForm = formOpen || isTabActive

  const handleMonthChange = (y, m) => {
    setYear(y)
    setMonth(m)
    const monthKey = `${y}-${String(m).padStart(2, '0')}`
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set('month', monthKey)
        return next
      },
      { replace: true },
    )
  }

  const handleSubmit = async (data, id, options = {}) => {
    if (id) {
      await updateTransaction(id, data)
      toast.success('Transaction updated')
      return
    }

    await createTransaction(data)

    const period = getPeriodForDate(data.transaction_date, monthStartDay)
    if (period.year !== year || period.month !== month) {
      handleMonthChange(period.year, period.month)
    }
    if (filterType && filterType !== data.type) {
      setFilterType('')
    }
    if (filterAccountId && filterAccountId !== data.account_id) {
      setFilterAccountId('')
    }

    if (options.goalId) {
      const goal = goals.find((g) => g.id === options.goalId)
      const account = accounts.find((a) => a.id === data.account_id)
      if (!goal) {
        toast.error('Goal not found — transaction saved without goal contribution')
        return
      }
      try {
        const contribution = await buildGoalContributionFromTransaction({
          goal,
          amount: data.amount,
          accountCurrency: account?.currency ?? defaultCurrency,
          note: data.note,
          transactionType: data.type,
        })
        if (!contribution.amount || contribution.amount <= 0) {
          throw new Error('Converted goal amount must be greater than 0')
        }
        await addContribution(contribution.goalId, contribution.amount, contribution.note)
        toast.success('Transaction added and applied to goal')
        return
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'Transaction saved but goal contribution failed',
        )
        return
      }
    }

    toast.success('Transaction added')
  }

  const handleDelete = async (tx) => {
    if (!window.confirm('Delete this transaction?')) return
    try {
      await deleteTransaction(tx.id)
      toast.success('Transaction deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  const openAddForm = () => {
    setEditingTx(null)
    setFormOpen(true)
  }

  const showSkeleton = loading && transactions.length === 0

  const filterChips = (
    <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible">
      {FILTER_TYPES.map((f) => (
        <button
          key={f.value || 'all'}
          type="button"
          onClick={() => setFilterType(f.value)}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset transition lg:text-sm ${
            filterType === f.value
              ? 'bg-brand-600 text-white ring-brand-600'
              : 'bg-white text-slate-600 ring-slate-200'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  )

  const advancedFilters = (
    <div className="space-y-3">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search note, category, account…"
          className="input-field w-full pl-9"
          aria-label="Search transactions"
        />
      </div>

      <select
        value={filterAccountId}
        onChange={(e) => setFilterAccountId(e.target.value)}
        className="input-field w-full"
        aria-label="Filter by account"
      >
        <option value="">All accounts</option>
        {accounts
          .filter((a) => !a.is_archived)
          .map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
      </select>

      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          value={amountMin}
          onChange={(e) => setAmountMin(e.target.value)}
          placeholder="Min amount"
          className="input-field w-full"
          aria-label="Minimum amount"
          min="0"
        />
        <input
          type="number"
          value={amountMax}
          onChange={(e) => setAmountMax(e.target.value)}
          placeholder="Max amount"
          className="input-field w-full"
          aria-label="Maximum amount"
          min="0"
        />
      </div>

      {(hasAdvancedFilters || filteredTransactions.length !== transactions.length) && (
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            {filteredTransactions.length} of {transactions.length} transactions
          </span>
          {hasAdvancedFilters && (
            <button
              type="button"
              onClick={clearAdvancedFilters}
              className="inline-flex items-center gap-1 font-medium text-brand-600 hover:text-brand-700"
            >
              <X className="h-3 w-3" aria-hidden="true" />
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  )

  const paginationBar =
    filteredTransactions.length > 0 ? (
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <span className="text-slate-500">Show</span>
          {PAGE_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setPageSize(size)}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset transition ${
                pageSize === size
                  ? 'bg-brand-600 text-white ring-brand-600'
                  : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              {size}
            </button>
          ))}
          <span className="text-slate-500">
            · {(page - 1) * pageSize + 1}–
            {Math.min(page * pageSize, filteredTransactions.length)} of{' '}
            {filteredTransactions.length}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-slate-700">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    ) : null

  const transactionList = showSkeleton ? (
    <div className="card animate-pulse space-y-3">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="h-12 rounded-lg bg-slate-100" />
      ))}
    </div>
  ) : groups.length === 0 ? (
    <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-12 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <RupeeIcon className="h-7 w-7" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-slate-900">
        {transactions.length === 0 ? 'No transactions' : 'No matching transactions'}
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
        {transactions.length === 0
          ? 'Record expenses, income, or transfers between your accounts.'
          : 'Try adjusting your search or filters for this month.'}
      </p>
      {transactions.length === 0 ? (
        <button type="button" onClick={openAddForm} className="btn-primary mt-6 px-5">
          <Plus className="h-4 w-4" />
          Add transaction
        </button>
      ) : hasAdvancedFilters ? (
        <button type="button" onClick={clearAdvancedFilters} className="btn-secondary mt-6 px-5">
          Clear filters
        </button>
      ) : null}
    </section>
  ) : (
    <div className="space-y-4">
      {paginationBar}
      {groups.map(({ date, items }) => (
        <section key={date} className="card">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {formatTransactionDateLabel(date)}
          </h3>
          <div className="hidden border-b border-slate-100 px-1 py-2 text-xs font-medium uppercase tracking-wide text-slate-400 lg:grid lg:grid-cols-[auto_1fr_minmax(6rem,auto)_auto] lg:gap-4">
            <span />
            <span>Description</span>
            <span>Account</span>
            <span className="text-right">Amount · Actions</span>
          </div>
          <div className="divide-y divide-slate-100">
            {items.map((tx) => (
              <TransactionRow
                key={tx.id}
                transaction={tx}
                onEdit={(t) => {
                  setEditingTx(t)
                  setFormOpen(true)
                }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </section>
      ))}
      {paginationBar}
    </div>
  )

  const activityBody = (
    <>
      <div className="flex flex-col gap-3 lg:hidden">
        <MonthPicker year={year} month={month} onChange={handleMonthChange} />
        {filterChips}
        {advancedFilters}
      </div>

      <div className="hidden lg:grid lg:grid-cols-12 lg:items-start lg:gap-8">
        <aside className="space-y-4 lg:col-span-3 xl:col-span-3">
          <div className="card space-y-4 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Month</p>
            <MonthPicker year={year} month={month} onChange={handleMonthChange} />
          </div>
          <div className="card space-y-3 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Type</p>
            {filterChips}
          </div>
          <div className="card space-y-3 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Filters</p>
            {advancedFilters}
          </div>
        </aside>
        <div className="space-y-4 lg:col-span-9">
          {error && <p className="alert-error">{error}</p>}
          {transactionList}
        </div>
      </div>

      <div className="lg:hidden">
        {error && <p className="alert-error">{error}</p>}
        {transactionList}
      </div>
    </>
  )

  if (embedded) {
    return (
      <>
        <section className="space-y-4 border-t border-slate-200 pt-10">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-900 lg:text-base">Activity</h2>
            <button
              type="button"
              onClick={openAddForm}
              className="btn-primary px-3 py-2 text-sm lg:hidden"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
            <button
              type="button"
              onClick={openAddForm}
              className="btn-primary hidden px-4 lg:inline-flex"
            >
              <Plus className="h-4 w-4" />
              Add transaction
            </button>
          </div>
          {activityBody}
        </section>

        {isTabActive && !showSkeleton && (
          <button
            type="button"
            onClick={openAddForm}
            aria-label="Add transaction"
            className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] right-4 z-[60] flex h-14 w-14 min-h-11 min-w-11 touch-manipulation items-center justify-center rounded-full bg-brand-600 text-white shadow-fab transition hover:bg-brand-700 active:scale-95 sm:right-6 lg:hidden"
          >
            <Plus className="h-6 w-6" />
          </button>
        )}

        {showTransactionForm && (
          <TransactionForm
            open={formOpen}
            onClose={() => {
              setFormOpen(false)
              setEditingTx(null)
            }}
            transaction={editingTx}
            accounts={accounts}
            expenseCategories={expenseCategories}
            incomeCategories={incomeCategories}
            goals={goals}
            defaultCurrency={defaultCurrency}
            onSubmit={handleSubmit}
            onError={(msg) => toast.error(msg)}
          />
        )}
      </>
    )
  }

  return (
    <>
      <PageHeader title="Activity">
        <div className="flex items-center gap-2">
          <Link
            to="/settings/recurring"
            className="hidden rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-200 lg:inline-flex"
          >
            Recurring
          </Link>
          <button
          type="button"
          onClick={openAddForm}
          className="btn-primary hidden px-4 lg:inline-flex"
        >
          <Plus className="h-4 w-4" />
          Add transaction
        </button>
        </div>
      </PageHeader>

      <main className="page-container space-y-4">
        {activityBody}
      </main>

      {isTabActive && !showSkeleton && (
        <button
          type="button"
          onClick={openAddForm}
          aria-label="Add transaction"
          className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] right-4 z-[60] flex h-14 w-14 min-h-11 min-w-11 touch-manipulation items-center justify-center rounded-full bg-brand-600 text-white shadow-fab transition hover:bg-brand-700 active:scale-95 sm:right-6 lg:hidden"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}

      {showTransactionForm && (
        <TransactionForm
          open={formOpen}
          onClose={() => {
            setFormOpen(false)
            setEditingTx(null)
          }}
          transaction={editingTx}
          accounts={accounts}
          expenseCategories={expenseCategories}
          incomeCategories={incomeCategories}
          goals={goals}
          defaultCurrency={defaultCurrency}
          onSubmit={handleSubmit}
          onError={(msg) => toast.error(msg)}
        />
      )}
    </>
  )
}
