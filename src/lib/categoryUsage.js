// "Frequent" row on the Add transaction sheet (session 92): the categories
// used most over the recent window, most-used first. Pure, so it can be
// checked without a database.

/**
 * @param {Array} selectable   picker-ordered categories for the current kind
 *                             (already free of archived and goal-linked rows)
 * @param {Array} usageRows    rows from getCategoryUsage: { category_id, transaction_date, created_at }
 * @returns {Array}            at most `limit` categories, each used at least `minCount` times
 */
export function buildFrequentCategories(selectable, usageRows, { limit = 6, minCount = 2 } = {}) {
  if (!Array.isArray(selectable) || !Array.isArray(usageRows) || usageRows.length === 0) return []

  const stats = new Map()
  for (const row of usageRows) {
    const id = row?.category_id
    if (!id) continue
    const last = `${row.transaction_date ?? ''}|${row.created_at ?? ''}`
    const entry = stats.get(id)
    if (entry) {
      entry.count += 1
      if (last > entry.last) entry.last = last
    } else {
      stats.set(id, { count: 1, last })
    }
  }

  return selectable
    .map((category, order) => ({ category, order, stat: stats.get(category.id) }))
    .filter(({ stat }) => stat && stat.count >= minCount)
    .sort(
      (a, b) =>
        b.stat.count - a.stat.count ||
        (a.stat.last < b.stat.last ? 1 : a.stat.last > b.stat.last ? -1 : 0) ||
        a.order - b.order,
    )
    .slice(0, limit)
    .map(({ category }) => category)
}

/**
 * Chip labels for the Frequent row: a subcategory whose name another
 * selectable category shares reads "Parent · Name", so two "Other" chips
 * can be told apart once they leave their group headings.
 */
export function frequentChipLabel(category, selectable, allCategories = selectable) {
  const name = String(category?.name ?? '')
  const key = name.trim().toLowerCase()
  const clash = selectable.some(
    (c) => c.id !== category.id && String(c.name ?? '').trim().toLowerCase() === key,
  )
  if (!clash || !category.parent_id) return undefined
  // Parents with children are group headings, not chips, so look them up in
  // the full list rather than the selectable one.
  const parent = allCategories.find((c) => c.id === category.parent_id)
  return parent ? `${parent.name} · ${name}` : undefined
}
