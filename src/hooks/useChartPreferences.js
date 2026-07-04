import { useCallback, useState } from 'react'
import {
  DEFAULT_CHART_PREFERENCES,
  loadChartPreferences,
  saveChartPreferences,
} from '../lib/chartPreferences'

export function useChartPreferences() {
  const [prefs, setPrefs] = useState(() => loadChartPreferences())

  const updatePrefs = useCallback((patch) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch }
      saveChartPreferences(next)
      return next
    })
  }, [])

  const resetPrefs = useCallback(() => {
    setPrefs({ ...DEFAULT_CHART_PREFERENCES })
    saveChartPreferences(DEFAULT_CHART_PREFERENCES)
  }, [])

  return { prefs, updatePrefs, resetPrefs }
}
