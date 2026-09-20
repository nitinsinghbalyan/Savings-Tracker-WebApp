// Local display preferences — theme and the Overview comparison period.
// Deliberately localStorage, not `user_profiles`: the profile loads async after
// auth, so a database-backed theme would paint the wrong one first. Same shape
// as chartPreferences.js, which is the established pattern here.
const STORAGE_KEY = 'savings-lite-display-preferences'

export const THEMES = ['light', 'dark', 'auto']
export const COMPARE_PERIODS = ['month', 'year']

export const DEFAULT_DISPLAY_PREFERENCES = {
  theme: 'auto',
  comparePeriod: 'month',
}

export function loadDisplayPreferences() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_DISPLAY_PREFERENCES }

    const parsed = JSON.parse(raw)
    return {
      theme: THEMES.includes(parsed?.theme)
        ? parsed.theme
        : DEFAULT_DISPLAY_PREFERENCES.theme,
      comparePeriod: COMPARE_PERIODS.includes(parsed?.comparePeriod)
        ? parsed.comparePeriod
        : DEFAULT_DISPLAY_PREFERENCES.comparePeriod,
    }
  } catch {
    // Private mode, disabled storage, or corrupt JSON — defaults are always safe.
    return { ...DEFAULT_DISPLAY_PREFERENCES }
  }
}

export function saveDisplayPreferences(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch {
    /* storage unavailable — preference simply does not persist */
  }
}
