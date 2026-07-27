import { format, endOfMonth, parseISO, startOfMonth } from 'date-fns'
import { supabase } from './supabase'
import { requireUserId } from './auth'
import { assertNoError, isMissingGoalLinkColumnError, isMissingSnapshotColumnError } from './errors'
import { fetchCategorySnapshot } from './transactionCategory'
import { deleteContributionsForTransaction } from './contributions'

/** Calendar month bucket used by MonthPicker / getMonthRange for a transaction date */
export function getPeriodForDate(dateStr, monthStartDay = 1) {
  const date = parseISO(dateStr)
  const year = date.getFullYear()
  const calendarMonth = date.getMonth() + 1
  const day = date.getDate()

  if (monthStartDay === 1) {
    return { year, month: calendarMonth }
  }

  if (day >= monthStartDay) {
    return { year, month: calendarMonth }
  }

  if (calendarMonth === 1) {
    return { year: year - 1, month: 12 }
  }

  return { year, month: calendarMonth - 1 }
}

export function transactionMatchesCacheFilters(tx, { type, accountId, year, month, monthStartDay = 1 }) {
  if (!tx || !year || !month) return false
  const { start, end } = getMonthRange(year, month, monthStartDay)
  if (tx.transaction_date < start || tx.transaction_date > end) return false
  if (type && tx.type !== type) return false
  if (accountId && tx.account_id !== accountId) return false
  return true
}

export function getMonthRange(year, month, monthStartDay = 1) {
  const base = new Date(year, month - 1, 1)
  if (monthStartDay === 1) {
    return {
      start: format(startOfMonth(base), 'yyyy-MM-dd'),
      end: format(endOfMonth(base), 'yyyy-MM-dd'),
    }
  }

  const start = new Date(year, month - 1, monthStartDay)
  const end = new Date(year, month, monthStartDay - 1)
  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd'),
  }
}

export async function getTransactions({ startDate, endDate, type, accountId } = {}) {
  const userId = await requireUserId()

  let query = supabase
    .from('transactions')
    .select('*, category:categories(id, name, kind, color, is_savings), account:accounts!transactions_account_id_fkey(id, name, currency), transfer_to:accounts!transactions_transfer_to_account_id_fkey(id, name, currency)')
    .eq('user_id', userId)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (startDate) query = query.gte('transaction_date', startDate)
  if (endDate) query = query.lte('transaction_date', endDate)
  if (type) query = query.eq('type', type)
  if (accountId) query = query.eq('account_id', accountId)

  const { data, error } = await query
  assertNoError(error, 'Failed to load transactions')
  return data ?? []
}

export async function createTransaction(data) {
  const userId = await requireUserId()

  if (data.type === 'transfer') {
    const { data: id, error } = await supabase.rpc('create_transfer', {
      p_from_account_id: data.account_id,
      p_to_account_id: data.transfer_to_account_id,
      p_amount: Number(data.amount),
      p_transaction_date: data.transaction_date,
      p_note: data.note ?? null,
    })
    assertNoError(error, 'Failed to create transfer')
    if (data.recurring_id) {
      await supabase
        .from('transactions')
        .update({ recurring_id: data.recurring_id })
        .eq('id', id)
        .eq('user_id', userId)
    }
    const { data: tx, error: fetchError } = await supabase
      .from('transactions')
      .select('*, category:categories(id, name, kind, color, is_savings), account:accounts!transactions_account_id_fkey(id, name, currency), transfer_to:accounts!transactions_transfer_to_account_id_fkey(id, name, currency)')
      .eq('id', id)
      .eq('user_id', userId)
      .single()
    assertNoError(fetchError, 'Failed to load transfer')
    return tx
  }

  const snapshot =
    data.type === 'transfer' ? {} : await fetchCategorySnapshot(userId, data.category_id)

  const payload = {
    user_id: userId,
    account_id: data.account_id,
    category_id: data.category_id,
    type: data.type,
    amount: Number(data.amount),
    note: data.note ?? null,
    transaction_date: data.transaction_date,
    ...(data.recurring_id ? { recurring_id: data.recurring_id } : {}),
    ...(data.goal_id ? { goal_id: data.goal_id } : {}),
  }

  let insertRow = { ...payload, ...snapshot }
  let { data: tx, error } = await supabase
    .from('transactions')
    .insert(insertRow)
    .select('*, category:categories(id, name, kind, color, is_savings), account:accounts!transactions_account_id_fkey(id, name, currency)')
    .single()

  if (error && isMissingSnapshotColumnError(error)) {
    insertRow = { ...payload }
    ;({ data: tx, error } = await supabase
      .from('transactions')
      .insert(insertRow)
      .select('*, category:categories(id, name, kind, color, is_savings), account:accounts!transactions_account_id_fkey(id, name, currency)')
      .single())
  }

  if (error && isMissingGoalLinkColumnError(error) && payload.goal_id) {
    const { goal_id: _goalId, ...withoutGoal } = insertRow
    ;({ data: tx, error } = await supabase
      .from('transactions')
      .insert(withoutGoal)
      .select('*, category:categories(id, name, kind, color, is_savings), account:accounts!transactions_account_id_fkey(id, name, currency)')
      .single())
  }

  assertNoError(error, 'Failed to create transaction')
  return tx
}

export async function updateTransaction(id, patch) {
  const userId = await requireUserId()

  if (patch.type === 'transfer') {
    throw new Error('Transfers cannot be edited; delete and recreate')
  }

  const safePatch = { ...patch }
  delete safePatch.user_id
  delete safePatch.id
  delete safePatch.created_at
  delete safePatch.transfer_to_account_id

  let snapshot = {}
  if (Object.prototype.hasOwnProperty.call(safePatch, 'category_id')) {
    snapshot = await fetchCategorySnapshot(userId, safePatch.category_id)
    Object.assign(safePatch, snapshot)
  }

  let { data, error } = await supabase
    .from('transactions')
    .update(safePatch)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*, category:categories(id, name, kind, color, is_savings), account:accounts!transactions_account_id_fkey(id, name, currency)')
    .single()

  if (error && isMissingSnapshotColumnError(error) && Object.keys(snapshot).length > 0) {
    for (const key of Object.keys(snapshot)) {
      delete safePatch[key]
    }
    ;({ data, error } = await supabase
      .from('transactions')
      .update(safePatch)
      .eq('id', id)
      .eq('user_id', userId)
      .select('*, category:categories(id, name, kind, color, is_savings), account:accounts!transactions_account_id_fkey(id, name, currency)')
      .single())
  }

  assertNoError(error, 'Failed to update transaction')
  return data
}

export async function deleteTransaction(id, { goals = [] } = {}) {
  const userId = await requireUserId()

  const { data: tx, error: fetchError } = await supabase
    .from('transactions')
    .select(
      '*, category:categories(id, name, kind, color, is_savings), account:accounts!transactions_account_id_fkey(id, name, currency)',
    )
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  assertNoError(fetchError, 'Failed to load transaction')

  const deletedContributionIds = await deleteContributionsForTransaction(tx, goals)

  const { error } = await supabase.from('transactions').delete().eq('id', id).eq('user_id', userId)
  assertNoError(error, 'Failed to delete transaction')

  return { id, deletedContributionIds }
}

export async function deleteAllTransactions() {
  const userId = await requireUserId()
  const { error } = await supabase.from('transactions').delete().eq('user_id', userId)
  assertNoError(error, 'Failed to clear transactions')
}

export function groupTransactionsByDate(transactions) {
  const groups = new Map()
  for (const tx of transactions) {
    const key = tx.transaction_date
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(tx)
  }
  return [...groups.entries()].map(([date, items]) => ({ date, items }))
}

export function formatTransactionDateLabel(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return 'Unknown date'
  const date = parseISO(dateStr)
  if (Number.isNaN(date.getTime())) return dateStr
  const today = format(new Date(), 'yyyy-MM-dd')
  const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd')
  if (dateStr === today) return 'Today'
  if (dateStr === yesterday) return 'Yesterday'
  return format(date, 'MMM d, yyyy')
}
