import { supabase } from './supabase'
import { getDeviceId } from './device'
import { assertNoError } from './errors'

export async function getGoals() {
  const deviceId = getDeviceId()

  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('device_id', deviceId)
    .order('end_date', { ascending: true })

  assertNoError(error, 'Failed to load goals')
  return data
}

export async function getGoalsWithContributions() {
  const deviceId = getDeviceId()

  const { data, error } = await supabase
    .from('goals')
    .select('*, contributions(*)')
    .eq('device_id', deviceId)
    .order('end_date', { ascending: true })

  assertNoError(error, 'Failed to load goals')
  return data ?? []
}

export async function createGoal(data) {
  const deviceId = getDeviceId()

  const { data: goal, error } = await supabase
    .from('goals')
    .insert({ ...data, device_id: deviceId })
    .select()
    .single()

  assertNoError(error, 'Failed to create goal')
  return goal
}

export async function updateGoal(id, patch) {
  const deviceId = getDeviceId()
  const safePatch = { ...patch }
  delete safePatch.device_id
  delete safePatch.id
  delete safePatch.created_at

  const { data: goal, error } = await supabase
    .from('goals')
    .update(safePatch)
    .eq('id', id)
    .eq('device_id', deviceId)
    .select()
    .single()

  assertNoError(error, 'Failed to update goal')
  return goal
}

export async function deleteGoal(id) {
  const deviceId = getDeviceId()

  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', id)
    .eq('device_id', deviceId)

  assertNoError(error, 'Failed to delete goal')
}
