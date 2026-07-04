import { useEffect } from 'react'

let lockCount = 0
let savedScrollY = 0
let savedStyles = null

function lockBody() {
  savedScrollY = window.scrollY
  savedStyles = {
    bodyOverflow: document.body.style.overflow,
    bodyPosition: document.body.style.position,
    bodyTop: document.body.style.top,
    bodyLeft: document.body.style.left,
    bodyRight: document.body.style.right,
    bodyWidth: document.body.style.width,
    htmlOverflow: document.documentElement.style.overflow,
  }

  document.body.style.overflow = 'hidden'
  document.body.style.position = 'fixed'
  document.body.style.top = `-${savedScrollY}px`
  document.body.style.left = '0'
  document.body.style.right = '0'
  document.body.style.width = '100%'
  document.documentElement.style.overflow = 'hidden'
}

function unlockBody() {
  if (!savedStyles) return

  document.body.style.overflow = savedStyles.bodyOverflow
  document.body.style.position = savedStyles.bodyPosition
  document.body.style.top = savedStyles.bodyTop
  document.body.style.left = savedStyles.bodyLeft
  document.body.style.right = savedStyles.bodyRight
  document.body.style.width = savedStyles.bodyWidth
  document.documentElement.style.overflow = savedStyles.htmlOverflow
  window.scrollTo(0, savedScrollY)
  savedStyles = null
}

function preventBackgroundTouchMove(event) {
  if (event.target.closest('[data-modal-panel]')) return
  event.preventDefault()
}

export function useBodyScrollLock(locked) {
  useEffect(() => {
    if (!locked) return undefined

    lockCount += 1
    if (lockCount === 1) {
      lockBody()
      document.addEventListener('touchmove', preventBackgroundTouchMove, { passive: false })
    }

    return () => {
      lockCount -= 1
      if (lockCount === 0) {
        document.removeEventListener('touchmove', preventBackgroundTouchMove)
        unlockBody()
      }
    }
  }, [locked])
}
