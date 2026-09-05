import { format } from 'date-fns'
import { fetchExchangeRate, convertAmount, buildConversionNote } from './exchangeRate'
import { resolveTransactionCategory } from './transactionCategory'

export const TRANSACTION_GOAL_NOTE_PREFIXES = [
  'From expense transaction',
  'From income transaction',
]

export function isSavingsCategoryTransaction(tx) {
  if (!tx || tx.type !== 'expense') return false
  const category = resolveTransactionCategory(tx)
  return Boolean(category?.is_savings)
}

export function isGoalLinkedTransaction(tx, goalLinkedIds) {
  if (!tx) return false
  if (tx.goal_id) return true
  return goalLinkedIds?.has(tx.id) ?? false
}

/** Savings-category expense that is not also applied to a goal (no double count). */
export function countsAsCategorySavings(tx, goalLinkedIds) {
  return isSavingsCategoryTransaction(tx) && !isGoalLinkedTransaction(tx, goalLinkedIds)
}

export function shouldHighlightSavingsOrGoal(tx, goalLinkedIds) {
  return isSavingsCategoryTransaction(tx) || isGoalLinkedTransaction(tx, goalLinkedIds)
}

function noteMatchesGoalPrefix(note) {
  return TRANSACTION_GOAL_NOTE_PREFIXES.some((prefix) => note.startsWith(prefix))
}

/** Index transactions for O(1) legacy note matching: date|type|currency|amount → tx ids */
function buildTransactionMatchIndex(transactions) {
  const index = new Map()
  for (const tx of transactions) {
    if (tx.type !== 'expense' && tx.type !== 'income') continue
    const currency = tx.account?.currency ?? 'INR'
    const amount = Number(tx.amount) || 0
    const key = `${tx.transaction_date}|${tx.type}|${currency}|${amount.toFixed(2)}`
    let list = index.get(key)
    if (!list) {
      list = []
      index.set(key, list)
    }
    list.push(tx.id)
  }
  return index
}

export function buildGoalLinkedTransactionIds(transactions, goals) {
  const ids = new Set()

  for (const tx of transactions) {
    if (tx.goal_id) ids.add(tx.id)
  }

  for (const goal of goals) {
    for (const contribution of goal.contributions ?? []) {
      if (contribution.source_transaction_id) {
        ids.add(contribution.source_transaction_id)
      }
    }
  }

  let matchIndex = null

  for (const goal of goals) {
    const goalCurrency = goal.currency ?? 'INR'
    for (const contribution of goal.contributions ?? []) {
      if (contribution.source_transaction_id) continue
      const note = contribution.note ?? ''
      if (!noteMatchesGoalPrefix(note)) continue

      const contribDate = contribution.created_at
        ? format(new Date(contribution.created_at), 'yyyy-MM-dd')
        : null
      if (!contribDate) continue

      const contribAmount = Number(contribution.amount) || 0
      if (!matchIndex) matchIndex = buildTransactionMatchIndex(transactions)

      // Prefer expense then income keys (legacy matching scanned in list order).
      for (const type of ['expense', 'income']) {
        const key = `${contribDate}|${type}|${goalCurrency}|${contribAmount.toFixed(2)}`
        const candidates = matchIndex.get(key)
        if (!candidates) continue
        const matchId = candidates.find((id) => !ids.has(id))
        if (matchId) {
          ids.add(matchId)
          break
        }
      }
    }
  }

  return ids
}

/** Contribution ids tied to a ledger transaction (source link or legacy note match). */
export function findLinkedContributionIds(transaction, goals) {
  const ids = []
  if (!transaction?.id) return ids
  const seen = new Set()

  const add = (id) => {
    if (!id || seen.has(id)) return
    seen.add(id)
    ids.push(id)
  }

  for (const goal of goals) {
    for (const contribution of goal.contributions ?? []) {
      if (contribution.source_transaction_id === transaction.id) {
        add(contribution.id)
      }
    }
  }

  const txCurrency = transaction.account?.currency ?? 'INR'
  const txAmount = Number(transaction.amount) || 0
  const canLegacyMatch =
    transaction.type === 'expense' || transaction.type === 'income'

  for (const goal of goals) {
    if (!canLegacyMatch) break
    const goalCurrency = goal.currency ?? 'INR'
    if (goalCurrency !== txCurrency) continue

    for (const contribution of goal.contributions ?? []) {
      if (seen.has(contribution.id)) continue
      if (contribution.source_transaction_id) continue

      const note = contribution.note ?? ''
      if (!noteMatchesGoalPrefix(note)) continue

      const contribDate = contribution.created_at
        ? format(new Date(contribution.created_at), 'yyyy-MM-dd')
        : null
      if (!contribDate || contribDate !== transaction.transaction_date) continue

      const contribAmount = Number(contribution.amount) || 0
      if (Math.abs(txAmount - contribAmount) >= 0.01) continue

      add(contribution.id)
    }
  }

  return ids
}

export async function buildGoalContributionFromTransaction({
  goal,
  amount,
  accountCurrency,
  note,
  transactionType = 'income',
}) {
  const goalCurrency = goal.currency ?? 'INR'
  const needsConversion = goalCurrency !== accountCurrency
  const label = transactionType === 'expense' ? 'expense' : 'income'
  const txNote = note ? `From ${label} transaction: ${note}` : `From ${label} transaction`

  if (needsConversion) {
    const rateInfo = await fetchExchangeRate(accountCurrency, goalCurrency)
    const contributionAmount = convertAmount(amount, rateInfo.rate)
    if (!contributionAmount || contributionAmount <= 0) {
      throw new Error(`Could not convert ${accountCurrency} to ${goalCurrency} for this amount`)
    }
    return {
      goalId: goal.id,
      amount: contributionAmount,
      note: buildConversionNote({
        sourceAmount: amount,
        sourceCurrency: accountCurrency,
        goalAmount: contributionAmount,
        goalCurrency,
        rate: rateInfo.rate,
        userNote: txNote,
      }),
    }
  }

  return {
    goalId: goal.id,
    amount,
    note: txNote,
  }
}
