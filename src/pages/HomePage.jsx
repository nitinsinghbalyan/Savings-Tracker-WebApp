import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Target } from 'lucide-react'
import { percentComplete, savedAmount } from '../lib/contributions'
import { formatCurrency } from '../lib/format'
import { useAuth } from '../hooks/useAuth'
import { useGoals } from '../hooks/useGoals'
import { useProfile } from '../hooks/useProfile'
import { useToast } from '../hooks/useToast'
import PageHeader from '../components/PageHeader'
import GoalsProgressBars from '../components/GoalsProgressBars'
import GoalForm from '../components/GoalForm'
import GoalDetailModal from '../components/GoalDetailModal'
import AddMoneyModal from '../components/AddMoneyModal'
import Celebration from '../components/Celebration'
import TransactionsPage from './TransactionsPage'

export default function HomePage({ isTabActive = true }) {
  const toast = useToast()
  const { user, authReady } = useAuth()
  const { profile } = useProfile({ enabled: Boolean(user) && authReady })
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

  const [formOpen, setFormOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [detailGoal, setDetailGoal] = useState(null)
  const [addMoneyGoal, setAddMoneyGoal] = useState(null)
  const [celebrationMessage, setCelebrationMessage] = useState(null)

  const openCreateForm = () => {
    setEditingGoal(null)
    setFormOpen(true)
  }

  const openEditForm = (goal) => {
    setEditingGoal(goal)
    setFormOpen(true)
  }

  const handleCreateGoal = async (data) => {
    const goal = await createGoal(data)
    toast.success('Goal created')
    return goal
  }

  const handleUpdateGoal = async (id, patch) => {
    await updateGoal(id, patch)
    toast.success('Goal updated')
  }

  const handleDeleteGoal = async (id) => {
    try {
      await deleteGoal(id)
      setDetailGoal((current) => (current?.id === id ? null : current))
      toast.success('Goal deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete goal')
      throw err
    }
  }

  const handleDeleteContribution = async (id) => {
    try {
      await deleteContribution(id)
      toast.success('Contribution removed')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove contribution')
      throw err
    }
  }

  const handleAddMoney = async (goal, amount, note) => {
    const before = percentComplete(goal)
    const target = Number(goal.target_amount)
    const projected = target > 0
      ? Math.min(100, ((savedAmount(goal) + amount) / target) * 100)
      : 0

    await addContribution(goal.id, amount, note)
    toast.success(`${formatCurrency(amount, goal.currency)} added`)

    if (before < 100 && projected >= 100) {
      setCelebrationMessage(`You reached your ${goal.name} goal!`)
    }
  }

  return (
    <>
      <PageHeader title="Home">
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
        <button
          type="button"
          onClick={openCreateForm}
          className="btn-secondary hidden px-3 lg:inline-flex"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New goal
        </button>
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
            <div className="card animate-pulse space-y-4 p-4">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i}>
                  <div className="mb-2 flex justify-between">
                    <div className="h-4 w-1/3 rounded bg-slate-200" />
                    <div className="h-4 w-16 rounded bg-slate-100" />
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100" />
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
                Create a savings goal and track progress alongside your transactions.
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
            <GoalsProgressBars
              goals={goals}
              preferredCurrency={profile?.default_currency ?? 'INR'}
              onGoalClick={setDetailGoal}
            />
          )}
        </section>

        <TransactionsPage isTabActive={isTabActive} embedded />
      </main>

      {isTabActive && !loading && goals.length > 0 && (
        <button
          type="button"
          onClick={openCreateForm}
          aria-label="New goal"
          className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] left-4 z-[60] flex h-12 w-12 min-h-11 min-w-11 touch-manipulation items-center justify-center rounded-full bg-white text-brand-600 shadow-fab ring-1 ring-slate-200 transition hover:bg-slate-50 active:scale-95 sm:left-6 lg:hidden"
        >
          <Target className="h-5 w-5" aria-hidden="true" />
        </button>
      )}

      {isTabActive && (
        <GoalForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          goal={editingGoal}
          createGoal={handleCreateGoal}
          updateGoal={handleUpdateGoal}
          onError={(message) => toast.error(message)}
        />
      )}

      {isTabActive && detailGoal && (
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

      {isTabActive && (
        <AddMoneyModal
          open={Boolean(addMoneyGoal)}
          onClose={() => setAddMoneyGoal(null)}
          goal={addMoneyGoal}
          defaultCurrency={profile?.default_currency ?? 'INR'}
          onSubmit={handleAddMoney}
          onError={(message) => toast.error(message)}
        />
      )}

      {isTabActive && celebrationMessage && (
        <Celebration
          message={celebrationMessage}
          onDone={() => setCelebrationMessage(null)}
        />
      )}
    </>
  )
}
