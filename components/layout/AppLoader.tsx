'use client'

import { useEffect } from 'react'

/**
 * AppLoader — hides the full-screen loader the moment React mounts.
 *
 * CSS stylesheets are render-blocking: by the time React's useEffect fires
 * (post-first-paint), Tailwind CSS is already applied. No need to wait.
 *
 * Fallback: the CSS animation in layout.tsx auto-hides the loader at 2s
 * if React never mounts (JS error, network failure, etc).
 * On prefers-reduced-motion devices, globals.css hides it immediately.
 */
export function AppLoader() {
  useEffect(() => {
    const el = document.getElementById('ltp-loader')
    if (el) el.style.cssText += ';display:none!important'
    document.body.classList.add('ltp-loaded')
    return () => { document.body.classList.remove('ltp-loaded') }
  }, [])

  return null
}
