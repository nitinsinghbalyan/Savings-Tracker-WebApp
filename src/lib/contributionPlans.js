import { supabase } from './supabase'
import { requireUserId } from './auth'
import { assertNoError, isMissingRelationError } from './errors'

const EDITABLE_FIELDS = [
  'name',
  'monthly_amount',
  'currency',
  'category_id',
  'holding_id',
  'sort_order',
  'is_archived',
]

export async function getContributionPlans() {
  await requireUserId()

  const { data, error } = await supabase
    .from('contribution_plans')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (isMissingRelationError(error)) return []
  assertNoError(error, 'Failed to load contribution plan')
  return data ?? []
}

export async function createContributionPlan(data) {
  const userId = await requireUserId()

  const { data: plan, error } = await supabase
    .from('contribution_plans')
    .insert({
      user_id: userId,
      name: String(data.name ?? '').trim(),
      monthly_amount: Number(data.monthly_amount) || 0,
      currency: data.currency ?? 'INR',
      category_id: data.category_id || null,
      holding_id: data.holding_id || null,
      sort_order: Number(data.sort_order) || 0,
    })
    .select()
    .single()

  assertNoError(error, 'Failed to create plan entry')
  return plan
}

export async function updateContributionPlan(id, patch) {
  const userId = await requireUserId()

  const safePatch = {}
  for (const field of EDITABLE_FIELDS) {
    if (field in patch) safePatch[field] = patch[field]
  }
  if ('monthly_amount' in safePatch) {
    safePatch.monthly_amount = Number(safePatch.monthly_amount) || 0
  }

  const { data, error } = await supabase
    .from('contribution_plans')
    .update(safePatch)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  assertNoError(error, 'Failed to update plan entry')
  return data
}

export async function deleteContributionPlan(id) {
  const userId = await requireUserId()
  const { error } = await supabase
    .from('contribution_plans')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  assertNoError(error, 'Failed to delete plan entry')
  return id
}
