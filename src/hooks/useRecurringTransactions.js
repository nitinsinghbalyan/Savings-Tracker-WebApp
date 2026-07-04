import { useCallback } from 'react'
import { useAppData } from '../context/AppDataContext'
import { useAuth } from './useAuth'

export function useRecurringTransactions({ enabled = true } = {}) {
  const { user } = useAuth()
  const showData = Boolean(user)
  const {
    recurringRules,
    bootstrapping,
    recurringError,
    refreshRecurring,
    createRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    skipNextRecurring,
  } = useAppData()

  const loading = enabled && bootstrapping && recurringRules.length === 0

  const refetch = useCallback(async () => {
    if (!enabled) return
    await refreshRecurring({ background: recurringRules.length > 0 })
  }, [enabled, refreshRecurring, recurringRules.length])

  return {
    rules: showData ? recurringRules : [],
    loading,
    error: enabled ? recurringError : null,
    refetch,
    createRecurring: createRecurringTransaction,
    updateRecurring: updateRecurringTransaction,
    deleteRecurring: deleteRecurringTransaction,
    skipNext: skipNextRecurring,
  }
}
