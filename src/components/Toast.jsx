import { useEffect } from 'react'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'

const STYLES = {
  success: {
    container: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    icon: 'text-emerald-600',
    Icon: CheckCircle2,
  },
  error: {
    container: 'border-red-200 bg-red-50 text-red-900',
    icon: 'text-red-600',
    Icon: AlertCircle,
  },
}

const AUTO_DISMISS_MS = 3200

export default function Toast({ type, message, onDismiss }) {
  const style = STYLES[type] ?? STYLES.success
  const Icon = style.Icon

  useEffect(() => {
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={`pointer-events-auto flex w-full max-w-sm animate-slide-up items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg ${style.container}`}
    >
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.icon}`} aria-hidden="true" />
      <p className="min-w-0 flex-1 text-sm font-medium">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="btn-icon -mr-1 h-11 w-11 shrink-0"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}
