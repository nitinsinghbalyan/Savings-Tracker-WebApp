import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { useNetWorth } from '../hooks/useNetWorth'
import { useTransactions } from '../hooks/useTransactions'
import NetWorthHeadline from '../components/netWorth/NetWorthHeadline'
import NetWorthTrend from '../components/netWorth/NetWorthTrend'
import TargetCard from '../components/netWorth/TargetCard'
import HoldingGroupSection from '../components/netWorth/HoldingGroupSection'
import HoldingForm from '../components/netWorth/HoldingForm'
import ContributionPlanSection from '../components/netWorth/ContributionPlanSection'

export default function NetWorthPage({ isTabActive = true }) {
  const { user, authReady } = useAuth()
  const { profile } = useProfile({ enabled: Boolean(user) && authReady })

  const dataReady = Boolean(user) && authReady

  // Hooks first, derived values after. A useMemo hoisted above the hook it
  // reads throws on every render and blanks the screen — see error-history.md.
  const {
    snapshots,
    plans,
    summaries,
    summary,
    target,
    holdings,
    migrationPending,
    loading,
    error,
    createHolding,
    updateHolding,
    deleteHolding,
    saveTarget,
  } = useNetWorth({ enabled: dataReady && isTabActive })

  const now = new Date()
  const monthStartDay = profile?.month_start_day ?? 1

  // Read-only reuse of the month the Summary tab has usually already cached.
  const { transactions } = useTransactions({
    enabled: dataReady && isTabActive && plans.length > 0,
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    monthStartDay,
  })

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [defaultGroup, setDefaultGroup] = useState('large_fixed')

  const excludedCount = useMemo(
    () => holdings.filter((h) => !h.is_archived && h.excluded_from_target).length,
    [holdings],
  )

  const openAdd = (group) => {
    setEditing(null)
    setDefaultGroup(group ?? 'large_fixed')
    setFormOpen(true)
  }

  const openEdit = (holding) => {
    setEditing(holding)
    setDefaultGroup(holding.holding_group)
    setFormOpen(true)
  }

  const submitHolding = (data) =>
    editing ? updateHolding(editing.id, data) : createHolding(data)

  return (
    <>
      <PageHeader title="Worth" subtitle="Assets, liabilities and net worth">
        <button
          type="button"
          onClick={() => openAdd()}
          className="flex h-9 items-center gap-1.5 rounded-lg bg-accent px-3 text-[13px] font-medium text-white transition hover:bg-accent-hover"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add
        </button>
      </PageHeader>

      <main className="page-container space-y-5">
        {error && (
          <p className="rounded-xl border border-negative/25 bg-negative-tint px-4 py-3 text-[12.5px] text-negative">
            {error}
          </p>
        )}

        {migrationPending && (
          <p className="rounded-xl border border-ink-rule bg-paper-card px-4 py-3 text-[12.5px] text-ink-muted">
            Showing account balances only. Run{' '}
            <code className="rounded bg-paper-sunk px-1 py-0.5 text-[11.5px]">add_net_worth.sql</code>{' '}
            in Supabase to track investments and personal items too.
          </p>
        )}

        {loading && !summary ? (
          <div className="space-y-4" aria-busy="true" aria-label="Loading net worth">
            <div className="h-32 animate-pulse rounded-xl bg-paper-card" />
            <div className="h-24 animate-pulse rounded-xl bg-paper-card" />
          </div>
        ) : (
          summaries.map((entry) => (
            <div key={entry.currency} className="space-y-5">
              {summaries.length > 1 && (
                <p className="text-[10px] font-medium uppercase tracking-[.1em] text-ink-faint">
                  {entry.currency}
                </p>
              )}

              <NetWorthHeadline summary={entry} />

              {entry.currency === summary?.currency && (
                <>
                  <TargetCard
                    target={target}
                    currency={entry.currency}
                    excludedCount={excludedCount}
                    onSave={saveTarget}
                  />
                  <NetWorthTrend snapshots={snapshots} currency={entry.currency} />
                </>
              )}

              {entry.groups.map((group) => (
                <HoldingGroupSection
                  key={group.key}
                  group={group}
                  currency={entry.currency}
                  onAdd={migrationPending ? undefined : openAdd}
                  onEdit={openEdit}
                />
              ))}

              {entry.currency === summary?.currency && (
                <ContributionPlanSection
                  plans={plans}
                  transactions={transactions}
                  currency={entry.currency}
                />
              )}
            </div>
          ))
        )}
      </main>

      {isTabActive && formOpen && (
        <HoldingForm
          key={editing?.id ?? `new-${defaultGroup}`}
          open
          holding={editing}
          defaultGroup={defaultGroup}
          defaultCurrency={profile?.default_currency ?? 'INR'}
          onClose={() => setFormOpen(false)}
          onSubmit={submitHolding}
          onDelete={deleteHolding}
        />
      )}
    </>
  )
}
