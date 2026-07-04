import { supabase } from './supabase'
import { requireUserId } from './auth'
import { assertNoError } from './errors'

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
