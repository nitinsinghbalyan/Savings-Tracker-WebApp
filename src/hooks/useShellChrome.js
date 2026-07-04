import { useContext } from 'react'
import { ShellChromeContext } from '../context/shell-chrome-context'

export function useShellChrome() {
  const context = useContext(ShellChromeContext)
  if (!context) {
    throw new Error('useShellChrome must be used within ShellChromeProvider')
  }
  return context
}
