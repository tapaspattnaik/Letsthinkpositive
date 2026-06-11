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

  const [copied, setCopied] = useState(false)

  const handleReset = () => { setQuote(''); setAttribution(''); setStyleId(1); setPhotoId(PHOTO_TEMPLATES[0].id); setBgMode('color'); setStep(1) }

  const [shareId,      setShareId]      = useState<string | null>(null)
  const [shareLoading, setShareLoading] = useState(false)

  // Upload canvas to server → get a /share/[id] URL with real og:image meta tags
  // Social platforms crawl that URL and show the image preview properly
  async function uploadCardAndGetShareUrl(): Promise<string> {
    if (shareId) return `https://letsthinkpositive.com/share/${shareId}` // reuse if already uploaded
    if (!cardRef.current) return 'https://letsthinkpositive.com/quotes'
    setShareLoading(true)
    try {
      const canvas    = await html2canvas(cardRef.current, { scale: 2, useCORS: true, allowTaint: true, logging: false })
      const imageData = canvas.toDataURL('image/png')
      const res       = await fetch('/api/share-image', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ imageData }),
      })
      if (res.ok) {
        const { id } = await res.json()
        setShareId(id)
        return `https://letsthinkpositive.com/share/${id}`
      }
    } catch (err) { console.error('Share upload error:', err) }
    finally { setShareLoading(false) }
    return 'https://letsthinkpositive.com/quotes'
  }

  const credit    = attribution ? attribution.replace(/^—\s*/, '') : ''
  const quoteLine = credit ? `"${quote}" — ${credit}` : `"${quote}"`

  // ── Post the card to the community wall ──────────────────────────────────
  const [wallPosting, setWallPosting] = useState(false)
  const [wallMsg,     setWallMsg]     = useState<string | null>(null)

  async function postToWall() {
    if (wallPosting || !cardRef.current) return
    setWallPosting(true)
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true, allowTaint: true, logging: false })
      const blob: Blob | null = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
      let images: string[] = []
      if (blob) {
        const { uploadWallImage } = await import('@/lib/wall')
        const url = await uploadWallImage(blob, 'quote-card.png')
        if (url === 'login') {
          setWallMsg('Sign in to post to the community wall ✋')
          return
        }
        if (url) images = [url]
      }
      const { createWallPost } = await import('@/lib/wall')
      const result = await createWallPost({ body: quoteLine, images, tags: '#quote' })
      setWallMsg(result.ok ? '🌍 Posted to the community wall!' : (result.error ?? 'Could not post — try again'))
    } catch {
      setWallMsg('Could not post — try again')
    } finally {
      setWallPosting(false)
      setTimeout(() => setWallMsg(null), 4000)
    }
  }

  async function shareTwitter() {
    const shareUrl = await uploadCardAndGetShareUrl()
    const text = `✨ ${quoteLine}\n\nThis one hit different 💛\n\n#Mindfulness #Positivity #letsthinkpositive`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400')
  }

  async function shareWhatsApp() {
    const shareUrl = await uploadCardAndGetShareUrl()
    const text = `Hey 👋 came across this quote and thought of you:\n\n${quoteLine}\n\nMade it on letsthinkpositive.com 🌿\n${shareUrl}`
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank')
  }

  async function shareFacebook() {
    const shareUrl = await uploadCardAndGetShareUrl()
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400')
  }

  async function shareLinkedIn() {
    const shareUrl = await uploadCardAndGetShareUrl()
    const text = `Words worth carrying:\n\n${quoteLine}\n\nCreated on letsthinkpositive.com — a space for mental wellness and positive thinking.`
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(text)}`, '_blank', 'width=600,height=500')
  }

  async function shareTelegram() {
    const shareUrl = await uploadCardAndGetShareUrl()
    const text = `📖 ${quoteLine}\n\nCreate your own quote card 👇`
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`, '_blank')
  }

  async function copyText() {
    try {
      const full = `${quoteLine}\n\n— via letsthinkpositive.com`
      await navigator.clipboard.writeText(full)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch { /* fallback */ }
  }

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

            {/* Primary actions */}
            <div className="flex flex-wrap gap-3 justify-center mb-8">
              <button onClick={handleDownload} disabled={downloading}
                className="flex items-center gap-2 bg-teal-deep text-white px-7 py-3.5 rounded-full font-semibold text-[0.92rem] hover:bg-teal-dark hover:-translate-y-0.5 transition-all disabled:opacity-60 shadow-md">
                {downloading
                  ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving…</>
                  : <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>Download Image</>}
              </button>
              <button onClick={handleShare}
                className="flex items-center gap-2 bg-amber text-charcoal px-6 py-3.5 rounded-full font-semibold text-[0.92rem] hover:bg-amber-soft hover:-translate-y-0.5 transition-all shadow-md">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>
                Native Share
              </button>
              <button onClick={postToWall} disabled={wallPosting}
                className="flex items-center gap-2 bg-white text-teal-deep border-2 border-teal-light px-6 py-3.5 rounded-full font-semibold text-[0.92rem] hover:border-teal-mid hover:-translate-y-0.5 transition-all shadow-md disabled:opacity-60">
                {wallPosting ? '⏳ Posting…' : '🌍 Post to wall'}
              </button>
            </div>

            {/* Wall post feedback */}
            {wallMsg && (
              <p className="text-center text-[0.85rem] font-semibold text-teal-deep mb-6">{wallMsg}</p>
            )}

            {/* Social sharing grid */}
            <div className="border border-teal-light rounded-[24px] p-6 mb-6 bg-ivory">
              <div className="flex items-center justify-center gap-2 mb-4">
                <p className="text-[0.75rem] font-bold text-text-xlight uppercase tracking-widest">Share to Social Media</p>
                {shareLoading && (
                  <span className="w-3.5 h-3.5 border-2 border-teal-light border-t-teal-deep rounded-full animate-spin" />
                )}
                {shareId && !shareLoading && (
                  <span className="text-[0.68rem] text-teal-deep font-medium">✓ Image ready</span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {/* Twitter / X */}
                <button onClick={shareTwitter}
                  className="flex items-center gap-3 bg-black text-white px-4 py-3 rounded-[14px] hover:bg-gray-800 hover:-translate-y-0.5 transition-all font-semibold text-[0.88rem]">
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  Post on X
                </button>

                {/* WhatsApp */}
                <button onClick={shareWhatsApp}
                  className="flex items-center gap-3 bg-[#25D366] text-white px-4 py-3 rounded-[14px] hover:bg-[#1ebe5d] hover:-translate-y-0.5 transition-all font-semibold text-[0.88rem]">
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </button>

                {/* Facebook */}
                <button onClick={shareFacebook}
                  className="flex items-center gap-3 bg-[#1877F2] text-white px-4 py-3 rounded-[14px] hover:bg-[#1565d8] hover:-translate-y-0.5 transition-all font-semibold text-[0.88rem]">
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </button>

                {/* LinkedIn */}
                <button onClick={shareLinkedIn}
                  className="flex items-center gap-3 bg-[#0A66C2] text-white px-4 py-3 rounded-[14px] hover:bg-[#0958a8] hover:-translate-y-0.5 transition-all font-semibold text-[0.88rem]">
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </button>

                {/* Telegram */}
                <button onClick={shareTelegram}
                  className="flex items-center gap-3 bg-[#26A5E4] text-white px-4 py-3 rounded-[14px] hover:bg-[#1e96d4] hover:-translate-y-0.5 transition-all font-semibold text-[0.88rem]">
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  Telegram
                </button>

                {/* Copy Text */}
                <button onClick={copyText}
                  className={`flex items-center gap-3 px-4 py-3 rounded-[14px] hover:-translate-y-0.5 transition-all font-semibold text-[0.88rem] border
                    ${copied
                      ? 'bg-teal-ghost border-teal-mid text-teal-deep'
                      : 'bg-white border-teal-light text-charcoal hover:border-teal-mid hover:bg-teal-ghost'}`}>
                  {copied
                    ? <><svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>Copied!</>
                    : <><svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586" /></svg>Copy Text</>
                  }
                </button>
              </div>

              {/* Post to Community */}
              <div className="border-t border-teal-light pt-4">
                <a href={`/community?quote=${encodeURIComponent(quote)}`}
                  className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-teal-deep to-teal-dark text-white py-3.5 rounded-[14px] font-semibold text-[0.92rem] no-underline hover:-translate-y-0.5 hover:shadow-lift transition-all">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                  🌿 Post to letsthinkpositive Community
                </a>
                <p className="text-[0.72rem] text-text-xlight text-center mt-2">Share with fellow members — inspire someone today</p>
              </div>
            </div>

            {/* Instagram note */}
            <div className="flex items-start gap-3 bg-gradient-to-r from-[#f09433]/10 to-[#e6683c]/10 border border-[#e6683c]/20 rounded-[14px] px-4 py-3 mb-6">
              <span className="text-[1.2rem] flex-shrink-0">📸</span>
              <div>
                <p className="text-[0.82rem] font-semibold text-charcoal">Instagram?</p>
                <p className="text-[0.75rem] text-text-mid">Download the image above, then post it to your Instagram feed or story and tag <strong>@letsthinkpositive</strong> 🌿</p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-5">
              <button onClick={() => setStep(2)} className="text-[0.8rem] text-teal-mid hover:text-teal-deep transition-colors">← Change design</button>
              <button onClick={() => setStep(1)} className="text-[0.8rem] text-teal-mid hover:text-teal-deep transition-colors">Edit quote</button>
              <button onClick={handleReset} className="text-[0.8rem] text-text-xlight hover:text-red-400 transition-colors">🔄 Start over</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
