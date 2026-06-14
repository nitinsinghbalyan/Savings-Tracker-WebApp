import { useCallback, useEffect, useState } from 'react'
import {
  createGoal,
  deleteGoal,
  getGoalsWithContributions,
  updateGoal,
} from '../lib/goals'
import {
  addContribution,
  deleteContribution,
  percentComplete,
  remainingAmount,
  savedAmount,
} from '../lib/contributions'

function toErrorMessage(err, fallback) {
  if (err instanceof Error) return err.message
  return fallback
}

export function useGoals() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getGoalsWithContributions()
      setGoals(data)
    } catch (err) {
      setError(toErrorMessage(err, 'Failed to load goals'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load
    refetch()
  }, [refetch])

  const runMutation = useCallback(
    async (action, fallbackMessage) => {
      setError(null)
      try {
        const result = await action()
        await refetch()
        return result
      } catch (err) {
        const message = toErrorMessage(err, fallbackMessage)
        setError(message)
        throw err
      }
    },
    [refetch],
  )

  const handleCreateGoal = useCallback(
    (data) => runMutation(() => createGoal(data), 'Failed to create goal'),
    [runMutation],
  )

  const handleUpdateGoal = useCallback(
    (id, patch) => runMutation(() => updateGoal(id, patch), 'Failed to update goal'),
    [runMutation],
  )

  const handleDeleteGoal = useCallback(
    (id) => runMutation(() => deleteGoal(id), 'Failed to delete goal'),
    [runMutation],
  )

  const handleAddContribution = useCallback(
    (goalId, amount, note) =>
      runMutation(() => addContribution(goalId, amount, note), 'Failed to add contribution'),
    [runMutation],
  )

  const handleDeleteContribution = useCallback(
    (id) => runMutation(() => deleteContribution(id), 'Failed to delete contribution'),
    [runMutation],
  )

  return {
    goals,
    loading,
    error,
    refetch,
    createGoal: handleCreateGoal,
    updateGoal: handleUpdateGoal,
    deleteGoal: handleDeleteGoal,
    addContribution: handleAddContribution,
    deleteContribution: handleDeleteContribution,
    savedAmount,
    percentComplete,
    remainingAmount,
  }
}
