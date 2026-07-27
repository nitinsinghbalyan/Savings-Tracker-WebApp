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

  for (const goal of goals) {
    const goalCurrency = goal.currency ?? 'INR'
    for (const contribution of goal.contributions ?? []) {
      if (contribution.source_transaction_id) continue
      const note = contribution.note ?? ''
      if (!TRANSACTION_GOAL_NOTE_PREFIXES.some((prefix) => note.startsWith(prefix))) continue

      const contribDate = contribution.created_at
        ? format(new Date(contribution.created_at), 'yyyy-MM-dd')
        : null
      if (!contribDate) continue

      const contribAmount = Number(contribution.amount) || 0

      for (const tx of transactions) {
        if (ids.has(tx.id)) continue
        if (tx.transaction_date !== contribDate) continue
        if (tx.type !== 'expense' && tx.type !== 'income') continue
        if ((tx.account?.currency ?? 'INR') !== goalCurrency) continue
        if (Math.abs(Number(tx.amount) - contribAmount) >= 0.01) continue
        ids.add(tx.id)
        break
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

  for (const goal of goals) {
    const goalCurrency = goal.currency ?? 'INR'
    for (const contribution of goal.contributions ?? []) {
      if (seen.has(contribution.id)) continue
      if (contribution.source_transaction_id) continue

      const note = contribution.note ?? ''
      if (!TRANSACTION_GOAL_NOTE_PREFIXES.some((prefix) => note.startsWith(prefix))) continue

      const contribDate = contribution.created_at
        ? format(new Date(contribution.created_at), 'yyyy-MM-dd')
        : null
      if (!contribDate || contribDate !== transaction.transaction_date) continue
      if (transaction.type !== 'expense' && transaction.type !== 'income') continue
      if ((transaction.account?.currency ?? 'INR') !== goalCurrency) continue

      const contribAmount = Number(contribution.amount) || 0
      const txAmount = Number(transaction.amount) || 0
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
