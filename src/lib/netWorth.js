// Pure net worth aggregation. No I/O — the Worth screen and the snapshot
// writer both derive their figures here so the two can never disagree.
//
// Deliberately never touches `transactions`: F-87 (session 43) reconstructed
// history by walking the whole ledger backwards and was removed in session 46
// for being slow and wrong. History comes from net_worth_snapshots instead.

export const ASSET_GROUPS = ['large_fixed', 'liquid', 'personal']
export const LIABILITY_GROUPS = ['long_term_liability', 'short_term_liability']

export const HOLDING_GROUPS = [
  {
    key: 'large_fixed',
    label: 'Large & fixed',
    hint: 'Investments, retirement accounts, vehicles, deposits',
    kind: 'asset',
  },
  {
    key: 'liquid',
    label: 'Liquid',
    hint: 'Cash and savings balances',
    kind: 'asset',
  },
  {
    key: 'personal',
    label: 'Personal items',
    hint: 'Jewellery, gold, valuables',
    kind: 'asset',
  },
  {
    key: 'long_term_liability',
    label: 'Long-term liabilities',
    hint: 'Loans running beyond a year',
    kind: 'liability',
  },
  {
    key: 'short_term_liability',
    label: 'Short-term liabilities',
    hint: 'Credit cards and dues',
    kind: 'liability',
  },
]

const GROUP_LABELS = new Map(HOLDING_GROUPS.map((g) => [g.key, g.label]))

export function getGroupLabel(key) {
  return GROUP_LABELS.get(key) ?? key
}

export function isLiabilityGroup(key) {
  return LIABILITY_GROUPS.includes(key)
}

/**
 * A holding is worth either a flat amount or quantity × unit price.
 * Quantity pricing wins only when both parts are present, so a half-filled
 * form never silently values a holding at zero.
 */
export function holdingValue(holding) {
  if (!holding) return 0
  const quantity = Number(holding.quantity)
  const unitPrice = Number(holding.unit_price)
  if (Number.isFinite(quantity) && Number.isFinite(unitPrice) && holding.quantity !== null) {
    return quantity * unitPrice
  }
  return Number(holding.value) || 0
}

export function isQuantityPriced(holding) {
  if (!holding) return false
  return (
    holding.quantity !== null &&
    holding.quantity !== undefined &&
    holding.quantity !== '' &&
    Number.isFinite(Number(holding.quantity)) &&
    Number.isFinite(Number(holding.unit_price))
  )
}

/** Live account balance, read exactly as sumBalancesForCurrency does. */
function accountBalance(account) {
  return Number(account.balance ?? account.opening_balance ?? 0) || 0
}

export function groupHoldings(holdings = []) {
  const byGroup = new Map(HOLDING_GROUPS.map((g) => [g.key, { items: [], total: 0 }]))

  for (const holding of holdings) {
    if (holding.is_archived) continue
    const bucket = byGroup.get(holding.holding_group)
    if (!bucket) continue
    const value = holdingValue(holding)
    bucket.items.push(holding)
    bucket.total += value
  }

  return byGroup
}

/**
 * Combine manually tracked holdings with the live account balances the ledger
 * already maintains.
 *
 * - non-credit accounts  -> liquid assets
 * - credit accounts      -> short-term liabilities, at max(0, -balance)
 * - a holding carrying `linked_account_id` is skipped, because the account row
 *   above already supplies it. This is the double-count guard.
 *
 * Currencies are never blended (see project-memory/decisions.md); callers run
 * this once per currency and render one block each.
 */
export function buildNetWorth(holdings = [], accounts = [], { currency = 'INR' } = {}) {
  const groups = new Map(
    HOLDING_GROUPS.map((g) => [g.key, { key: g.key, label: g.label, kind: g.kind, total: 0, items: [] }]),
  )

  let excluded = 0

  for (const holding of holdings) {
    if (holding.is_archived) continue
    if ((holding.currency ?? 'INR') !== currency) continue
    if (holding.linked_account_id) continue

    const group = groups.get(holding.holding_group)
    if (!group) continue

    const value = holdingValue(holding)
    group.total += value
    group.items.push({
      id: holding.id,
      name: holding.name,
      value,
      excluded: Boolean(holding.excluded_from_target),
      quantity: holding.quantity,
      unitPrice: holding.unit_price,
      unitLabel: holding.unit_label,
      note: holding.note,
      source: 'holding',
      holding,
    })

    if (holding.excluded_from_target) {
      excluded += isLiabilityGroup(holding.holding_group) ? -value : value
    }
  }

  for (const account of accounts) {
    if (account.is_archived) continue
    if ((account.currency ?? 'INR') !== currency) continue

    const balance = accountBalance(account)

    if (account.account_type === 'credit') {
      // Money owed is a negative balance. A credit account in surplus owes
      // nothing — it must not turn into an asset.
      const owed = Math.max(0, -balance)
      const group = groups.get('short_term_liability')
      group.total += owed
      group.items.push({
        id: account.id,
        name: account.name,
        value: owed,
        excluded: false,
        source: 'account',
        account,
      })
      continue
    }

    const group = groups.get('liquid')
    group.total += balance
    group.items.push({
      id: account.id,
      name: account.name,
      value: balance,
      excluded: false,
      source: 'account',
      account,
    })
  }

  const largeFixed = groups.get('large_fixed').total
  const liquid = groups.get('liquid').total
  const personal = groups.get('personal').total
  const longTerm = groups.get('long_term_liability').total
  const shortTerm = groups.get('short_term_liability').total

  const assetsTotal = largeFixed + liquid + personal
  const liabilitiesTotal = longTerm + shortTerm
  const netWorth = assetsTotal - liabilitiesTotal

  return {
    currency,
    assets: { largeFixed, liquid, personal, total: assetsTotal },
    liabilities: { longTerm, shortTerm, total: liabilitiesTotal },
    netWorth,
    targetEligible: netWorth - excluded,
    excludedTotal: excluded,
    groups: [...groups.values()],
  }
}

/** Every currency that has either a holding or an account behind it. */
export function netWorthCurrencies(holdings = [], accounts = []) {
  const currencies = new Set()
  for (const holding of holdings) {
    if (holding.is_archived) continue
    currencies.add(holding.currency ?? 'INR')
  }
  for (const account of accounts) {
    if (account.is_archived) continue
    currencies.add(account.currency ?? 'INR')
  }
  if (currencies.size === 0) currencies.add('INR')
  return [...currencies]
}

/** Target progress. Returns null when no target is set. */
export function buildTargetProgress(summary, { target, targetDate } = {}) {
  const amount = Number(target)
  if (!Number.isFinite(amount) || amount <= 0) return null

  const eligible = summary?.targetEligible ?? 0
  const percent = Math.min(100, Math.max(0, (eligible / amount) * 100))

  return {
    target: amount,
    targetDate: targetDate ?? null,
    eligible,
    percent,
    delta: amount - eligible,
    reached: eligible >= amount,
  }
}
