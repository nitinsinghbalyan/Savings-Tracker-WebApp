import { useCallback } from 'react'
import { useAppData } from '../context/AppDataContext'
import { useAuth } from './useAuth'

export function useProfile({ enabled = true } = {}) {
  const { user } = useAuth()
  const showData = Boolean(user)
  const { profile, bootstrapping, profileError, saveProfile, refreshProfile } = useAppData()

  const loading = enabled && bootstrapping && profile === null

  const refetch = useCallback(async () => {
    if (!enabled) return
    await refreshProfile()
  }, [enabled, refreshProfile])

  return {
    profile: showData ? profile : null,
    loading,
    error: enabled ? profileError : null,
    refetch,
    saveProfile,
  }
}
