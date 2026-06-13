'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

// ── Community post comments + AI kind-reply suggestions ─────────────────────
// The hardest part of community isn't posting — it's getting the first reply.
// Three one-tap suggested responses lower that barrier to a single click.

interface Comment {
  id: number
  body: string
  createdAt: string
  user: { id: number; name: string; avatarUrl?: string | null }
}

export function CommunityComments({
  postId, postTitle, postBody, count, onCountChange,
}: {
  postId: number
  postTitle: string
  postBody: string
  count: number
  onCountChange?: (n: number) => void
}) {
  const { data: session } = useSession()
  const [open,        setOpen]        = useState(false)
  const [comments,    setComments]    = useState<Comment[]>([])
  const [loaded,      setLoaded]      = useState(false)
  const [text,        setText]        = useState('')
  const [sending,     setSending]     = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])

  async function toggle() {
    const next = !open
    setOpen(next)
    if (next && !loaded) {
      // Load comments + AI suggestions in parallel, lazily
      fetch(`/api/community/${postId}/comments`)
        .then(r => r.json())
        .then(d => { if (Array.isArray(d)) setComments(d) })
        .catch(() => {})
        .finally(() => setLoaded(true))
      if (session) {
        fetch('/api/ai-kind-replies', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: postTitle, body: postBody }),
        })
          .then(r => r.json())
          .then(d => { if (Array.isArray(d.replies)) setSuggestions(d.replies) })
          .catch(() => {})
      }
    }
  }

  async function send(replyText: string) {
    const body = replyText.trim()
    if (!body || sending) return
    setSending(true)
    try {
      const res = await fetch(`/api/community/${postId}/comments`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      })
      const data = await res.json()
      if (res.ok && data.id) {
        setComments(c => [...c, data])
        setText('')
        onCountChange?.(comments.length + 1)
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <button onClick={toggle}
        aria-expanded={open}
        className="flex items-center gap-1 text-[0.78rem] transition-colors hover:text-teal-deep min-h-[44px]">
        💬 {loaded ? comments.length : count}
      </button>

      {open && (
        <div className="mt-1 space-y-2.5 border-t border-teal-light/40 pt-3">
          {/* Comments */}
          {!loaded ? (
            <p className="text-text-xlight text-[0.75rem]">Loading replies…</p>
          ) : comments.length === 0 ? (
            <p className="text-text-xlight text-[0.75rem]">No replies yet — be the first kind voice. 💛</p>
          ) : (
            comments.map(c => (
              <div key={c.id} className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-teal-ghost flex items-center justify-center flex-shrink-0 overflow-hidden mt-0.5">
                  {c.user.avatarUrl
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={c.user.avatarUrl} alt={c.user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    : <span className="text-[0.6rem]">🌿</span>}
                </div>
                <div className="flex-1 bg-teal-ghost/60 rounded-[10px] px-3 py-1.5 min-w-0">
                  <Link href={`/profile/${c.user.id}`} className="font-semibold text-[0.72rem] text-charcoal no-underline hover:text-teal-deep mr-1.5">
                    {c.user.name}
                  </Link>
                  <span className="text-[0.78rem] text-text-mid break-words">{c.body}</span>
                </div>
              </div>
            ))
          )}

          {/* Composer */}
          {session ? (
            <>
              {/* AI kind-reply chips — one tap to send */}
              {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((s, i) => (
                    <button key={i} onClick={() => send(s)} disabled={sending}
                      className="text-[0.72rem] text-teal-deep bg-teal-ghost border border-teal-light hover:border-teal-mid hover:bg-teal-light/30 px-3 py-1.5 rounded-full transition-all disabled:opacity-50 text-left">
                      ✨ {s}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); send(text) } }}
                  placeholder="Write a kind reply…"
                  className="flex-1 border border-teal-light rounded-full px-3.5 py-1.5 text-[0.8rem] outline-none focus:border-teal-mid bg-ivory min-w-0"
                />
                <button onClick={() => send(text)} disabled={!text.trim() || sending}
                  className="bg-teal-deep text-white px-3.5 py-1.5 rounded-full text-[0.75rem] font-semibold hover:bg-teal-dark disabled:opacity-50 transition-colors flex-shrink-0">
                  {sending ? '…' : 'Send'}
                </button>
              </div>
            </>
          ) : (
            <p className="text-[0.75rem] text-text-xlight">
              <Link href="/login" className="text-teal-mid font-semibold no-underline hover:text-teal-deep">Sign in</Link> to reply.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
