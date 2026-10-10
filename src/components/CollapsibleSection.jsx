import { ChevronDown } from 'lucide-react'

// Native <details>: keyboard and screen-reader support for free, no state.
export default function CollapsibleSection({ title, meta, children, defaultOpen = false }) {
  return (
    <details
      className="group overflow-hidden rounded-xl border border-ink-rule bg-paper-card"
      open={defaultOpen || undefined}
    >
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 px-3.5 py-2.5 [&::-webkit-details-marker]:hidden">
        <span className="text-[10px] font-medium uppercase tracking-[.1em] text-ink-faint">{title}</span>
        {meta && <span className="n text-[10.5px] text-ink-faint">{meta}</span>}
        <ChevronDown
          className="ml-auto h-4 w-4 text-ink-faint transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="border-t border-ink-hairline">{children}</div>
    </details>
  )
}
