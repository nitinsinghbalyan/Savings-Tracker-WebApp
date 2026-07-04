import { format } from 'date-fns'
import { supabase } from './supabase'
import { requireUserId } from './auth'
import { assertNoError } from './errors'
import { createGoal, deleteAllGoals } from './goals'
import { deleteAllAccounts, createAccount } from './accounts'
import { deleteAllCategories, createCategory, getCategories, categoryDedupeKey } from './categories'
import { deleteAllTransactions } from './transactions'
import { createRecurringTransaction, deleteAllRecurringTransactions } from './recurringTransactions'
import { ensureProfile, updateProfile } from './profile'

export const BACKUP_VERSION = 3
export const BACKUP_VERSION_LEGACY = 1

const GOAL_PRIORITIES = new Set(['high', 'medium', 'low'])
const GOAL_CURRENCIES = new Set(['INR', 'USD'])
const GOAL_COLORS = new Set(['indigo', 'rose', 'emerald', 'amber', 'violet', 'cyan'])

function mapGoals(goals) {
  return goals.map((goal) => ({
    name: goal.name,
    target_amount: Number(goal.target_amount),
    start_date: goal.start_date ?? null,
    end_date: goal.end_date ?? null,
    priority: goal.priority ?? 'medium',
    category: goal.category ?? null,
    currency: goal.currency ?? 'INR',
    color: goal.color ?? 'indigo',
    contributions: (goal.contributions ?? []).map((contribution) => ({
      amount: Number(contribution.amount),
      note: contribution.note ?? null,
      created_at: contribution.created_at ?? null,
    })),
  }))
}

export function buildBackupPayload({ goals, profile, accounts, categories, transactions, recurring }) {
  const categoryById = new Map((categories ?? []).map((c) => [c.id, c]))
  return {
    version: BACKUP_VERSION,
    app: 'savings-tracker',
    exported_at: new Date().toISOString(),
    profile: profile
      ? {
          default_currency: profile.default_currency ?? 'INR',
          month_start_day: profile.month_start_day ?? 1,
        }
      : null,
    accounts: (accounts ?? []).map((a) => ({
      name: a.name,
      account_type: a.account_type,
      currency: a.currency,
      opening_balance: Number(a.opening_balance ?? 0),
      color: a.color ?? 'indigo',
      bank: a.bank ?? null,
      is_archived: Boolean(a.is_archived),
    })),
    categories: (categories ?? []).map((c) => ({
      name: c.name,
      kind: c.kind,
      color: c.color ?? 'indigo',
      parent_name: c.parent_id ? categoryById.get(c.parent_id)?.name ?? null : null,
      sort_order: c.sort_order ?? 0,
      is_archived: Boolean(c.is_archived),
      is_savings: Boolean(c.is_savings),
      monthly_budget: Number(c.monthly_budget) || 0,
    })),
    transactions: (transactions ?? []).map((t) => ({
      type: t.type,
      amount: Number(t.amount),
      account_name: t.account?.name ?? null,
      category_name: t.category?.name ?? null,
      category_kind: t.category?.kind ?? null,
      transfer_to_account_name: t.transfer_to?.name ?? null,
      note: t.note ?? null,
      transaction_date: t.transaction_date,
    })),
    recurring_transactions: (recurring ?? []).map((r) => ({
      type: r.type,
      amount: Number(r.amount),
      account_name: r.account?.name ?? null,
      category_name: r.category?.name ?? null,
      category_kind: r.category?.kind ?? null,
      transfer_to_account_name: r.transfer_to?.name ?? null,
      note: r.note ?? null,
      frequency: r.frequency,
      interval_count: r.interval_count ?? 1,
      day_of_month: r.day_of_month,
      start_date: r.start_date,
      end_date: r.end_date ?? null,
      next_run_date: r.next_run_date,
      is_paused: Boolean(r.is_paused),
    })),
    goals: mapGoals(goals ?? []),
  }
}

export async function fetchFullBackupData(goals) {
  const userId = await requireUserId()

  const [profileRes, accountsRes, categoriesRes, transactionsRes, recurringRes] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('accounts').select('*').eq('user_id', userId),
    supabase.from('categories').select('*').eq('user_id', userId),
    supabase
      .from('transactions')
      .select(
        '*, account:accounts!transactions_account_id_fkey(name), category:categories(name, kind), transfer_to:accounts!transactions_transfer_to_account_id_fkey(name)',
      )
      .eq('user_id', userId),
    supabase
      .from('recurring_transactions')
      .select(
        '*, account:accounts!recurring_transactions_account_id_fkey(name), category:categories(name, kind), transfer_to:accounts!recurring_transactions_transfer_to_account_id_fkey(name)',
      )
      .eq('user_id', userId)
      .then((r) => r)
      .catch(() => ({ data: [], error: null })),
  ])

  assertNoError(profileRes.error, 'Failed to export profile')
  assertNoError(accountsRes.error, 'Failed to export accounts')
  assertNoError(categoriesRes.error, 'Failed to export categories')
  assertNoError(transactionsRes.error, 'Failed to export transactions')

  return buildBackupPayload({
    goals,
    profile: profileRes.data,
    accounts: accountsRes.data,
    categories: categoriesRes.data,
    transactions: transactionsRes.data,
    recurring: recurringRes.data ?? [],
  })
}

export async function downloadBackup(goals) {
  const payload = await fetchFullBackupData(goals)

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `savings-tracker-backup-${format(new Date(), 'yyyy-MM-dd')}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

function validateGoal(goal, index) {
  if (!goal || typeof goal !== 'object') {
    throw new Error(`Goal ${index + 1} is invalid`)
  }
  if (!goal.name || typeof goal.name !== 'string') {
    throw new Error(`Goal ${index + 1} is missing a name`)
  }
  if (goal.target_amount == null || Number.isNaN(Number(goal.target_amount))) {
    throw new Error(`Goal "${goal.name}" is missing a target amount`)
  }
  if (goal.priority && !GOAL_PRIORITIES.has(goal.priority)) {
    throw new Error(`Goal "${goal.name}" has an invalid priority`)
  }
  if (goal.currency && !GOAL_CURRENCIES.has(goal.currency)) {
    throw new Error(`Goal "${goal.name}" has an invalid currency`)
  }
  if (goal.color && !GOAL_COLORS.has(goal.color)) {
    throw new Error(`Goal "${goal.name}" has an invalid color`)
  }
  if (goal.contributions != null && !Array.isArray(goal.contributions)) {
    throw new Error(`Goal "${goal.name}" has invalid contributions`)
  }
  for (const [i, contribution] of (goal.contributions ?? []).entries()) {
    if (!contribution || Number.isNaN(Number(contribution.amount))) {
      throw new Error(`Goal "${goal.name}" has an invalid contribution (${i + 1})`)
    }
  }
}

export function parseBackup(text) {
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('File is not valid JSON')
  }

  validateBackupData(data)
  return data
}

export function validateBackupData(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid backup file')
  }
  if (data.app && data.app !== 'savings-tracker') {
    throw new Error('This file is not a Savings Tracker backup')
  }
  if (![BACKUP_VERSION, 2, BACKUP_VERSION_LEGACY].includes(data.version)) {
    throw new Error('Unsupported backup version')
  }
  if (!Array.isArray(data.goals)) {
    throw new Error('Backup is missing goals')
  }

  const isLegacy = data.version === BACKUP_VERSION_LEGACY
  if (isLegacy && data.goals.length === 0) {
    throw new Error('Backup contains no goals')
  }

  data.goals.forEach(validateGoal)
}

export function summarizeBackup(data) {
  const goalCount = data.goals.length
  const contributionCount = data.goals.reduce(
    (sum, goal) => sum + (goal.contributions?.length ?? 0),
    0,
  )
  const accountCount = data.accounts?.length ?? 0
  const transactionCount = data.transactions?.length ?? 0
  return { goalCount, contributionCount, accountCount, transactionCount }
}

async function importContribution(goalId, contribution) {
  const userId = await requireUserId()
  const row = {
    goal_id: goalId,
    user_id: userId,
    amount: Number(contribution.amount),
    note: contribution.note ?? null,
  }
  if (contribution.created_at) {
    row.created_at = contribution.created_at
  }

  const { error } = await supabase.from('contributions').insert(row)
  assertNoError(error, 'Failed to import contribution')
}

async function importGoals(data) {
  for (const goal of data.goals) {
    const created = await createGoal({
      name: goal.name.trim(),
      target_amount: Number(goal.target_amount),
      start_date: goal.start_date ?? undefined,
      end_date: goal.end_date ?? undefined,
      priority: goal.priority ?? 'medium',
      category: goal.category ?? null,
      currency: goal.currency ?? 'INR',
      color: goal.color ?? 'indigo',
    })

    for (const contribution of goal.contributions ?? []) {
      await importContribution(created.id, contribution)
    }
  }
}

async function importFinanceData(data) {
  if (!data.accounts && !data.categories && !data.transactions) return

  await ensureProfile()
  if (data.profile) {
    await updateProfile({
      default_currency: data.profile.default_currency ?? 'INR',
      month_start_day: data.profile.month_start_day ?? 1,
    })
  }

  const accountIdByName = new Map()
  for (const account of data.accounts ?? []) {
    const created = await createAccount({
      name: account.name,
      account_type: account.account_type ?? 'checking',
      currency: account.currency ?? 'INR',
      opening_balance: Number(account.opening_balance) || 0,
      color: account.color ?? 'indigo',
      bank: account.bank ?? null,
    })
    accountIdByName.set(account.name, created.id)
    if (account.is_archived) {
      await supabase.from('accounts').update({ is_archived: true }).eq('id', created.id)
    }
  }

  const categoryIdByKey = new Map()
  const categoryIdByKindName = new Map()
  const parentCategories = (data.categories ?? []).filter((c) => !c.parent_name)
  const childCategories = (data.categories ?? []).filter((c) => c.parent_name)

  for (const category of parentCategories) {
    const key = categoryDedupeKey({ kind: category.kind, name: category.name, parent_id: null })
    if (categoryIdByKey.has(key)) continue

    const created = await createCategory({
      name: category.name,
      kind: category.kind,
      color: category.color ?? 'indigo',
      sort_order: category.sort_order ?? 0,
      is_savings: Boolean(category.is_savings),
      monthly_budget: Number(category.monthly_budget) || 0,
    })
    categoryIdByKey.set(key, created.id)
    categoryIdByKindName.set(`${category.kind}:${category.name.trim().toLowerCase()}`, created.id)
    if (category.is_archived) {
      await supabase.from('categories').update({ is_archived: true }).eq('id', created.id)
    }
  }

  for (const category of childCategories) {
    const parentId = categoryIdByKindName.get(
      `${category.kind}:${String(category.parent_name).trim().toLowerCase()}`,
    )
    const key = categoryDedupeKey({
      kind: category.kind,
      name: category.name,
      parent_id: parentId ?? 'missing',
    })
    if (categoryIdByKey.has(key)) continue

    const created = await createCategory({
      name: category.name,
      kind: category.kind,
      color: category.color ?? 'indigo',
      sort_order: category.sort_order ?? 0,
      is_savings: Boolean(category.is_savings),
      monthly_budget: Number(category.monthly_budget) || 0,
      parent_id: parentId,
    })
    categoryIdByKey.set(key, created.id)
    if (category.is_archived) {
      await supabase.from('categories').update({ is_archived: true }).eq('id', created.id)
    }
  }

  const userId = await requireUserId()
  for (const tx of data.transactions ?? []) {
    const accountId = accountIdByName.get(tx.account_name)
    if (!accountId) continue

    if (tx.type === 'transfer') {
      const toId = accountIdByName.get(tx.transfer_to_account_name)
      if (!toId) continue
      const { error } = await supabase.rpc('create_transfer', {
        p_from_account_id: accountId,
        p_to_account_id: toId,
        p_amount: Number(tx.amount),
        p_transaction_date: tx.transaction_date,
        p_note: tx.note ?? null,
      })
      assertNoError(error, 'Failed to import transfer')
      continue
    }

    const catKey = categoryDedupeKey({
      kind: tx.category_kind ?? tx.type,
      name: tx.category_name ?? '',
      parent_id: null,
    })
    let categoryId = categoryIdByKey.get(catKey)
    if (!categoryId && tx.category_name) {
      const cats = await getCategories({ kind: tx.type === 'income' ? 'income' : 'expense' })
      const match = cats.find(
        (c) => c.name.trim().toLowerCase() === String(tx.category_name ?? '').trim().toLowerCase(),
      )
      categoryId = match?.id
    }

    const { error } = await supabase.from('transactions').insert({
      user_id: userId,
      account_id: accountId,
      category_id: categoryId ?? null,
      type: tx.type,
      amount: Number(tx.amount),
      note: tx.note ?? null,
      transaction_date: tx.transaction_date,
    })
    assertNoError(error, 'Failed to import transaction')
  }

  for (const rule of data.recurring_transactions ?? []) {
    const accountId = accountIdByName.get(rule.account_name)
    if (!accountId) continue

    let categoryId = null
    if (rule.category_name) {
      const key = categoryDedupeKey({
        kind: rule.category_kind ?? rule.type,
        name: rule.category_name,
        parent_id: null,
      })
      categoryId = categoryIdByKey.get(key) ?? null
    }

    let transferToId = null
    if (rule.type === 'transfer') {
      transferToId = accountIdByName.get(rule.transfer_to_account_name)
      if (!transferToId) continue
    }

    await createRecurringTransaction({
      type: rule.type,
      amount: rule.amount,
      account_id: accountId,
      category_id: categoryId,
      transfer_to_account_id: transferToId,
      note: rule.note,
      frequency: rule.frequency ?? 'monthly',
      interval_count: rule.interval_count ?? 1,
      day_of_month: rule.day_of_month,
      start_date: rule.start_date,
      end_date: rule.end_date,
      is_paused: Boolean(rule.is_paused),
    })
  }
}

export async function importBackup(data, { mode }) {
  if (mode !== 'merge' && mode !== 'replace') {
    throw new Error('Invalid import mode')
  }

  validateBackupData(data)

  if (mode === 'replace') {
    await deleteAllTransactions()
    await deleteAllRecurringTransactions().catch(() => {})
    await deleteAllAccounts()
    await deleteAllCategories()
    await deleteAllGoals()
  }

  if (data.version === BACKUP_VERSION || data.version === 2) {
    await importFinanceData(data)
  }

  await importGoals(data)

  return summarizeBackup(data)
}

// Legacy helper for v1-only callers
export function goalsToBackup(goals) {
  return {
    version: BACKUP_VERSION_LEGACY,
    app: 'savings-tracker',
    exported_at: new Date().toISOString(),
    goals: mapGoals(goals),
  }
}
