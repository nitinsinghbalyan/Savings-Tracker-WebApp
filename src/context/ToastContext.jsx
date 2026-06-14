import { useCallback, useMemo, useState } from 'react'
import Toast from '../components/Toast'
import { ToastContext } from './toast-context'

let toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback((type, message) => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, type, message }])
    return id
  }, [])

  const success = useCallback(
    (message) => addToast('success', message),
    [addToast],
  )

  const error = useCallback(
    (message) => addToast('error', message),
    [addToast],
  )

  const value = useMemo(
    () => ({ success, error, dismiss }),
    [success, error, dismiss],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex flex-col items-center gap-2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2"
        aria-live="polite"
        aria-relevant="additions"
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            type={toast.type}
            message={toast.message}
            onDismiss={() => dismiss(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
