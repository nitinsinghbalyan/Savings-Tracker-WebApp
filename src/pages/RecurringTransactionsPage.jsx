import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Pause, Play, Plus, SkipForward, Trash2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { useAuth } from '../hooks/useAuth'
import { useAccounts } from '../hooks/useAccounts'
import { useCategories } from '../hooks/useCategories'
import { useProfile } from '../hooks/useProfile'
import { useRecurringTransactions } from '../hooks/useRecurringTransactions'
import { useToast } from '../hooks/useToast'
import { formatCurrency } from '../lib/format'
import { CategoriesPageHeader } from '../components/CategoryTreeManager'
import RecurringTransactionForm from '../components/RecurringTransactionForm'
import SettingsSection from '../components/SettingsSection'

function formatFrequency(rule) {
  const n = rule.interval_count ?? 1
  const freq = rule.frequency
  const singular = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
  }
  const pluralUnit = {
    daily: 'days',
    weekly: 'weeks',
    monthly: 'months',
    yearly: 'years',
  }
  if (n === 1) return singular[freq] ?? freq
  const unit = pluralUnit[freq]
  if (unit) return `Every ${n} ${unit}`
  return `Every ${n} ${freq}`
}

export default function RecurringTransactionsPage() {
  const toast = useToast()
  const { user, authReady } = useAuth()
  const { profile } = useProfile({ enabled: Boolean(user) && authReady })
  const { accounts } = useAccounts({ enabled: Boolean(user) && authReady })
  const { categories } = useCategories({ enabled: Boolean(user) && authReady })
  const {
    rules,
    loading,
    createRecurring,
    updateRecurring,
    deleteRecurring,
    skipNext,
  } = useRecurringTransactions({ enabled: Boolean(user) && authReady })

  const [formOpen, setFormOpen] = useState(false)
  const [editingRule, setEditingRule] = useState(null)

  const expenseCategories = categories.filter((c) => c.kind === 'expense')
  const incomeCategories = categories.filter((c) => c.kind === 'income')
  const defaultCurrency = profile?.default_currency ?? 'INR'

  const handleSubmit = async (data, id) => {
    if (id) {
      await updateRecurring(id, data)
      toast.success('Recurring rule updated')
      return
    }
    await createRecurring(data)
    toast.success('Recurring rule created')
  }

  const handleTogglePause = async (rule) => {
    await updateRecurring(rule.id, { is_paused: !rule.is_paused })
    toast.success(rule.is_paused ? 'Resumed' : 'Paused')
  }

  const handleSkip = async (rule) => {
    await skipNext(rule.id)
    toast.success('Next occurrence skipped')
  }

  const handleDelete = async (rule) => {
    if (!window.confirm('Delete this recurring rule? Posted transactions are kept.')) return
    try {
      await deleteRecurring(rule.id)
      toast.success('Recurring rule deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  return (
    <>
      <CategoriesPageHeader title="Recurring" />

      <main className="page-container space-y-4">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              setEditingRule(null)
              setFormOpen(true)
            }}
            className="btn-primary px-4"
          >
            <Plus className="h-4 w-4" />
            Add recurring
          </button>
        </div>

        <SettingsSection title="Rules">
          {loading && rules.length === 0 ? (
            <div className="animate-pulse space-y-3 px-4 py-4">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="h-16 rounded-lg bg-slate-100" />
              ))}
            </div>
          ) : rules.length === 0 ? (
            <p className="px-4 py-6 text-sm text-slate-500">
              No recurring rules yet. Add rent, salary, or SIP schedules here — they post
              automatically when due.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {rules.map((rule) => {
                const currency = rule.account?.currency ?? defaultCurrency
                const label =
                  rule.note ||
                  rule.category?.name ||
                  (rule.type === 'transfer' ? 'Transfer' : rule.type)
                return (
                  <li key={rule.id} className="px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">{label}</p>
                        <p className="mt-0.5 text-sm text-slate-600">
                          {formatCurrency(rule.amount, currency)} · {formatFrequency(rule)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Next: {format(parseISO(rule.next_run_date), 'MMM d, yyyy')}
                          {rule.is_paused && (
                            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-800">
                              Paused
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={() => handleTogglePause(rule)}
                          className="btn-icon"
                          aria-label={rule.is_paused ? 'Resume' : 'Pause'}
                        >
                          {rule.is_paused ? (
                            <Play className="h-4 w-4" />
                          ) : (
                            <Pause className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSkip(rule)}
                          className="btn-icon"
                          aria-label="Skip next"
                        >
                          <SkipForward className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingRule(rule)
                            setFormOpen(true)
                          }}
                          className="btn-icon text-xs font-medium"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(rule)}
                          className="btn-icon text-rose-600"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </SettingsSection>

        <p className="text-center text-xs text-slate-500">
          <Link to="/settings" className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700">
            <ArrowLeft className="h-3 w-3" />
            Back to settings
          </Link>
        </p>
      </main>

      <RecurringTransactionForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingRule(null)
        }}
        rule={editingRule}
        accounts={accounts}
        expenseCategories={expenseCategories}
        incomeCategories={incomeCategories}
        defaultCurrency={defaultCurrency}
        onSubmit={handleSubmit}
        onError={(msg) => toast.error(msg)}
      />
    </>
  )
}
