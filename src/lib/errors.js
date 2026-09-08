export function assertNoError(error, fallbackMessage) {
  if (error) {
    const detail = error.details || error.hint
    const message = error.message || fallbackMessage
    throw new Error(detail ? `${message} (${detail})` : message)
  }
}

/** True when category snapshot columns are not on `transactions` yet. */
export function isMissingSnapshotColumnError(error) {
  if (!error) return false
  const message = String(error.message ?? '').toLowerCase()
  const code = String(error.code ?? '')
  return (
    code === '42703' ||
    code === 'PGRST204' ||
    message.includes('category_name') ||
    message.includes('category_color') ||
    message.includes('category_is_savings')
  )
}

/** True when goal link columns are not on `transactions` / `contributions` yet. */
export function isMissingGoalLinkColumnError(error) {
  if (!error) return false
  const message = String(error.message ?? '').toLowerCase()
  const code = String(error.code ?? '')
  // Only treat as "column missing" — not FK violations (23503) that merely mention goal_id.
  if (code === '42703' || code === 'PGRST204') {
    return (
      message.includes('goal_id') ||
      message.includes('source_transaction_id') ||
      // Bare schema-cache misses sometimes omit the column name
      message.includes('schema cache')
    )
  }
  return (
    (message.includes('goal_id') || message.includes('source_transaction_id')) &&
    (message.includes('does not exist') ||
      message.includes('schema cache') ||
      message.includes('could not find'))
  )
}

/** True when goal↔category link columns are not migrated yet. */
export function isMissingGoalCategoryLinkError(error) {
  if (!error) return false
  const message = String(error.message ?? '').toLowerCase()
  const code = String(error.code ?? '')
  return (
    code === '42703' ||
    code === 'PGRST204' ||
    message.includes('linked_category_id') ||
    (message.includes('goal_id') && message.includes('categories'))
  )
}

/**
 * True when a whole table is missing — i.e. `add_net_worth.sql` has not been
 * run yet. Deliberately distinct from the helpers above, which match missing
 * *columns* (42703 / PGRST204). Postgres reports an unknown relation as 42P01
 * and PostgREST reports it as PGRST205.
 */
export function isMissingRelationError(error) {
  if (!error) return false
  const message = String(error.message ?? '').toLowerCase()
  const code = String(error.code ?? '')
  if (code === '42P01' || code === 'PGRST205') return true
  return (
    (message.includes('holdings') ||
      message.includes('net_worth_snapshots') ||
      message.includes('contribution_plans')) &&
    (message.includes('does not exist') ||
      message.includes('schema cache') ||
      message.includes('could not find'))
  )
}

/** True when the net worth target columns are not on `user_profiles` yet. */
export function isMissingNetWorthTargetColumnError(error) {
  if (!error) return false
  const message = String(error.message ?? '').toLowerCase()
  const code = String(error.code ?? '')
  if (code === '42703' || code === 'PGRST204') {
    return (
      message.includes('net_worth_target') ||
      // Bare schema-cache misses sometimes omit the column name
      message.includes('schema cache')
    )
  }
  return (
    message.includes('net_worth_target') &&
    (message.includes('does not exist') ||
      message.includes('schema cache') ||
      message.includes('could not find'))
  )
}
