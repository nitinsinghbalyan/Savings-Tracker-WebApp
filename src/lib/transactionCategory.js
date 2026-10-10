import { supabase } from './supabase'
import { assertNoError } from './errors'

export function categorySnapshotFromRow(category) {
  if (!category) return {}
  return {
    category_name: category.name,
    category_color: category.color ?? 'indigo',
    category_is_savings: Boolean(category.is_savings),
  }
}

/**
 * Display category for a transaction — prefers frozen snapshot over live join.
 * There is no icon snapshot column: the icon comes from the live join when the
 * category still exists, and `getCategoryIconId` falls back to a name-based
 * default when it does not, so no migration is needed.
 */
export function resolveTransactionCategory(tx) {
  if (tx?.category_name) {
    return {
      id: tx.category_id ?? null,
      name: tx.category_name,
      color: tx.category_color ?? 'indigo',
      icon: tx.category?.icon ?? null,
      is_savings: Boolean(tx.category_is_savings),
      kind: tx.type === 'income' ? 'income' : 'expense',
    }
  }
  return tx?.category ?? null
}

export async function fetchCategorySnapshot(userId, categoryId) {
  if (!categoryId) {
    return {
      category_name: null,
      category_color: null,
      category_is_savings: false,
    }
  }

  const { data, error } = await supabase
    .from('categories')
    .select('name, color, is_savings')
    .eq('id', categoryId)
    .eq('user_id', userId)
    .single()

  assertNoError(error, 'Category not found')
  return categorySnapshotFromRow(data)
}
