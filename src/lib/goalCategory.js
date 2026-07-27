import { supabase } from './supabase'
import { requireUserId } from './auth'
import { assertNoError, isMissingGoalCategoryLinkError } from './errors'

/**
 * Find or create a savings expense category linked to a goal.
 * Returns null when the goal↔category migration has not been applied.
 */
export async function ensureGoalCategory(goal) {
  if (!goal?.id) return null
  const userId = await requireUserId()

  const { data: existing, error: findError } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .eq('goal_id', goal.id)
    .eq('is_archived', false)
    .maybeSingle()

  if (findError && isMissingGoalCategoryLinkError(findError)) return null
  assertNoError(findError, 'Failed to look up goal category')
  if (existing) {
    if (goal.linked_category_id !== existing.id) {
      await linkGoalToCategory(goal.id, existing.id)
    }
    return existing
  }

  if (goal.linked_category_id) {
    const { data: byLink, error: linkError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', goal.linked_category_id)
      .eq('user_id', userId)
      .maybeSingle()

    if (!linkError && byLink && !byLink.is_archived) {
      if (!byLink.goal_id) {
        await supabase
          .from('categories')
          .update({ goal_id: goal.id, is_savings: true })
          .eq('id', byLink.id)
          .eq('user_id', userId)
      }
      return { ...byLink, goal_id: goal.id, is_savings: true }
    }
  }

  const insertRow = {
    user_id: userId,
    name: goal.name,
    kind: 'expense',
    color: goal.color ?? 'indigo',
    sort_order: 0,
    is_system: false,
    is_savings: true,
    monthly_budget: 0,
    goal_id: goal.id,
  }

  let { data: created, error: createError } = await supabase
    .from('categories')
    .insert(insertRow)
    .select()
    .single()

  if (createError && isMissingGoalCategoryLinkError(createError)) {
    const { goal_id: _goalId, ...withoutGoal } = insertRow
    ;({ data: created, error: createError } = await supabase
      .from('categories')
      .insert({ ...withoutGoal, is_savings: true })
      .select()
      .single())
    if (createError) {
      assertNoError(createError, 'Failed to create goal category')
    }
    // Without goal_id column we cannot link; still return savings category for picker use
    return created
  }

  assertNoError(createError, 'Failed to create goal category')
  await linkGoalToCategory(goal.id, created.id)
  return created
}

async function linkGoalToCategory(goalId, categoryId) {
  const userId = await requireUserId()
  const { error } = await supabase
    .from('goals')
    .update({ linked_category_id: categoryId })
    .eq('id', goalId)
    .eq('user_id', userId)

  if (error && isMissingGoalCategoryLinkError(error)) return
  assertNoError(error, 'Failed to link goal category')
}

/** Keep linked category name/color in sync when a goal is edited. */
export async function syncGoalCategory(goal) {
  if (!goal?.id) return null

  const category = await ensureGoalCategory(goal)
  if (!category) return null

  const userId = await requireUserId()
  const patch = {
    name: goal.name,
    color: goal.color ?? category.color ?? 'indigo',
    is_savings: true,
  }

  const { data, error } = await supabase
    .from('categories')
    .update(patch)
    .eq('id', category.id)
    .eq('user_id', userId)
    .select()
    .single()

  assertNoError(error, 'Failed to sync goal category')
  return data
}

/** Archive the savings category when a goal is deleted. */
export async function archiveGoalCategory(goalId) {
  if (!goalId) return
  const userId = await requireUserId()

  const { data: rows, error } = await supabase
    .from('categories')
    .select('id')
    .eq('user_id', userId)
    .eq('goal_id', goalId)

  if (error && isMissingGoalCategoryLinkError(error)) return
  assertNoError(error, 'Failed to find goal categories')

  for (const row of rows ?? []) {
    const { error: archiveError } = await supabase
      .from('categories')
      .update({ is_archived: true })
      .eq('id', row.id)
      .eq('user_id', userId)
    assertNoError(archiveError, 'Failed to archive goal category')
  }
}

/**
 * Ensure every goal has a linked savings category.
 * Returns updated goals (with linked_category_id) and whether categories changed.
 */
export async function backfillGoalCategories(goals) {
  if (!goals?.length) return { goals, categoriesChanged: false }

  let categoriesChanged = false
  const nextGoals = []

  for (const goal of goals) {
    try {
      const category = await ensureGoalCategory(goal)
      if (category) {
        categoriesChanged = true
        nextGoals.push({
          ...goal,
          linked_category_id: category.id,
        })
      } else {
        nextGoals.push(goal)
      }
    } catch {
      nextGoals.push(goal)
    }
  }

  return { goals: nextGoals, categoriesChanged }
}
