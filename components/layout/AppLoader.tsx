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
    // Hide after document + all stylesheets are ready
    function hide() {
      setVisible(false)
    }

    if (document.readyState === 'complete') {
      // Already fully loaded (e.g. fast desktop)
      hide()
    } else {
      window.addEventListener('load', hide)
      // Fallback: hide after 4 seconds no matter what
      const fallback = setTimeout(hide, 4000)
      return () => {
        window.removeEventListener('load', hide)
        clearTimeout(fallback)
      }
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
