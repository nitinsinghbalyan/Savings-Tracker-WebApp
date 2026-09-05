import { ChevronRight } from 'lucide-react'

// Artboard 1f row: title over a quiet description, control or chevron on the
// right, separated by a hairline rather than a card edge.
export default function SettingsRow({ label, value, onClick, children }) {
  const content = (
    <>
      <div className="min-w-0 flex-1">
        {label && <p className="text-[13.5px] text-ink">{label}</p>}
        {value && <p className="mt-0.5 truncate text-[11.5px] text-ink-faint">{value}</p>}
        {children}
      </div>
      {onClick && (
        <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden="true" />
      )}
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 border-b border-ink-hairline px-0.5 py-[15px] text-left transition hover:bg-paper-card"
      >
        {content}
      </button>
    )
  }

  return (
    <div className="flex items-center gap-3 border-b border-ink-hairline px-0.5 py-[15px]">
      {content}
    </div>
  )
}
