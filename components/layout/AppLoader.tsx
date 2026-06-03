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
    // Check if Tailwind CSS has loaded by detecting a known CSS custom property
    function cssLoaded(): boolean {
      try {
        return getComputedStyle(document.documentElement)
          .getPropertyValue('--teal-deep').trim().length > 0
      } catch { return false }
    }

    // Hide immediately if CSS is already present (warm page load / navigation)
    if (cssLoaded()) { setVisible(false); return }

    // Otherwise poll — but STOP BLOCKING CLICKS after 800ms regardless.
    // This prevents the AppLoader permanently blocking interaction if the
    // CSS variable check fails (e.g. dark mode race, browser quirks).
    let cancelled = false
    let attempts  = 0
    const MAX_ATTEMPTS = 60  // ~1 second at 60fps

    function poll() {
      if (cancelled) return
      attempts++
      if (cssLoaded() || attempts >= MAX_ATTEMPTS) {
        setVisible(false)
      } else {
        requestAnimationFrame(poll)
      }
    }

    // Start polling after next paint
    requestAnimationFrame(poll)

    // Absolute hard ceiling — 3 seconds max, then always hide
    const fallback = setTimeout(() => { cancelled = true; setVisible(false) }, 3000)

    return () => { cancelled = true; clearTimeout(fallback) }
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
