import { createElement } from 'react'
import { getCategoryIconComponent, getIconComponentById } from '../lib/categoryIcons'

/**
 * Decorative category icon. Always aria-hidden: the visible name is the
 * category's identity, the icon is a second cue next to it.
 *
 * Pass `category` (anything with icon/name/is_savings/goal_id) or `iconId`.
 * The component is looked up from a static, module-level registry, so it is
 * stable across renders — createElement rather than JSX only because the
 * static-components lint rule cannot see that.
 */
export default function CategoryIcon({ category, iconId, className = 'h-4 w-4' }) {
  const component = iconId ? getIconComponentById(iconId) : getCategoryIconComponent(category)
  return createElement(component, { className: `shrink-0 ${className}`, 'aria-hidden': true })
}
