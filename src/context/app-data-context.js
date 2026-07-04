import { createContext } from 'react'

export const AppDataContext = createContext(null)

const CACHE_KEY_SEP = '|'

export function buildTransactionsCacheKey({
  year,
  month,
  monthStartDay = 1,
  type,
  accountId,
} = {}) {
  return [year, month, monthStartDay, type ?? 'all', accountId ?? 'all'].join(CACHE_KEY_SEP)
}

export function buildOverallTransactionsCacheKey({ type, accountId } = {}) {
  return ['overall', type ?? 'all', accountId ?? 'all'].join(CACHE_KEY_SEP)
}

export function isOverallTransactionsCacheKey(key) {
  return key.startsWith(`overall${CACHE_KEY_SEP}`)
}

export function parseTransactionsCacheKey(key) {
  const parts = key.split(CACHE_KEY_SEP)
  if (parts.length < 5) return null

  const year = Number(parts[0])
  const month = Number(parts[1])
  const monthStartDay = Number(parts[2])
  if (!year || !month) return null

  const accountPart = parts.slice(4).join(CACHE_KEY_SEP)

  return {
    year,
    month,
    monthStartDay,
    type: parts[3] === 'all' ? undefined : parts[3],
    accountId: accountPart === 'all' ? undefined : accountPart,
  }
}

export function buildTransactionsCachePrefix(year, month) {
  return `${year}${CACHE_KEY_SEP}${month}${CACHE_KEY_SEP}`
}
