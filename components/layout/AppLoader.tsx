'use client'

import { useState, useEffect } from 'react'

/**
 * AppLoader — renders the full-screen loader as a React-controlled element.
 *
 * useState(true) → both server and client render the loader on first pass,
 * so hydration matches. useEffect then sets visible=false, React unmounts
 * the element cleanly. No inline-style hacks that React re-renders can undo.
 *
 * CSS animation fallback: if React never mounts (JS error / network fail),
 * the ltp-auto-hide keyframe in layout.tsx auto-hides via opacity+visibility
 * after 2s — no JS required.
 */
export function AppLoader() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // React mounted — hide immediately
    setVisible(false)
  }, [])

  if (!visible) return null

  return (
    <div
      id="ltp-loader"
      aria-hidden="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: '#1A6B6B', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '16px',
      }}
    >
      <p style={{ fontFamily: '"DM Sans",sans-serif', fontSize: '1.1rem', fontWeight: 600, color: '#F5C96A', letterSpacing: '0.02em', margin: 0 }}>
        letsthinkpositive
      </p>
      <div style={{ display: 'flex', gap: '6px' }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'rgba(255,255,255,0.5)', display: 'inline-block' }} />
        ))}
      </div>
    </div>
  )
}
