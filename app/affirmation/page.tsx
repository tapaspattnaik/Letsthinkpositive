// npm install html2canvas
'use client'

import { useState, useRef, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Mood = 'calm' | 'anxious' | 'low' | 'motivated' | 'grateful' | 'tired'
type Theme =
  | 'strength'
  | 'self-love'
  | 'resilience'
  | 'hope'
  | 'focus'
  | 'gratitude'

// ─── Data ─────────────────────────────────────────────────────────────────────

const MOODS: { value: Mood; label: string; emoji: string }[] = [
  { value: 'calm',      label: 'Calm',      emoji: '😌' },
  { value: 'anxious',   label: 'Anxious',   emoji: '😰' },
  { value: 'low',       label: 'Low',       emoji: '😔' },
  { value: 'motivated', label: 'Motivated', emoji: '⚡' },
  { value: 'grateful',  label: 'Grateful',  emoji: '🙏' },
  { value: 'tired',     label: 'Tired',     emoji: '😴' },
]

const THEMES: { value: Theme; label: string }[] = [
  { value: 'strength',   label: 'Strength'   },
  { value: 'self-love',  label: 'Self-Love'  },
  { value: 'resilience', label: 'Resilience' },
  { value: 'hope',       label: 'Hope'       },
  { value: 'focus',      label: 'Focus'      },
  { value: 'gratitude',  label: 'Gratitude'  },
]

// Each background: [cssGradient, textColor, subtleColor]
type BgConfig = {
  gradient: string
  textColor: string
  subtleColor: string
  tagColor: string
}

const BACKGROUNDS: BgConfig[] = [
  {
    gradient: 'linear-gradient(135deg, #1A6B6B 0%, #0F4040 100%)',
    textColor: '#F8F8F4',
    subtleColor: 'rgba(248,248,244,0.55)',
    tagColor: 'rgba(168,216,208,0.7)',
  },
  {
    gradient: 'linear-gradient(135deg, #FFF8E7 0%, #FFFFFF 100%)',
    textColor: '#1C2B2B',
    subtleColor: 'rgba(28,43,43,0.5)',
    tagColor: 'rgba(232,160,32,0.8)',
  },
  {
    gradient: 'linear-gradient(135deg, #EEF7F6 0%, #FFFFFF 100%)',
    textColor: '#1A6B6B',
    subtleColor: 'rgba(26,107,107,0.5)',
    tagColor: 'rgba(45,155,138,0.7)',
  },
  {
    gradient: 'linear-gradient(135deg, rgba(232,160,32,0.15) 0%, #EEF7F6 100%)',
    textColor: '#1C2B2B',
    subtleColor: 'rgba(28,43,43,0.5)',
    tagColor: 'rgba(232,160,32,0.75)',
  },
  {
    gradient: 'linear-gradient(135deg, #1A6B6B 0%, #0A1F1F 100%)',
    textColor: '#F8F8F4',
    subtleColor: 'rgba(248,248,244,0.45)',
    tagColor: 'rgba(245,201,106,0.75)',
  },
  {
    gradient: 'linear-gradient(135deg, #FFF0F0 0%, #FFF8E7 100%)',
    textColor: '#1C2B2B',
    subtleColor: 'rgba(28,43,43,0.5)',
    tagColor: 'rgba(232,160,32,0.8)',
  },
]

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      style={{
        width: 400,
        height: 400,
        borderRadius: 24,
        background: 'linear-gradient(135deg, #1A6B6B 0%, #0F4040 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: '40px',
        boxSizing: 'border-box',
      }}
    >
      {/* Pulsing lines */}
      <div
        style={{
          width: '80%',
          height: 14,
          borderRadius: 8,
          background: 'rgba(168,216,208,0.25)',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      />
      <div
        style={{
          width: '90%',
          height: 20,
          borderRadius: 8,
          background: 'rgba(168,216,208,0.35)',
          animation: 'pulse 1.5s ease-in-out 0.15s infinite',
        }}
      />
      <div
        style={{
          width: '70%',
          height: 20,
          borderRadius: 8,
          background: 'rgba(168,216,208,0.35)',
          animation: 'pulse 1.5s ease-in-out 0.3s infinite',
        }}
      />
      <div
        style={{
          width: '55%',
          height: 14,
          borderRadius: 8,
          background: 'rgba(168,216,208,0.2)',
          animation: 'pulse 1.5s ease-in-out 0.45s infinite',
        }}
      />
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.9; }
        }
      `}</style>
    </div>
  )
}

// ─── The shareable card ────────────────────────────────────────────────────────

function AffirmationCard({
  affirmation,
  bgIndex,
  mood,
  theme,
  cardRef,
}: {
  affirmation: string
  bgIndex: number
  mood: Mood | null
  theme: Theme | null
  cardRef: React.RefObject<HTMLDivElement>
}) {
  const bg = BACKGROUNDS[bgIndex]

  const moodObj = MOODS.find((m) => m.value === mood)
  const themeObj = THEMES.find((t) => t.value === theme)
  const tagLine = [
    moodObj ? `${moodObj.emoji} ${moodObj.label}` : null,
    themeObj ? themeObj.label : null,
  ]
    .filter(Boolean)
    .join('  ·  ')

  return (
    <div
      id="affirmation-card"
      ref={cardRef}
      style={{
        width: 400,
        height: 400,
        borderRadius: 24,
        background: bg.gradient,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '44px 40px 32px',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(15,64,64,0.18)',
      }}
    >
      {/* Decorative ring top-right */}
      <div
        style={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 200,
          height: 200,
          borderRadius: '50%',
          border: `1.5px solid ${bg.subtleColor}`,
          opacity: 0.35,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 130,
          height: 130,
          borderRadius: '50%',
          border: `1.5px solid ${bg.subtleColor}`,
          opacity: 0.25,
          pointerEvents: 'none',
        }}
      />
      {/* Decorative ring bottom-left */}
      <div
        style={{
          position: 'absolute',
          bottom: -50,
          left: -50,
          width: 160,
          height: 160,
          borderRadius: '50%',
          border: `1.5px solid ${bg.subtleColor}`,
          opacity: 0.3,
          pointerEvents: 'none',
        }}
      />

      {/* Small top flourish */}
      <div
        style={{
          position: 'absolute',
          top: 22,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 6,
          alignItems: 'center',
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: i === 1 ? 28 : 16,
              height: 3,
              borderRadius: 2,
              background: bg.tagColor,
              opacity: i === 1 ? 0.9 : 0.5,
            }}
          />
        ))}
      </div>

      {/* Affirmation text */}
      <p
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontStyle: 'italic',
          fontWeight: 500,
          fontSize: affirmation.length > 80 ? '1.35rem' : affirmation.length > 60 ? '1.5rem' : '1.7rem',
          lineHeight: 1.55,
          textAlign: 'center',
          color: bg.textColor,
          margin: 0,
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          letterSpacing: '0.01em',
        }}
      >
        {affirmation}
      </p>

      {/* Tag line */}
      {tagLine && (
        <p
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: '0.72rem',
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: bg.tagColor,
            margin: '12px 0 18px',
            textAlign: 'center',
          }}
        >
          {tagLine}
        </p>
      )}

      {/* Watermark */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ fontSize: '0.65rem' }}>🌿</span>
        <span
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: '0.62rem',
            fontWeight: 600,
            letterSpacing: '0.07em',
            color: bg.subtleColor,
            textTransform: 'lowercase',
          }}
        >
          letsthinkpositive.com
        </span>
      </div>
    </div>
  )
}

// ─── Chip components ───────────────────────────────────────────────────────────

function MoodChip({
  mood,
  selected,
  onClick,
}: {
  mood: (typeof MOODS)[number]
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        borderRadius: '999px',
        border: selected ? '2px solid #2D9B8A' : '2px solid transparent',
        background: selected ? 'rgba(45,155,138,0.12)' : 'rgba(255,255,255,0.6)',
        color: selected ? '#1A6B6B' : '#374151',
        fontFamily: "'DM Sans', system-ui, sans-serif",
        fontSize: '0.88rem',
        fontWeight: selected ? 600 : 400,
        cursor: 'pointer',
        transition: 'all 0.18s ease',
        backdropFilter: 'blur(4px)',
        boxShadow: selected
          ? '0 2px 12px rgba(45,155,138,0.18)'
          : '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      <span style={{ fontSize: '1.05rem' }}>{mood.emoji}</span>
      {mood.label}
    </button>
  )
}

function ThemeChip({
  theme,
  selected,
  onClick,
}: {
  theme: (typeof THEMES)[number]
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 18px',
        borderRadius: '999px',
        border: selected ? '2px solid #E8A020' : '2px solid transparent',
        background: selected ? 'rgba(232,160,32,0.12)' : 'rgba(255,255,255,0.6)',
        color: selected ? '#C47A10' : '#374151',
        fontFamily: "'DM Sans', system-ui, sans-serif",
        fontSize: '0.88rem',
        fontWeight: selected ? 600 : 400,
        cursor: 'pointer',
        transition: 'all 0.18s ease',
        backdropFilter: 'blur(4px)',
        boxShadow: selected
          ? '0 2px 12px rgba(232,160,32,0.2)'
          : '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      {theme.label}
    </button>
  )
}

// ─── Action button ─────────────────────────────────────────────────────────────

function ActionButton({
  children,
  onClick,
  variant = 'default',
  disabled = false,
}: {
  children: React.ReactNode
  onClick: () => void
  variant?: 'default' | 'primary'
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '10px 20px',
        borderRadius: '12px',
        border: variant === 'primary' ? 'none' : '1.5px solid rgba(45,155,138,0.25)',
        background:
          variant === 'primary'
            ? 'linear-gradient(135deg, #2D9B8A 0%, #1A6B6B 100%)'
            : 'rgba(255,255,255,0.75)',
        color: variant === 'primary' ? '#F8F8F4' : '#1A6B6B',
        fontFamily: "'DM Sans', system-ui, sans-serif",
        fontSize: '0.88rem',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        transition: 'all 0.18s ease',
        backdropFilter: 'blur(4px)',
        boxShadow:
          variant === 'primary'
            ? '0 4px 16px rgba(45,155,138,0.28)'
            : '0 1px 6px rgba(0,0,0,0.07)',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function AffirmationPage() {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null)
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null)
  const [affirmation, setAffirmation] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [bgIndex, setBgIndex] = useState(0)
  const [shareMsg, setShareMsg] = useState<string | null>(null)
  const [hasGenerated, setHasGenerated] = useState(false)

  const cardRef = useRef<HTMLDivElement>(null!)

  const generate = useCallback(async () => {
    setLoading(true)
    setShareMsg(null)
    try {
      const res = await fetch('/api/affirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: selectedMood ?? undefined,
          theme: selectedTheme ?? undefined,
        }),
      })
      const data = await res.json()
      setAffirmation(data.affirmation ?? 'You are enough, exactly as you are.')
      setHasGenerated(true)
    } catch {
      setAffirmation('You carry more strength than you have ever been told.')
      setHasGenerated(true)
    } finally {
      setLoading(false)
    }
  }, [selectedMood, selectedTheme])

  const cycleBackground = useCallback(() => {
    setBgIndex((i) => (i + 1) % BACKGROUNDS.length)
  }, [])

  const downloadCard = useCallback(async () => {
    if (!cardRef.current) return
    try {
      // @ts-expect-error — html2canvas is installed separately (npm install html2canvas)
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      })
      const url = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = url
      a.download = 'my-affirmation-ltp.png'
      a.click()
    } catch {
      setShareMsg('Install html2canvas to enable downloads: npm install html2canvas')
      setTimeout(() => setShareMsg(null), 4000)
    }
  }, [])

  const shareCard = useCallback(async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'My Daily Affirmation 💌',
          text: affirmation,
          url: 'https://letsthinkpositive.com/affirmation',
        })
      } catch {
        // User cancelled — no error
      }
    } else {
      try {
        await navigator.clipboard.writeText(
          `${affirmation}\n\n✨ letsthinkpositive.com/affirmation`
        )
        setShareMsg('Copied to clipboard! ✓')
      } catch {
        setShareMsg('Share link: letsthinkpositive.com/affirmation')
      }
      setTimeout(() => setShareMsg(null), 3000)
    }
  }, [affirmation])

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #FFF8E7 0%, #EEF7F6 50%, #F8F8F4 100%)',
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      {/* ── Hero ── */}
      <section
        style={{
          textAlign: 'center',
          padding: '64px 24px 40px',
        }}
      >
        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 700,
            color: '#0F4040',
            margin: '0 0 12px',
            lineHeight: 1.2,
          }}
        >
          Your Daily Affirmation 💌
        </h1>
        <p
          style={{
            fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
            color: '#2D9B8A',
            margin: 0,
            fontWeight: 400,
          }}
        >
          A card made just for you, to carry through your day
        </p>
      </section>

      {/* ── Controls ── */}
      <section
        style={{
          maxWidth: 600,
          margin: '0 auto',
          padding: '0 24px 40px',
        }}
      >
        {/* Mood selector */}
        <div style={{ marginBottom: 28 }}>
          <p
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#1A6B6B',
              marginBottom: 12,
            }}
          >
            How are you feeling?
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            {MOODS.map((m) => (
              <MoodChip
                key={m.value}
                mood={m}
                selected={selectedMood === m.value}
                onClick={() =>
                  setSelectedMood(selectedMood === m.value ? null : m.value)
                }
              />
            ))}
          </div>
        </div>

        {/* Theme selector */}
        <div style={{ marginBottom: 32 }}>
          <p
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#1A6B6B',
              marginBottom: 12,
            }}
          >
            Choose a theme
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {THEMES.map((t) => (
              <ThemeChip
                key={t.value}
                theme={t}
                selected={selectedTheme === t.value}
                onClick={() =>
                  setSelectedTheme(selectedTheme === t.value ? null : t.value)
                }
              />
            ))}
          </div>
        </div>

        {/* Generate button */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={generate}
            disabled={loading}
            style={{
              padding: '14px 36px',
              borderRadius: '14px',
              border: 'none',
              background: loading
                ? 'rgba(45,155,138,0.4)'
                : 'linear-gradient(135deg, #2D9B8A 0%, #1A6B6B 100%)',
              color: '#F8F8F4',
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: '1rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.02em',
              boxShadow: loading ? 'none' : '0 6px 24px rgba(45,155,138,0.32)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {loading ? (
              <>
                <span
                  style={{
                    display: 'inline-block',
                    width: 16,
                    height: 16,
                    border: '2.5px solid rgba(248,248,244,0.4)',
                    borderTopColor: '#F8F8F4',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
                Writing your affirmation…
              </>
            ) : (
              <>Generate my affirmation →</>
            )}
          </button>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </section>

      {/* ── Card Preview ── */}
      {(loading || hasGenerated) && (
        <section
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '0 24px 60px',
            gap: 28,
          }}
        >
          {/* Card */}
          <div
            style={{
              filter: 'drop-shadow(0 20px 48px rgba(15,64,64,0.14))',
              borderRadius: 24,
            }}
          >
            {loading ? (
              <SkeletonCard />
            ) : (
              <AffirmationCard
                affirmation={affirmation}
                bgIndex={bgIndex}
                mood={selectedMood}
                theme={selectedTheme}
                cardRef={cardRef}
              />
            )}
          </div>

          {/* Action buttons */}
          {!loading && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 12,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ActionButton onClick={generate} variant="primary">
                🔄 New affirmation
              </ActionButton>
              <ActionButton onClick={cycleBackground}>
                🎨 Change background
              </ActionButton>
              <ActionButton onClick={downloadCard}>
                ⬇️ Download card
              </ActionButton>
              <ActionButton onClick={shareCard}>
                📤 Share
              </ActionButton>
            </div>
          )}

          {/* Share / copy feedback */}
          {shareMsg && (
            <p
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: '0.85rem',
                color: '#1A6B6B',
                background: 'rgba(45,155,138,0.1)',
                border: '1px solid rgba(45,155,138,0.25)',
                borderRadius: 8,
                padding: '8px 16px',
                margin: 0,
              }}
            >
              {shareMsg}
            </p>
          )}
        </section>
      )}

      {/* ── Empty state prompt ── */}
      {!loading && !hasGenerated && (
        <section
          style={{
            textAlign: 'center',
            padding: '0 24px 80px',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              padding: '32px 48px',
              borderRadius: 20,
              background: 'rgba(255,255,255,0.6)',
              border: '1.5px dashed rgba(45,155,138,0.3)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <p
              style={{
                fontSize: '2.5rem',
                margin: '0 0 8px',
              }}
            >
              💌
            </p>
            <p
              style={{
                fontSize: '0.9rem',
                color: '#2D9B8A',
                margin: 0,
                fontWeight: 500,
              }}
            >
              Your card will appear here
            </p>
            <p
              style={{
                fontSize: '0.78rem',
                color: 'rgba(45,155,138,0.6)',
                margin: '4px 0 0',
              }}
            >
              Select a mood or theme above, then generate
            </p>
          </div>
        </section>
      )}
    </main>
  )
}
