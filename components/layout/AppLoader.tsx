'use client'

import { useEffect } from 'react'

/**
 * AppLoader — when React mounts, immediately hides the CSS-animated loader
 * by adding 'ltp-loaded' to <body>. The CSS rule body.ltp-loaded #ltp-loader
 * sets display:none (defined in layout.tsx critical CSS).
 *
 * If React never mounts (cached broken JS, network error), the pure CSS
 * animation in layout.tsx auto-hides the loader after ~2s without any JS.
 *
 * No state, no re-render, no hydration mismatch.
 */
export function AppLoader() {
  useEffect(() => {
    // React mounted — hide loader instantly via body class
    document.body.classList.add('ltp-loaded')
    return () => { document.body.classList.remove('ltp-loaded') }
  }, [])

  return null  // The loader HTML lives in layout.tsx, not here
}
