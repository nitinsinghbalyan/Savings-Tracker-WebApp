import { memo, useMemo, useState } from 'react'
import { ChevronDown, Pencil, Plus, Tag, Trash2 } from 'lucide-react'
import {
  percentComplete,
  remainingAmount,
  savedAmount,
} from '../lib/contributions'
import { formatCurrency } from '../lib/format'
import { getColorPalette } from '../lib/constants'
import {
  formatContributionDate,
  formatDaysRemaining,
  getDaysRemaining,
  getRequiredMonthly,
  sortedContributions,
} from '../lib/goalDisplay'
import { getForecast } from '../lib/forecast'

function stopCardClick(event) {
  event.stopPropagation()
}

function GoalCard({
  goal,
  compact = false,
  onOpenDetails,
  onAddMoney,
  onEdit,
  onDelete,
  onDeleteContribution,
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [contributionsOpen, setContributionsOpen] = useState(false)
  const [confirmingContributionId, setConfirmingContributionId] = useState(null)
  const [deletingContributionId, setDeletingContributionId] = useState(null)

  const contributions = useMemo(() => sortedContributions(goal), [goal])
  const saved = useMemo(() => savedAmount(goal), [goal])
  const target = Number(goal.target_amount)
  const remaining = useMemo(() => remainingAmount(goal), [goal])
  const progress = useMemo(() => percentComplete(goal), [goal])
  const requiredMonthly = useMemo(() => getRequiredMonthly(goal), [goal])
  const forecast = useMemo(() => getForecast(goal), [goal])
  const daysLeft = useMemo(() => getDaysRemaining(goal.end_date), [goal.end_date])
  const palette = useMemo(() => getColorPalette(goal.color), [goal.color])
  const currency = goal.currency ?? 'INR'

  const handleDelete = async (event) => {
    event.stopPropagation()

    if (!confirmingDelete) {
      setConfirmingDelete(true)
      return
    }

    setDeleting(true)
    try {
      await onDelete(goal.id)
    } finally {
      setDeleting(false)
      setConfirmingDelete(false)
    }
  }

  const handleDeleteContribution = async (contributionId) => {
    if (confirmingContributionId !== contributionId) {
      setConfirmingContributionId(contributionId)
      return
    }

    setDeletingContributionId(contributionId)
    try {
      await onDeleteContribution(contributionId)
      setConfirmingContributionId(null)
    } finally {
      setDeletingContributionId(null)
    }
  }

  return (
    <article
      onClick={() => onOpenDetails?.(goal)}
      className="min-w-0 cursor-pointer overflow-hidden rounded-xl border border-ink-rule bg-paper-card transition hover:shadow-card"
    >
      {/* 3px goal-colour edge from artboard 1e, replacing the left stripe. */}
      <div className="h-[3px]" style={{ background: palette.fill }} aria-hidden="true" />
      <div className={compact ? 'p-3.5' : 'p-4 sm:p-[18px]'}>
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className={`truncate font-medium text-ink ${compact ? 'text-[13.5px]' : 'text-base'}`}>
            {goal.name}
          </h3>
          {!compact && goal.category && (
            <p className="mt-1 flex min-w-0 items-center gap-1.5 text-sm text-slate-500">
              <Tag className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{goal.category}</span>
            </p>
          )}
        </div>
        <span
          className={`n shrink-0 rounded-[5px] px-1.5 py-[3px] text-[11px] ${
            daysLeft < 0
              ? 'bg-negative-tint text-negative'
              : daysLeft <= 7
                ? 'bg-[#F6E2E6] text-[#8E2340]'
                : 'text-ink-faint'
          }`}
        >
          {formatDaysRemaining(daysLeft)}
        </span>
      </header>

      <div className={compact ? 'mt-3' : 'mt-4'}>
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <p className={`n min-w-0 truncate font-medium text-ink ${compact ? 'text-base' : 'text-lg'}`}>
            {formatCurrency(saved, currency)}{' '}
            <span className="n text-[11px] font-normal text-ink-faint">of {formatCurrency(target, currency)}</span>
          </p>
          <p className="n shrink-0 text-[11px] text-ink-soft">
            {Math.round(progress)}%
          </p>
        </div>

        <div
          className={`overflow-hidden rounded-full bg-paper-line ${compact ? 'h-1.5' : 'h-2'}`}
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${goal.name} progress`}
        >
          <div
            className={`h-full rounded-full transition-all duration-300 ${palette.bar}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {remaining > 0 && !compact && (
        <p className="mt-3 text-sm text-slate-600">
          Save{' '}
          <span className="font-semibold text-slate-900">
            {formatCurrency(requiredMonthly, currency)}/month
          </span>{' '}
          to stay on track
        </p>
      )}

      {forecast?.label && !forecast.complete && !compact && (
        <p className="mt-1 text-sm text-slate-500">{forecast.label}</p>
      )}

      <div className={`flex items-center gap-2 ${compact ? 'mt-3' : 'mt-4'}`} onClick={stopCardClick}>
        <button
          type="button"
          onClick={() => {
            setConfirmingDelete(false)
            onAddMoney(goal)
          }}
          className={`btn-primary min-w-0 flex-1 ${compact ? 'px-2 py-2 text-xs' : ''}`}
        >
          <Plus className={`${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} aria-hidden="true" />
          {compact ? 'Add' : 'Add money'}
        </button>

        <button
          type="button"
          onClick={() => {
            setConfirmingDelete(false)
            onEdit(goal)
          }}
          aria-label="Edit goal"
          className="btn-icon shrink-0 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          aria-label={
            deleting
              ? 'Deleting goal'
              : confirmingDelete
                ? 'Confirm delete goal'
                : 'Delete goal'
          }
          className={`btn-icon shrink-0 rounded-xl disabled:opacity-60 ${
            confirmingDelete
              ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
              : 'text-rose-600 hover:bg-rose-50 hover:text-rose-700'
          }`}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {confirmingDelete && !deleting && !compact && (
        <p className="mt-2 text-center text-xs text-slate-500" onClick={stopCardClick}>
          Tap the <span className="font-medium text-rose-600">delete icon</span> again to remove this goal.
        </p>
      )}

      {!compact && (
      <div className="mt-4 border-t border-slate-100 pt-3" onClick={stopCardClick}>
        <button
          type="button"
          onClick={() => {
            setConfirmingContributionId(null)
            setContributionsOpen((open) => !open)
          }}
          className="flex min-h-11 w-full items-center justify-between gap-2 rounded-xl px-1 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          aria-expanded={contributionsOpen}
        >
          <span className="truncate">
            Recent contributions
            {contributions.length > 0 && (
              <span className="ml-1.5 font-normal text-slate-400">({contributions.length})</span>
            )}
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${contributionsOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>

        {contributionsOpen && (
          <div className="mt-2 space-y-2">
            {contributions.length === 0 ? (
              <p className="rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-500">
                No contributions yet. Tap Add money to get started.
              </p>
            ) : (
              contributions.map((contribution) => {
                const isConfirming = confirmingContributionId === contribution.id
                const isDeleting = deletingContributionId === contribution.id

                return (
                  <div
                    key={contribution.id}
                    className="flex min-w-0 items-start gap-2 rounded-xl bg-slate-50 px-3 py-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900">
                        {formatCurrency(contribution.amount, currency)}
                      </p>
                      <p className="mt-0.5 truncate text-sm text-slate-600">
                        {contribution.note || '—'}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {formatContributionDate(contribution.created_at)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteContribution(contribution.id)}
                      disabled={isDeleting}
                      aria-label={
                        isConfirming ? 'Confirm delete contribution' : 'Delete contribution'
                      }
                      className={`btn-icon shrink-0 rounded-lg ${
                        isConfirming
                          ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                          : 'text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                      }`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
      )}
      </div>
    </article>
  )
}

export default memo(GoalCard)
