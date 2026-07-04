import { ChevronRight } from 'lucide-react'

export default function SettingsRow({ label, value, onClick, children }) {
  const content = (
    <>
      <div className="min-w-0 flex-1">
        {label && <p className="text-sm font-medium text-slate-900">{label}</p>}
        {value && <p className="truncate text-sm text-slate-500">{value}</p>}
        {children}
      </div>
      {onClick && <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />}
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-slate-50"
      >
        {content}
      </button>
    )
  }

  return <div className="flex items-center gap-3 px-4 py-3.5">{content}</div>
}
