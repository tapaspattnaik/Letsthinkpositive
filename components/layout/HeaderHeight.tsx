'use client'

import { useEffect } from 'react'

/**
 * Measures the fixed site-header height and sets it as a CSS variable
 * on the document root so the main content can offset correctly regardless
 * of whether the construction banner is visible.
 */
export function HeaderHeight() {
  useEffect(() => {
    function update() {
      const header = document.getElementById('site-header')
      if (!header) return
      const h = header.getBoundingClientRect().height
      document.documentElement.style.setProperty('--header-h', `${h}px`)
      const main = document.getElementById('main-content')
      if (main) main.style.paddingTop = `${h}px`
    }
    update()
    const ro = new ResizeObserver(update)
    const header = document.getElementById('site-header')
    if (header) ro.observe(header)
    return () => ro.disconnect()
  }, [])

  return null
}
