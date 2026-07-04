import { fetchExchangeRate, convertAmount, buildConversionNote } from './exchangeRate'

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
