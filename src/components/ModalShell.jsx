import { createPortal } from 'react-dom'
import { useBodyScrollLock } from '../hooks/useBodyScrollLock'
import { useBottomNavAutoHide } from '../hooks/useBottomNavAutoHide'
import { useModalEscape } from '../hooks/useModalEscape'

export default function ModalShell({
  open,
  onClose,
  closeDisabled = false,
  hideBottomNav = false,
  children,
  align = 'bottom',
  className = '',
}) {
  useBodyScrollLock(open)
  useBottomNavAutoHide(open && hideBottomNav)
  useModalEscape(open, onClose, closeDisabled)

  if (!open) return null

  const alignClass =
    align === 'center'
      ? 'items-center justify-center p-4'
      : 'items-end justify-center lg:items-center lg:p-6'

  return createPortal(
    <div className={`fixed inset-0 z-50 flex overscroll-none ${alignClass} ${className}`}>
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 touch-none bg-slate-900/40 lg:bg-slate-900/50 lg:backdrop-blur-sm"
        onClick={closeDisabled ? undefined : onClose}
        disabled={closeDisabled}
        tabIndex={-1}
      />
      {children}
    </div>,
    document.body,
  )
}
