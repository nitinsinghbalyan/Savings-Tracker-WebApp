import { useCallback, useMemo, useRef, useState } from 'react'
import { ShellChromeContext } from './shell-chrome-context'

export function ShellChromeProvider({ children }) {
  const hideCountRef = useRef(0)
  const [bottomNavHidden, setBottomNavHidden] = useState(false)

  const pushBottomNavHide = useCallback(() => {
    hideCountRef.current += 1
    if (hideCountRef.current === 1) {
      setBottomNavHidden(true)
    }
  }, [])

  const popBottomNavHide = useCallback(() => {
    hideCountRef.current = Math.max(0, hideCountRef.current - 1)
    if (hideCountRef.current === 0) {
      setBottomNavHidden(false)
    }
  }, [])

  const value = useMemo(
    () => ({ bottomNavHidden, pushBottomNavHide, popBottomNavHide }),
    [bottomNavHidden, pushBottomNavHide, popBottomNavHide],
  )

  return <ShellChromeContext.Provider value={value}>{children}</ShellChromeContext.Provider>
}
