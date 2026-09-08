import { supabase } from './supabase'
import { requireUserId } from './auth'
import { assertNoError, isMissingRelationError } from './errors'

export const SNAPSHOT_LIMIT = 24

/**
 * The whole of net worth history. Capped at two years of rows so the trend
 * chart costs O(months) — never a ledger scan, which is what got the previous
 * net worth tracker removed in session 46.
 */
export async function getSnapshots({ months = SNAPSHOT_LIMIT } = {}) {
  await requireUserId()

  const limit = Math.min(Math.max(1, Number(months) || SNAPSHOT_LIMIT), SNAPSHOT_LIMIT)

  const { data, error } = await supabase
    .from('net_worth_snapshots')
    .select('*')
    .order('period', { ascending: false })
    .limit(limit)

  if (isMissingRelationError(error)) return []
  assertNoError(error, 'Failed to load net worth history')
  return [...(data ?? [])].sort((a, b) => String(a.period).localeCompare(String(b.period)))
}

/**
 * Write (or overwrite) this period's snapshot. Idempotent: the last visit in a
 * period wins, so editing holdings mid-period self-corrects.
 */
export async function upsertSnapshot({
  period,
  currency = 'INR',
  assets = 0,
  liabilities = 0,
  netWorth = 0,
  targetEligible = 0,
}) {
  const userId = await requireUserId()

  const { data, error } = await supabase
    .from('net_worth_snapshots')
    .upsert(
      {
        user_id: userId,
        period,
        currency,
        assets,
        liabilities,
        net_worth: netWorth,
        target_eligible: targetEligible,
      },
      { onConflict: 'user_id,period,currency' },
    )
    .select()
    .single()

  if (isMissingRelationError(error)) return null
  assertNoError(error, 'Failed to save net worth snapshot')
  return data
}
