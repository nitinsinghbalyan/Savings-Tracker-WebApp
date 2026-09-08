import { supabase } from './supabase'
import { requireUserId } from './auth'
import { assertNoError, isMissingRelationError } from './errors'

const EDITABLE_FIELDS = [
  'name',
  'holding_group',
  'currency',
  'value',
  'quantity',
  'unit_price',
  'unit_label',
  'excluded_from_target',
  'linked_account_id',
  'note',
  'sort_order',
  'is_archived',
]

function toNullableNumber(raw) {
  if (raw === '' || raw === null || raw === undefined) return null
  const num = Number(raw)
  return Number.isFinite(num) ? num : null
}

function toRow(data) {
  return {
    name: String(data.name ?? '').trim(),
    holding_group: data.holding_group,
    currency: data.currency ?? 'INR',
    value: Number(data.value) || 0,
    quantity: toNullableNumber(data.quantity),
    unit_price: toNullableNumber(data.unit_price),
    unit_label: data.unit_label?.trim() || null,
    excluded_from_target: Boolean(data.excluded_from_target),
    linked_account_id: data.linked_account_id || null,
    note: data.note?.trim() || null,
    sort_order: Number(data.sort_order) || 0,
  }
}

/** Returns [] when add_net_worth.sql has not been run — the Worth tab still renders. */
export async function getHoldings() {
  await requireUserId()

  const { data, error } = await supabase
    .from('holdings')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (isMissingRelationError(error)) return []
  assertNoError(error, 'Failed to load holdings')
  return data ?? []
}

export async function createHolding(data) {
  const userId = await requireUserId()

  const { data: holding, error } = await supabase
    .from('holdings')
    .insert({ user_id: userId, ...toRow(data) })
    .select()
    .single()

  assertNoError(error, 'Failed to create holding')
  return holding
}

export async function updateHolding(id, patch) {
  const userId = await requireUserId()

  const safePatch = {}
  for (const field of EDITABLE_FIELDS) {
    if (field in patch) safePatch[field] = patch[field]
  }
  if ('quantity' in safePatch) safePatch.quantity = toNullableNumber(safePatch.quantity)
  if ('unit_price' in safePatch) safePatch.unit_price = toNullableNumber(safePatch.unit_price)
  if ('value' in safePatch) safePatch.value = Number(safePatch.value) || 0
  safePatch.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('holdings')
    .update(safePatch)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  assertNoError(error, 'Failed to update holding')
  return data
}

export async function archiveHolding(id) {
  return updateHolding(id, { is_archived: true })
}

export async function deleteHolding(id) {
  const userId = await requireUserId()
  const { error } = await supabase.from('holdings').delete().eq('id', id).eq('user_id', userId)
  assertNoError(error, 'Failed to delete holding')
  return id
}
