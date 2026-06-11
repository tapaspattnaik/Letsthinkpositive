'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { ImageAttach } from '@/components/PostContent'

// ── "What's on your mind?" wall composer ────────────────────────────────────
// Facebook-style instant composer — no title needed, photos + links supported.
// Posts go live on the community wall immediately for signed-in users.

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

  async function submit() {
    if (!body.trim() || posting) return
    setPosting(true)
    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body, images, postType: 'story' }),
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
            placeholder="Write anything — a thought, a win, a photo moment, a link worth sharing…"
            rows={3}
            className="w-full border border-teal-light rounded-[14px] px-4 py-3 text-[0.9rem] outline-none focus:border-teal-mid bg-ivory resize-none transition-colors"
          />
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <ImageAttach images={images} setImages={setImages} max={4} />
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
          <p className="text-[0.68rem] text-text-xlight">Posts appear on the community wall. Links become clickable automatically.</p>
        </div>
      )}
    </div>
  )
}
