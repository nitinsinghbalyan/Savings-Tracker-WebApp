import { useEffect, useState } from 'react'
import { Download, Share, X } from 'lucide-react'

const DISMISS_KEY = 'savings-lite-install-dismissed'

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

function isSafari() {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
}

export default function InstallPrompt() {
  const [visible, setVisible] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)

  useEffect(() => {
    if (isStandalone() || localStorage.getItem(DISMISS_KEY) === '1') return

    const showIosBanner = isIos() && isSafari()
    if (showIosBanner) {
      setVisible(true)
      return
    }

    function onBeforeInstall(event) {
      event.preventDefault()
      setDeferredPrompt(event)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall)
  }, [])

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, '1')
    setVisible(false)
    setDeferredPrompt(null)
  }

  async function install() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    dismiss()
  }

  if (!visible) return null

  const ios = isIos()

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] z-30 px-4 lg:hidden"
      role="region"
      aria-label="Install Savings Lite"
    >
      <div className="pointer-events-auto mx-auto max-w-app rounded-2xl border border-brand-200 bg-white p-4 shadow-lg shadow-slate-900/10">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            {ios ? <Share className="h-5 w-5" aria-hidden="true" /> : <Download className="h-5 w-5" aria-hidden="true" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900">Install Savings Lite</p>
            {ios ? (
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Tap <span className="font-medium text-slate-800">Share</span>, then{' '}
                <span className="font-medium text-slate-800">Add to Home Screen</span> to open the app like a native app.
              </p>
            ) : (
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Add Savings Lite to your home screen for quick access without the browser bar.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="btn-icon -mr-1 -mt-1 h-9 w-9 shrink-0"
            aria-label="Dismiss install prompt"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {!ios && deferredPrompt && (
          <button type="button" onClick={install} className="btn-primary mt-3 w-full">
            Install app
          </button>
        )}
      </div>
    </div>
  )
}
