import { lazy, Suspense, useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Target } from 'lucide-react'
import { percentComplete, savedAmount } from '../lib/contributions'
import { formatCurrency } from '../lib/format'
import { getColorPalette } from '../lib/constants'
import { useAuth } from '../hooks/useAuth'
import { useGoals } from '../hooks/useGoals'
import { useProfile } from '../hooks/useProfile'
import { useAccounts } from '../hooks/useAccounts'
import { useAppData } from '../context/AppDataContext'
import { useToast } from '../hooks/useToast'
import { ensureGoalCategory } from '../lib/goalCategory'
import PageHeader from '../components/PageHeader'
import GoalCard from '../components/GoalCard'

const GoalForm = lazy(() => import('../components/GoalForm'))
const GoalDetailModal = lazy(() => import('../components/GoalDetailModal'))
const AddMoneyModal = lazy(() => import('../components/AddMoneyModal'))
const Celebration = lazy(() => import('../components/Celebration'))

export default function HomePage({ isTabActive = true }) {
  const toast = useToast()
  const { user, authReady } = useAuth()
  const { createTransaction, refreshCategories } = useAppData()
  const { profile } = useProfile({ enabled: Boolean(user) && authReady })
  const { accounts } = useAccounts({ enabled: Boolean(user) && authReady })
  const {
    goals,
    loading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    addContribution,
    deleteContribution,
  } = useGoals({ enabled: Boolean(user) && authReady })

  // Artboard 1e splits goals by whether anything has been saved yet, so the
  // unfunded ones collapse into a list rather than padding the card grid.
  const activeGoals = useMemo(
    () => goals.filter((goal) => savedAmount(goal) > 0),
    [goals],
  )
  const notStartedGoals = useMemo(
    () => goals.filter((goal) => savedAmount(goal) <= 0),
    [goals],
  )
  const notStartedTarget = useMemo(
    () => notStartedGoals.reduce((sum, goal) => sum + Number(goal.target_amount || 0), 0),
    [notStartedGoals],
  )

  const [formOpen, setFormOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [detailGoal, setDetailGoal] = useState(null)
  const [addMoneyGoal, setAddMoneyGoal] = useState(null)
  const [celebrationMessage, setCelebrationMessage] = useState(null)

  const openCreateForm = useCallback(() => {
    setEditingGoal(null)
    setFormOpen(true)
  }, [])

  const openEditForm = useCallback((goal) => {
    setEditingGoal(goal)
    setFormOpen(true)
  }, [])

  const handleCreateGoal = useCallback(
    async (data) => {
      const goal = await createGoal(data)
      toast.success('Goal created')
      return goal
    },
    [createGoal, toast],
  )

  const handleUpdateGoal = useCallback(
    async (id, patch) => {
      await updateGoal(id, patch)
      toast.success('Goal updated')
    },
    [updateGoal, toast],
  )

  const handleDeleteGoal = useCallback(
    async (id) => {
      try {
        await deleteGoal(id)
        setDetailGoal((current) => (current?.id === id ? null : current))
        toast.success('Goal deleted')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to delete goal')
        throw err
      }
    },
    [deleteGoal, toast],
  )

  const handleDeleteContribution = useCallback(
    async (id) => {
      try {
        await deleteContribution(id)
        toast.success('Contribution removed')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to remove contribution')
        throw err
      }
    },
    [deleteContribution, toast],
  )

  const handleAddMoney = useCallback(
    async (goal, contributionAmount, contributionNote, meta = {}) => {
      const before = percentComplete(goal)
      const target = Number(goal.target_amount)
      const projected = target > 0
        ? Math.min(100, ((savedAmount(goal) + contributionAmount) / target) * 100)
        : 0

      const { accountId, transactionDate, sourceAmount } = meta
      if (!accountId) {
        throw new Error('Select an account')
      }
      if (!transactionDate) {
        throw new Error('Select a date')
      }

      // Goal categories need the goal↔category migration. Without it we still record the
      // transaction and contribution, labeled with the goal name via category snapshot.
      const category = await ensureGoalCategory(goal).catch(() => null)
      if (category?.id) {
        await refreshCategories({ background: true }).catch(() => {})
      }

      const txAmount = sourceAmount ?? contributionAmount
      const tx = await createTransaction(
        {
          type: 'expense',
          amount: txAmount,
          account_id: accountId,
          category_id: category?.id ?? null,
          // Snapshot so Activity shows the goal name even when category link is missing
          category_name: category?.name ?? goal.name,
          category_color: category?.color ?? goal.color ?? 'indigo',
          category_is_savings: true,
          goal_id: goal.id,
          transfer_to_account_id: null,
          transaction_date: transactionDate,
          note: contributionNote,
        },
        {
          transactionDate,
          monthStartDay: profile?.month_start_day ?? 1,
        },
      )

      if (!tx?.id) {
        throw new Error('Transaction was not created. Please try again.')
      }

      await addContribution(goal.id, contributionAmount, contributionNote, tx.id)
      toast.success('Added to goal and Activity')

      if (before < 100 && projected >= 100) {
        setCelebrationMessage(`You reached your ${goal.name} goal!`)
      }
    },
    [createTransaction, addContribution, refreshCategories, toast, profile?.month_start_day],
  )

  return (
    <>
      <PageHeader title="Goals">
        <Link
          to="/summary"
          className="hidden rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-200 lg:inline-flex"
        >
          Summary
        </Link>
        <Link
          to="/settings/recurring"
          className="hidden rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-200 lg:inline-flex"
        >
          Recurring
        </Link>
      </PageHeader>

      <main className="page-container space-y-10 pb-8">
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-900 lg:text-base">Your goals</h2>
            <Link
              to="/summary"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 lg:hidden"
            >
              Summary →
            </Link>
          </div>

          {error && (
            <p role="alert" className="alert-error">
              {error}
            </p>
          )}

          {loading && goals.length === 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="card animate-pulse space-y-4 p-4">
                  <div className="h-5 w-2/3 rounded bg-slate-200" />
                  <div className="h-3 w-1/2 rounded bg-slate-100" />
                  <div className="h-3 w-full rounded-full bg-slate-100" />
                  <div className="h-10 w-full rounded-xl bg-slate-100" />
                </div>
              ))}
            </div>
          ) : goals.length === 0 ? (
            <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-12 text-center sm:px-6">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <Target className="h-7 w-7" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">No goals yet</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                Create a savings goal and track your progress over time.
              </p>
              <button
                type="button"
                onClick={openCreateForm}
                className="btn-primary mt-6 px-5"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Create your first goal
              </button>
            </section>
          ) : (
            <>
              {activeGoals.length > 0 && (
                <>
                  <p className="text-[10px] font-medium uppercase tracking-[.1em] text-ink-faint">
                    In progress
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {activeGoals.map((goal) => (
                      <GoalCard
                        key={goal.id}
                        goal={goal}
                        compact
                        onOpenDetails={setDetailGoal}
                        onAddMoney={setAddMoneyGoal}
                        onEdit={openEditForm}
                        onDelete={handleDeleteGoal}
                        onDeleteContribution={handleDeleteContribution}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Artboard 1e collapses unfunded goals into a plain list instead
                  of letting empty cards pad the grid. */}
              {notStartedGoals.length > 0 && (
                <div className="flex items-baseline gap-2">
                  <p className="text-[10px] font-medium uppercase tracking-[.1em] text-ink-faint">
                    Not started
                  </p>
                  <span className="n text-[10.5px] text-ink-faint">
                    {notStartedGoals.length} · {formatCurrency(notStartedTarget, 'INR')} target
                  </span>
                </div>
              )}
              <div className="overflow-hidden rounded-xl border border-ink-rule bg-paper-card">
                {notStartedGoals.map((goal) => (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => setDetailGoal(goal)}
                    className="flex w-full items-center gap-[11px] border-b border-ink-hairline px-3.5 py-3 text-left transition hover:bg-paper-sunk"
                  >
                    <span
                      className="h-[18px] w-[3px] shrink-0 rounded-sm"
                      style={{ background: getColorPalette(goal.color).fill }}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{goal.name}</span>
                    <span className="n shrink-0 text-[11.5px] text-ink-faint">
                      {formatCurrency(Number(goal.target_amount), goal.currency ?? 'INR')}
                    </span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={openCreateForm}
                  className="flex w-full items-center justify-center gap-1.5 py-3 text-[12.5px] font-medium text-accent transition hover:bg-paper-sunk"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  New goal
                </button>
              </div>
            </>
          )}
        </section>
      </main>

      {isTabActive && (formOpen || detailGoal || addMoneyGoal || celebrationMessage) && (
        <Suspense fallback={null}>
          {formOpen && (
            <GoalForm
              open={formOpen}
              onClose={() => setFormOpen(false)}
              goal={editingGoal}
              createGoal={handleCreateGoal}
              updateGoal={handleUpdateGoal}
              onError={(message) => toast.error(message)}
            />
          )}

          {detailGoal && (
            <GoalDetailModal
              key={detailGoal.id}
              open
              onClose={() => setDetailGoal(null)}
              goal={goals.find((g) => g.id === detailGoal.id) ?? detailGoal}
              onAddMoney={setAddMoneyGoal}
              onEdit={openEditForm}
              onDelete={handleDeleteGoal}
              onDeleteContribution={handleDeleteContribution}
            />
          )}

          {addMoneyGoal && (
            <AddMoneyModal
              open
              onClose={() => setAddMoneyGoal(null)}
              goal={addMoneyGoal}
              accounts={accounts}
              defaultCurrency={profile?.default_currency ?? 'INR'}
              onSubmit={handleAddMoney}
              onError={(message) => toast.error(message)}
            />
          )}

          {celebrationMessage && (
            <Celebration
              message={celebrationMessage}
              onDone={() => setCelebrationMessage(null)}
            />
          )}
        </Suspense>
      )}
    </>
  )
}
