const CURRENCY_LOCALES = {
  INR: 'en-IN',
  USD: 'en-US',
}

const formatterCache = new Map()

function getNumberFormatter(currency) {
  const code = currency === 'USD' ? 'USD' : 'INR'
  const key = `num-${code}`
  if (!formatterCache.has(key)) {
    formatterCache.set(
      key,
      new Intl.NumberFormat(CURRENCY_LOCALES[code] ?? 'en-IN', {
        maximumFractionDigits: 2,
      }),
    )
  }
  return formatterCache.get(key)
}

function getFormatter(currency, { compact = false, decimals = 0 } = {}) {
  const key = `${currency}-${compact}-${decimals}`
  if (!formatterCache.has(key)) {
    formatterCache.set(
      key,
      new Intl.NumberFormat(CURRENCY_LOCALES[currency] ?? 'en-IN', {
        style: 'currency',
        currency: currency === 'USD' ? 'USD' : 'INR',
        ...(compact
          ? { notation: 'compact', maximumFractionDigits: 1 }
          : { minimumFractionDigits: 0, maximumFractionDigits: decimals }),
      }),
    )
  }
  return formatterCache.get(key)
}

export function formatCurrency(amount, currency = 'INR', options = {}) {
  const code = currency === 'USD' ? 'USD' : 'INR'
  const { compact = false, decimals = 0 } = options
  return getFormatter(code, { compact, decimals }).format(Number(amount) || 0)
}

/** Account balances and transaction amounts — up to 2 decimal places */
export function formatMoney(amount, currency = 'INR') {
  return formatCurrency(amount, currency, { decimals: 2 })
}

export function formatCurrencyCompact(amount, currency = 'INR') {
  const value = Number(amount) || 0
  const code = currency === 'USD' ? 'USD' : 'INR'
  if (Math.abs(value) < 10000) return formatCurrency(value, code)
  return getFormatter(code, { compact: true, decimals: 0 }).format(value)
}

export function parseAmountInput(raw) {
  const cleaned = String(raw).replace(/,/g, '').replace(/[^\d.]/g, '')
  const dotIndex = cleaned.indexOf('.')
  if (dotIndex === -1) return cleaned
  return `${cleaned.slice(0, dotIndex)}.${cleaned.slice(dotIndex + 1).replace(/\./g, '')}`
}

export function formatAmountInput(value, currency = 'INR') {
  if (value === '' || value === undefined || value === null) return ''
  const num = Number(value)
  if (Number.isNaN(num)) return ''
  return getNumberFormatter(currency).format(num)
}

function formatScaleUnit(value) {
  const rounded = Math.round(value * 10) / 10
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}

export function getAmountScaleLabel(value, currency = 'INR') {
  const num = Number(value)
  if (!num || num <= 0) return null

  if (currency === 'USD') {
    if (num >= 1_000_000_000) {
      return `${formatScaleUnit(num / 1_000_000_000)} billion`
    }
    if (num >= 1_000_000) {
      return `${formatScaleUnit(num / 1_000_000)} million`
    }
    if (num >= 1_000) {
      return `${formatScaleUnit(num / 1_000)} thousand`
    }
    return null
  }

  if (num >= 10_000_000) {
    return `${formatScaleUnit(num / 10_000_000)} crore`
  }
  if (num >= 100_000) {
    return `${formatScaleUnit(num / 100_000)} lakh`
  }
  if (num >= 1_000) {
    return `${formatScaleUnit(num / 1_000)} thousand`
  }
  return null
}
