'use client'

import { useState } from 'react'

interface Props {
  images: string[]
  title:  string
}

function SafeImg({ src, alt, className }: { src: string; alt: string; className: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) return null
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />
}

export function BlogImageGallery({ images, title }: Props) {
  const [loadedCount, setLoadedCount] = useState(images.length)

  if (images.length === 0 || loadedCount === 0) return null

  return (
    <div className="mb-8">
      {/* First image — featured / full-width */}
      <SafeImg
        src={images[0]}
        alt={`${title} — featured image`}
        className="w-full rounded-[18px] object-cover max-h-[480px] shadow-card border border-teal-light/30"
      />

      {/* Additional images — 2-3 col grid */}
      {images.length > 1 && (
        <div className={`mt-3 grid gap-3 ${images.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
          {images.slice(1).map((src, i) => (
            <SafeImg
              key={i}
              src={src}
              alt={`${title} — image ${i + 2}`}
              className="w-full rounded-[14px] object-cover aspect-[4/3] shadow-card border border-teal-light/20"
            />
          ))}
        </div>
      )}
    </div>
  )
}
