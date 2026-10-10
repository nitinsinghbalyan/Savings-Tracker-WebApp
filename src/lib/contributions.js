import { supabase } from './supabase'
import { requireUserId } from './auth'
import { assertNoError, isMissingGoalLinkColumnError } from './errors'
import { findLinkedContributionIds } from './transactionGoal'

export async function getContributions(goalId) {
  const userId = await requireUserId()

  const { data, error } = await supabase
    .from('contributions')
    .select('*')
    .eq('goal_id', goalId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  assertNoError(error, 'Failed to load contributions')
  return data ?? []
}

/**
 * `created_at` for a contribution funded by a transaction on `transactionDate`
 * (yyyy-MM-dd). Contributions have no date column of their own, so a backdated
 * "Add money" used to be stamped with today and land in the wrong month on the
 * funding chart, the forecast and the Summary. Today → undefined (the DB
 * default `now()` is exact); any other day → that date at the current local
 * time of day, so same-day entries keep their order.
 */
export function contributionTimestamp(transactionDate, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(transactionDate ?? ''))) return undefined
  const [y, m, d] = transactionDate.split('-').map(Number)
  if (y === now.getFullYear() && m === now.getMonth() + 1 && d === now.getDate()) return undefined
  const stamped = new Date(now)
  stamped.setFullYear(y, m - 1, d)
  return stamped.toISOString()
}

export async function addContribution(goalId, amount, note, sourceTransactionId, { createdAt } = {}) {
  const userId = await requireUserId()
  const value = Number(amount)
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error('Contribution amount must be greater than 0')
  }

  const row = {
    goal_id: goalId,
    user_id: userId,
    amount: value,
    note: note ?? null,
    ...(sourceTransactionId ? { source_transaction_id: sourceTransactionId } : {}),
    ...(createdAt ? { created_at: createdAt } : {}),
  }

  let { data: contribution, error } = await supabase.from('contributions').insert(row).select().single()

  if (error && isMissingGoalLinkColumnError(error) && sourceTransactionId) {
    const { source_transaction_id: _source, ...withoutSource } = row
    ;({ data: contribution, error } = await supabase
      .from('contributions')
      .insert(withoutSource)
      .select()
      .single())
  }

  assertNoError(error, 'Failed to add contribution')
  return contribution
}

export async function deleteContribution(id) {
  const userId = await requireUserId()

  const { error } = await supabase
    .from('contributions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  assertNoError(error, 'Failed to delete contribution')
}

export async function getContributionIdsBySourceTransactionId(transactionId) {
  const userId = await requireUserId()

  const { data, error } = await supabase
    .from('contributions')
    .select('id')
    .eq('user_id', userId)
    .eq('source_transaction_id', transactionId)

  if (error && isMissingGoalLinkColumnError(error)) return []
  assertNoError(error, 'Failed to load linked contributions')
  return (data ?? []).map((row) => row.id)
}

export async function deleteContributionsForTransaction(transaction, goals = []) {
  if (!transaction?.id) return []

  const ids = new Set(findLinkedContributionIds(transaction, goals))
  const dbIds = await getContributionIdsBySourceTransactionId(transaction.id)
  for (const id of dbIds) ids.add(id)

  for (const id of ids) {
    await deleteContribution(id)
  }

  return [...ids]
}

export function savedAmount(goalWithContributions) {
  const contributions = goalWithContributions.contributions ?? []
  return contributions.reduce((sum, c) => sum + Number(c.amount), 0)
}

export function percentComplete(goalWithContributions) {
  const target = Number(goalWithContributions.target_amount)
  if (!target || target <= 0) return 0
  const saved = savedAmount(goalWithContributions)
  return Math.min(100, (saved / target) * 100)
}

export function remainingAmount(goalWithContributions) {
  const target = Number(goalWithContributions.target_amount)
  return Math.max(0, target - savedAmount(goalWithContributions))
}
