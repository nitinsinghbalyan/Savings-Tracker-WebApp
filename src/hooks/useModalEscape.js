import { useEffect } from 'react'

export function useModalEscape(open, onClose, disabled = false) {
  useEffect(() => {
    if (!open || disabled) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose, disabled])
}
