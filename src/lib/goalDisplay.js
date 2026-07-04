import {
  differenceInCalendarDays,
  differenceInCalendarMonths,
  format,
  parseISO,
  startOfDay,
} from 'date-fns'
import { percentComplete, remainingAmount } from './contributions'

export const TRACK_STATUS = {
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

export function getTrackStatus(goal) {
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

export function getRequiredMonthly(goal) {
  const remaining = remainingAmount(goal)
  if (remaining <= 0) return 0
  return remaining / getMonthsRemaining(goal.end_date)
}

export function getDaysRemaining(endDate) {
  const today = startOfDay(new Date())
  const end = startOfDay(parseISO(endDate))
  return differenceInCalendarDays(end, today)
}

export function formatGoalDate(date) {
  return format(parseISO(date), 'd MMM yyyy')
}

export function formatDaysRemaining(days) {
  if (days < 0) return `${Math.abs(days)} days overdue`
  if (days === 0) return 'Due today'
  if (days === 1) return '1 day left'
  return `${days} days left`
}

export function formatContributionDate(createdAt) {
  return format(parseISO(createdAt), 'd MMM yyyy')
}

export function sortedContributions(goal) {
  return [...(goal.contributions ?? [])].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at),
  )
}
