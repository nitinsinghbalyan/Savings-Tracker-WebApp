import { useCallback } from 'react'
import { useAppData } from '../context/AppDataContext'
import { useAuth } from './useAuth'
import { percentComplete, remainingAmount, savedAmount } from '../lib/contributions'

export function useGoals({ enabled = true } = {}) {
  const { user } = useAuth()
  const showData = Boolean(user)
  const {
    goals,
    bootstrapping,
    goalsError,
    refreshGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    addContribution,
    deleteContribution,
  } = useAppData()

  const loading = enabled && bootstrapping && goals.length === 0

  const refetch = useCallback(async () => {
    if (!enabled) return
    await refreshGoals({ background: goals.length > 0 })
  }, [enabled, refreshGoals, goals.length])

  return {
    goals: showData ? goals : [],
    loading,
    error: enabled ? goalsError : null,
    refetch,
    createGoal,
    updateGoal,
    deleteGoal,
    addContribution,
    deleteContribution,
    savedAmount,
    percentComplete,
    remainingAmount,
  }
}
