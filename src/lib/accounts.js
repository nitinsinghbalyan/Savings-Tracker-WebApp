import { supabase } from './supabase'
import { requireUserId } from './auth'
import { assertNoError } from './errors'

export async function getAccountsWithBalances() {
  await requireUserId()

  const { data, error } = await supabase.rpc('get_account_balances')
  assertNoError(error, 'Failed to load accounts')
  return data ?? []
}

export async function getActiveAccounts() {
  const accounts = await getAccountsWithBalances()
  return accounts.filter((a) => !a.is_archived)
}

export async function createAccount(data) {
  const userId = await requireUserId()

  const { data: account, error } = await supabase
    .from('accounts')
    .insert({
      user_id: userId,
      name: data.name.trim(),
      account_type: data.account_type ?? 'checking',
      currency: data.currency ?? 'INR',
      opening_balance: Number(data.opening_balance) || 0,
      color: data.color ?? 'indigo',
      bank: data.bank ?? null,
    })
    .select()
    .single()

  assertNoError(error, 'Failed to create account')
  const balances = await getAccountsWithBalances()
  return balances.find((a) => a.id === account.id) ?? { ...account, balance: account.opening_balance }
}

export async function updateAccount(id, patch) {
  const userId = await requireUserId()
  const safePatch = { ...patch }
  delete safePatch.user_id
  delete safePatch.id
  delete safePatch.created_at
  delete safePatch.balance

  const { error } = await supabase
    .from('accounts')
    .update(safePatch)
    .eq('id', id)
    .eq('user_id', userId)

  assertNoError(error, 'Failed to update account')
  const balances = await getAccountsWithBalances()
  return balances.find((a) => a.id === id)
}

export async function archiveAccount(id) {
  return updateAccount(id, { is_archived: true })
}

export async function deleteAllAccounts() {
  const userId = await requireUserId()
  const { error } = await supabase.from('accounts').delete().eq('user_id', userId)
  assertNoError(error, 'Failed to clear accounts')
}
