import { useCallback, useMemo } from 'react'
import { useAppData } from '../context/AppDataContext'
import { useAuth } from './useAuth'

export function useCategories({ enabled = true, kind } = {}) {
  const { user } = useAuth()
  const showData = Boolean(user)
  const {
    categories,
    bootstrapping,
    categoriesError,
    refreshCategories,
    createCategory,
    updateCategory,
    archiveCategory,
    deleteCategory,
    deleteAllCategories,
  } = useAppData()

  const filtered = useMemo(() => {
    if (!showData) return []
    if (!kind) return categories
    return categories.filter((c) => c.kind === kind)
  }, [showData, categories, kind])

  const loading = enabled && bootstrapping && categories.length === 0

  const refetch = useCallback(async () => {
    if (!enabled) return
    await refreshCategories({ background: categories.length > 0 })
  }, [enabled, refreshCategories, categories.length])

  return {
    categories: filtered,
    loading,
    error: enabled ? categoriesError : null,
    refetch,
    createCategory,
    updateCategory,
    archiveCategory,
    deleteCategory,
    deleteAllCategories,
  }
}
