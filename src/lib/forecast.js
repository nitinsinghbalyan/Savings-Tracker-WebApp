import {
  addMonths,
  differenceInCalendarMonths,
  format,
  parseISO,
  startOfDay,
  subMonths,
} from 'date-fns'
import { percentComplete, remainingAmount } from './contributions'

export function getForecast(goal, { now = new Date() } = {}) {
  const remaining = remainingAmount(goal)
  const progress = percentComplete(goal)

  if (remaining <= 0 || progress >= 100) {
    return {
      complete: true,
      monthlyPace: 0,
      estimatedDate: null,
      monthsToComplete: 0,
      deadlineComparison: null,
      label: 'Goal complete',
    }
  }

  if (!goal.end_date) {
    return {
      complete: false,
      monthlyPace: 0,
      estimatedDate: null,
      monthsToComplete: null,
      deadlineComparison: null,
      label: null,
    }
  }

  const contributions = goal.contributions ?? []
  const threeMonthsAgo = subMonths(startOfDay(now), 3)
  let recentTotal = 0

  for (const contribution of contributions) {
    if (!contribution.created_at) continue
    const date = parseISO(contribution.created_at)
    if (date >= threeMonthsAgo) {
      recentTotal += Number(contribution.amount) || 0
    }
  }

  const monthlyPace = recentTotal / 3

  if (monthlyPace <= 0) {
    return {
      complete: false,
      monthlyPace: 0,
      estimatedDate: null,
      monthsToComplete: null,
      deadlineComparison: null,
      label: 'No recent contributions',
    }
  }

  const monthsToComplete = Math.ceil(remaining / monthlyPace)
  const estimatedDate = addMonths(startOfDay(now), monthsToComplete)
  const endDate = startOfDay(parseISO(goal.end_date))
  const monthsDiff = differenceInCalendarMonths(endDate, estimatedDate)

  const deadlineComparison = {
    monthsEarly: monthsDiff > 0 ? monthsDiff : 0,
    monthsLate: monthsDiff < 0 ? Math.abs(monthsDiff) : 0,
    onTime: monthsDiff === 0,
  }

  const dateLabel = format(estimatedDate, 'MMM yyyy')
  let timingSuffix
  if (deadlineComparison.monthsEarly > 0) {
    const n = deadlineComparison.monthsEarly
    timingSuffix = ` — ${n} month${n === 1 ? '' : 's'} early`
  } else if (deadlineComparison.monthsLate > 0) {
    const n = deadlineComparison.monthsLate
    timingSuffix = ` — ${n} month${n === 1 ? '' : 's'} late`
  } else {
    timingSuffix = ' — on time'
  }

  return {
    complete: false,
    monthlyPace,
    estimatedDate,
    monthsToComplete,
    deadlineComparison,
    label: `At your pace, done by ${dateLabel}${timingSuffix}`,
  }
}
