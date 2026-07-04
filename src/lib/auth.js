import { supabase } from './supabase'
import { getDeviceId } from './device'
import { assertNoError } from './errors'

function getAuthRedirectUrl() {
  const configured = import.meta.env.VITE_AUTH_REDIRECT_URL?.trim()
  if (configured) return configured
  return window.location.origin
}

export async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser()
  assertNoError(error, 'Failed to get user')
  return data.user?.id ?? null
}

export async function requireUserId() {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('You must be signed in')
  }
  return userId
}

export async function claimDeviceData() {
  const deviceId = getDeviceId()
  const { data, error } = await supabase.rpc('claim_device_data', {
    p_device_id: deviceId,
  })
  assertNoError(error, 'Failed to claim existing data')
  return data ?? 0
}

export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getAuthRedirectUrl(),
    },
  })
  if (error) throw error
}

export async function signUpWithEmail(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
