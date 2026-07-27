import { supabase } from './supabase'
import { requireUserId } from './auth'
import { assertNoError } from './errors'
import { archiveGoalCategory, ensureGoalCategory, syncGoalCategory } from './goalCategory'

export async function getGoals() {
  const userId = await requireUserId()

  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('end_date', { ascending: true })

  assertNoError(error, 'Failed to load goals')
  return data
}

export async function getGoalsWithContributions() {
  const userId = await requireUserId()

  const { data: goals, error: goalsError } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('end_date', { ascending: true })

  assertNoError(goalsError, 'Failed to load goals')
  if (!goals?.length) return []

  const goalIds = goals.map((g) => g.id)
  const { data: contributions, error: contributionsError } = await supabase
    .from('contributions')
    .select('*')
    .in('goal_id', goalIds)
    .order('created_at', { ascending: false })

  assertNoError(contributionsError, 'Failed to load goals')

  const contributionsByGoal = new Map()
  for (const contribution of contributions ?? []) {
    const list = contributionsByGoal.get(contribution.goal_id) ?? []
    list.push(contribution)
    contributionsByGoal.set(contribution.goal_id, list)
  }

  return goals.map((goal) => ({
    ...goal,
    contributions: contributionsByGoal.get(goal.id) ?? [],
  }))
}

export async function createGoal(data) {
  const userId = await requireUserId()

  const { data: goal, error } = await supabase
    .from('goals')
    .insert({ ...data, user_id: userId })
    .select()
    .single()

  assertNoError(error, 'Failed to create goal')

  try {
    const category = await ensureGoalCategory(goal)
    if (category) {
      return { ...goal, linked_category_id: category.id, contributions: [] }
    }
  } catch {
    // Category link is best-effort when migration is missing
  }

  return { ...goal, contributions: [] }
}

export async function updateGoal(id, patch) {
  const userId = await requireUserId()
  const safePatch = { ...patch }
  delete safePatch.device_id
  delete safePatch.user_id
  delete safePatch.id
  delete safePatch.created_at

  const { data: goal, error } = await supabase
    .from('goals')
    .update(safePatch)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  assertNoError(error, 'Failed to update goal')

  try {
    await syncGoalCategory(goal)
  } catch {
    // Best-effort sync
  }

  return goal
}

export async function deleteGoal(id) {
  const userId = await requireUserId()

  try {
    await archiveGoalCategory(id)
  } catch {
    // Best-effort; CASCADE may still remove the category
  }

  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  assertNoError(error, 'Failed to delete goal')
}

export async function deleteAllGoals() {
  const userId = await requireUserId()

  const { error } = await supabase.from('goals').delete().eq('user_id', userId)

  assertNoError(error, 'Failed to clear goals')
}
