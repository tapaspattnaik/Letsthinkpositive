'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'

interface Comment {
  id: number; author: string; body: string; createdAt: string
  user?: { id: number; name: string; avatarUrl?: string } | null
}

// Friendly share copy per platform — each feels native to that platform's tone
function shareText(title: string, url: string, platform: string): string {
  const site = 'letsthinkpositive.com'
  switch (platform) {
    case 'twitter':
      return `✨ "${title}"\n\nThis really resonated with me 💛 Found it on ${site}\n\n${url}\n\n#MentalWellness #PositiveThinking #Mindfulness`
    case 'whatsapp':
      return `Hey 👋 I came across something that might help you too:\n\n*"${title}"*\n\nReally worth a read 🌿\n👉 ${url}\n\n(from letsthinkpositive.com)`
    case 'linkedin':
      return `Just read a really thoughtful piece: "${title}"\n\nIt's a good reminder that small mindset shifts can make a big difference. Sharing in case it's useful for anyone else going through something similar.\n\n${url}\n\n#Wellbeing #MentalHealth #PersonalGrowth`
    case 'telegram':
      return `📖 Read this and thought of you:\n\n"${title}"\n\nIt's worth a few minutes of your time 🌿\n${url}`
    default:
      return `"${title}" — worth a read 💛\n${url}`
  }
}

const SHARE_PLATFORMS = [
  { name: 'X / Twitter', icon: '𝕏', color: 'hover:bg-black hover:text-white',    key: 'twitter',
    url: (title: string, url: string) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText(title, url, 'twitter'))}` },
  { name: 'WhatsApp',    icon: '💬', color: 'hover:bg-[#25D366] hover:text-white', key: 'whatsapp',
    url: (title: string, url: string) => `https://wa.me/?text=${encodeURIComponent(shareText(title, url, 'whatsapp'))}` },
  { name: 'LinkedIn',    icon: 'in', color: 'hover:bg-[#0077B5] hover:text-white', key: 'linkedin',
    url: (title: string, url: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(shareText(title, url, 'linkedin'))}` },
  { name: 'Telegram',    icon: '✈️', color: 'hover:bg-[#26A5E4] hover:text-white', key: 'telegram',
    url: (title: string, url: string) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText(title, url, 'telegram'))}` },
  { name: 'Facebook',    icon: 'f',  color: 'hover:bg-[#1877F2] hover:text-white', key: 'facebook',
    url: (_: string, url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
]

export function BlogInteractions({ slug, title }: { slug: string; title: string }) {
  const { data: session } = useSession()
  const [likes,     setLikes]     = useState(0)
  const [likedByMe, setLikedByMe] = useState(false)
  const [comments,  setComments]  = useState<Comment[]>([])
  const [views,     setViews]     = useState(0)
  const [showForm,  setShowForm]  = useState(false)
  const [body,      setBody]      = useState('')
  const [author,    setAuthor]    = useState('')
  const [posting,   setPosting]   = useState(false)
  const [copied,    setCopied]    = useState(false)
  const [justPosted,setJustPosted]= useState(false)
  const formRef = useRef<HTMLDivElement>(null)

  const siteUrl = typeof window !== 'undefined' ? window.location.href : `https://letsthinkpositive.com/blog/${slug}`

  useEffect(() => {
    // Fetch likes, comments, and track + get view count
    fetch(`/api/blog/${slug}/like`).then(r => r.json()).then(d => { setLikes(d.count); setLikedByMe(d.likedByMe) })
    fetch(`/api/blog/${slug}/comments`).then(r => r.json()).then(setComments)
    // Record this view and get updated count
    fetch(`/api/blog/${slug}/view`, { method: 'POST' }).then(r => r.json()).then(d => setViews(d.views))
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

      {/* Stats bar — views, likes, comments at a glance */}
      <div className="flex items-center gap-5 mb-6 pb-5 border-b border-teal-light/60 flex-wrap">
        <div className="flex items-center gap-1.5 text-text-xlight text-[0.82rem]">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span><strong className="text-charcoal">{views.toLocaleString()}</strong> {views === 1 ? 'read' : 'reads'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-text-xlight text-[0.82rem]">
          <span>❤️</span>
          <span><strong className="text-charcoal">{likes}</strong> {likes === 1 ? 'like' : 'likes'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-text-xlight text-[0.82rem]">
          <span>💬</span>
          <span><strong className="text-charcoal">{comments.length}</strong> {comments.length === 1 ? 'comment' : 'comments'}</span>
        </div>
      </div>

      {/* Action row — Like + Share */}
      <div className="flex flex-wrap items-center gap-4 mb-10">
        {/* Like / Appreciate */}
        <button onClick={toggleLike}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-[0.88rem] font-semibold transition-all hover:scale-105 active:scale-95
            ${likedByMe
              ? 'bg-red-50 border-red-300 text-red-500 shadow-sm'
              : 'border-teal-light text-text-mid hover:border-red-300 hover:text-red-400'}`}>
          <span className={`transition-transform ${likedByMe ? 'scale-110' : ''}`}>{likedByMe ? '❤️' : '🤍'}</span>
          {likedByMe ? 'Appreciated!' : 'Appreciate'} · {likes}
        </button>

        {/* Comment toggle */}
        <button onClick={() => { setShowForm(s => !s); setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100) }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-teal-light text-text-mid text-[0.88rem] font-semibold hover:border-teal-mid hover:text-teal-deep transition-all">
          💬 Leave a comment {comments.length > 0 && `· ${comments.length}`}
        </button>

        {/* Share buttons */}
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          {/* 📤 Native share with image (works on mobile — WhatsApp, Instagram, etc.) */}
          <button
            onClick={async () => {
              try {
                // Build a simple share card as canvas
                const { default: html2canvas } = await import('html2canvas')
                const el = document.createElement('div')
                el.style.cssText = `
                  position:fixed;left:-9999px;top:0;
                  width:600px;padding:48px 40px;
                  background:linear-gradient(135deg,#0F4040,#1A6B6B);
                  border-radius:24px;font-family:system-ui,sans-serif;
                `
                el.innerHTML = `
                  <p style="color:#A8D8D0;font-size:12px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 16px">letsthinkpositive.com</p>
                  <p style="color:#ffffff;font-size:26px;font-weight:700;line-height:1.35;margin:0 0 20px">${title}</p>
                  <p style="color:rgba(255,255,255,0.65);font-size:13px;margin:0">${siteUrl}</p>
                `
                document.body.appendChild(el)
                const canvas = await html2canvas(el, { scale: 2, backgroundColor: null, logging: false })
                document.body.removeChild(el)
                canvas.toBlob(async blob => {
                  if (!blob) return
                  const file = new File([blob], 'post-share.png', { type: 'image/png' })
                  if (navigator.canShare?.({ files: [file] })) {
                    await navigator.share({
                      files: [file],
                      title,
                      text: `"${title}" on letsthinkpositive.com`,
                      url: siteUrl,
                    })
                  } else {
                    // Fallback: open share menu
                    const link = document.createElement('a')
                    link.download = 'post-share.png'
                    link.href = canvas.toDataURL('image/png')
                    link.click()
                  }
                }, 'image/png')
              } catch { /* ignore */ }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-teal-light text-text-mid text-[0.75rem] font-semibold hover:border-teal-mid hover:bg-teal-ghost transition-all"
            title="Share as image (WhatsApp, Instagram, etc.)">
            📤 Share image
          </button>

          <span className="text-[0.78rem] text-text-xlight">or:</span>
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
