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

export async function addContribution(goalId, amount, note, sourceTransactionId) {
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
