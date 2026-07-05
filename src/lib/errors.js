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
