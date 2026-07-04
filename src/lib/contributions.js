import { supabase } from './supabase'
import { requireUserId } from './auth'
import { assertNoError } from './errors'

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

export async function addContribution(goalId, amount, note) {
  const userId = await requireUserId()
  const value = Number(amount)
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error('Contribution amount must be greater than 0')
  }

  const { data: contribution, error } = await supabase
    .from('contributions')
    .insert({
      goal_id: goalId,
      user_id: userId,
      amount: value,
      note: note ?? null,
    })
    .select()
    .single()

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
