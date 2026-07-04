import { useCallback, useEffect, useMemo } from 'react'
import { useAppData } from '../context/AppDataContext'
import { useAuth } from './useAuth'
import { buildTransactionsCacheKey } from '../context/app-data-context'

export function useTransactions({
  enabled = true,
  year,
  month,
  monthStartDay = 1,
  type,
  accountId,
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
      year && month
        ? buildTransactionsCacheKey({ year, month, monthStartDay, type, accountId })
        : null,
    [year, month, monthStartDay, type, accountId],
  )

  const entry = getTransactionsEntry({
    year,
    month,
    monthStartDay,
    type,
    accountId,
  })

  useEffect(() => {
    if (!enabled || !year || !month) return
    if (entry.data.length > 0 && !entry.stale) return
    loadTransactions({ year, month, monthStartDay, type, accountId, enabled: true })
  }, [
    enabled,
    year,
    month,
    monthStartDay,
    type,
    accountId,
    loadTransactions,
    entry.data.length,
    entry.stale,
  ])

  const refetch = useCallback(async () => {
    if (!enabled || !year || !month) return
    await loadTransactions({
      year,
      month,
      monthStartDay,
      type,
      accountId,
      enabled: true,
      force: true,
    })
  }, [enabled, year, month, monthStartDay, type, accountId, loadTransactions])

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

  return {
    transactions: showData ? entry.data : [],
    loading: enabled && entry.loading && entry.data.length === 0,
    refreshing: enabled && entry.refreshing,
    error: enabled ? entry.error : null,
    refetch,
    createTransaction: handleCreate,
    updateTransaction: handleUpdate,
    deleteTransaction: handleDelete,
    cacheKey,
  }
}
