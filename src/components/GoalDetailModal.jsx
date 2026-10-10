import { useId, useState } from 'react'
import { CircleCheck, Pencil, Plus, Trash2, X } from 'lucide-react'
import { format } from 'date-fns'
import {
  percentComplete,
  remainingAmount,
  savedAmount,
} from '../lib/contributions'
import { formatCurrency } from '../lib/format'
import { getColorPalette, PRIORITIES } from '../lib/constants'
import {
  formatContributionDate,
  formatDaysRemaining,
  formatGoalDate,
  getDaysRemaining,
  getRequiredMonthly,
  getTrackStatus,
  sortedContributions,
} from '../lib/goalDisplay'
import { getForecast } from '../lib/forecast'
import { buildFundingByMonth, goalCompletedAt, isGoalComplete } from '../lib/goalSummary'
import CategoryIcon from './CategoryIcon'
import FundingByMonth from './FundingByMonth'
import ModalShell from './ModalShell'

function DetailRow({ label, hint, hintClassName = 'text-ink-faint', children }) {
  return (
    <div className="min-w-0 rounded-xl bg-paper-sunk px-3 py-2.5">
      <p className="text-xs text-ink-soft">{label}</p>
      <div className="n mt-0.5 truncate text-sm font-semibold text-ink">{children}</div>
      {hint && <p className={`mt-0.5 truncate text-[11px] ${hintClassName}`}>{hint}</p>}
    </div>
  )
}

export default function GoalDetailModal({
  open,
  onClose,
  goal,
  onAddMoney,
  onEdit,
  onDelete,
  onDeleteContribution,
}) {
  const titleId = useId()
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const [confirmingContributionId, setConfirmingContributionId] = useState(null)
  const [deletingContributionId, setDeletingContributionId] = useState(null)

  if (!open || !goal) return null

  const contributions = sortedContributions(goal)
  const saved = savedAmount(goal)
  const target = Number(goal.target_amount)
  const remaining = remainingAmount(goal)
  const progress = percentComplete(goal)
  const trackStatus = getTrackStatus(goal)
  const requiredMonthly = getRequiredMonthly(goal)
  const forecast = getForecast(goal)
  // Artboard 1d "Funding by month" — buckets the contributions already loaded
  // with the goal; no fetch.
  const funding = buildFundingByMonth(goal)
  const daysLeft = getDaysRemaining(goal.end_date)
  const priorityStyle =
    PRIORITIES.find((p) => p.value === goal.priority)?.badge ??
    PRIORITIES.find((p) => p.value === 'medium').badge
  const palette = getColorPalette(goal.color)
  const currency = goal.currency ?? 'INR'
  const complete = isGoalComplete(goal)
  const completedAt = complete ? goalCompletedAt(goal) : null
  const forecastValue = complete
    ? 'Complete'
    : forecast?.estimatedDate
      ? format(forecast.estimatedDate, 'MMM yyyy')
      : '—'
  const forecastHint = complete
    ? completedAt
      ? `Reached ${formatContributionDate(completedAt)}`
      : null
    : forecast?.deadlineComparison
      ? forecast.deadlineComparison.monthsLate > 0
        ? `${forecast.deadlineComparison.monthsLate} mo late`
        : forecast.deadlineComparison.monthsEarly > 0
          ? `${forecast.deadlineComparison.monthsEarly} mo early`
          : 'On time'
      : (forecast?.label ?? null)

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Delete “${goal.name}” and all its contributions? This cannot be undone.`,
      )
    ) {
      return
    }

    setDeleting(true)
    setDeleteError(null)
    try {
      await onDelete(goal.id)
      onClose()
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete goal')
    } finally {
      setDeleting(false)
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
    <ModalShell open={open} onClose={onClose} closeDisabled={deleting}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-modal-panel
        className="modal-panel max-h-[min(90dvh,720px)] max-w-lg overflow-hidden rounded-t-2xl shadow-2xl lg:max-w-2xl lg:rounded-2xl"
      >
        {/* Goal colour as a 3px top edge — the same treatment as the card. */}
        <div className="h-[3px] shrink-0" style={{ background: palette.fill }} aria-hidden="true" />
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-ink-hairline px-4 py-3 sm:px-6">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="truncate text-lg font-semibold text-ink">
              {goal.name}
            </h2>
            {goal.category && (
              <p className="mt-1 flex min-w-0 items-center gap-1.5 text-sm text-ink-soft">
                <CategoryIcon category={{ name: goal.category }} className="h-3.5 w-3.5" />
                <span className="truncate">{goal.category}</span>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            aria-label="Close"
            className="btn-icon shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div data-modal-scroll className="modal-scroll px-4 py-4 sm:px-6">
          <div className="flex flex-wrap gap-1.5">
            {complete ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-positive-tint px-2.5 py-1 text-xs font-semibold text-positive ring-1 ring-inset ring-positive/30">
                <CircleCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Completed
              </span>
            ) : (
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${trackStatus.className}`}
              >
                {trackStatus.label}
              </span>
            )}
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${priorityStyle}`}
            >
              {goal.priority}
            </span>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <p className="min-w-0 truncate text-sm font-medium text-ink">
                {formatCurrency(saved, currency)}{' '}
                <span className="font-normal text-ink-faint">
                  of {formatCurrency(target, currency)}
                </span>
              </p>
              <p className="shrink-0 text-sm font-semibold text-ink">
                {Math.round(progress)}%
              </p>
            </div>
            <div
              className="h-3 overflow-hidden rounded-full bg-paper-line"
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${goal.name} progress`}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, background: palette.fill }}
              />
            </div>
          </div>

          {/* Each fact once: the old grid repeated the due date three times and
              the monthly target twice. */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <DetailRow label="Saved">{formatCurrency(saved, currency)}</DetailRow>
            <DetailRow label="Remaining">{formatCurrency(remaining, currency)}</DetailRow>
            <DetailRow label="Target">{formatCurrency(target, currency)}</DetailRow>
            <DetailRow
              label="Due"
              hint={complete ? null : formatDaysRemaining(daysLeft)}
              hintClassName={daysLeft < 0 ? 'text-negative' : 'text-ink-faint'}
            >
              {formatGoalDate(goal.end_date)}
            </DetailRow>
            <DetailRow label="Needed monthly" hint={remaining > 0 ? 'to finish on time' : null}>
              {remaining > 0 ? `${formatCurrency(requiredMonthly, currency)}/mo` : '—'}
            </DetailRow>
            <DetailRow
              label="Forecast"
              hint={forecastHint}
              hintClassName={
                forecast?.deadlineComparison?.monthsLate > 0 ? 'text-negative' : 'text-ink-faint'
              }
            >
              {forecastValue}
            </DetailRow>
          </div>

          <div className="mt-5">
            <FundingByMonth
              funding={funding}
              currency={currency}
              pace={complete ? null : forecast?.monthlyPace}
            />
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-ink">
              Contributions
              {contributions.length > 0 && (
                <span className="ml-1.5 font-normal text-ink-faint">
                  ({contributions.length})
                </span>
              )}
            </h3>
            <div className="mt-2 space-y-2">
              {contributions.length === 0 ? (
                <p className="rounded-xl bg-paper-sunk px-3 py-3 text-sm text-ink-soft">
                  No contributions yet.
                </p>
              ) : (
                contributions.map((contribution) => {
                  const isConfirming = confirmingContributionId === contribution.id
                  const isDeleting = deletingContributionId === contribution.id

                  return (
                    <div
                      key={contribution.id}
                      className="flex min-w-0 items-start gap-2 rounded-xl bg-paper-sunk px-3 py-2.5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-ink">
                          {formatCurrency(contribution.amount, currency)}
                        </p>
                        <p className="mt-0.5 truncate text-sm text-ink-muted">
                          {contribution.note || '—'}
                        </p>
                        <p className="mt-0.5 text-xs text-ink-faint">
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
                            ? 'bg-negative-tint text-negative ring-1 ring-negative/40'
                            : 'text-negative hover:bg-negative-tint'
                        }`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-ink-hairline px-4 py-4 safe-bottom sm:px-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose()
                onAddMoney(goal)
              }}
              className="btn-primary min-w-0 flex-1"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add money
            </button>
            <button
              type="button"
              onClick={() => {
                onClose()
                onEdit(goal)
              }}
              aria-label="Edit goal"
              className="btn-icon shrink-0 rounded-xl text-ink-muted hover:bg-paper-line hover:text-ink"
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              aria-label={deleting ? 'Deleting goal' : 'Delete goal'}
              className="btn-icon shrink-0 rounded-xl text-negative hover:bg-negative-tint disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          {deleteError && (
            <p role="alert" className="mt-2 text-center text-xs text-negative">
              {deleteError}
            </p>
          )}
        </div>
      </div>
    </ModalShell>
  )
}
