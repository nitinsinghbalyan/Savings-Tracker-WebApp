import { IndianRupee } from 'lucide-react'

/** Indian rupee (₹) — Lucide stroke icon; matches PWA/favicon (`public/icon-source.svg`). */
export default function RupeeIcon({ className, strokeWidth = 2.25 }) {
  return <IndianRupee className={className} strokeWidth={strokeWidth} aria-hidden="true" />
}