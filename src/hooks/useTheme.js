import { useCallback, useEffect, useState } from 'react'
import {
  loadDisplayPreferences,
  saveDisplayPreferences,
} from '../lib/displayPreferences'
import { applyTheme, prefersDark, resolveTheme, watchSystemTheme } from '../lib/theme'

export function useTheme() {
  const [prefs, setPrefs] = useState(() => loadDisplayPreferences())
  const [systemDark, setSystemDark] = useState(() => prefersDark())

  // Keep 'auto' honest when the OS flips while the app is open.
  useEffect(() => watchSystemTheme(setSystemDark), [])

  // Declared below the state it reads — a derived value above its source throws
  // at render and blanks the screen (error-history.md, three recorded instances).
  const resolved = resolveTheme(prefs.theme, systemDark)

  useEffect(() => {
    applyTheme(resolved)
  }, [resolved])

  const setTheme = useCallback((theme) => {
    setPrefs((prev) => {
      const next = { ...prev, theme }
      saveDisplayPreferences(next)
      return next
    })
  }, [])

  const setComparePeriod = useCallback((comparePeriod) => {
    setPrefs((prev) => {
      const next = { ...prev, comparePeriod }
      saveDisplayPreferences(next)
      return next
    })
  }, [])

  return {
    theme: prefs.theme,
    comparePeriod: prefs.comparePeriod,
    resolved,
    setTheme,
    setComparePeriod,
  }
}
