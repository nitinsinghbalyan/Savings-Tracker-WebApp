import { supabase } from './supabase'
import { getDeviceId } from './device'
import { assertNoError } from './errors'

export async function getContributions(goalId) {
  const deviceId = getDeviceId()

  const { data, error } = await supabase
    .from('contributions')
    .select('*')
    .eq('goal_id', goalId)
    .eq('device_id', deviceId)
    .order('created_at', { ascending: false })

  assertNoError(error, 'Failed to load contributions')
  return data ?? []
}

export async function addContribution(goalId, amount, note) {
  const deviceId = getDeviceId()

  const { data: contribution, error } = await supabase
    .from('contributions')
    .insert({
      goal_id: goalId,
      device_id: deviceId,
      amount,
      note: note ?? null,
    })
    .select()
    .single()

  assertNoError(error, 'Failed to add contribution')
  return contribution
}

export async function deleteContribution(id) {
  const deviceId = getDeviceId()

  const { error } = await supabase
    .from('contributions')
    .delete()
    .eq('id', id)
    .eq('device_id', deviceId)

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
