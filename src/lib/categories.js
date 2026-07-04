import { supabase } from './supabase'
import { requireUserId } from './auth'
import { assertNoError } from './errors'
import { categorySnapshotFromRow } from './transactionCategory'
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from './constants'

function categoryNameKey(name) {
  return String(name ?? '').trim().toLowerCase()
}

export function categoryDedupeKey(category) {
  const parentKey = category.parent_id ?? 'root'
  return `${category.kind}:${parentKey}:${categoryNameKey(category.name)}`
}

function pickPreferredCategory(a, b) {
  const orderA = a.sort_order ?? 99
  const orderB = b.sort_order ?? 99
  if (orderA !== orderB) return orderA <= orderB ? a : b
  const createdA = a.created_at ? new Date(a.created_at).getTime() : 0
  const createdB = b.created_at ? new Date(b.created_at).getTime() : 0
  return createdA <= createdB ? a : b
}

export function dedupeCategoriesForDisplay(categories) {
  const winners = new Map()

  for (const category of categories) {
    if (category.is_archived) continue
    const key = categoryDedupeKey(category)
    const existing = winners.get(key)
    winners.set(key, existing ? pickPreferredCategory(existing, category) : category)
  }

  return [...winners.values()].sort((a, b) => {
    const orderDiff = (a.sort_order ?? 99) - (b.sort_order ?? 99)
    if (orderDiff !== 0) return orderDiff
    return String(a.name).localeCompare(String(b.name))
  })
}

export function buildCategoryTree(categories, kind) {
  const filtered = dedupeCategoriesForDisplay(categories).filter((c) => c.kind === kind)
  const parents = filtered.filter((c) => !c.parent_id)
  const childrenByParent = new Map()

  for (const child of filtered.filter((c) => c.parent_id)) {
    const list = childrenByParent.get(child.parent_id) ?? []
    list.push(child)
    childrenByParent.set(child.parent_id, list)
  }

  return parents.map((parent) => ({
    parent,
    children: (childrenByParent.get(parent.id) ?? []).sort((a, b) =>
      String(a.name).localeCompare(String(b.name)),
    ),
  }))
}

/** Picker groups: parents with children are headers; leaf parents and children are selectable */
export function buildCategoryPickerTree(categories, kind) {
  const tree = buildCategoryTree(categories, kind)
  const groups = []

  for (const { parent, children } of tree) {
    if (children.length > 0) {
      groups.push({ label: parent.name, parentId: parent.id, items: children })
    } else {
      groups.push({ label: null, parentId: null, items: [parent] })
    }
  }

  const orphanChildren = dedupeCategoriesForDisplay(categories).filter(
    (c) => c.kind === kind && c.parent_id && !tree.some((t) => t.parent.id === c.parent_id),
  )
  if (orphanChildren.length > 0) {
    groups.push({ label: 'Other', parentId: null, items: orphanChildren })
  }

  return groups
}

export function getSelectableCategories(categories, kind) {
  return buildCategoryPickerTree(categories, kind).flatMap((g) => g.items)
}

async function fetchCategoriesRaw(userId, { kind, includeArchived = false } = {}) {
  let query = supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
    .order('name', { ascending: true })

  if (kind) query = query.eq('kind', kind)
  if (!includeArchived) query = query.eq('is_archived', false)

  const { data, error } = await query
  assertNoError(error, 'Failed to load categories')
  return data ?? []
}

export async function pruneDuplicateCategories() {
  const userId = await requireUserId()
  const rows = await fetchCategoriesRaw(userId, { includeArchived: false })
  const winners = new Map()
  const losers = []

  for (const category of rows) {
    const key = categoryDedupeKey(category)
    const existing = winners.get(key)
    if (!existing) {
      winners.set(key, category)
      continue
    }
    const keep = pickPreferredCategory(existing, category)
    const drop = keep.id === existing.id ? category : existing
    winners.set(key, keep)
    losers.push(drop)
  }

  if (losers.length === 0) return

  await Promise.all(
    losers.map((category) =>
      supabase
        .from('categories')
        .update({ is_archived: true })
        .eq('id', category.id)
        .eq('user_id', userId),
    ),
  )
}

export async function getCategories({ kind, includeArchived = false } = {}) {
  const userId = await requireUserId()
  const rows = await fetchCategoriesRaw(userId, { kind, includeArchived })
  if (includeArchived) return rows
  return dedupeCategoriesForDisplay(rows)
}

export async function seedStarterCategories() {
  const userId = await requireUserId()
  const rows = [
    ...DEFAULT_EXPENSE_CATEGORIES.map((c, i) => ({
      user_id: userId,
      name: c.name,
      kind: 'expense',
      color: c.color,
      sort_order: i,
      is_system: false,
    })),
    ...DEFAULT_INCOME_CATEGORIES.map((c, i) => ({
      user_id: userId,
      name: c.name,
      kind: 'income',
      color: c.color,
      sort_order: i,
      is_system: false,
    })),
  ]

  const { data, error } = await supabase.from('categories').insert(rows).select()
  assertNoError(error, 'Failed to add starter categories')
  return data ?? []
}

export async function ensureCategories() {
  // No auto-seed: users manage their own categories
}

export async function createCategory(data) {
  const userId = await requireUserId()
  const name = data.name.trim()
  const kind = data.kind
  const parentId = data.parent_id ?? null

  if (parentId) {
    const { data: parent, error: parentError } = await supabase
      .from('categories')
      .select('id, kind')
      .eq('id', parentId)
      .eq('user_id', userId)
      .single()
    assertNoError(parentError, 'Parent category not found')
    if (parent.kind !== kind) {
      throw new Error('Sub-category must match parent type')
    }
  }

  const existing = (await fetchCategoriesRaw(userId, { kind, includeArchived: false })).find(
    (category) =>
      categoryNameKey(category.name) === categoryNameKey(name) &&
      (category.parent_id ?? null) === parentId,
  )
  if (existing) return existing

  const { data: category, error } = await supabase
    .from('categories')
    .insert({
      user_id: userId,
      name,
      kind,
      parent_id: parentId,
      color: data.color ?? 'indigo',
      sort_order: data.sort_order ?? 99,
      is_system: false,
      is_savings: Boolean(data.is_savings) && kind === 'expense',
      monthly_budget: kind === 'expense' ? Math.max(0, Number(data.monthly_budget) || 0) : 0,
    })
    .select()
    .single()

  assertNoError(error, 'Failed to create category')
  return category
}

export async function updateCategory(id, patch) {
  const userId = await requireUserId()
  const safePatch = { ...patch }
  delete safePatch.user_id
  delete safePatch.id
  delete safePatch.created_at

  const { data, error } = await supabase
    .from('categories')
    .update(safePatch)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  assertNoError(error, 'Failed to update category')
  return data
}

export async function archiveCategory(id) {
  return updateCategory(id, { is_archived: true })
}

async function collectDescendantCategoryIds(userId, rootId) {
  const { data: rows, error } = await supabase
    .from('categories')
    .select('id, parent_id')
    .eq('user_id', userId)

  assertNoError(error, 'Failed to load categories')

  const ids = new Set([rootId])
  let changed = true
  while (changed) {
    changed = false
    for (const row of rows ?? []) {
      if (row.parent_id && ids.has(row.parent_id) && !ids.has(row.id)) {
        ids.add(row.id)
        changed = true
      }
    }
  }
  return [...ids]
}

async function freezeTransactionSnapshotsForCategories(userId, categoryIds) {
  for (const catId of categoryIds) {
    const { data: cat, error } = await supabase
      .from('categories')
      .select('name, color, is_savings')
      .eq('id', catId)
      .eq('user_id', userId)
      .single()

    if (error || !cat) continue

    const snapshot = categorySnapshotFromRow(cat)
    const { error: updateError } = await supabase
      .from('transactions')
      .update(snapshot)
      .eq('category_id', catId)
      .eq('user_id', userId)

    assertNoError(updateError, 'Failed to preserve transaction categories')
  }
}

export async function deleteCategory(id) {
  const userId = await requireUserId()
  const subtreeIds = await collectDescendantCategoryIds(userId, id)
  await freezeTransactionSnapshotsForCategories(userId, subtreeIds)

  const { error } = await supabase.from('categories').delete().eq('id', id).eq('user_id', userId)
  assertNoError(error, 'Failed to delete category')
}

export async function deleteAllCategories() {
  const userId = await requireUserId()
  const rows = await fetchCategoriesRaw(userId, { includeArchived: true })
  await freezeTransactionSnapshotsForCategories(
    userId,
    rows.map((row) => row.id),
  )

  const { error } = await supabase.from('categories').delete().eq('user_id', userId)
  assertNoError(error, 'Failed to clear categories')
}
