'use client'

import { useEffect, useState } from 'react'
import { LtpLogo } from '@/components/ui/LtpLogo'

/**
 * AppLoader — shows a branded splash while CSS + JS finish loading.
 *
 * On desktop it's invisible (hides in <10ms).
 * On Android WebView (slow CSS download) it shows the brand colour until
 * the page is fully loaded, preventing the "unstyled flash" on first open.
 */
export function AppLoader() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Hide after first paint — inline critical CSS means the page is always styled.
    // We only need the loader long enough for the initial JS bundle to execute.
    // On mobile with slow connections, cap at 1.2s max so it never blocks interaction.
    let cancelled = false

    // Try to hide on next frame (desktop fast path)
    const raf = requestAnimationFrame(() => {
      if (!cancelled) setVisible(false)
    })

    // Hard ceiling — 1.2s max regardless of anything
    const timeout = setTimeout(() => {
      cancelled = true
      setVisible(false)
    }, 1200)

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      clearTimeout(timeout)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      style={{
        position:         'fixed',
        inset:            0,
        zIndex:           99999,
        background:       '#1A6B6B',
        display:          'flex',
        flexDirection:    'column',
        alignItems:       'center',
        justifyContent:   'center',
        gap:              '16px',
        transition:       'opacity 0.4s ease',
        opacity:          visible ? 1 : 0,
      }}
      aria-hidden="true"
    >
      {/* Logo */}
      <div style={{ animation: 'ltp-pulse 2s ease-in-out infinite' }}>
        <LtpLogo size={72} />
      </div>

      {/* App name */}
      <p style={{
        fontFamily:    '"DM Sans", sans-serif',
        fontSize:      '1.1rem',
        fontWeight:    600,
        color:         '#F5C96A',
        letterSpacing: '0.02em',
        margin:        0,
      }}>
        letsthinkpositive
      </p>

      {/* Loading dots */}
      <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width:            '7px',
            height:           '7px',
            borderRadius:     '50%',
            background:       'rgba(255,255,255,0.5)',
            display:          'inline-block',
            animation:        `ltp-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes ltp-pulse {
          0%, 100% { transform: scale(1);    opacity: 1;   }
          50%       { transform: scale(1.08); opacity: 0.85; }
        }
        @keyframes ltp-bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1);   opacity: 1;   }
        }
      `}</style>
    </div>
  )
}
