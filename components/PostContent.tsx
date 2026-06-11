'use client'

import { useState } from 'react'

// ── Shared wall-post rendering: linkified text + image grid ─────────────────

const URL_REGEX = /(https?:\/\/[^\s<>"')\]]+)/g

/** Renders post text with URLs as safe, clickable links. */
export function LinkifiedText({ text, className }: { text: string; className?: string }) {
  // split() with a capture group alternates [text, url, text, url, …] — odd indices are URLs
  const parts = text.split(URL_REGEX)
  return (
    <p className={className}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer nofollow"
            className="text-teal-mid hover:text-teal-deep underline break-all">
            {part.replace(/^https?:\/\/(www\.)?/, '').slice(0, 50)}{part.replace(/^https?:\/\/(www\.)?/, '').length > 50 ? '…' : ''}
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  )
}

function SafeImg({ src, alt, className, onClick }: { src: string; alt: string; className: string; onClick?: () => void }) {
  const [failed, setFailed] = useState(false)
  if (failed) return null
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} onClick={onClick} loading="lazy" />
}

/** Image grid for wall posts — 1 image full width, 2+ in a grid, with lightbox. */
export function PostImages({ images, alt }: { images: string[]; alt: string }) {
  const [lightbox, setLightbox] = useState<string | null>(null)

  if (!images || images.length === 0) return null

  return (
    <>
      <div className={`mb-3 ${images.length === 1 ? '' : `grid gap-1.5 ${images.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}`}>
        {images.slice(0, 4).map((src, i) => (
          <SafeImg
            key={i}
            src={src}
            alt={`${alt} — image ${i + 1}`}
            onClick={() => setLightbox(src)}
            className={`w-full object-cover rounded-[12px] border border-teal-light/30 cursor-zoom-in hover:opacity-95 transition-opacity ${
              images.length === 1 ? 'max-h-[360px]' : 'aspect-[4/3]'
            }`}
          />
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightbox(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt={alt} className="max-w-full max-h-[90vh] rounded-[12px] object-contain" />
          <button aria-label="Close"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/15 text-white text-[1.1rem] hover:bg-white/30 transition-colors">
            ✕
          </button>
        </div>
      )}
    </>
  )
}

/** Composer attachment strip: picker + thumbnails. Parent owns the state. */
export function ImageAttach({
  images, setImages, max = 4,
}: {
  images: string[]
  setImages: (urls: string[]) => void
  max?: number
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, max - images.length)
    if (!files.length) return
    setUploading(true)
    setError('')
    const uploaded: string[] = []
    for (const file of files) {
      const fd = new FormData()
      fd.append('image', file)
      try {
        const res  = await fetch('/api/upload/post-image', { method: 'POST', body: fd })
        const data = await res.json()
        if (res.ok && data.imageUrl) uploaded.push(data.imageUrl)
        else setError(data.error ?? 'Upload failed')
      } catch {
        setError('Upload failed — try again')
      }
    }
    setImages([...images, ...uploaded].slice(0, max))
    setUploading(false)
    e.target.value = ''
  }

  return (
    <div>
      {images.length > 0 && (
        <div className="flex gap-2 mb-2 flex-wrap">
          {images.map((src, i) => (
            <div key={src} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Attachment ${i + 1}`} className="w-16 h-16 object-cover rounded-[10px] border border-teal-light" />
              <button type="button" aria-label="Remove image"
                onClick={() => setImages(images.filter(u => u !== src))}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-charcoal text-white text-[0.6rem] flex items-center justify-center hover:bg-red-500 transition-colors">
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      {images.length < max && (
        <label className={`inline-flex items-center gap-1.5 text-[0.8rem] font-semibold cursor-pointer transition-colors ${uploading ? 'text-text-xlight' : 'text-teal-mid hover:text-teal-deep'}`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
          </svg>
          {uploading ? 'Uploading…' : `📷 Add photo${images.length > 0 ? ` (${images.length}/${max})` : ''}`}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="hidden" onChange={pick} disabled={uploading} />
        </label>
      )}
      {error && <p className="text-red-400 text-[0.72rem] mt-1">{error}</p>}
    </div>
  )
}
