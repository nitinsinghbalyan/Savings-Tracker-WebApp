import { formatMoney } from './format'

const CACHE_KEY_PREFIX = 'savings-fx-'
const CACHE_TTL_MS = 60 * 60 * 1000

/** Used when Frankfurter is unreachable (common on mobile/PWA). */
const FALLBACK_RATES = {
  'INR-USD': 0.012,
  'USD-INR': 83,
}

function buildCacheKey(from, to) {
  return `${CACHE_KEY_PREFIX}${from}-${to}`
}

function readCache(from, to) {
  try {
    const raw = localStorage.getItem(buildCacheKey(from, to))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.rate || Date.now() - parsed.fetchedAt > CACHE_TTL_MS) return null
    return { rate: parsed.rate, date: parsed.date ?? null }
  } catch {
    return null
  }
}

function writeCache(from, to, { rate, date }) {
  try {
    localStorage.setItem(
      buildCacheKey(from, to),
      JSON.stringify({ rate, date, fetchedAt: Date.now() }),
    )
  } catch {
    // ignore storage errors
  }
}

export function convertAmount(amount, rate) {
  const value = Number(amount) * Number(rate)
  if (!Number.isFinite(value)) return 0
  return Math.round(value * 100) / 100
}

export function parseFrankfurterResponse(data, to) {
  const rate = data?.rates?.[to]
  if (!rate || rate <= 0) {
    throw new Error('Invalid exchange rate')
  }
  return { rate, date: data.date ?? null }
}

async function fetchFrankfurterRate(from, to) {
  const response = await fetch(
    `https://api.frankfurter.app/latest?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
  )

  if (!response.ok) {
    throw new Error('Could not fetch exchange rate')
  }

  const data = await response.json()
  return parseFrankfurterResponse(data, to)
}

function getFallbackRate(from, to) {
  const direct = FALLBACK_RATES[`${from}-${to}`]
  if (direct) return { rate: direct, date: null, fallback: true }

  const inverse = FALLBACK_RATES[`${to}-${from}`]
  if (inverse) return { rate: 1 / inverse, date: null, fallback: true }

  return null
}

export async function fetchExchangeRate(from, to) {
  if (from === to) {
    return { rate: 1, date: null }
  }

  const cached = readCache(from, to)
  if (cached) return cached

  try {
    const parsed = await fetchFrankfurterRate(from, to)
    writeCache(from, to, parsed)
    return parsed
  } catch {
    const fallback = getFallbackRate(from, to)
    if (fallback) {
      writeCache(from, to, fallback)
      return fallback
    }
    throw new Error(`Could not fetch ${from}/${to} exchange rate`)
  }
}

export function buildConversionNote({
  sourceAmount,
  sourceCurrency,
  goalAmount,
  goalCurrency,
  rate,
  userNote,
}) {
  const conversionLine = `Converted from ${formatMoney(sourceAmount, sourceCurrency)} at 1 ${sourceCurrency} = ${rate} ${goalCurrency} → ${formatMoney(goalAmount, goalCurrency)}`
  if (!userNote) return conversionLine
  return `${userNote} (${conversionLine})`
}
