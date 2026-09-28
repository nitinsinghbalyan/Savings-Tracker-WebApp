const STORAGE_KEY = 'savings-lite-chart-preferences'

export const CHART_TYPES = ['mosaic', 'heatmap', 'sparklines']

export const DEFAULT_CHART_PREFERENCES = {
  sortBy: 'amount',
  chartType: 'mosaic',
}

export function loadChartPreferences() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_CHART_PREFERENCES }

    const parsed = JSON.parse(raw)
    // Whitelisted field by field — anything not listed here is dropped on
    // reload, so a new preference must be added in both places.
    return {
      sortBy: parsed?.sortBy === 'name' ? 'name' : 'amount',
      chartType: CHART_TYPES.includes(parsed?.chartType)
        ? parsed.chartType
        : DEFAULT_CHART_PREFERENCES.chartType,
    }
  } catch {
    return { ...DEFAULT_CHART_PREFERENCES }
  }
}

export function saveChartPreferences(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch {
    // Private mode or storage disabled — the preference just doesn't persist.
    // Previously this threw and took the chart down with it.
  }
}
