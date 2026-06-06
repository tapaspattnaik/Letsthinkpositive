'use client'

import { useEffect } from 'react'

/**
 * AppLoader — when React mounts, immediately hides the loader by directly
 * setting display:none!important on the element (overrides inline style)
 * and adding body.ltp-loaded for the CSS rule fallback.
 *
 * If React never mounts (JS error, crash), the CSS animation in layout.tsx
 * auto-hides the loader after ~2s via opacity+visibility.
 * On prefers-reduced-motion devices, globals.css hides it immediately.
 *
 * No inline <script> tag — that caused React hydration mismatch / app crash.
 */
export function AppLoader() {
  useEffect(() => {
    // Force-hide with !important to override the inline display:flex style
    const loader = document.getElementById('ltp-loader')
    if (loader) loader.style.cssText += ';display:none!important'
    document.body.classList.add('ltp-loaded')
    return () => { document.body.classList.remove('ltp-loaded') }
  }, [])

  return null  // The loader HTML lives in layout.tsx, not here
}
