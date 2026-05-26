'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'

interface Comment {
  id: number; author: string; body: string; createdAt: string
  user?: { id: number; name: string; avatarUrl?: string } | null
}

const SHARE_PLATFORMS = [
  { name: 'X / Twitter', icon: '𝕏', color: 'hover:bg-black hover:text-white',
    url: (title: string, url: string) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}` },
  { name: 'WhatsApp',    icon: '💬', color: 'hover:bg-[#25D366] hover:text-white',
    url: (title: string, url: string) => `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}` },
  { name: 'LinkedIn',    icon: 'in', color: 'hover:bg-[#0077B5] hover:text-white',
    url: (_: string, url: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
  { name: 'Facebook',    icon: 'f',  color: 'hover:bg-[#1877F2] hover:text-white',
    url: (_: string, url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
]

export function BlogInteractions({ slug, title }: { slug: string; title: string }) {
  const { data: session } = useSession()
  const [likes,     setLikes]     = useState(0)
  const [likedByMe, setLikedByMe] = useState(false)
  const [comments,  setComments]  = useState<Comment[]>([])
  const [showForm,  setShowForm]  = useState(false)
  const [body,      setBody]      = useState('')
  const [author,    setAuthor]    = useState('')
  const [posting,   setPosting]   = useState(false)
  const [copied,    setCopied]    = useState(false)
  const [justPosted,setJustPosted]= useState(false)
  const formRef = useRef<HTMLDivElement>(null)

  const siteUrl = typeof window !== 'undefined' ? window.location.href : `https://letsthinkpositive.com/blog/${slug}`

  useEffect(() => {
    fetch(`/api/blog/${slug}/like`).then(r => r.json()).then(d => { setLikes(d.count); setLikedByMe(d.likedByMe) })
    fetch(`/api/blog/${slug}/comments`).then(r => r.json()).then(setComments)
  }, [slug])

  async function toggleLike() {
    const res  = await fetch(`/api/blog/${slug}/like`, { method: 'POST' })
    const data = await res.json()
    setLikes(data.count)
    setLikedByMe(data.liked)
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault()
    setPosting(true)
    const res  = await fetch(`/api/blog/${slug}/comments`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body:   JSON.stringify({ body, author }),
    })
    const data = await res.json()
    if (data.live) setComments(c => [...c, data.comment])
    setBody(''); setAuthor(''); setPosting(false)
    setJustPosted(true); setShowForm(false)
    setTimeout(() => setJustPosted(false), 4000)
  }

  function copyLink() {
    navigator.clipboard.writeText(siteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mt-12 border-t border-teal-light pt-10">

      {/* Like + Share row */}
      <div className="flex flex-wrap items-center gap-4 mb-10">
        {/* Like */}
        <button onClick={toggleLike}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-[0.88rem] font-semibold transition-all
            ${likedByMe ? 'bg-red-50 border-red-300 text-red-500' : 'border-teal-light text-text-mid hover:border-red-300 hover:text-red-400'}`}>
          {likedByMe ? '❤️' : '🤍'} {likes} {likes === 1 ? 'like' : 'likes'}
        </button>

        {/* Comment toggle */}
        <button onClick={() => { setShowForm(s => !s); setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100) }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-teal-light text-text-mid text-[0.88rem] font-semibold hover:border-teal-mid hover:text-teal-deep transition-all">
          💬 {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </button>

        {/* Share buttons */}
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <span className="text-[0.78rem] text-text-xlight mr-1">Share:</span>
          {SHARE_PLATFORMS.map(p => (
            <a key={p.name} href={p.url(title, siteUrl)} target="_blank" rel="noopener noreferrer"
              className={`w-8 h-8 rounded-full border border-teal-light flex items-center justify-center text-[0.75rem] font-bold text-text-mid transition-all ${p.color}`}
              title={p.name}>
              {p.icon}
            </a>
          ))}
          <button onClick={copyLink}
            className={`w-8 h-8 rounded-full border flex items-center justify-center text-[0.75rem] transition-all
              ${copied ? 'border-teal-mid bg-teal-ghost text-teal-deep' : 'border-teal-light text-text-mid hover:border-teal-mid'}`}
            title="Copy link">
            {copied ? '✓' : '🔗'}
          </button>
        </div>
      </div>

      {/* Comments list */}
      {comments.length > 0 && (
        <div className="space-y-4 mb-8">
          <h3 className="font-display text-[1.1rem] font-semibold text-charcoal mb-4">
            {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
          </h3>
          {comments.map(c => (
            <div key={c.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-teal-ghost flex items-center justify-center flex-shrink-0 overflow-hidden mt-0.5">
                {c.user?.avatarUrl
                  ? <Image src={c.user.avatarUrl} alt={c.author} width={32} height={32} className="object-cover" />
                  : <span className="text-[0.8rem]">🌿</span>}
              </div>
              <div className="flex-1 bg-teal-ghost rounded-[16px] px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-[0.85rem] text-charcoal">{c.user?.name ?? c.author}</span>
                  <span className="text-[0.72rem] text-text-xlight">
                    {new Date(c.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <p className="text-[0.88rem] text-text-mid leading-[1.7]">{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {justPosted && (
        <div className="bg-teal-ghost border border-teal-light rounded-[16px] px-5 py-3 mb-6 text-[0.88rem] text-teal-deep font-semibold">
          {session ? '✓ Your comment is live!' : '✓ Comment submitted — it will appear after review.'}
        </div>
      )}

      {/* Comment form */}
      <div ref={formRef}>
        {showForm && (
          <div className="bg-white border border-teal-light rounded-[24px] p-7">
            <h3 className="font-display text-[1.1rem] font-semibold text-charcoal mb-4">Leave a comment</h3>
            {!session && (
              <p className="text-[0.82rem] text-text-xlight mb-4">
                <Link href="/login" className="text-teal-mid font-semibold no-underline hover:text-teal-deep">Sign in</Link> for instant publishing · or post as a guest (needs review)
              </p>
            )}
            <form onSubmit={submitComment} className="space-y-3">
              {!session && (
                <input value={author} onChange={e => setAuthor(e.target.value)}
                  placeholder="Your name (optional)"
                  className="w-full border border-teal-light rounded-[12px] px-4 py-2.5 text-[0.9rem] outline-none focus:border-teal-mid bg-ivory" />
              )}
              <textarea required rows={3} value={body} onChange={e => setBody(e.target.value)}
                placeholder="Share your thoughts…"
                className="w-full border border-teal-light rounded-[12px] px-4 py-2.5 text-[0.9rem] outline-none focus:border-teal-mid bg-ivory resize-none" />
              <div className="flex gap-3">
                <button type="submit" disabled={posting}
                  className="bg-teal-deep text-white px-6 py-2.5 rounded-full text-[0.88rem] font-semibold hover:bg-teal-dark disabled:opacity-60 transition-colors">
                  {posting ? 'Posting…' : 'Post comment'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="border border-teal-light text-text-mid px-5 py-2.5 rounded-full text-[0.88rem] hover:bg-teal-ghost transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="text-[0.88rem] text-teal-mid font-semibold hover:text-teal-deep transition-colors">
            + Add a comment
          </button>
        )}
      </div>
    </div>
  )
}
