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
    let rafId: number
    let fallbackId: ReturnType<typeof setTimeout>

    // Verify Tailwind CSS has ACTUALLY loaded by checking for a known CSS
    // custom property from globals.css (--teal-deep: #1A6B6B).
    // document.readyState === 'complete' fires too early on Hostinger cold
    // starts — the CSS file may still be in-flight when readyState fires.
    function cssLoaded(): boolean {
      try {
        const v = getComputedStyle(document.documentElement)
          .getPropertyValue('--teal-deep').trim()
        return v.length > 0
      } catch { return false }
    }

    function tryHide() {
      if (cssLoaded()) {
        setVisible(false)
      } else {
        rafId = requestAnimationFrame(tryHide) // retry next frame
      }
    }

    function onLoad() {
      rafId = requestAnimationFrame(tryHide)
    }

    if (document.readyState === 'complete') {
      onLoad()
    } else {
      window.addEventListener('load', onLoad)
    }

    // Hard ceiling — never block the page forever
    fallbackId = setTimeout(() => setVisible(false), 6000)

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(fallbackId)
      window.removeEventListener('load', onLoad)
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
