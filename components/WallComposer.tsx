'use client'

import { useState, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ImageAttach } from '@/components/PostContent'

// Extract #hashtags from body text (unique, lowercase, no leading #)
function extractHashtags(text: string): string[] {
  const matches = text.match(/#([a-zA-Z][a-zA-Z0-9_]{0,39})/g) ?? []
  return [...new Set(matches.map(h => h.slice(1).toLowerCase()))]
}

export function WallComposer({ onPosted }: { onPosted?: () => void }) {
  const { data: session, status } = useSession()
  const [open,    setOpen]    = useState(false)
  const [body,    setBody]    = useState('')
  const [images,  setImages]  = useState<string[]>([])
  const [posting, setPosting] = useState(false)
  const [done,    setDone]    = useState(false)

  if (status !== 'authenticated') return null

  const firstName = session?.user?.name?.split(' ')[0] ?? 'friend'
  const avatar    = session?.user?.image

  // Auto-detect hashtags as user types
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const detectedTags = useMemo(() => extractHashtags(body), [body])

  async function submit() {
    if (!body.trim() || posting) return
    setPosting(true)
    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body,
          images,
          postType: 'story',
          tags: detectedTags.join(','),
        }),
      })
      const data = await res.json()
      if (data.ok) {
        setBody(''); setImages([]); setOpen(false)
        setDone(true)
        setTimeout(() => setDone(false), 3000)
        onPosted?.()
      }
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="bg-white rounded-[20px] p-4 shadow-card border border-teal-light/60">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-teal-ghost flex items-center justify-center overflow-hidden flex-shrink-0">
          {avatar
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={avatar} alt="you" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            : <span className="text-[1rem]">🌿</span>}
        </div>
        {!open ? (
          <button onClick={() => setOpen(true)}
            className="flex-1 text-left bg-teal-ghost hover:bg-teal-light/30 text-text-xlight text-[0.88rem] px-4 py-2.5 rounded-full border border-teal-light/50 hover:border-teal-mid transition-all">
            {done ? '✓ Posted to the community wall!' : `What's on your mind, ${firstName}?`}
          </button>
        ) : (
          <p className="flex-1 font-semibold text-charcoal text-[0.88rem]">Share with the community</p>
        )}
      </div>

      {open && (
        <div className="mt-3 space-y-3">
          <textarea
            autoFocus
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Write anything — a thought, a win, a photo moment… Add #hashtags to help others find your post."
            rows={3}
            className="w-full border border-teal-light rounded-[14px] px-4 py-3 text-[0.9rem] outline-none focus:border-teal-mid bg-ivory resize-none transition-colors"
          />

          {/* Detected hashtag preview */}
          {detectedTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-1">
              {detectedTags.map(tag => (
                <span key={tag}
                  className="flex items-center gap-1 bg-teal-ghost text-teal-deep text-[0.75rem] font-semibold px-2.5 py-1 rounded-full border border-teal-light">
                  <span className="text-teal-mid">#</span>{tag}
                </span>
              ))}
              <span className="text-text-xlight text-[0.7rem] self-center ml-1">will be tagged</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <ImageAttach images={images} setImages={setImages} max={4} />
              <span className="text-text-xlight text-[0.7rem]">Tip: type #mindfulness to tag your post</span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button onClick={() => { setOpen(false); setBody(''); setImages([]) }}
                className="text-text-xlight text-[0.8rem] font-semibold px-3 py-2 hover:text-charcoal transition-colors">
                Cancel
              </button>
              <button onClick={submit} disabled={!body.trim() || posting}
                className="bg-teal-deep text-white text-[0.83rem] font-semibold px-5 py-2 rounded-full hover:bg-teal-dark disabled:opacity-50 transition-colors">
                {posting ? 'Posting…' : 'Post →'}
              </button>
            </div>
          </div>

          {/* Suggested hashtags for wellness context */}
          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-teal-light/40">
            <span className="text-text-xlight text-[0.68rem] self-center mr-1">Suggest:</span>
            {['gratitude','mindfulness','anxiety','sleep','affirmation','selfcare','journaling','mentalhealth'].map(s => (
              <button key={s} type="button"
                onClick={() => setBody(b => b + (b.endsWith(' ') || b === '' ? '' : ' ') + `#${s} `)}
                className="text-teal-mid text-[0.72rem] hover:text-teal-deep hover:bg-teal-ghost px-2 py-0.5 rounded-full border border-transparent hover:border-teal-light transition-all">
                #{s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
