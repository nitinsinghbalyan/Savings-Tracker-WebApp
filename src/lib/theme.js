// Resolving and applying the theme. Kept free of React so the same logic can be
// mirrored by the pre-paint script in index.html.
const DARK_QUERY = '(prefers-color-scheme: dark)'

export function prefersDark() {
  try {
    return window.matchMedia(DARK_QUERY).matches
  } catch {
    return false
  }
}

/** 'auto' resolves against the OS; everything else is taken at face value. */
export function resolveTheme(preference, systemPrefersDark = prefersDark()) {
  if (preference === 'dark') return 'dark'
  if (preference === 'light') return 'light'
  return systemPrefersDark ? 'dark' : 'light'
}

/**
 * Apply a resolved theme to the document. Also updates `color-scheme` (so form
 * controls and scrollbars follow) and the theme-color meta (so the mobile
 * browser chrome matches).
 */
export function applyTheme(resolved) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.classList.toggle('dark', resolved === 'dark')
  root.style.colorScheme = resolved

  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', resolved === 'dark' ? '#16130F' : '#EFE9DE')

  // index.html paints the body before React mounts; keep it in step afterwards.
  document.body.style.background = resolved === 'dark' ? '#16130F' : '#EFE9DE'
  document.body.style.color = resolved === 'dark' ? '#F7F3EC' : '#16130F'
}

export function watchSystemTheme(onChange) {
  try {
    const mql = window.matchMedia(DARK_QUERY)
    const handler = (e) => onChange(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  } catch {
    return () => {}
  }
}
