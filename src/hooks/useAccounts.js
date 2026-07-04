import { useCallback, useMemo } from 'react'
import { useAppData } from '../context/AppDataContext'
import { useAuth } from './useAuth'

export function useAccounts({ enabled = true, includeArchived = true } = {}) {
  const { user } = useAuth()
  const showData = Boolean(user)
  const {
    accounts,
    bootstrapping,
    accountsError,
    refreshAccounts,
    createAccount,
    updateAccount,
    archiveAccount,
  } = useAppData()

  const visibleAccounts = useMemo(() => {
    if (!showData) return []
    return includeArchived ? accounts : accounts.filter((a) => !a.is_archived)
  }, [showData, accounts, includeArchived])

  const activeAccounts = useMemo(
    () => visibleAccounts.filter((a) => !a.is_archived),
    [visibleAccounts],
  )

  const loading = enabled && bootstrapping && accounts.length === 0

  const refetch = useCallback(async () => {
    if (!enabled) return
    await refreshAccounts({ background: accounts.length > 0 })
  }, [enabled, refreshAccounts, accounts.length])

  return {
    accounts: visibleAccounts,
    activeAccounts,
    loading,
    error: enabled ? accountsError : null,
    refetch,
    createAccount,
    updateAccount,
    archiveAccount,
  }
}
