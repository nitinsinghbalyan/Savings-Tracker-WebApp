import { useState } from 'react'
import {
  differenceInCalendarDays,
  differenceInCalendarMonths,
  format,
  parseISO,
  startOfDay,
} from 'date-fns'
import { Calendar, ChevronDown, Pencil, Plus, Tag, Trash2 } from 'lucide-react'
import {
  percentComplete,
  remainingAmount,
  savedAmount,
} from '../lib/contributions'
import { formatCurrency } from '../lib/format'
import { getColorPalette, PRIORITIES } from '../lib/constants'

const TRACK_STATUS = {
  onTrack: {
    label: 'On track',
    className: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  },
  slightlyBehind: {
    label: 'Slightly behind',
    className: 'bg-amber-100 text-amber-800 ring-amber-200',
  },
  behind: {
    label: 'Behind',
    className: 'bg-rose-100 text-rose-800 ring-rose-200',
  },
}

function expectedProgress(goal) {
  const start = startOfDay(parseISO(goal.start_date))
  const end = startOfDay(parseISO(goal.end_date))
  const today = startOfDay(new Date())

  if (today >= end) return 100
  if (today <= start) return 0

  const totalDays = differenceInCalendarDays(end, start)
  if (totalDays <= 0) return 100

  const elapsedDays = differenceInCalendarDays(today, start)
  return Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100))
}

function getTrackStatus(goal) {
  const actual = percentComplete(goal)
  const expected = expectedProgress(goal)
  const gap = expected - actual

  if (actual >= 100) return TRACK_STATUS.onTrack
  if (actual >= expected || gap <= 5) return TRACK_STATUS.onTrack
  if (gap <= 20) return TRACK_STATUS.slightlyBehind
  return TRACK_STATUS.behind
}

function getMonthsRemaining(endDate) {
  const today = startOfDay(new Date())
  const end = startOfDay(parseISO(endDate))
  return Math.max(1, differenceInCalendarMonths(end, today))
}

function getRequiredMonthly(goal) {
  const remaining = remainingAmount(goal)
  if (remaining <= 0) return 0
  return remaining / getMonthsRemaining(goal.end_date)
}

function getDaysRemaining(endDate) {
  const today = startOfDay(new Date())
  const end = startOfDay(parseISO(endDate))
  return differenceInCalendarDays(end, today)
}

function formatEndDate(endDate) {
  return format(parseISO(endDate), 'd MMM yyyy')
}

function formatDaysRemaining(days) {
  if (days < 0) return `${Math.abs(days)} days overdue`
  if (days === 0) return 'Due today'
  if (days === 1) return '1 day left'
  return `${days} days left`
}

function formatContributionDate(createdAt) {
  return format(parseISO(createdAt), 'd MMM yyyy')
}

function sortedContributions(goal) {
  return [...(goal.contributions ?? [])].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at),
  )
}

export default function GoalCard({
  goal,
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

  const contributions = sortedContributions(goal)
  const saved = savedAmount(goal)
  const target = Number(goal.target_amount)
  const remaining = remainingAmount(goal)
  const progress = percentComplete(goal)
  const trackStatus = getTrackStatus(goal)
  const requiredMonthly = getRequiredMonthly(goal)
  const daysLeft = getDaysRemaining(goal.end_date)
  const priorityStyle =
    PRIORITIES.find((p) => p.value === goal.priority)?.badge ??
    PRIORITIES.find((p) => p.value === 'medium').badge
  const palette = getColorPalette(goal.color)
  const currency = goal.currency ?? 'INR'

  const handleDelete = async () => {
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
    <article className={`card min-w-0 border-l-4 ${palette.border}`}>
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold text-slate-900">{goal.name}</h3>
          {goal.category && (
            <p className="mt-1 flex min-w-0 items-center gap-1.5 text-sm text-slate-500">
              <Tag className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{goal.category}</span>
            </p>
          )}
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${priorityStyle}`}
        >
          {goal.priority}
        </span>
      </header>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <Calendar className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
          <span className="truncate">{formatEndDate(goal.end_date)}</span>
        </span>
        <span
          className={`shrink-0 font-medium ${daysLeft < 0 ? 'text-rose-600' : daysLeft <= 7 ? 'text-amber-700' : 'text-slate-600'}`}
        >
          {formatDaysRemaining(daysLeft)}
        </span>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <p className="min-w-0 truncate text-sm font-medium text-slate-700">
            {formatCurrency(saved, currency)}{' '}
            <span className="font-normal text-slate-400">of {formatCurrency(target, currency)}</span>
          </p>
          <p className="shrink-0 text-sm font-semibold text-slate-700">{Math.round(progress)}%</p>
        </div>

        <div
          className="h-3 overflow-hidden rounded-full bg-slate-100"
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

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="min-w-0 rounded-xl bg-slate-50 px-3 py-2.5">
          <p className="text-xs text-slate-500">Saved</p>
          <p className="mt-0.5 truncate font-semibold text-slate-900">{formatCurrency(saved, currency)}</p>
        </div>
        <div className="min-w-0 rounded-xl bg-slate-50 px-3 py-2.5">
          <p className="text-xs text-slate-500">Remaining</p>
          <p className="mt-0.5 truncate font-semibold text-slate-900">
            {formatCurrency(remaining, currency)}
          </p>
        </div>
      </div>

      {remaining > 0 && (
        <p className="mt-3 text-sm text-slate-600">
          Save{' '}
          <span className="font-semibold text-slate-900">
            {formatCurrency(requiredMonthly, currency)}/month
          </span>{' '}
          to stay on track
        </p>
      )}

      <div className="mt-3">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${trackStatus.className}`}
        >
          {trackStatus.label}
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => {
            setConfirmingDelete(false)
            onAddMoney(goal)
          }}
          className="btn-primary flex-1"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add money
        </button>

        <button
          type="button"
          onClick={() => {
            setConfirmingDelete(false)
            onEdit(goal)
          }}
          className="btn-secondary flex-1"
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
          Edit
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className={`flex-1 ${confirmingDelete ? 'btn-danger' : 'btn-secondary'} disabled:opacity-60`}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          {deleting ? 'Deleting…' : confirmingDelete ? 'Confirm delete' : 'Delete'}
        </button>
      </div>

      {confirmingDelete && !deleting && (
        <p className="mt-2 text-center text-xs text-slate-500">
          Tap <span className="font-medium">Confirm delete</span> again to remove this goal.
        </p>
      )}

      <div className="mt-4 border-t border-slate-100 pt-3">
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
    </article>
  )
}
