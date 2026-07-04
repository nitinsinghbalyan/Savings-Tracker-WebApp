import { useEffect } from 'react'
import { useShellChrome } from './useShellChrome'

export function useBottomNavAutoHide(active) {
  const { pushBottomNavHide, popBottomNavHide } = useShellChrome()

  useEffect(() => {
    if (!active) return undefined

    pushBottomNavHide()
    return () => {
      popBottomNavHide()
    }
  }, [active, pushBottomNavHide, popBottomNavHide])
}
