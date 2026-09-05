import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { ensureProfile, updateProfile } from '../lib/profile'
import { getCategories, pruneDuplicateCategories, createCategory, updateCategory, archiveCategory, deleteCategory, deleteAllCategories } from '../lib/categories'
import { getAccountsWithBalances, createAccount, updateAccount, archiveAccount } from '../lib/accounts'
import { getGoalsWithContributions, createGoal, updateGoal, deleteGoal } from '../lib/goals'
import { addContribution, deleteContribution } from '../lib/contributions'
import { backfillGoalCategories } from '../lib/goalCategory'
import {
  createRecurringTransaction,
  deleteRecurringTransaction,
  getRecurringTransactions,
  processDueRecurring,
  skipNextOccurrence,
  updateRecurringTransaction,
} from '../lib/recurringTransactions'
import {
  createTransaction,
  deleteTransaction,
  getMonthRange,
  getPeriodForDate,
  getTransactions,
  transactionMatchesCacheFilters,
  updateTransaction,
} from '../lib/transactions'
import { AppDataContext, buildOverallTransactionsCacheKey, buildTransactionsCacheKey, buildTransactionsCachePrefix, parseTransactionsCacheKey } from './app-data-context'

function toErrorMessage(err, fallback) {
  if (err instanceof Error) return err.message
  return fallback
}

function sortGoalsByEndDate(goals) {
  return [...goals].sort((a, b) => {
    const aDate = a.end_date ?? ''
    const bDate = b.end_date ?? ''
    return aDate.localeCompare(bDate)
  })
}

function mergeUpdatedGoal(goals, updated) {
  return goals.map((goal) => (goal.id === updated.id ? { ...goal, ...updated } : goal))
}

function mergeCreatedGoal(goals, created) {
  return sortGoalsByEndDate([...goals, { ...created, contributions: [] }])
}

function mergeDeletedGoal(goals, goalId) {
  return goals.filter((goal) => goal.id !== goalId)
}

function mergeAddedContribution(goals, goalId, contribution) {
  return goals.map((goal) =>
    goal.id === goalId
      ? { ...goal, contributions: [contribution, ...(goal.contributions ?? [])] }
      : goal,
  )
}

function mergeDeletedContribution(goals, contributionId) {
  return goals.map((goal) => ({
    ...goal,
    contributions: (goal.contributions ?? []).filter((c) => c.id !== contributionId),
  }))
}

function applyGoalsMutationResult(goals, result, kind) {
  if (!result) return goals

  switch (kind) {
    case 'create':
      return mergeCreatedGoal(goals, result)
    case 'update':
      return mergeUpdatedGoal(goals, result)
    case 'delete':
      return mergeDeletedGoal(goals, result.id ?? result)
    case 'addContribution':
      return mergeAddedContribution(goals, result.goal_id, result)
    case 'deleteContribution':
      return mergeDeletedContribution(goals, result)
    default:
      return goals
  }
}

function preserveContributionsOnRefresh(prevGoals, nextGoals) {
  const prevById = new Map(prevGoals.map((goal) => [goal.id, goal]))
  return nextGoals.map((goal) => {
    const prev = prevById.get(goal.id)
    if (!prev) return goal
    const prevCount = prev.contributions?.length ?? 0
    const nextCount = goal.contributions?.length ?? 0
    if (nextCount >= prevCount) return goal
    return { ...goal, contributions: prev.contributions ?? [] }
  })
}

const EMPTY_TX_ENTRY = { data: [], loading: false, error: null, refreshing: false, stale: false, loaded: false }

function mergeTransactionIntoCache(cache, tx) {
  if (!tx?.id) return cache

  let changed = false
  const next = { ...cache }

  for (const key of Object.keys(next)) {
    const entry = next[key]
    if (!entry) continue
    if (entry.data.some((row) => row.id === tx.id)) continue

    const parsed = parseTransactionsCacheKey(key)
    if (!parsed) continue

    if (!transactionMatchesCacheFilters(tx, parsed)) {
      continue
    }

    const data = [tx, ...entry.data].sort((a, b) => {
      const byDate = b.transaction_date.localeCompare(a.transaction_date)
      if (byDate !== 0) return byDate
      return String(b.created_at ?? '').localeCompare(String(a.created_at ?? ''))
    })

    next[key] = {
      ...entry,
      data,
      loading: false,
      refreshing: false,
      error: null,
      stale: false,
      loaded: true,
    }
    changed = true
  }

  return changed ? next : cache
}

export function AppDataProvider({ children }) {
  const { user, authReady, claimNotice } = useAuth()
  const enabled = Boolean(user) && authReady

  const [profile, setProfile] = useState(null)
  const [accounts, setAccounts] = useState([])
  const [categories, setCategories] = useState([])
  const [recurringRules, setRecurringRules] = useState([])
  const [goals, setGoals] = useState([])
  const [txCache, setTxCache] = useState({})
  const [txCacheVersion, setTxCacheVersion] = useState(0)

  const [bootstrapping, setBootstrapping] = useState(false)
  const [bootstrapError, setBootstrapError] = useState(null)
  const [refreshingCore, setRefreshingCore] = useState(false)

  const [goalsError, setGoalsError] = useState(null)
  const [accountsError, setAccountsError] = useState(null)
  const [categoriesError, setCategoriesError] = useState(null)
  const [profileError, setProfileError] = useState(null)
  const [recurringError, setRecurringError] = useState(null)

  const bootstrappedRef = useRef(false)
  const bootstrapPromiseRef = useRef(null)
  const categoriesPrunedRef = useRef(false)
  const recurringPostedRef = useRef(0)
  const recurringProcessedRef = useRef(false)
  const txCacheRef = useRef(txCache)
  const txInflightRef = useRef(new Map())

  txCacheRef.current = txCache

  const clearAll = useCallback(() => {
    bootstrappedRef.current = false
    bootstrapPromiseRef.current = null
    categoriesPrunedRef.current = false
    recurringProcessedRef.current = false
    setProfile(null)
    setAccounts([])
    setCategories([])
    setRecurringRules([])
    setGoals([])
    setTxCache({})
    setTxCacheVersion(0)
    txInflightRef.current.clear()
    setBootstrapError(null)
    setGoalsError(null)
    setAccountsError(null)
    setCategoriesError(null)
    setProfileError(null)
    setRecurringError(null)
    recurringPostedRef.current = 0
    setBootstrapping(false)
    setRefreshingCore(false)
  }, [])

  useEffect(() => {
    if (!user) {
      clearAll()
    }
  }, [user, clearAll])

  const bootstrap = useCallback(
    async ({ background = false } = {}) => {
      if (!enabled) return

      if (bootstrapPromiseRef.current) {
        return bootstrapPromiseRef.current
      }

      const hasCoreData = bootstrappedRef.current

      if (!background && !hasCoreData) {
        setBootstrapping(true)
      } else if (background || hasCoreData) {
        setRefreshingCore(true)
      }
      setBootstrapError(null)

      const promise = (async () => {
        try {
          const [profileData, accountsData, categoriesData, goalsData, recurringData] = await Promise.all([
            ensureProfile(),
            getAccountsWithBalances(),
            (async () => {
              const data = await getCategories()
              if (!categoriesPrunedRef.current) {
                categoriesPrunedRef.current = true
                pruneDuplicateCategories()
                  .then(() => getCategories())
                  .then((fresh) => setCategories(fresh))
                  .catch(() => {})
              }
              return data
            })(),
            getGoalsWithContributions(),
            getRecurringTransactions().catch(() => []),
          ])

          setProfile(profileData)
          setAccounts(accountsData)
          setCategories(categoriesData)
          setGoals(goalsData)
          setRecurringRules(recurringData)
          setGoalsError(null)
          setAccountsError(null)
          setCategoriesError(null)
          setProfileError(null)
          setRecurringError(null)
          bootstrappedRef.current = true

          // Lazy-link existing goals to savings categories (non-blocking)
          backfillGoalCategories(goalsData)
            .then(async ({ goals: linkedGoals, categoriesChanged }) => {
              if (categoriesChanged) {
                setGoals(linkedGoals)
                try {
                  const fresh = await getCategories()
                  setCategories(fresh)
                } catch {
                  /* ignore */
                }
              }
            })
            .catch(() => {})
        } catch (err) {
          const message = toErrorMessage(err, 'Failed to load app data')
          setBootstrapError(message)
          throw err
        } finally {
          setBootstrapping(false)
          setRefreshingCore(false)
          bootstrapPromiseRef.current = null
        }
      })()

      bootstrapPromiseRef.current = promise
      return promise
    },
    [enabled],
  )

  const refreshGoals = useCallback(
    async ({ background = true } = {}) => {
      if (!enabled) return
      if (!background && goals.length === 0) setBootstrapping(true)
      else setRefreshingCore(true)
      setGoalsError(null)
      try {
        const data = await getGoalsWithContributions()
        setGoals((prev) => preserveContributionsOnRefresh(prev, data))
      } catch (err) {
        setGoalsError(toErrorMessage(err, 'Failed to load goals'))
        throw err
      } finally {
        setBootstrapping(false)
        setRefreshingCore(false)
      }
    },
    [enabled, goals.length],
  )

  useEffect(() => {
    if (!enabled) return
    if (bootstrappedRef.current) return
    bootstrap()
  }, [enabled, bootstrap])

  useEffect(() => {
    if (!enabled || claimNotice <= 0) return
    refreshGoals({ background: true })
  }, [claimNotice, enabled, refreshGoals])

  const refreshAccounts = useCallback(
    async ({ background = true } = {}) => {
      if (!enabled) return
      setAccountsError(null)
      try {
        const data = await getAccountsWithBalances()
        setAccounts(data)
      } catch (err) {
        setAccountsError(toErrorMessage(err, 'Failed to load accounts'))
        throw err
      }
    },
    [enabled],
  )

  const refreshCategories = useCallback(
    async ({ background = true } = {}) => {
      if (!enabled) return
      setCategoriesError(null)
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (err) {
        setCategoriesError(toErrorMessage(err, 'Failed to load categories'))
        throw err
      }
    },
    [enabled],
  )

  const refreshRecurring = useCallback(
    async ({ background = true } = {}) => {
      if (!enabled) return
      setRecurringError(null)
      try {
        const data = await getRecurringTransactions()
        setRecurringRules(data)
      } catch (err) {
        setRecurringError(toErrorMessage(err, 'Failed to load recurring transactions'))
        throw err
      }
    },
    [enabled],
  )

  const refreshProfile = useCallback(async () => {
    if (!enabled) return
    setProfileError(null)
    try {
      const data = await ensureProfile()
      setProfile(data)
    } catch (err) {
      setProfileError(toErrorMessage(err, 'Failed to load settings'))
      throw err
    }
  }, [enabled])

  const invalidateTransactions = useCallback((prefix) => {
    setTxCache((prev) => {
      const next = { ...prev }
      for (const key of Object.keys(next)) {
        if (prefix && !key.startsWith(prefix)) continue
        const entry = next[key]
        if (!entry) continue
        next[key] = {
          ...entry,
          stale: true,
          refreshing: entry.data.length > 0,
        }
      }
      return next
    })
  }, [])

  useEffect(() => {
    if (!enabled || bootstrapping || !bootstrappedRef.current || recurringProcessedRef.current) return
    recurringProcessedRef.current = true

    processDueRecurring()
      .then(async (posted) => {
        if (posted <= 0) return
        recurringPostedRef.current = posted
        await refreshAccounts({ background: true })
        invalidateTransactions()
        await refreshRecurring({ background: true })
      })
      .catch(() => {})
  }, [enabled, bootstrapping, refreshAccounts, invalidateTransactions, refreshRecurring])

  const consumeRecurringPosted = useCallback(() => {
    const count = recurringPostedRef.current
    recurringPostedRef.current = 0
    return count
  }, [])

  const loadTransactions = useCallback(
    async ({
      year,
      month,
      monthStartDay = 1,
      type,
      accountId,
      allTime = false,
      enabled: loadEnabled = true,
      force = false,
    }) => {
      if (!loadEnabled) return
      if (!allTime && (!year || !month)) return

      const key = allTime
        ? buildOverallTransactionsCacheKey({ type, accountId })
        : buildTransactionsCacheKey({ year, month, monthStartDay, type, accountId })

      const existing = txCacheRef.current[key] ?? EMPTY_TX_ENTRY
      if (!force && existing.loaded && !existing.stale) return

      if (!force) {
        const inflight = txInflightRef.current.get(key)
        if (inflight) return inflight
      }

      setTxCache((prev) => {
        const current = prev[key] ?? EMPTY_TX_ENTRY
        if (!force && current.loaded && !current.stale) return prev
        return {
          ...prev,
          [key]: {
            ...current,
            loading: !current.loaded,
            refreshing: current.loaded,
            error: null,
          },
        }
      })

      const request = (async () => {
        try {
          const data = allTime
            ? await getTransactions({ type, accountId })
            : await getTransactions({
                startDate: getMonthRange(year, month, monthStartDay).start,
                endDate: getMonthRange(year, month, monthStartDay).end,
                type,
                accountId,
              })
          setTxCache((prev) => ({
            ...prev,
            [key]: { data, loading: false, refreshing: false, error: null, stale: false, loaded: true },
          }))
          return data
        } catch (err) {
          const message = toErrorMessage(err, 'Failed to load transactions')
          setTxCache((prev) => ({
            ...prev,
            [key]: {
              ...(prev[key] ?? EMPTY_TX_ENTRY),
              loading: false,
              refreshing: false,
              error: message,
              stale: false,
              loaded: true,
            },
          }))
          throw err
        } finally {
          txInflightRef.current.delete(key)
        }
      })()

      txInflightRef.current.set(key, request)
      return request
    },
    [],
  )

  const getTransactionsEntry = useCallback(
    (params) => {
      const key = params.allTime
        ? buildOverallTransactionsCacheKey(params)
        : buildTransactionsCacheKey(params)
      return txCache[key] ?? {
        ...EMPTY_TX_ENTRY,
        loading: enabled && Boolean(params.allTime || (params.year && params.month)),
        stale: false,
        loaded: false,
      }
    },
    [txCache, enabled],
  )

  const saveProfile = useCallback(
    async (patch) => {
      setProfileError(null)
      try {
        const updated = await updateProfile(patch)
        setProfile(updated)
        const monthPrefix = `${new Date().getFullYear()}|`
        invalidateTransactions(monthPrefix)
        return updated
      } catch (err) {
        const message = toErrorMessage(err, 'Failed to save settings')
        setProfileError(message)
        throw err
      }
    },
    [invalidateTransactions],
  )

  const runGoalsMutation = useCallback(
    async (action, fallbackMessage, { mutationKind } = {}) => {
      setGoalsError(null)
      try {
        const result = await action()

        if (mutationKind) {
          setGoals((current) => applyGoalsMutationResult(current, result, mutationKind))
          // Optimistic merge already applied — reconcile in the background without blocking UI.
          void refreshGoals({ background: true }).catch(() => {})
          return result
        }

        await refreshGoals({ background: true })
        return result
      } catch (err) {
        const message = toErrorMessage(err, fallbackMessage)
        setGoalsError(message)
        throw err
      }
    },
    [refreshGoals],
  )

  const runAccountsMutation = useCallback(
    async (action, fallbackMessage) => {
      setAccountsError(null)
      try {
        const result = await action()
        await refreshAccounts({ background: true })
        invalidateTransactions()
        return result
      } catch (err) {
        const message = toErrorMessage(err, fallbackMessage)
        setAccountsError(message)
        throw err
      }
    },
    [refreshAccounts, invalidateTransactions],
  )

  const runCategoriesMutation = useCallback(
    async (action, fallbackMessage) => {
      setCategoriesError(null)
      try {
        const result = await action()
        await refreshCategories({ background: true })
        return result
      } catch (err) {
        const message = toErrorMessage(err, fallbackMessage)
        setCategoriesError(message)
        throw err
      }
    },
    [refreshCategories],
  )

  const runRecurringMutation = useCallback(
    async (action, fallbackMessage) => {
      setRecurringError(null)
      try {
        const result = await action()
        await refreshRecurring({ background: true })
        return result
      } catch (err) {
        const message = toErrorMessage(err, fallbackMessage)
        setRecurringError(message)
        throw err
      }
    },
    [refreshRecurring],
  )

  const runTransactionsMutation = useCallback(
    async (action, fallbackMessage, { year, month, monthStartDay = 1, transactionDate } = {}) => {
      try {
        const result = await action()
        const period =
          transactionDate != null
            ? getPeriodForDate(transactionDate, monthStartDay)
            : year && month
              ? { year, month }
              : null

        const canMergeCreate = Boolean(result?.type && result?.transaction_date)

        // Optimistic merge into any matching loaded slots (including overall).
        // Use a functional update so concurrent cache writes aren't overwritten.
        if (canMergeCreate) {
          setTxCache((prev) => mergeTransactionIntoCache(prev, result))
        }

        // Always invalidate the transaction's month + overall so Activity/Summary
        // refetch even when no matching cache slot existed yet to merge into.
        // monthStartDay must match Activity's key or a custom month-start period is missed.
        if (period) {
          invalidateTransactions(buildTransactionsCachePrefix(period.year, period.month))
        } else if (!canMergeCreate) {
          invalidateTransactions()
        }
        invalidateTransactions('overall|')

        await refreshAccounts({ background: true })
        return result
      } catch (err) {
        const message = toErrorMessage(err, fallbackMessage)
        throw err
      }
    },
    [invalidateTransactions, refreshAccounts],
  )

  const handleCreateGoal = useCallback(
    (data) =>
      runGoalsMutation(async () => {
        const goal = await createGoal(data)
        await refreshCategories({ background: true }).catch(() => {})
        return goal
      }, 'Failed to create goal', { mutationKind: 'create' }),
    [runGoalsMutation, refreshCategories],
  )

  const handleUpdateGoal = useCallback(
    (id, patch) =>
      runGoalsMutation(async () => {
        const goal = await updateGoal(id, patch)
        await refreshCategories({ background: true }).catch(() => {})
        return goal
      }, 'Failed to update goal', { mutationKind: 'update' }),
    [runGoalsMutation, refreshCategories],
  )

  const handleDeleteGoal = useCallback(
    (id) =>
      runGoalsMutation(async () => {
        await deleteGoal(id)
        await refreshCategories({ background: true }).catch(() => {})
        return id
      }, 'Failed to delete goal', { mutationKind: 'delete' }),
    [runGoalsMutation, refreshCategories],
  )

  const handleAddContribution = useCallback(
    (goalId, amount, note, sourceTransactionId) =>
      runGoalsMutation(
        () => addContribution(goalId, amount, note, sourceTransactionId),
        'Failed to add contribution',
        { mutationKind: 'addContribution' },
      ),
    [runGoalsMutation],
  )

  const handleDeleteContribution = useCallback(
    (id) =>
      runGoalsMutation(() => deleteContribution(id).then(() => id), 'Failed to delete contribution', {
        mutationKind: 'deleteContribution',
      }),
    [runGoalsMutation],
  )

  const handleCreateAccount = useCallback(
    (data) => runAccountsMutation(() => createAccount(data), 'Failed to create account'),
    [runAccountsMutation],
  )

  const handleUpdateAccount = useCallback(
    (id, patch) => runAccountsMutation(() => updateAccount(id, patch), 'Failed to update account'),
    [runAccountsMutation],
  )

  const handleArchiveAccount = useCallback(
    (id) => runAccountsMutation(() => archiveAccount(id), 'Failed to archive account'),
    [runAccountsMutation],
  )

  const handleCreateCategory = useCallback(
    (data) => runCategoriesMutation(() => createCategory(data), 'Failed to create category'),
    [runCategoriesMutation],
  )

  const handleUpdateCategory = useCallback(
    (id, patch) => runCategoriesMutation(() => updateCategory(id, patch), 'Failed to update category'),
    [runCategoriesMutation],
  )

  const handleArchiveCategory = useCallback(
    (id) => runCategoriesMutation(() => archiveCategory(id), 'Failed to archive category'),
    [runCategoriesMutation],
  )

  const handleDeleteCategory = useCallback(
    (id) => runCategoriesMutation(() => deleteCategory(id), 'Failed to delete category'),
    [runCategoriesMutation],
  )

  const handleDeleteAllCategories = useCallback(
    () => runCategoriesMutation(() => deleteAllCategories(), 'Failed to delete categories'),
    [runCategoriesMutation],
  )

  const handleCreateRecurring = useCallback(
    (data) =>
      runRecurringMutation(() => createRecurringTransaction(data), 'Failed to create recurring transaction'),
    [runRecurringMutation],
  )

  const handleUpdateRecurring = useCallback(
    (id, patch) =>
      runRecurringMutation(
        () => updateRecurringTransaction(id, patch),
        'Failed to update recurring transaction',
      ),
    [runRecurringMutation],
  )

  const handleDeleteRecurring = useCallback(
    (id) =>
      runRecurringMutation(() => deleteRecurringTransaction(id), 'Failed to delete recurring transaction'),
    [runRecurringMutation],
  )

  const handleSkipNextRecurring = useCallback(
    (id) => runRecurringMutation(() => skipNextOccurrence(id), 'Failed to skip occurrence'),
    [runRecurringMutation],
  )

  const handleCreateTransaction = useCallback(
    (data, meta) =>
      runTransactionsMutation(() => createTransaction(data), 'Failed to save transaction', meta),
    [runTransactionsMutation],
  )

  const handleUpdateTransaction = useCallback(
    (id, patch, meta) =>
      runTransactionsMutation(() => updateTransaction(id, patch), 'Failed to update transaction', meta),
    [runTransactionsMutation],
  )

  const goalsRef = useRef(goals)
  useEffect(() => {
    goalsRef.current = goals
  }, [goals])

  const handleDeleteTransaction = useCallback(
    async (id, meta) => {
      const result = await runTransactionsMutation(
        () => deleteTransaction(id, { goals: goalsRef.current }),
        'Failed to delete transaction',
        meta,
      )
      if (result?.deletedContributionIds?.length) {
        setGoals((prev) =>
          result.deletedContributionIds.reduce(
            (acc, contributionId) => mergeDeletedContribution(acc, contributionId),
            prev,
          ),
        )
        await refreshGoals({ background: true })
      }
      return result
    },
    [runTransactionsMutation, refreshGoals],
  )

  const value = useMemo(
    () => ({
      profile,
      accounts,
      categories,
      recurringRules,
      goals,
      bootstrapping,
      bootstrapError,
      refreshingCore,
      goalsError,
      accountsError,
      categoriesError,
      profileError,
      recurringError,
      bootstrap,
      refreshGoals,
      refreshAccounts,
      refreshCategories,
      refreshRecurring,
      refreshProfile,
      consumeRecurringPosted,
      loadTransactions,
      getTransactionsEntry,
      invalidateTransactions,
      saveProfile,
      txCacheVersion,
      createGoal: handleCreateGoal,
      updateGoal: handleUpdateGoal,
      deleteGoal: handleDeleteGoal,
      addContribution: handleAddContribution,
      deleteContribution: handleDeleteContribution,
      createAccount: handleCreateAccount,
      updateAccount: handleUpdateAccount,
      archiveAccount: handleArchiveAccount,
      createCategory: handleCreateCategory,
      updateCategory: handleUpdateCategory,
      archiveCategory: handleArchiveCategory,
      deleteCategory: handleDeleteCategory,
      deleteAllCategories: handleDeleteAllCategories,
      createRecurringTransaction: handleCreateRecurring,
      updateRecurringTransaction: handleUpdateRecurring,
      deleteRecurringTransaction: handleDeleteRecurring,
      skipNextRecurring: handleSkipNextRecurring,
      createTransaction: handleCreateTransaction,
      updateTransaction: handleUpdateTransaction,
      deleteTransaction: handleDeleteTransaction,
    }),
    [
      profile,
      accounts,
      categories,
      recurringRules,
      goals,
      bootstrapping,
      bootstrapError,
      refreshingCore,
      goalsError,
      accountsError,
      categoriesError,
      profileError,
      recurringError,
      bootstrap,
      refreshGoals,
      refreshAccounts,
      refreshCategories,
      refreshRecurring,
      refreshProfile,
      consumeRecurringPosted,
      loadTransactions,
      getTransactionsEntry,
      invalidateTransactions,
      saveProfile,
      txCacheVersion,
      handleCreateGoal,
      handleUpdateGoal,
      handleDeleteGoal,
      handleAddContribution,
      handleDeleteContribution,
      handleCreateAccount,
      handleUpdateAccount,
      handleArchiveAccount,
      handleCreateCategory,
      handleUpdateCategory,
      handleArchiveCategory,
      handleDeleteCategory,
      handleDeleteAllCategories,
      handleCreateRecurring,
      handleUpdateRecurring,
      handleDeleteRecurring,
      handleSkipNextRecurring,
      handleCreateTransaction,
      handleUpdateTransaction,
      handleDeleteTransaction,
    ],
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const context = useContext(AppDataContext)
  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider')
  }
  return context
}
