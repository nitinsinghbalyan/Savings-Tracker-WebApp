import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  format,
  parseISO,
  startOfDay,
} from 'date-fns'
import { supabase } from './supabase'
import { requireUserId } from './auth'
import { assertNoError } from './errors'
import { createTransaction } from './transactions'

const MAX_CATCH_UP = 12

export function computeInitialNextRunDate({ startDate, frequency, intervalCount = 1, dayOfMonth }) {
  const start = startOfDay(parseISO(startDate))
  const today = startOfDay(new Date())

  if (start >= today) {
    return format(start, 'yyyy-MM-dd')
  }

  let next = start
  let guard = 0
  while (next < today && guard < 500) {
    next = advanceNextRunDate(next, frequency, intervalCount, dayOfMonth)
    guard++
  }
  return format(next, 'yyyy-MM-dd')
}

export function advanceNextRunDate(fromDateStr, frequency, intervalCount = 1, dayOfMonth) {
  const from = parseISO(fromDateStr)
  let next

  switch (frequency) {
    case 'daily':
      next = addDays(from, intervalCount)
      break
    case 'weekly':
      next = addWeeks(from, intervalCount)
      break
    case 'monthly':
      next = addMonths(from, intervalCount)
      if (dayOfMonth) {
        const daysInMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()
        next = new Date(next.getFullYear(), next.getMonth(), Math.min(dayOfMonth, daysInMonth))
      }
      break
    case 'yearly':
      next = addYears(from, intervalCount)
      break
    default:
      next = addMonths(from, intervalCount)
  }

  return format(startOfDay(next), 'yyyy-MM-dd')
}

export async function getRecurringTransactions() {
  const userId = await requireUserId()
  const { data, error } = await supabase
    .from('recurring_transactions')
    .select(
      '*, account:accounts!recurring_transactions_account_id_fkey(id, name, currency), category:categories(id, name, kind, color), transfer_to:accounts!recurring_transactions_transfer_to_account_id_fkey(id, name, currency)',
    )
    .eq('user_id', userId)
    .order('next_run_date', { ascending: true })

  assertNoError(error, 'Failed to load recurring transactions')
  return data ?? []
}

export async function createRecurringTransaction(data) {
  const userId = await requireUserId()
  const frequency = data.frequency ?? 'monthly'
  const intervalCount = Math.max(1, Number(data.interval_count) || 1)
  const startDate = data.start_date
  const dayOfMonth =
    frequency === 'monthly' ? Number(data.day_of_month) || parseISO(startDate).getDate() : null

  const nextRunDate = computeInitialNextRunDate({
    startDate,
    frequency,
    intervalCount,
    dayOfMonth,
  })

  const { data: row, error } = await supabase
    .from('recurring_transactions')
    .insert({
      user_id: userId,
      account_id: data.account_id,
      category_id: data.type === 'transfer' ? null : data.category_id ?? null,
      type: data.type,
      amount: Number(data.amount),
      transfer_to_account_id: data.type === 'transfer' ? data.transfer_to_account_id : null,
      note: data.note ?? null,
      frequency,
      interval_count: intervalCount,
      day_of_month: dayOfMonth,
      start_date: startDate,
      end_date: data.end_date ?? null,
      next_run_date: nextRunDate,
      is_paused: Boolean(data.is_paused),
    })
    .select()
    .single()

  assertNoError(error, 'Failed to create recurring transaction')
  return row
}

export async function updateRecurringTransaction(id, patch) {
  const userId = await requireUserId()
  const safePatch = { ...patch }
  delete safePatch.user_id
  delete safePatch.id
  delete safePatch.created_at

  const { data, error } = await supabase
    .from('recurring_transactions')
    .update(safePatch)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  assertNoError(error, 'Failed to update recurring transaction')
  return data
}

export async function deleteRecurringTransaction(id) {
  const userId = await requireUserId()
  const { error } = await supabase
    .from('recurring_transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  assertNoError(error, 'Failed to delete recurring transaction')
}

export async function skipNextOccurrence(id) {
  return updateRecurringTransaction(id, { skip_next: true })
}

async function materializeRule(rule, upTo) {
  const upToDate = upTo ?? format(new Date(), 'yyyy-MM-dd')
  let posted = 0
  let current = { ...rule }
  let iterations = 0

  while (
    !current.is_paused &&
    current.next_run_date <= upToDate &&
    iterations < MAX_CATCH_UP &&
    (!current.end_date || current.next_run_date <= current.end_date)
  ) {
    iterations++

    if (current.skip_next) {
      current = await updateRecurringTransaction(current.id, {
        skip_next: false,
        next_run_date: advanceNextRunDate(
          current.next_run_date,
          current.frequency,
          current.interval_count,
          current.day_of_month,
        ),
      })
      continue
    }

    const tx = await createTransaction({
      account_id: current.account_id,
      category_id: current.category_id,
      type: current.type,
      amount: current.amount,
      transfer_to_account_id: current.transfer_to_account_id,
      note: current.note,
      transaction_date: current.next_run_date,
      recurring_id: current.id,
    })

    if (!tx) break

    posted++

    current = await updateRecurringTransaction(current.id, {
      next_run_date: advanceNextRunDate(
        current.next_run_date,
        current.frequency,
        current.interval_count,
        current.day_of_month,
      ),
      last_generated_at: new Date().toISOString(),
    })
  }

  return posted
}

export async function deleteAllRecurringTransactions() {
  const userId = await requireUserId()
  const { error } = await supabase.from('recurring_transactions').delete().eq('user_id', userId)
  assertNoError(error, 'Failed to clear recurring transactions')
}

export async function processDueRecurring({ upTo } = {}) {
  const upToDate = upTo ?? format(new Date(), 'yyyy-MM-dd')
  const rules = await getRecurringTransactions()
  let totalPosted = 0

  for (const rule of rules) {
    if (rule.is_paused) continue
    if (rule.next_run_date > upToDate) continue
    if (rule.end_date && rule.next_run_date > rule.end_date) continue
    totalPosted += await materializeRule(rule, upToDate)
  }

  return totalPosted
}
