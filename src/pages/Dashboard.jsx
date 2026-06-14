import { useMemo, useState } from 'react'
import { Plus, Target } from 'lucide-react'
import { percentComplete, savedAmount } from '../lib/contributions'
import { formatCurrency, formatCurrencyCompact } from '../lib/format'
import { useGoals } from '../hooks/useGoals'
import { useToast } from '../hooks/useToast'
import GoalCard from '../components/GoalCard'
import GoalForm from '../components/GoalForm'
import AddMoneyModal from '../components/AddMoneyModal'
import Celebration from '../components/Celebration'

export default function Dashboard() {
  const toast = useToast()
  const {
    goals,
    loading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    addContribution,
    deleteContribution,
  } = useGoals()

  const [formOpen, setFormOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [addMoneyGoal, setAddMoneyGoal] = useState(null)
  const [celebrationMessage, setCelebrationMessage] = useState(null)

  const totalsByCurrency = useMemo(() => {
    const map = {}
    for (const goal of goals) {
      const currency = goal.currency ?? 'INR'
      if (!map[currency]) {
        map[currency] = { saved: 0, target: 0 }
      }
      map[currency].saved += savedAmount(goal)
      map[currency].target += Number(goal.target_amount)
    }
    return Object.entries(map).map(([currency, { saved, target }]) => ({
      currency,
      saved,
      target,
      percent: target > 0 ? Math.min(100, (saved / target) * 100) : 0,
    }))
  }, [goals])

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
    <div className="min-h-dvh bg-slate-50 pb-28">
      <header className="safe-top sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto max-w-app px-4 py-4">
          <h1 className="truncate text-xl font-bold text-slate-900">Savings Tracker</h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-app space-y-6 px-4 py-6">
        {!loading && goals.length > 0 && (
          <section className="card space-y-4">
            <p className="text-sm font-medium text-slate-500">Overall progress</p>
            {totalsByCurrency.map(({ currency, saved, target, percent }) => (
              <div key={currency}>
                {totalsByCurrency.length > 1 && (
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {currency}
                  </p>
                )}
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-xl font-bold text-slate-900 sm:text-2xl">
                    <span className="sm:hidden">{formatCurrencyCompact(saved, currency)}</span>
                    <span className="hidden sm:inline">{formatCurrency(saved, currency)}</span>
                    <span className="ml-1 text-sm font-normal text-slate-400 sm:text-base">
                      of{' '}
                      <span className="sm:hidden">{formatCurrencyCompact(target, currency)}</span>
                      <span className="hidden sm:inline">{formatCurrency(target, currency)}</span>
                    </span>
                  </p>
                  <p className="text-base font-semibold text-brand-600 sm:text-lg">
                    {Math.round(percent)}%
                  </p>
                </div>
                <div
                  className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100"
                  role="progressbar"
                  aria-valuenow={Math.round(percent)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Overall savings progress (${currency})`}
                >
                  <div
                    className="h-full rounded-full bg-brand-600 transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            ))}
          </section>
        )}

        {error && (
          <p role="alert" className="alert-error">
            {error}
          </p>
        )}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-5 w-2/3 rounded bg-slate-200" />
                <div className="mt-3 h-4 w-1/2 rounded bg-slate-100" />
                <div className="mt-4 h-3 w-full rounded-full bg-slate-100" />
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="h-14 rounded-xl bg-slate-100" />
                  <div className="h-14 rounded-xl bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : goals.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-12 text-center sm:px-6">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <Target className="h-7 w-7" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">No goals yet</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
              Create your first savings goal and start tracking contributions toward what matters
              to you.
            </p>
            <button type="button" onClick={openCreateForm} className="btn-primary mt-6 px-5">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create your first goal
            </button>
          </section>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onAddMoney={setAddMoneyGoal}
                onEdit={openEditForm}
                onDelete={handleDeleteGoal}
                onDeleteContribution={handleDeleteContribution}
              />
            ))}
          </div>
        )}
      </main>

      {!loading && goals.length > 0 && (
        <button
          type="button"
          onClick={openCreateForm}
          aria-label="New goal"
          className="fixed bottom-6 right-4 z-40 flex h-14 w-14 min-h-11 min-w-11 items-center justify-center rounded-full bg-brand-600 text-white shadow-fab transition hover:bg-brand-700 active:scale-95 sm:right-6"
          style={{ marginBottom: 'max(0px, env(safe-area-inset-bottom))' }}
        >
          <Plus className="h-6 w-6" aria-hidden="true" />
        </button>
      )}

      <GoalForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        goal={editingGoal}
        createGoal={handleCreateGoal}
        updateGoal={handleUpdateGoal}
        onError={(message) => toast.error(message)}
      />

      <AddMoneyModal
        open={Boolean(addMoneyGoal)}
        onClose={() => setAddMoneyGoal(null)}
        goal={addMoneyGoal}
        onSubmit={handleAddMoney}
        onError={(message) => toast.error(message)}
      />

      {celebrationMessage && (
        <Celebration
          message={celebrationMessage}
          onDone={() => setCelebrationMessage(null)}
        />
      )}
    </div>
  )
}
