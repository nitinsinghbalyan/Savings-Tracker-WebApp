import { supabase } from './supabase'
import { requireUserId } from './auth'
import { assertNoError, isMissingNetWorthTargetColumnError } from './errors'

const DEFAULT_PROFILE = {
  default_currency: 'INR',
  month_start_day: 1,
}

export async function getProfile() {
  const userId = await requireUserId()

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  assertNoError(error, 'Failed to load profile')
  return data
}

export async function ensureProfile() {
  const userId = await requireUserId()
  const existing = await getProfile()
  if (existing) return existing

  const { data, error } = await supabase
    .from('user_profiles')
    .insert({ user_id: userId, ...DEFAULT_PROFILE })
    .select()
    .single()

  assertNoError(error, 'Failed to create profile')
  return data
}

export async function updateProfile(patch) {
  const userId = await requireUserId()
  await ensureProfile()

  const safePatch = { ...patch }
  delete safePatch.user_id
  delete safePatch.created_at

  const { data, error } = await supabase
    .from('user_profiles')
    .update(safePatch)
    .eq('user_id', userId)
    .select()
    .single()

  assertNoError(error, 'Failed to update profile')
  return data
}

/**
 * Save the net worth target. Degrades quietly when add_net_worth.sql has not
 * been run yet — the columns simply are not there, and the rest of the Worth
 * screen keeps working.
 */
export async function saveNetWorthTarget({ target, targetDate }) {
  const userId = await requireUserId()
  await ensureProfile()

  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      net_worth_target: target === '' || target === null || target === undefined
        ? null
        : Number(target) || 0,
      net_worth_target_date: targetDate || null,
    })
    .eq('user_id', userId)
    .select()
    .single()

  if (isMissingNetWorthTargetColumnError(error)) return null
  assertNoError(error, 'Failed to save net worth target')
  return data
}
