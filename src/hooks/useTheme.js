import { useCallback, useEffect, useRef, useState } from 'react'
import {
  loadDisplayPreferences,
  saveDisplayPreferences,
  subscribeDisplayPreferences,
} from '../lib/displayPreferences'
import { applyTheme, prefersDark, resolveTheme, watchSystemTheme } from '../lib/theme'

export function useTheme() {
  const [prefs, setPrefs] = useState(() => loadDisplayPreferences())
  const [systemDark, setSystemDark] = useState(() => prefersDark())

  // Keep 'auto' honest when the OS flips while the app is open.
  useEffect(() => watchSystemTheme(setSystemDark), [])

  // Follow changes made by any other useTheme() — Settings and Summary are both
  // kept mounted, so each instance must hear the other's writes.
  useEffect(
    () =>
      subscribeDisplayPreferences((next) => {
        setPrefs((prev) =>
          prev.theme === next.theme && prev.comparePeriod === next.comparePeriod
            ? prev
            : { theme: next.theme, comparePeriod: next.comparePeriod },
        )
      }),
    [],
  )

  // Declared below the state it reads — a derived value above its source throws
  // at render and blanks the screen (error-history.md, three recorded instances).
  const resolved = resolveTheme(prefs.theme, systemDark)

  useEffect(() => {
    applyTheme(resolved)
  }, [resolved])

  // Save outside the state updater: saving notifies the other mounted
  // instances, and setState-ing another component from inside an updater is a
  // render-phase update React warns about.
  const prefsRef = useRef(prefs)
  useEffect(() => {
    prefsRef.current = prefs
  }, [prefs])

  const update = useCallback((patch) => {
    const next = { ...prefsRef.current, ...patch }
    prefsRef.current = next
    setPrefs(next)
    saveDisplayPreferences(next)
  }, [])

  const setTheme = useCallback((theme) => update({ theme }), [update])

  const setComparePeriod = useCallback((comparePeriod) => update({ comparePeriod }), [update])

  return {
    theme: prefs.theme,
    comparePeriod: prefs.comparePeriod,
    resolved,
    setTheme,
    setComparePeriod,
  }
}
