// Native date pickers (session 93). The real <input type="date"> sits,
// transparent, on top of the styled field, so the user's tap lands on it and
// every platform opens its own picker — iOS Safari ignores showPicker() on a
// hidden input, which silently swallowed taps on the old button + sr-only
// input. Desktop Chrome/Edge only open the calendar from their icon, so a
// click anywhere also asks for the picker; on phones the tap has already
// opened it and the call may throw, which is fine.
export function showNativePicker(event) {
  try {
    event.currentTarget.showPicker?.()
  } catch {
    // Already open, or the browser has no showPicker — the tap still works.
  }
}
