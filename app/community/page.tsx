'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'

interface Post {
  id: number; title: string; body: string; author: string
  tags: string; createdAt: string; approved: boolean
  user?: { id: number; name: string; avatarUrl?: string } | null
  _likes?: number
}

const ICONS = ['😊','📓','👣','💛','🎧','✨','🌿','🌸','🌙','⭐']

function PostCard({ post, liked, onLike }: { post: Post; liked: boolean; onLike: () => void }) {
  const tags    = post.tags ? post.tags.split(',').map(t => t.trim()).filter(Boolean) : []
  const icon    = ICONS[post.id % ICONS.length]
  const dateStr = new Date(post.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

  return (
    <div className="bg-white border border-teal-light rounded-[24px] p-7 hover:-translate-y-0.5 hover:shadow-lift transition-all flex flex-col">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-[1.8rem] flex-shrink-0">{icon}</span>
        <h3 className="font-body font-semibold text-[0.97rem] text-charcoal leading-snug">{post.title}</h3>
      </div>
      <p className="text-text-mid text-[0.88rem] leading-[1.75] mb-4 flex-1">{post.body}</p>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tags.map(t => (
            <span key={t} className="text-[0.68rem] text-teal-mid bg-teal-ghost px-2.5 py-0.5 rounded-full">{t}</span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between text-[0.78rem] text-text-xlight border-t border-teal-light/40 pt-4 mt-auto">
        <div className="flex items-center gap-2">
          {post.user?.avatarUrl ? (
            <Image src={post.user.avatarUrl} alt={post.user.name} width={22} height={22} className="rounded-full object-cover" />
          ) : (
            <span className="w-[22px] h-[22px] rounded-full bg-teal-ghost flex items-center justify-center text-[0.6rem]">🌿</span>
          )}
          <span>
            {post.user
              ? <Link href={`/profile/${post.user.id}`} className="hover:text-teal-deep transition-colors no-underline">{post.user.name}</Link>
              : post.author}
          </span>
          <span>· {dateStr}</span>
        </div>
        <button onClick={onLike}
          className={`flex items-center gap-1 transition-colors ${liked ? 'text-red-400' : 'hover:text-red-400'}`}>
          {liked ? '❤️' : '🤍'} {(post._likes ?? 0) + (liked ? 1 : 0)}
        </button>
      </div>
    </div>
  )
}

export default function CommunityPage() {
  const { data: session } = useSession()
  const [posts,     setPosts]     = useState<Post[]>([])
  const [liked,     setLiked]     = useState<Set<number>>(new Set())
  const [showForm,  setShowForm]  = useState(false)
  const [form,      setForm]      = useState({ title: '', body: '', author: '', tags: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting,setSubmitting]= useState(false)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    fetch('/api/community')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          // seed with random like counts for display warmth
          setPosts(data.map((p: Post) => ({ ...p, _likes: Math.floor(Math.random() * 40) + 3 })))
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // If logged in, pre-fill author name
  useEffect(() => {
    if (session?.user?.name) setForm(f => ({ ...f, author: session.user!.name! }))
  }, [session])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res  = await fetch('/api/community', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body:   JSON.stringify(form),
      })
      const data = await res.json()
      if (data.ok) {
        if (data.live) {
          // refresh posts
          const fresh = await fetch('/api/community').then(r => r.json())
          if (Array.isArray(fresh)) setPosts(fresh.map((p: Post) => ({ ...p, _likes: Math.floor(Math.random() * 40) + 3 })))
        }
        setSubmitted(true)
      }
    } catch { /* ignore */ }
    setSubmitting(false)
  }

  const featured = posts[0]
  const rest     = posts.slice(1)

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-deep to-teal-dark py-20 px-[5%] text-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 text-amber-soft text-[0.75rem] font-semibold tracking-[0.18em] uppercase mb-4">
              <span className="w-6 h-0.5 bg-amber rounded" /> Community
            </div>
            <h1 className="font-display text-[clamp(2rem,3.5vw,3rem)] font-bold leading-snug mb-4">
              You are not <em className="italic text-amber-soft">alone in this.</em>
            </h1>
            <p className="text-white/72 text-[1.05rem] leading-[1.8] max-w-[480px]">
              Real people. Real stories. A space to share what&apos;s working, what&apos;s hard, and what&apos;s helping.
            </p>
          </div>
          <div className="flex-shrink-0 w-full md:w-[300px] bg-white/8 border border-white/15 rounded-[24px] p-7">
            <p className="font-display text-[1.1rem] italic text-amber-soft mb-2">Join the Conversation</p>
            <p className="text-white/65 text-[0.88rem] leading-[1.7] mb-5">What&apos;s one thing you&apos;re grateful for today?</p>
            {session ? (
              <button onClick={() => { setShowForm(true); setTimeout(() => document.getElementById('share-form')?.scrollIntoView({ behavior: 'smooth' }), 100) }}
                className="w-full bg-amber text-charcoal py-3 rounded-full font-semibold text-[0.9rem] hover:bg-amber-soft transition-colors">
                Share Your Story →
              </button>
            ) : (
              <div className="space-y-2">
                <Link href="/register" className="block w-full bg-amber text-charcoal py-3 rounded-full font-semibold text-[0.9rem] hover:bg-amber-soft transition-colors text-center no-underline">
                  Join the community →
                </Link>
                <Link href="/login" className="block text-center text-white/60 text-[0.8rem] hover:text-white no-underline">
                  Already a member? Sign in
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto py-14 px-[5%]">

        {/* Guidelines */}
        <div className="mb-10 bg-teal-ghost border border-teal-light rounded-[20px] px-7 py-5">
          <p className="text-[0.78rem] font-bold text-teal-deep uppercase tracking-wider mb-2">Community Guidelines</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {['Be kind and respectful', 'Share only supportive experiences', 'No advertising or self-promotion', 'Protect your privacy'].map((r, i) => (
              <span key={i} className="flex items-center gap-1.5 text-[0.83rem] text-text-mid"><span className="text-teal-mid">✓</span>{r}</span>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="flex gap-1.5">
              {[0,1,2].map(i => <span key={i} className="w-2 h-2 rounded-full bg-teal-mid animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[2rem] mb-3">🌱</p>
            <p className="text-text-mid mb-2">No stories yet — be the first to share!</p>
          </div>
        ) : (
          <>
            {/* Featured */}
            {featured && (
              <div className="mb-12">
                <h2 className="font-display text-[1.1rem] text-charcoal font-semibold mb-5">🌟 Latest Story</h2>
                <div className="bg-gradient-to-br from-teal-ghost to-white border-2 border-teal-light rounded-[24px] p-8">
                  <div className="flex items-start gap-4">
                    <span className="text-[2.5rem] flex-shrink-0">{ICONS[featured.id % ICONS.length]}</span>
                    <div className="flex-1">
                      <h3 className="font-body font-bold text-[1.05rem] text-charcoal mb-2">{featured.title}</h3>
                      <p className="text-text-mid text-[0.95rem] leading-[1.8] mb-4">{featured.body}</p>
                      <div className="flex items-center gap-3 text-[0.8rem] text-text-xlight">
                        {featured.user?.avatarUrl && (
                          <Image src={featured.user.avatarUrl} alt={featured.user.name} width={24} height={24} className="rounded-full object-cover" />
                        )}
                        <span>— {featured.user
                          ? <Link href={`/profile/${featured.user.id}`} className="hover:text-teal-deep no-underline">{featured.user.name}</Link>
                          : featured.author}
                        </span>
                        <span>· {new Date(featured.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Posts grid */}
            {rest.length > 0 && (
              <div className="mb-14">
                <h2 className="font-display text-[1.1rem] text-charcoal font-semibold mb-6">Recent Stories</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {rest.map(post => (
                    <PostCard
                      key={post.id} post={post}
                      liked={liked.has(post.id)}
                      onLike={() => setLiked(s => { const n = new Set(s); n.has(post.id) ? n.delete(post.id) : n.add(post.id); return n })}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Share form */}
        <div id="share-form" className="bg-teal-ghost border border-teal-light rounded-[28px] p-8 md:p-10">
          <h2 className="font-display text-[1.4rem] text-charcoal font-semibold mb-1">Share Your Story</h2>
          <p className="text-text-light text-[0.88rem] mb-6">
            {session ? 'Your story will appear instantly.' : 'Stories from guests are reviewed before publishing.'}
          </p>

          {!session && (
            <div className="bg-white border border-teal-light rounded-[16px] px-5 py-4 mb-6 flex items-center gap-3">
              <span className="text-[1.4rem]">💡</span>
              <p className="text-[0.85rem] text-text-mid">
                <Link href="/register" className="text-teal-mid font-semibold no-underline hover:text-teal-deep">Create a free account</Link> to post instantly and earn the <strong>Story Sharer</strong> badge.
              </p>
            </div>
          )}

          {submitted ? (
            <div className="bg-white border border-teal-light rounded-[20px] p-8 text-center">
              <div className="text-[3rem] mb-3">🌱</div>
              <h3 className="font-display text-[1.2rem] text-teal-deep font-semibold mb-2">
                {session ? 'Your story is live! 🎉' : 'Thank you for sharing!'}
              </h3>
              <p className="text-text-mid text-[0.9rem]">
                {session ? 'Scroll up to see it in the community.' : 'Your story will appear here once approved.'}
              </p>
              <button onClick={() => { setSubmitted(false); setForm({ title: '', body: '', author: '', tags: '' }) }}
                className="mt-4 text-teal-mid text-[0.85rem] font-semibold hover:text-teal-deep transition-colors">
                Share another story
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[0.82rem] font-semibold text-text-mid mb-1.5">Title / Headline *</label>
                <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Something small that helped me today..."
                  className="w-full px-4 py-3 bg-white border border-teal-light rounded-[14px] text-[0.9rem] outline-none focus:border-teal-mid transition-colors" />
              </div>
              <div>
                <label className="block text-[0.82rem] font-semibold text-text-mid mb-1.5">Your story *</label>
                <textarea required rows={4} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                  placeholder="Share what happened, how you felt, and what helped..."
                  className="w-full px-4 py-3 bg-white border border-teal-light rounded-[14px] text-[0.9rem] outline-none focus:border-teal-mid transition-colors resize-none" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {!session && (
                  <div>
                    <label className="block text-[0.82rem] font-semibold text-text-mid mb-1.5">Your name (or Anonymous)</label>
                    <input value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                      placeholder="First name or nickname"
                      className="w-full px-4 py-3 bg-white border border-teal-light rounded-[14px] text-[0.9rem] outline-none focus:border-teal-mid transition-colors" />
                  </div>
                )}
                <div>
                  <label className="block text-[0.82rem] font-semibold text-text-mid mb-1.5">Tags (optional)</label>
                  <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                    placeholder="#gratitude #mindfulness"
                    className="w-full px-4 py-3 bg-white border border-teal-light rounded-[14px] text-[0.9rem] outline-none focus:border-teal-mid transition-colors" />
                </div>
              </div>
              <button type="submit" disabled={submitting}
                className="bg-teal-deep text-white px-8 py-3.5 rounded-full font-semibold text-[0.95rem] hover:bg-teal-dark transition-colors disabled:opacity-60">
                {submitting ? 'Submitting…' : 'Share your story →'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  )
}
