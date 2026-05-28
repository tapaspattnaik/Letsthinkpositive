'use client'

// npm install html2canvas
import html2canvas from 'html2canvas'
import { useState, useRef, useCallback } from 'react'

const EXAMPLE_QUOTES = [
  'The comeback is always stronger than the setback.',
  'You are not behind. You are exactly where you need to be.',
  'Small steps every day. That\'s the whole secret.',
  'Be the energy you want to attract.',
  'Your story isn\'t over. The best chapters are ahead.',
  'It\'s okay to be a work in progress.',
  'Breathe. You\'ve survived every hard day so far.',
  'Kindness costs nothing and means everything.',
]

type StyleId = 1 | 2 | 3 | 4 | 5 | 6

interface CardStyle {
  id:       StyleId
  label:    string
  swatch:   string
  cardBg:   string
  textColor: string
  attrColor: string
  border?:  string
}

const CARD_STYLES: CardStyle[] = [
  {
    id: 1,
    label:     'Dark Teal',
    swatch:    'bg-gradient-to-br from-[#0F4040] to-[#1A6B6B]',
    cardBg:    'linear-gradient(135deg, #0F4040 0%, #1A6B6B 100%)',
    textColor: '#ffffff',
    attrColor: 'rgba(255,255,255,0.65)',
  },
  {
    id: 2,
    label:     'Warm Amber',
    swatch:    'bg-gradient-to-br from-[#E8A020] to-[#F5C96A]',
    cardBg:    'linear-gradient(135deg, #E8A020 0%, #F5C96A 100%)',
    textColor: '#1C2B2B',
    attrColor: 'rgba(28,43,43,0.65)',
  },
  {
    id: 3,
    label:     'Mint Ghost',
    swatch:    'bg-[#EEF7F6]',
    cardBg:    '#EEF7F6',
    textColor: '#1A6B6B',
    attrColor: '#2D9B8A',
  },
  {
    id: 4,
    label:     'Deep Space',
    swatch:    'bg-gradient-to-br from-[#1a1a2e] to-[#1A6B6B]',
    cardBg:    'linear-gradient(135deg, #1a1a2e 0%, #1A6B6B 100%)',
    textColor: '#ffffff',
    attrColor: 'rgba(255,255,255,0.60)',
  },
  {
    id: 5,
    label:     'Sunrise',
    swatch:    'bg-gradient-to-br from-[#E8A020] to-[#FFE4E1]',
    cardBg:    'linear-gradient(135deg, #E8A020 0%, #FFE4E1 100%)',
    textColor: '#1C2B2B',
    attrColor: 'rgba(28,43,43,0.60)',
  },
  {
    id: 6,
    label:     'Pure White',
    swatch:    'bg-white border-2 border-[#2D9B8A]',
    cardBg:    '#ffffff',
    textColor: '#1C2B2B',
    attrColor: '#2D9B8A',
    border:    '3px solid #2D9B8A',
  },
]

function getFontSize(text: string): number {
  const len = text.length
  if (len < 60)  return 28
  if (len < 100) return 24
  if (len < 150) return 20
  return 17
}

export default function QuoteCreatorPage() {
  const [quote,       setQuote]       = useState('')
  const [attribution, setAttribution] = useState('')
  const [styleId,     setStyleId]     = useState<StyleId>(1)
  const [step,        setStep]        = useState<1 | 2 | 3>(1)
  const [downloading, setDownloading] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const style = CARD_STYLES.find(s => s.id === styleId) ?? CARD_STYLES[0]

  const handleQuoteChip = (q: string) => {
    setQuote(q)
  }

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return
    setDownloading(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale:           2,
        useCORS:         true,
        backgroundColor: null,
        logging:         false,
      })
      const link      = document.createElement('a')
      link.download   = 'quote-card.png'
      link.href       = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('Download failed:', err)
    }
    setDownloading(false)
  }, [])

  const handleShare = useCallback(async () => {
    if (!cardRef.current) return
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true, logging: false })
      canvas.toBlob(async (blob: Blob | null) => {
        if (!blob) return
        const file = new File([blob], 'quote-card.png', { type: 'image/png' })
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'My Quote Card',
            text:  quote,
          })
        } else {
          // Fallback: just download
          handleDownload()
        }
      }, 'image/png')
    } catch (err) {
      console.error('Share failed:', err)
    }
  }, [quote, handleDownload])

  const handleReset = () => {
    setQuote('')
    setAttribution('')
    setStyleId(1)
    setStep(1)
  }

  const canProceedTo2 = quote.trim().length > 0
  const canProceedTo3 = canProceedTo2

  const STEP_LABELS = ['The Quote', 'Design', 'Preview & Download']

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-ghost to-ivory pt-[72px] pb-20">

      {/* Header */}
      <div className="max-w-3xl mx-auto px-[5%] pt-12 pb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-amber/20 text-[#B07818] text-[0.72rem] font-bold tracking-[0.18em] uppercase rounded-full px-4 py-1.5 mb-5">
          ✨ Quote Card Creator
        </div>
        <h1 className="font-display text-[clamp(2rem,4vw,3rem)] text-charcoal leading-tight mb-3">
          Create Your Quote Card
        </h1>
        <p className="text-[1rem] text-text-mid max-w-[520px] mx-auto leading-[1.8]">
          Write a quote that moves you. Make it beautiful. Share it with the world.
        </p>
      </div>

      {/* Step progress */}
      <div className="max-w-3xl mx-auto px-[5%] mb-10">
        <div className="flex items-center gap-0">
          {STEP_LABELS.map((label, i) => {
            const n    = (i + 1) as 1 | 2 | 3
            const done = step > n
            const active = step === n
            return (
              <div key={n} className="flex items-center flex-1 last:flex-none">
                <button
                  onClick={() => {
                    if (n <= step || (n === 2 && canProceedTo2) || (n === 3 && canProceedTo3)) {
                      setStep(n)
                    }
                  }}
                  className={`flex items-center gap-2 group focus:outline-none`}
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-[0.8rem] font-bold transition-all
                    ${done   ? 'bg-teal-mid text-white' :
                      active ? 'bg-amber text-charcoal shadow-sm' :
                               'bg-white border-2 border-teal-light text-text-xlight'}`}>
                    {done ? '✓' : n}
                  </span>
                  <span className={`text-[0.78rem] font-semibold hidden sm:block transition-colors
                    ${active ? 'text-charcoal' : done ? 'text-teal-mid' : 'text-text-xlight'}`}>
                    {label}
                  </span>
                </button>
                {i < 2 && (
                  <div className={`flex-1 h-px mx-3 transition-colors ${done ? 'bg-teal-mid' : 'bg-teal-light'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-[5%]">

        {/* ── Step 1: The Quote ── */}
        {step === 1 && (
          <div className="bg-white rounded-[28px] border border-teal-light shadow-card p-8">
            <h2 className="font-display text-[1.4rem] text-charcoal mb-1">Step 1 — The Quote</h2>
            <p className="text-[0.82rem] text-text-xlight mb-6">Type your own or pick one of our favourites.</p>

            <textarea
              value={quote}
              onChange={e => setQuote(e.target.value)}
              placeholder="Type your quote or affirmation..."
              rows={3}
              maxLength={280}
              className="w-full border border-teal-light rounded-[16px] px-5 py-4 text-[1rem] text-charcoal font-body outline-none focus:border-teal-mid resize-none bg-teal-ghost/20 transition-colors placeholder:text-text-xlight"
            />
            <div className="text-right text-[0.72rem] text-text-xlight mt-1 mb-6">
              {quote.length}/280
            </div>

            {/* Example chips */}
            <p className="text-[0.75rem] font-semibold text-text-mid uppercase tracking-[0.12em] mb-3">
              Or choose a favourite:
            </p>
            <div className="flex flex-wrap gap-2 mb-8">
              {EXAMPLE_QUOTES.map(q => (
                <button
                  key={q}
                  onClick={() => handleQuoteChip(q)}
                  className={`text-[0.8rem] px-3.5 py-2 rounded-full border transition-all text-left leading-snug
                    ${quote === q
                      ? 'bg-amber text-charcoal border-amber font-semibold'
                      : 'border-teal-light text-text-mid hover:bg-teal-ghost hover:border-teal-mid'}`}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Attribution */}
            <div className="mb-6">
              <label className="block text-[0.78rem] font-semibold text-charcoal mb-1.5">
                Attribution <span className="text-text-xlight font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={attribution}
                onChange={e => setAttribution(e.target.value)}
                placeholder="— Your name or leave blank"
                maxLength={80}
                className="w-full max-w-sm border border-teal-light rounded-[10px] px-4 py-2.5 text-[0.88rem] outline-none focus:border-teal-mid bg-teal-ghost/20"
              />
            </div>

            <button
              onClick={() => canProceedTo2 && setStep(2)}
              disabled={!canProceedTo2}
              className="bg-teal-deep text-white px-8 py-3.5 rounded-full font-semibold text-[0.95rem] hover:bg-teal-dark hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              Next: Choose Design →
            </button>
          </div>
        )}

        {/* ── Step 2: Design ── */}
        {step === 2 && (
          <div className="bg-white rounded-[28px] border border-teal-light shadow-card p-8">
            <h2 className="font-display text-[1.4rem] text-charcoal mb-1">Step 2 — Design</h2>
            <p className="text-[0.82rem] text-text-xlight mb-6">Pick a background style for your card.</p>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
              {CARD_STYLES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setStyleId(s.id)}
                  title={s.label}
                  className={`group flex flex-col items-center gap-1.5 focus:outline-none`}
                >
                  <div className={`w-14 h-14 rounded-[12px] ${s.swatch} transition-all
                    ${styleId === s.id ? 'ring-2 ring-offset-2 ring-teal-deep scale-110' : 'hover:scale-105'}`} />
                  <span className={`text-[0.65rem] font-semibold transition-colors leading-tight text-center
                    ${styleId === s.id ? 'text-teal-deep' : 'text-text-xlight'}`}>
                    {s.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Mini preview */}
            <div className="mb-8 flex justify-center">
              <div
                className="rounded-[16px] flex flex-col items-center justify-center text-center px-6 py-6 shadow-md overflow-hidden"
                style={{
                  width: '240px',
                  height: '240px',
                  background: style.cardBg,
                  border: style.border ?? 'none',
                  position: 'relative',
                }}
              >
                <span style={{
                  position: 'absolute', top: '6px', left: '10px',
                  fontSize: '5rem', lineHeight: 1,
                  color: 'rgba(255,255,255,0.08)',
                  fontFamily: 'Georgia, serif',
                }}>&ldquo;</span>
                <p style={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontStyle:  'italic',
                  fontSize:   `${Math.max(getFontSize(quote) - 6, 11)}px`,
                  color:      style.textColor,
                  lineHeight: 1.5,
                  margin:     0,
                  zIndex:     1,
                  position:   'relative',
                }}>
                  {quote || 'Your quote will appear here…'}
                </p>
                {attribution && (
                  <p style={{
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize:   '9px',
                    color:      style.attrColor,
                    marginTop:  '8px',
                    position:   'relative',
                    zIndex:     1,
                  }}>
                    {attribution.startsWith('—') ? attribution : `— ${attribution}`}
                  </p>
                )}
                <p style={{
                  position: 'absolute', bottom: '6px',
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize:   '7px',
                  color:      style.attrColor,
                  zIndex:     1,
                }}>
                  🌿 letsthinkpositive.com
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="border border-teal-light text-text-mid px-6 py-3 rounded-full font-semibold text-[0.88rem] hover:bg-teal-ghost transition-all"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="bg-teal-deep text-white px-8 py-3.5 rounded-full font-semibold text-[0.95rem] hover:bg-teal-dark hover:-translate-y-0.5 transition-all"
              >
                Next: Preview →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Preview & Download ── */}
        {step === 3 && (
          <div className="bg-white rounded-[28px] border border-teal-light shadow-card p-8">
            <h2 className="font-display text-[1.4rem] text-charcoal mb-1">Step 3 — Preview &amp; Download</h2>
            <p className="text-[0.82rem] text-text-xlight mb-8">Your card is ready. Download it or share it directly.</p>

            {/* Card preview — fixed 400×400, no responsive Tailwind classes on inner elements */}
            <div className="flex justify-center mb-8">
              <div
                ref={cardRef}
                id="quote-card"
                style={{
                  width:          '400px',
                  height:         '400px',
                  background:     style.cardBg,
                  border:         style.border ?? 'none',
                  borderRadius:   '24px',
                  display:        'flex',
                  flexDirection:  'column',
                  alignItems:     'center',
                  justifyContent: 'center',
                  padding:        '48px 40px 40px',
                  position:       'relative',
                  overflow:       'hidden',
                  boxShadow:      '0 12px 48px rgba(0,0,0,0.15)',
                  boxSizing:      'border-box',
                  textAlign:      'center',
                }}
              >
                {/* Decorative quote mark */}
                <span style={{
                  position:   'absolute',
                  top:        '-10px',
                  left:       '16px',
                  fontSize:   '10rem',
                  lineHeight: 1,
                  color:      'rgba(255,255,255,0.07)',
                  fontFamily: 'Georgia, serif',
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}>
                  &ldquo;
                </span>

                {/* Quote text */}
                <p style={{
                  fontFamily:  '"Playfair Display", Georgia, serif',
                  fontStyle:   'italic',
                  fontSize:    `${getFontSize(quote)}px`,
                  color:       style.textColor,
                  lineHeight:  1.65,
                  margin:      0,
                  zIndex:      1,
                  position:    'relative',
                  maxWidth:    '100%',
                }}>
                  {quote}
                </p>

                {/* Attribution */}
                {attribution && (
                  <p style={{
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize:   '13px',
                    color:      style.attrColor,
                    marginTop:  '18px',
                    position:   'relative',
                    zIndex:     1,
                  }}>
                    {attribution.startsWith('—') ? attribution : `— ${attribution}`}
                  </p>
                )}

                {/* Watermark */}
                <p style={{
                  position:   'absolute',
                  bottom:     '14px',
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize:   '10px',
                  color:      style.attrColor,
                  zIndex:     1,
                  letterSpacing: '0.04em',
                }}>
                  🌿 letsthinkpositive.com
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-2 bg-teal-deep text-white px-7 py-3.5 rounded-full font-semibold text-[0.92rem] hover:bg-teal-dark hover:-translate-y-0.5 transition-all disabled:opacity-60"
              >
                {downloading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Downloading…
                  </>
                ) : (
                  <>⬇️ Download as image</>
                )}
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 bg-amber text-charcoal px-7 py-3.5 rounded-full font-semibold text-[0.92rem] hover:bg-amber-soft hover:-translate-y-0.5 transition-all"
              >
                📤 Share
              </button>

              <button
                onClick={handleReset}
                className="flex items-center gap-2 border border-teal-light text-text-mid px-6 py-3.5 rounded-full font-semibold text-[0.88rem] hover:bg-teal-ghost transition-all"
              >
                🔄 Reset
              </button>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setStep(2)}
                className="text-[0.8rem] text-teal-mid hover:text-teal-deep transition-colors"
              >
                ← Change design
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
