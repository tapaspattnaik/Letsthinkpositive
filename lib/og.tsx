/**
 * Shared OG image template — used by every opengraph-image.tsx in the app.
 * Must use only inline styles; no Tailwind, no CSS modules.
 * Satori (the renderer behind next/og) requires all elements to have display:'flex'.
 */

export const OG_SIZE = { width: 1200, height: 630 } as const
export const OG_CONTENT_TYPE = 'image/png'

// Brand colours (duplicated here so this file has zero imports)
const C = {
  bgFrom:       '#0A3838',
  bgMid:        '#1A6B6B',
  bgTo:         '#1E5A5A',
  white:        '#FFFFFF',
  whiteMid:     'rgba(255,255,255,0.72)',
  whiteLight:   'rgba(255,255,255,0.45)',
  whiteXLight:  'rgba(255,255,255,0.22)',
  amber:        '#E8A020',
  amberSoft:    '#F5C96A',
  tealLight:    '#A8D8D0',
  separator:    'rgba(255,255,255,0.13)',
}

function bg(): React.CSSProperties {
  return {
    width: '100%', height: '100%',
    display: 'flex', flexDirection: 'column',
    background: `linear-gradient(135deg, ${C.bgFrom} 0%, ${C.bgMid} 55%, ${C.bgTo} 100%)`,
    padding: '56px 80px 48px',
    position: 'relative',
    fontFamily: 'sans-serif',
    overflow: 'hidden',
  }
}

/** Reusable decorative glow circles */
function Glows() {
  return (
    <>
      {/* Amber glow top-right */}
      <div style={{
        position: 'absolute', top: -140, right: -140,
        width: 520, height: 520, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(232,160,32,0.18) 0%, transparent 68%)',
        display: 'flex',
      }} />
      {/* Teal glow bottom-left */}
      <div style={{
        position: 'absolute', bottom: -120, left: -120,
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(45,155,138,0.28) 0%, transparent 68%)',
        display: 'flex',
      }} />
      {/* Subtle dot grid (three faint circles) */}
      <div style={{
        position: 'absolute', bottom: 60, right: 80,
        width: 200, height: 200, borderRadius: '50%',
        border: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
      }} />
      <div style={{
        position: 'absolute', bottom: 30, right: 50,
        width: 260, height: 260, borderRadius: '50%',
        border: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
      }} />
    </>
  )
}

/** Bottom brand bar — same across all images */
function BrandBar({ author }: { author?: string }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      borderTop: `1px solid ${C.separator}`, paddingTop: 22, marginTop: 'auto',
    }}>
      {/* letsthinkpositive logotype */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 0 }}>
        <span style={{ fontSize: 28, fontWeight: 300, color: C.tealLight }}>lets</span>
        <span style={{ fontSize: 28, fontWeight: 700, color: C.white }}>think</span>
        <span style={{ fontSize: 28, fontWeight: 300, color: C.amber }}>positive</span>
      </div>
      {/* Author + URL */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {author && (
          <>
            <span style={{ fontSize: 22, color: C.whiteMid, display: 'flex' }}>{author}</span>
            <span style={{ fontSize: 22, color: C.whiteLight, display: 'flex' }}>·</span>
          </>
        )}
        <span style={{ fontSize: 22, color: C.whiteLight, display: 'flex' }}>
          letsthinkpositive.com
        </span>
      </div>
    </div>
  )
}

// ── Exported templates ──────────────────────────────────────────────────────

export interface OgArticleProps {
  badge: string           // e.g. "Blog", "Wellness Library"
  badgeEmoji: string      // e.g. "✍️", "📚"
  title: string
  excerpt?: string
  author?: string
  meta?: string           // e.g. "5 min read" or "Mindfulness"
}

/** Used by blog posts and library articles */
export function OgArticle({ badge, badgeEmoji, title, excerpt, author, meta }: OgArticleProps) {
  const titleSize = title.length > 72 ? 44 : title.length > 52 ? 52 : 60

  return (
    <div style={bg()}>
      <Glows />

      {/* Badge row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 30 }}>
        <span style={{ fontSize: 42, display: 'flex', lineHeight: 1 }}>{badgeEmoji}</span>
        <span style={{
          fontSize: 21, fontWeight: 700, color: C.amber,
          textTransform: 'uppercase', letterSpacing: '0.14em', display: 'flex',
        }}>{badge}</span>
        {meta && (
          <>
            <span style={{ fontSize: 21, color: C.whiteXLight, display: 'flex' }}>·</span>
            <span style={{ fontSize: 21, color: C.whiteLight, display: 'flex' }}>{meta}</span>
          </>
        )}
      </div>

      {/* Title */}
      <div style={{
        fontSize: titleSize, fontWeight: 700, color: C.white,
        lineHeight: 1.2, maxWidth: 980,
        display: 'flex', flexWrap: 'wrap',
        marginBottom: excerpt ? 20 : 'auto',
      }}>
        {title}
      </div>

      {/* Excerpt */}
      {excerpt && (
        <div style={{
          fontSize: 27, color: C.whiteMid, lineHeight: 1.55,
          maxWidth: 900, display: 'flex', flexWrap: 'wrap',
          marginBottom: 'auto',
        }}>
          {excerpt.length > 130 ? excerpt.slice(0, 130) + '…' : excerpt}
        </div>
      )}

      <BrandBar author={author} />
    </div>
  )
}

export interface OgToolProps {
  emoji: string
  label: string        // Section label, e.g. "Guided Meditation"
  title: string        // Short punchy headline
  description: string  // 1–2 sentence description
  pill?: string        // Optional pill text, e.g. "Free · No sign-up needed"
}

/** Used by tool pages (meditation, sounds, coach, etc.) */
export function OgTool({ emoji, label, title, description, pill }: OgToolProps) {
  return (
    <div style={bg()}>
      <Glows />

      {/* Emoji + label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <span style={{ fontSize: 52, display: 'flex', lineHeight: 1 }}>{emoji}</span>
        <span style={{
          fontSize: 21, fontWeight: 700, color: C.amber,
          textTransform: 'uppercase', letterSpacing: '0.14em', display: 'flex',
        }}>{label}</span>
      </div>

      {/* Headline */}
      <div style={{
        fontSize: 64, fontWeight: 700, color: C.white,
        lineHeight: 1.15, maxWidth: 880,
        display: 'flex', flexWrap: 'wrap',
        marginBottom: 22,
      }}>
        {title}
      </div>

      {/* Description */}
      <div style={{
        fontSize: 28, color: C.whiteMid, lineHeight: 1.55,
        maxWidth: 820, display: 'flex', flexWrap: 'wrap',
        marginBottom: pill ? 22 : 'auto',
      }}>
        {description}
      </div>

      {/* Pill */}
      {pill && (
        <div style={{
          display: 'flex', marginBottom: 'auto', marginTop: 4,
        }}>
          <span style={{
            fontSize: 20, color: C.amber,
            background: 'rgba(232,160,32,0.12)',
            border: '1px solid rgba(232,160,32,0.3)',
            borderRadius: 999, padding: '6px 18px',
            display: 'flex',
          }}>{pill}</span>
        </div>
      )}

      <BrandBar />
    </div>
  )
}

export interface OgDefaultProps {
  tagline?: string
  pills?: string[]   // e.g. ['Mindfulness', 'Gratitude', 'Wellness']
}

/** Default / home OG image */
export function OgDefault({ tagline, pills }: OgDefaultProps) {
  return (
    <div style={bg()}>
      <Glows />

      {/* Large emoji */}
      <div style={{ fontSize: 72, display: 'flex', marginBottom: 28, lineHeight: 1 }}>
        🌿
      </div>

      {/* Big brand name */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 0, marginBottom: 20 }}>
        <span style={{ fontSize: 72, fontWeight: 300, color: C.tealLight, lineHeight: 1 }}>lets</span>
        <span style={{ fontSize: 72, fontWeight: 700, color: C.white,     lineHeight: 1 }}>think</span>
        <span style={{ fontSize: 72, fontWeight: 300, color: C.amber,     lineHeight: 1 }}>positive</span>
      </div>

      {/* Tagline */}
      <div style={{
        fontSize: 32, color: C.whiteMid, fontStyle: 'italic',
        display: 'flex', marginBottom: 'auto',
      }}>
        {tagline ?? 'where every thought begins with hope'}
      </div>

      {/* Pills row + URL */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderTop: `1px solid ${C.separator}`, paddingTop: 22, marginTop: 'auto',
      }}>
        <div style={{ display: 'flex', gap: 10 }}>
          {(pills ?? ['Mindfulness', 'Gratitude', 'Wellness', 'Community']).map((p) => (
            <span key={p} style={{
              fontSize: 19, color: C.whiteMid,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 999, padding: '5px 16px',
              display: 'flex',
            }}>{p}</span>
          ))}
        </div>
        <span style={{ fontSize: 22, color: C.whiteLight, display: 'flex' }}>
          letsthinkpositive.com
        </span>
      </div>
    </div>
  )
}
