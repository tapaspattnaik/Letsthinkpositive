'use client'

import { useEffect } from 'react'

function hideLoader() {
  const loader = document.getElementById('ltp-loader')
  if (loader) loader.style.cssText += ';display:none!important'
  document.body.classList.add('ltp-loaded')
}

/**
 * AppLoader — waits for all <link rel="stylesheet"> tags to finish loading
 * before hiding the loader. This prevents FOUC (Flash of Unstyled Content)
 * where the page briefly renders without Tailwind CSS applied.
 *
 * Hard fallback: hides after 4s regardless, so the loader never gets stuck.
 *
 * If React never mounts (JS error), the CSS animation in layout.tsx
 * auto-hides the loader after ~2s via opacity+visibility.
 * On prefers-reduced-motion devices, globals.css hides it immediately.
 */
export function AppLoader() {
  useEffect(() => {
    // Hard fallback — never let the loader run longer than 4s
    const fallback = setTimeout(hideLoader, 4000)

    const stylesheets = Array.from(
      document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
    )

    if (stylesheets.length === 0) {
      // No external stylesheets — hide immediately
      clearTimeout(fallback)
      hideLoader()
      return () => clearTimeout(fallback)
    }

    // Check if all stylesheets already loaded (e.g. browser cache)
    const allLoaded = stylesheets.every(s => {
      try { return !!s.sheet } catch { return false }
    })

    if (allLoaded) {
      clearTimeout(fallback)
      hideLoader()
      return () => clearTimeout(fallback)
    }

    // Wait for the last pending stylesheet to finish loading
    let loadedCount = stylesheets.filter(s => { try { return !!s.sheet } catch { return false } }).length
    const total = stylesheets.length

    const onLoad = () => {
      loadedCount++
      if (loadedCount >= total) {
        clearTimeout(fallback)
        hideLoader()
      }
    }
    const onError = () => {
      loadedCount++
      if (loadedCount >= total) {
        clearTimeout(fallback)
        hideLoader()
      }
    }

    stylesheets.forEach(s => {
      if (!s.sheet) {
        s.addEventListener('load',  onLoad,  { once: true })
        s.addEventListener('error', onError, { once: true })
      }
    })

    return () => {
      clearTimeout(fallback)
      stylesheets.forEach(s => {
        s.removeEventListener('load',  onLoad)
        s.removeEventListener('error', onError)
      })
      document.body.classList.remove('ltp-loaded')
    }
  }, [])

  return null  // The loader HTML lives in layout.tsx, not here
}
