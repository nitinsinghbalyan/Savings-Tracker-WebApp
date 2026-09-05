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
