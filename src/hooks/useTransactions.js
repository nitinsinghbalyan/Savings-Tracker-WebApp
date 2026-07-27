import { useCallback, useEffect, useMemo } from 'react'
import { useAppData } from '../context/AppDataContext'
import { useAuth } from './useAuth'
import { buildOverallTransactionsCacheKey, buildTransactionsCacheKey } from '../context/app-data-context'

export function useTransactions({
  enabled = true,
  year,
  month,
  monthStartDay = 1,
  type,
  accountId,
  allTime = false,
} = {}) {
  const { user } = useAuth()
  const showData = Boolean(user)
  const {
    loadTransactions,
    getTransactionsEntry,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  } = useAppData()

  const cacheKey = useMemo(
    () =>
      allTime
        ? buildOverallTransactionsCacheKey({ type, accountId })
        : year && month
          ? buildTransactionsCacheKey({ year, month, monthStartDay, type, accountId })
          : null,
    [allTime, year, month, monthStartDay, type, accountId],
  )

  const entry = getTransactionsEntry({
    allTime,
    year,
    month,
    monthStartDay,
    type,
    accountId,
  })

  useEffect(() => {
    if (!enabled) return
    if (allTime) {
      if (entry.loaded && !entry.stale) return
      loadTransactions({ allTime: true, type, accountId, enabled: true })
      return
    }
    if (!year || !month) return
    if (entry.loaded && !entry.stale) return
    loadTransactions({ year, month, monthStartDay, type, accountId, enabled: true })
  }, [
    enabled,
    allTime,
    year,
    month,
    monthStartDay,
    type,
    accountId,
    loadTransactions,
    entry.loaded,
    entry.stale,
  ])

  const refetch = useCallback(async () => {
    if (!enabled) return
    if (allTime) {
      await loadTransactions({ allTime: true, type, accountId, enabled: true, force: true })
      return
    }
    if (!year || !month) return
    await loadTransactions({
      year,
      month,
      monthStartDay,
      type,
      accountId,
      enabled: true,
      force: true,
    })
  }, [enabled, allTime, year, month, monthStartDay, type, accountId, loadTransactions])

  const txMeta = useMemo(
    () => ({ year, month, monthStartDay }),
    [year, month, monthStartDay],
  )

  const handleCreate = useCallback(
    (data) =>
      createTransaction(data, {
        ...txMeta,
        transactionDate: data.transaction_date,
      }),
    [createTransaction, txMeta],
  )

  const handleUpdate = useCallback(
    (id, patch) =>
      updateTransaction(id, patch, {
        ...txMeta,
        transactionDate: patch.transaction_date,
      }),
    [updateTransaction, txMeta],
  )

  const handleDelete = useCallback(
    (id) => deleteTransaction(id, txMeta),
    [deleteTransaction, txMeta],
  )

  const initialLoading =
    enabled && !entry.loaded && (entry.loading || entry.refreshing)

  return {
    transactions: showData ? entry.data : [],
    loading: initialLoading,
    initialLoading,
    refreshing: enabled && entry.refreshing,
    stale: enabled && entry.stale,
    loaded: entry.loaded,
    error: enabled ? entry.error : null,
    refetch,
    createTransaction: handleCreate,
    updateTransaction: handleUpdate,
    deleteTransaction: handleDelete,
    cacheKey,
  }
}
