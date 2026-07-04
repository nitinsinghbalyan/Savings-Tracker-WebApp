export function assertNoError(error, fallbackMessage) {
  if (error) {
    const detail = error.details || error.hint
    const message = error.message || fallbackMessage
    throw new Error(detail ? `${message} (${detail})` : message)
  }
}
