'use client'

import html2canvas from 'html2canvas'
import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'

const EXAMPLE_QUOTES = [
  'The comeback is always stronger than the setback.',
  'You are not behind. You are exactly where you need to be.',
  'Small steps every day. That\'s the whole secret.',
  'Be the energy you want to attract.',
  'Your story isn\'t over. The best chapters are ahead.',
  'It\'s okay to be a work in progress.',
  'Breathe. You\'ve survived every hard day so far.',
  'Kindness costs nothing and means everything.',
  'Growth is not always linear. That\'s okay.',
  'Today I choose peace over perfection.',
  'You are worthy of the love you give others.',
  'One step at a time is still progress.',
]

// ── Color gradient styles ─────────────────────────────────────────────────────
type StyleId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
interface CardStyle {
  id: StyleId; label: string; swatch: string
  cardBg: string; textColor: string; attrColor: string; border?: string
}
const CARD_STYLES: CardStyle[] = [
  { id: 1, label: 'Deep Teal',    swatch: 'bg-gradient-to-br from-[#0F4040] to-[#1A6B6B]', cardBg: 'linear-gradient(135deg,#0F4040,#1A6B6B)', textColor: '#fff', attrColor: 'rgba(255,255,255,0.65)' },
  { id: 2, label: 'Golden Hour',  swatch: 'bg-gradient-to-br from-[#E8A020] to-[#F5C96A]', cardBg: 'linear-gradient(135deg,#E8A020,#F5C96A)', textColor: '#1C2B2B', attrColor: 'rgba(28,43,43,0.65)' },
  { id: 3, label: 'Mint Calm',    swatch: 'bg-[#EEF7F6] border border-teal-light',         cardBg: '#EEF7F6',                                 textColor: '#1A6B6B', attrColor: '#2D9B8A' },
  { id: 4, label: 'Midnight',     swatch: 'bg-gradient-to-br from-[#1a1a2e] to-[#1A6B6B]', cardBg: 'linear-gradient(135deg,#1a1a2e,#16213e)', textColor: '#fff', attrColor: 'rgba(255,255,255,0.60)' },
  { id: 5, label: 'Sunrise Pink', swatch: 'bg-gradient-to-br from-[#ff9a9e] to-[#fad0c4]', cardBg: 'linear-gradient(135deg,#ff9a9e,#fad0c4)', textColor: '#4a2040', attrColor: 'rgba(74,32,64,0.70)' },
  { id: 6, label: 'Lavender',     swatch: 'bg-gradient-to-br from-[#a18cd1] to-[#fbc2eb]', cardBg: 'linear-gradient(135deg,#a18cd1,#fbc2eb)', textColor: '#2d1b5e', attrColor: 'rgba(45,27,94,0.70)' },
  { id: 7, label: 'Ocean Blue',   swatch: 'bg-gradient-to-br from-[#0093E9] to-[#80D0C7]', cardBg: 'linear-gradient(135deg,#0093E9,#80D0C7)', textColor: '#fff', attrColor: 'rgba(255,255,255,0.70)' },
  { id: 8, label: 'Pure White',   swatch: 'bg-white border-2 border-teal-mid',             cardBg: '#ffffff',                                 textColor: '#1C2B2B', attrColor: '#2D9B8A', border: '3px solid #2D9B8A' },
]

// ── Photo background templates ────────────────────────────────────────────────
interface PhotoTemplate {
  id: string; label: string; url: string
  textColor: string; overlayColor: string; attrColor: string
}
const PHOTO_TEMPLATES: PhotoTemplate[] = [
  { id: 'forest',    label: 'Forest Path',    url: 'https://images.pexels.com/photos/167698/pexels-photo-167698.jpeg?auto=compress&cs=tinysrgb&w=800',  textColor: '#fff', overlayColor: 'rgba(15,40,30,0.55)',  attrColor: 'rgba(255,255,255,0.75)' },
  { id: 'ocean',     label: 'Ocean Calm',     url: 'https://images.pexels.com/photos/1056553/pexels-photo-1056553.jpeg?auto=compress&cs=tinysrgb&w=800', textColor: '#fff', overlayColor: 'rgba(0,40,80,0.50)',   attrColor: 'rgba(255,255,255,0.75)' },
  { id: 'sunrise',   label: 'Sunrise',        url: 'https://images.pexels.com/photos/1431822/pexels-photo-1431822.jpeg?auto=compress&cs=tinysrgb&w=800', textColor: '#fff', overlayColor: 'rgba(80,30,10,0.45)',  attrColor: 'rgba(255,245,220,0.80)' },
  { id: 'mountain',  label: 'Mountain Mist',  url: 'https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg?auto=compress&cs=tinysrgb&w=800', textColor: '#fff', overlayColor: 'rgba(20,30,60,0.50)',  attrColor: 'rgba(255,255,255,0.70)' },
  { id: 'flowers',   label: 'Spring Bloom',   url: 'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&cs=tinysrgb&w=800',   textColor: '#fff', overlayColor: 'rgba(60,10,60,0.45)',  attrColor: 'rgba(255,230,255,0.80)' },
  { id: 'waterfall', label: 'Waterfall',      url: 'https://images.pexels.com/photos/688660/pexels-photo-688660.jpeg?auto=compress&cs=tinysrgb&w=800',   textColor: '#fff', overlayColor: 'rgba(10,50,50,0.50)',  attrColor: 'rgba(255,255,255,0.75)' },
  { id: 'stars',     label: 'Starry Night',   url: 'https://images.pexels.com/photos/1252869/pexels-photo-1252869.jpeg?auto=compress&cs=tinysrgb&w=800', textColor: '#fff', overlayColor: 'rgba(5,5,30,0.55)',    attrColor: 'rgba(200,200,255,0.80)' },
  { id: 'beach',     label: 'Golden Beach',   url: 'https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg?auto=compress&cs=tinysrgb&w=800', textColor: '#fff', overlayColor: 'rgba(80,50,0,0.45)',   attrColor: 'rgba(255,245,200,0.85)' },
  { id: 'autumn',    label: 'Autumn Leaves',  url: 'https://images.pexels.com/photos/紅叶/pexels-photo-1166869.jpeg?auto=compress&cs=tinysrgb&w=800',    textColor: '#fff', overlayColor: 'rgba(60,20,0,0.45)',   attrColor: 'rgba(255,230,200,0.80)' },
  { id: 'snow',      label: 'Winter Peace',   url: 'https://images.pexels.com/photos/773594/pexels-photo-773594.jpeg?auto=compress&cs=tinysrgb&w=800',   textColor: '#1a2b2b', overlayColor: 'rgba(240,248,255,0.60)', attrColor: 'rgba(26,43,43,0.70)' },
  { id: 'meadow',    label: 'Green Meadow',   url: 'https://images.pexels.com/photos/462118/pexels-photo-462118.jpeg?auto=compress&cs=tinysrgb&w=800',   textColor: '#fff', overlayColor: 'rgba(10,40,10,0.50)',  attrColor: 'rgba(255,255,255,0.75)' },
  { id: 'desert',    label: 'Desert Dusk',    url: 'https://images.pexels.com/photos/847402/pexels-photo-847402.jpeg?auto=compress&cs=tinysrgb&w=800',   textColor: '#fff', overlayColor: 'rgba(60,30,0,0.45)',   attrColor: 'rgba(255,235,200,0.80)' },
]

function getFontSize(text: string): number {
  const len = text.length
  if (len < 60)  return 28
  if (len < 100) return 24
  if (len < 150) return 20
  return 17
}

type BgMode = 'color' | 'photo'

export default function QuoteCreatorPage() {
  const [quote,       setQuote]       = useState('')
  const [attribution, setAttribution] = useState('')
  const [styleId,     setStyleId]     = useState<StyleId>(1)
  const [photoId,     setPhotoId]     = useState<string>(PHOTO_TEMPLATES[0].id)
  const [bgMode,      setBgMode]      = useState<BgMode>('color')
  const [step,        setStep]        = useState<1 | 2 | 3>(1)
  const [downloading, setDownloading] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const colorStyle  = CARD_STYLES.find(s => s.id === styleId) ?? CARD_STYLES[0]
  const photoStyle  = PHOTO_TEMPLATES.find(p => p.id === photoId) ?? PHOTO_TEMPLATES[0]

  // Active text/attribution colors for display
  const textColor  = bgMode === 'photo' ? photoStyle.textColor  : colorStyle.textColor
  const attrColor  = bgMode === 'photo' ? photoStyle.attrColor  : colorStyle.attrColor

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return
    setDownloading(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, useCORS: true, allowTaint: true, backgroundColor: null, logging: false,
      })
      const link    = document.createElement('a')
      link.download = 'quote-card.png'
      link.href     = canvas.toDataURL('image/png')
      link.click()
    } catch (err) { console.error('Download failed:', err) }
    setDownloading(false)
  }, [])

  const handleShare = useCallback(async () => {
    if (!cardRef.current) return
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true, allowTaint: true, logging: false })
      canvas.toBlob(async (blob: Blob | null) => {
        if (!blob) return
        const file = new File([blob], 'quote-card.png', { type: 'image/png' })
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: 'My Quote Card', text: quote })
        } else { handleDownload() }
      }, 'image/png')
    } catch { handleDownload() }
  }, [quote, handleDownload])

  const handleReset = () => { setQuote(''); setAttribution(''); setStyleId(1); setPhotoId(PHOTO_TEMPLATES[0].id); setBgMode('color'); setStep(1) }

  const STEP_LABELS = ['Your Quote', 'Design', 'Preview & Share']

  // Card inner content — shared between preview and export
  function CardInner({ forExport = false }: { forExport?: boolean }) {
    const fs = forExport ? getFontSize(quote) : Math.max(getFontSize(quote) - 4, 13)
    return (
      <>
        {/* Quote mark */}
        <span style={{ position:'absolute', top:'-10px', left:'14px', fontSize: forExport ? '10rem' : '6rem', lineHeight:1, color:'rgba(255,255,255,0.07)', fontFamily:'Georgia,serif', userSelect:'none', pointerEvents:'none' }}>&ldquo;</span>

        {/* Text */}
        <p style={{ fontFamily:'"Playfair Display",Georgia,serif', fontStyle:'italic', fontSize:`${fs}px`, color: textColor, lineHeight:1.65, margin:0, zIndex:1, position:'relative', maxWidth:'100%', textAlign:'center' }}>
          {quote || (forExport ? '' : 'Your quote will appear here…')}
        </p>

        {attribution && (
          <p style={{ fontFamily:'"DM Sans",sans-serif', fontSize: forExport ? '13px' : '10px', color: attrColor, marginTop: forExport ? '18px' : '10px', position:'relative', zIndex:1, textAlign:'center' }}>
            {attribution.startsWith('—') ? attribution : `— ${attribution}`}
          </p>
        )}

        {/* Watermark */}
        <p style={{ position:'absolute', bottom: forExport ? '14px' : '8px', fontFamily:'"DM Sans",sans-serif', fontSize: forExport ? '10px' : '7px', color: attrColor, zIndex:1, letterSpacing:'0.04em' }}>
          🌿 letsthinkpositive.com
        </p>
      </>
    )
  }

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
          Write a quote. Choose a beautiful background. Download or share.
        </p>
      </div>

      {/* Step progress */}
      <div className="max-w-3xl mx-auto px-[5%] mb-10">
        <div className="flex items-center gap-0">
          {STEP_LABELS.map((label, i) => {
            const n = (i + 1) as 1 | 2 | 3
            const done = step > n; const active = step === n
            return (
              <div key={n} className="flex items-center flex-1 last:flex-none">
                <button onClick={() => { if (n < step || (n === 2 && quote.trim())) setStep(n) }} className="flex items-center gap-2 focus:outline-none">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-[0.8rem] font-bold transition-all
                    ${done ? 'bg-teal-mid text-white' : active ? 'bg-amber text-charcoal shadow-sm' : 'bg-white border-2 border-teal-light text-text-xlight'}`}>
                    {done ? '✓' : n}
                  </span>
                  <span className={`text-[0.78rem] font-semibold hidden sm:block transition-colors ${active ? 'text-charcoal' : done ? 'text-teal-mid' : 'text-text-xlight'}`}>{label}</span>
                </button>
                {i < 2 && <div className={`flex-1 h-px mx-3 transition-colors ${done ? 'bg-teal-mid' : 'bg-teal-light'}`} />}
              </div>
            )
          })}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-[5%]">

        {/* ── Step 1: The Quote ─────────────────────────────────────── */}
        {step === 1 && (
          <div className="bg-white rounded-[28px] border border-teal-light shadow-card p-8">
            <h2 className="font-display text-[1.4rem] text-charcoal mb-1">Step 1 — Your Quote</h2>
            <p className="text-[0.82rem] text-text-xlight mb-6">Write your own or choose one of our favourites below.</p>

            <textarea
              value={quote}
              onChange={e => setQuote(e.target.value)}
              placeholder="Type your quote, affirmation, or thought…"
              rows={4}
              maxLength={280}
              className="w-full border border-teal-light rounded-[16px] px-5 py-4 text-[1rem] text-charcoal font-body outline-none focus:border-teal-mid resize-none bg-teal-ghost/20 transition-colors placeholder:text-text-xlight"
            />
            <div className="text-right text-[0.72rem] text-text-xlight mt-1 mb-6">{quote.length}/280</div>

            <p className="text-[0.75rem] font-bold text-text-mid uppercase tracking-[0.12em] mb-3">Or choose a favourite:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8">
              {EXAMPLE_QUOTES.map(q => (
                <button key={q} onClick={() => setQuote(q)}
                  className={`text-[0.82rem] px-4 py-3 rounded-[12px] border transition-all text-left leading-snug
                    ${quote === q ? 'bg-amber/15 text-charcoal border-amber font-semibold' : 'border-teal-light text-text-mid hover:bg-teal-ghost hover:border-teal-mid'}`}>
                  &ldquo;{q}&rdquo;
                </button>
              ))}
            </div>

            <div className="mb-7">
              <label className="block text-[0.78rem] font-semibold text-charcoal mb-1.5">Attribution <span className="text-text-xlight font-normal">(optional — your name or source)</span></label>
              <input type="text" value={attribution} onChange={e => setAttribution(e.target.value)}
                placeholder="e.g. — Tapas Pattanaik" maxLength={80}
                className="w-full max-w-sm border border-teal-light rounded-[12px] px-4 py-2.5 text-[0.88rem] outline-none focus:border-teal-mid bg-teal-ghost/20" />
            </div>

            <button onClick={() => quote.trim() && setStep(2)} disabled={!quote.trim()}
              className="bg-teal-deep text-white px-8 py-3.5 rounded-full font-semibold text-[0.95rem] hover:bg-teal-dark hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0">
              Next: Choose Design →
            </button>
          </div>
        )}

        {/* ── Step 2: Design ───────────────────────────────────────── */}
        {step === 2 && (
          <div className="bg-white rounded-[28px] border border-teal-light shadow-card p-8">
            <h2 className="font-display text-[1.4rem] text-charcoal mb-1">Step 2 — Design</h2>
            <p className="text-[0.82rem] text-text-xlight mb-6">Choose a colour gradient or a photo background.</p>

            {/* Mode toggle */}
            <div className="flex gap-1 bg-teal-ghost rounded-[14px] p-1 mb-6 w-fit">
              {(['color', 'photo'] as BgMode[]).map(mode => (
                <button key={mode} onClick={() => setBgMode(mode)}
                  className={`px-5 py-2 rounded-[10px] text-[0.85rem] font-semibold transition-all
                    ${bgMode === mode ? 'bg-teal-deep text-white shadow-sm' : 'text-text-mid hover:text-charcoal'}`}>
                  {mode === 'color' ? '🎨 Colour' : '📷 Photo'}
                </button>
              ))}
            </div>

            {/* Color swatches */}
            {bgMode === 'color' && (
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 mb-8">
                {CARD_STYLES.map(s => (
                  <button key={s.id} onClick={() => setStyleId(s.id)} title={s.label} className="flex flex-col items-center gap-1.5 focus:outline-none">
                    <div className={`w-12 h-12 rounded-[12px] ${s.swatch} transition-all ${styleId === s.id ? 'ring-2 ring-offset-2 ring-teal-deep scale-110' : 'hover:scale-105'}`} />
                    <span className={`text-[0.62rem] font-semibold leading-tight text-center transition-colors ${styleId === s.id ? 'text-teal-deep' : 'text-text-xlight'}`}>{s.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Photo grid */}
            {bgMode === 'photo' && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-8">
                {PHOTO_TEMPLATES.map(p => (
                  <button key={p.id} onClick={() => setPhotoId(p.id)}
                    className={`relative rounded-[14px] overflow-hidden aspect-square focus:outline-none group transition-all
                      ${photoId === p.id ? 'ring-3 ring-teal-deep scale-105 shadow-lift' : 'hover:scale-102 hover:shadow-card'}`}
                    style={{ outline: photoId === p.id ? '3px solid #1A6B6B' : 'none', outlineOffset: '2px' }}>
                    <Image src={p.url} alt={p.label} fill className="object-cover" sizes="150px" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" style={{ background: p.overlayColor }} />
                    <div className="absolute inset-0 flex items-end p-2">
                      <span className="text-white text-[0.62rem] font-semibold drop-shadow leading-tight">{p.label}</span>
                    </div>
                    {photoId === p.id && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-teal-deep rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5"/></svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Mini live preview */}
            <div className="mb-8">
              <p className="text-[0.75rem] font-semibold text-text-mid uppercase tracking-widest mb-3">Live Preview</p>
              <div className="flex justify-center">
                <div className="relative rounded-[16px] overflow-hidden shadow-lift flex flex-col items-center justify-center text-center"
                  style={{ width: 220, height: 220, padding: '24px 20px', boxSizing: 'border-box',
                    ...(bgMode === 'color'
                      ? { background: colorStyle.cardBg, border: colorStyle.border ?? 'none' }
                      : {}) }}>
                  {bgMode === 'photo' && (
                    <>
                      <Image src={photoStyle.url} alt={photoStyle.label} fill className="object-cover" sizes="220px" />
                      <div className="absolute inset-0" style={{ background: photoStyle.overlayColor }} />
                    </>
                  )}
                  <CardInner />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="border border-teal-light text-text-mid px-6 py-3 rounded-full font-semibold text-[0.88rem] hover:bg-teal-ghost transition-all">← Back</button>
              <button onClick={() => setStep(3)} className="bg-teal-deep text-white px-8 py-3.5 rounded-full font-semibold text-[0.95rem] hover:bg-teal-dark hover:-translate-y-0.5 transition-all">Next: Preview →</button>
            </div>
          </div>
        )}

        {/* ── Step 3: Preview & Download ───────────────────────────── */}
        {step === 3 && (
          <div className="bg-white rounded-[28px] border border-teal-light shadow-card p-8">
            <h2 className="font-display text-[1.4rem] text-charcoal mb-1">Step 3 — Preview &amp; Share</h2>
            <p className="text-[0.82rem] text-text-xlight mb-8">Your card is ready. Download as an image or share it directly.</p>

            {/* Full-size card for export */}
            <div className="flex justify-center mb-8">
              <div ref={cardRef}
                style={{ width: 400, height: 400, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 40px 40px', overflow: 'hidden', boxSizing: 'border-box', textAlign: 'center', borderRadius: '24px', boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
                  ...(bgMode === 'color'
                    ? { background: colorStyle.cardBg, border: colorStyle.border ?? 'none' }
                    : { background: '#111' }) }}>
                {bgMode === 'photo' && (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photoStyle.url} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} crossOrigin="anonymous" />
                    <div style={{ position:'absolute', inset:0, background: photoStyle.overlayColor }} />
                  </>
                )}
                <CardInner forExport />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 justify-center mb-6">
              <button onClick={handleDownload} disabled={downloading}
                className="flex items-center gap-2 bg-teal-deep text-white px-7 py-3.5 rounded-full font-semibold text-[0.92rem] hover:bg-teal-dark hover:-translate-y-0.5 transition-all disabled:opacity-60">
                {downloading
                  ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Downloading…</>
                  : <>⬇️ Download as Image</>}
              </button>
              <button onClick={handleShare}
                className="flex items-center gap-2 bg-amber text-charcoal px-7 py-3.5 rounded-full font-semibold text-[0.92rem] hover:bg-amber-soft hover:-translate-y-0.5 transition-all">
                📤 Share
              </button>
              <button onClick={handleReset}
                className="flex items-center gap-2 border border-teal-light text-text-mid px-6 py-3.5 rounded-full font-semibold text-[0.88rem] hover:bg-teal-ghost transition-all">
                🔄 Start Over
              </button>
            </div>

            <div className="flex justify-center gap-5">
              <button onClick={() => setStep(2)} className="text-[0.8rem] text-teal-mid hover:text-teal-deep transition-colors">← Change design</button>
              <button onClick={() => setStep(1)} className="text-[0.8rem] text-teal-mid hover:text-teal-deep transition-colors">Edit quote</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
