'use client'

import { useEffect } from 'react'

/**
 * AppLoader — when React mounts, immediately hides the loader by calling
 * window.__ltpHide() (set by the inline script in layout.tsx). This cancels
 * the 2.5s hard-timeout and force-hides the loader instantly.
 *
 * If React never mounts (JS error, crash), the inline script's setTimeout
 * fires at 2.5s and hides the loader regardless.
 *
 * This approach is reliable on all mobile browsers including those with
 * prefers-reduced-motion enabled (which breaks CSS animation-based hiding).
 */
export function AppLoader() {
  useEffect(() => {
    // Call the inline-script hide function (cancels timer + force-hides)
    if (typeof window !== 'undefined' && typeof (window as any).__ltpHide === 'function') {
      ;(window as any).__ltpHide()
    } else {
      // Fallback if script didn't run (e.g. strict CSP blocking inline scripts)
      const loader = document.getElementById('ltp-loader')
      if (loader) loader.style.cssText += ';display:none!important'
    }
    document.body.classList.add('ltp-loaded')
    return () => { document.body.classList.remove('ltp-loaded') }
  }, [])

  return null  // The loader HTML lives in layout.tsx, not here
}
