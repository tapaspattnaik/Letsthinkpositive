'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { ReportButton } from '@/components/ReportButton'

interface Post {
  id: number
  title: string
  body: string
  author: string
  tags: string
  createdAt: string
  approved: boolean
  postType?: string
  user?: { id: number; name: string; avatarUrl?: string } | null
  likeCount?: number
  likedByMe?: boolean
  reactionCounts?: Record<string, number>
  myReactions?: string[]
}

const WISH_REACTIONS = ['🙏', '❤️', '💪', '✨', '😊']
const STORY_ICONS    = ['😊','📓','👣','💛','🎧','✨','🌿','🌸','🌙','⭐']

// ─── Story Card ───────────────────────────────────────────────────────────────
function StoryCard({
  post, onLike,
}: {
  post: Post; onLike: () => void
}) {
  const tags    = post.tags ? post.tags.split(',').map(t => t.trim()).filter(Boolean) : []
  const icon    = STORY_ICONS[post.id % STORY_ICONS.length]
  const dateStr = new Date(post.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

  return (
    <div className="bg-white border border-teal-light rounded-[24px] p-6 hover:-translate-y-0.5 hover:shadow-lift transition-all flex flex-col">
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
        <div className="flex items-center gap-3">
          <button onClick={onLike}
            aria-pressed={post.likedByMe ?? false}
            aria-label={`${post.likedByMe ? 'Unlike' : 'Like'} this story. ${post.likeCount ?? 0} likes`}
            className={`flex items-center gap-1 transition-colors min-w-[44px] min-h-[44px] justify-center ${post.likedByMe ? 'text-red-400' : 'hover:text-red-400'}`}>
            {post.likedByMe ? '❤️' : '🤍'} {post.likeCount ?? 0}
          </button>
          <ReportButton postType="community" postId={post.id} compact />
        </div>
      </div>
    </div>
  )
}

// ─── Wish Card ────────────────────────────────────────────────────────────────
function WishCard({
  post, onReact,
}: {
  post: Post; onReact: (emoji: string) => void
}) {
  const dateStr = new Date(post.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  const myReactions = post.myReactions ?? []
  const counts      = post.reactionCounts ?? {}

  return (
    <div className="bg-white border border-amber/30 rounded-[24px] p-6 hover:-translate-y-0.5 hover:shadow-lift transition-all flex flex-col">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-[1.8rem] flex-shrink-0">🙏</span>
        <h3 className="font-body font-semibold text-[0.97rem] text-charcoal leading-snug">{post.title}</h3>
      </div>
      <p className="text-text-mid text-[0.88rem] leading-[1.75] mb-5 flex-1">{post.body}</p>

      {/* Reaction bar */}
      <div className="flex flex-wrap gap-2 mb-4">
        {WISH_REACTIONS.map(emoji => {
          const count   = counts[emoji] ?? 0
          const reacted = myReactions.includes(emoji)
          return (
            <button
              key={emoji}
              onClick={() => onReact(emoji)}
              aria-pressed={reacted}
              aria-label={`React with ${emoji}. ${count} reactions`}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[0.82rem] font-medium border transition-all min-h-[36px]
                ${reacted
                  ? 'bg-amber/20 border-amber/60 text-charcoal scale-105'
                  : 'bg-teal-ghost border-teal-light text-text-mid hover:bg-amber/10 hover:border-amber/40'
                }`}
            >
              {emoji} {count > 0 && <span className="text-[0.75rem]">{count}</span>}
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-between text-[0.78rem] text-text-xlight border-t border-teal-light/40 pt-4 mt-auto">
        <div className="flex items-center gap-2">
          {post.user?.avatarUrl ? (
            <Image src={post.user.avatarUrl} alt={post.user.name} width={22} height={22} className="rounded-full object-cover" />
          ) : (
            <span className="w-[22px] h-[22px] rounded-full bg-amber/20 flex items-center justify-center text-[0.6rem]">🙏</span>
          )}
          <span>
            {post.user
              ? <Link href={`/profile/${post.user.id}`} className="hover:text-teal-deep transition-colors no-underline">{post.user.name}</Link>
              : post.author}
          </span>
          <span>· {dateStr}</span>
        </div>
        <ReportButton postType="community" postId={post.id} compact />
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CommunityPage() {
  const { data: session } = useSession()

  const [activeTab, setActiveTab]   = useState<'story' | 'wish'>('story')
  const [stories,   setStories]     = useState<Post[]>([])
  const [wishes,    setWishes]      = useState<Post[]>([])
  const [loading,   setLoading]     = useState(true)

  const [form,      setForm]        = useState({ title: '', body: '', author: '', tags: '' })
  const [submitted, setSubmitted]   = useState(false)
  const [submitting,setSubmitting]  = useState(false)
  const [formType,  setFormType]    = useState<'story' | 'wish'>('story')
  const [showForm,  setShowForm]    = useState(false)

  // Fetch both types
  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [sRes, wRes] = await Promise.all([
          fetch('/api/community?type=story'),
          fetch('/api/community?type=wish'),
        ])
        const [sData, wData] = await Promise.all([sRes.json(), wRes.json()])
        if (Array.isArray(sData)) setStories(sData)
        if (Array.isArray(wData)) setWishes(wData)
      } catch { /* ignore */ }
      setLoading(false)
    }
    load()
  }, [])

  // Pre-fill author name from session
  useEffect(() => {
    if (session?.user?.name) setForm(f => ({ ...f, author: session.user!.name! }))
  }, [session])

  async function handleLike(postId: number) {
    if (!session) return
    const res  = await fetch(`/api/community/${postId}/like`, { method: 'POST' })
    const data = await res.json()
    if (!res.ok) return
    setStories(prev => prev.map(p =>
      p.id === postId
        ? { ...p, likedByMe: data.liked, likeCount: data.count }
        : p
    ))
  }

  async function handleReact(postId: number, emoji: string) {
    if (!session) return
    const res  = await fetch(`/api/community/${postId}/react`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji }),
    })
    const data = await res.json()
    if (!res.ok) return
    setWishes(prev => prev.map(p =>
      p.id === postId
        ? { ...p, reactionCounts: data.counts, myReactions: data.myReactions }
        : p
    ))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res  = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...form, postType: formType }),
      })
      const data = await res.json()
      if (data.ok) {
        if (data.live) {
          const [sRes, wRes] = await Promise.all([
            fetch('/api/community?type=story'),
            fetch('/api/community?type=wish'),
          ])
          const [sData, wData] = await Promise.all([sRes.json(), wRes.json()])
          if (Array.isArray(sData)) setStories(sData)
          if (Array.isArray(wData)) setWishes(wData)
        }
        setSubmitted(true)
      }
    } catch { /* ignore */ }
    setSubmitting(false)
  }

  function openForm(type: 'story' | 'wish') {
    setFormType(type)
    setActiveTab(type)
    setShowForm(true)
    setTimeout(() => document.getElementById('share-form')?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  const currentPosts = activeTab === 'story' ? stories : wishes

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
            <div className="flex gap-3 mt-6">
              <button onClick={() => openForm('story')}
                className="bg-amber text-charcoal px-6 py-3 rounded-full font-semibold text-[0.9rem] hover:bg-amber-soft transition-colors">
                Share a Story
              </button>
              <button onClick={() => openForm('wish')}
                className="bg-white/15 text-white border border-white/30 px-6 py-3 rounded-full font-semibold text-[0.9rem] hover:bg-white/25 transition-colors">
                🙏 Post a Wish
              </button>
            </div>
          </div>
          <div className="flex-shrink-0 w-full md:w-[280px] bg-white/8 border border-white/15 rounded-[24px] p-6 space-y-3">
            <p className="font-display text-[1rem] italic text-amber-soft">Today&apos;s reflection</p>
            <p className="text-white/65 text-[0.88rem] leading-[1.7]">
              What&apos;s one thing you&apos;re grateful for today? Share it — gratitude is contagious. 💛
            </p>
            {!session && (
              <div className="space-y-2 pt-1">
                <Link href="/register"
                  className="block w-full bg-amber text-charcoal py-2.5 rounded-full font-semibold text-[0.88rem] hover:bg-amber-soft transition-colors text-center no-underline">
                  Join the community →
                </Link>
                <Link href="/login"
                  className="block text-center text-white/60 text-[0.78rem] hover:text-white no-underline">
                  Already a member? Sign in
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto py-12 px-[5%]">

        {/* Guidelines */}
        <div className="mb-8 bg-teal-ghost border border-teal-light rounded-[20px] px-6 py-4">
          <p className="text-[0.78rem] font-bold text-teal-deep uppercase tracking-wider mb-2">Community Guidelines</p>
          <div className="flex flex-wrap gap-x-6 gap-y-1.5">
            {['Be kind and respectful', 'Share only supportive content', 'No advertising or self-promotion', 'Protect your privacy'].map((r, i) => (
              <span key={i} className="flex items-center gap-1.5 text-[0.82rem] text-text-mid">
                <span className="text-teal-mid">✓</span>{r}
              </span>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div role="tablist" aria-label="Community posts" className="flex gap-2 mb-8">
          <button
            role="tab"
            aria-selected={activeTab === 'story'}
            aria-controls="community-tabpanel"
            id="tab-story"
            onClick={() => setActiveTab('story')}
            className={`px-5 py-2.5 rounded-full font-semibold text-[0.88rem] transition-all border ${
              activeTab === 'story'
                ? 'bg-teal-deep text-white border-teal-deep shadow-sm'
                : 'bg-white text-text-mid border-teal-light hover:border-teal-mid'
            }`}>
            💛 Stories &amp; Posts {stories.length > 0 && <span className="ml-1 opacity-70">({stories.length})</span>}
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'wish'}
            aria-controls="community-tabpanel"
            id="tab-wish"
            onClick={() => setActiveTab('wish')}
            className={`px-5 py-2.5 rounded-full font-semibold text-[0.88rem] transition-all border ${
              activeTab === 'wish'
                ? 'bg-amber text-charcoal border-amber shadow-sm'
                : 'bg-white text-text-mid border-teal-light hover:border-amber/60'
            }`}>
            🙏 Wishes &amp; Prayers {wishes.length > 0 && <span className="ml-1 opacity-70">({wishes.length})</span>}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="flex gap-1.5">
              {[0,1,2].map(i => (
                <span key={i} className="w-2 h-2 rounded-full bg-teal-mid animate-bounce" style={{ animationDelay: `${i*150}ms` }} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-10 items-start">

            {/* ── Posts column ─────────────────────────────────────── */}
            <div id="community-tabpanel" role="tabpanel" aria-labelledby={activeTab === 'story' ? 'tab-story' : 'tab-wish'} className="flex-1 min-w-0">
              {currentPosts.length === 0 ? (
                <div className="text-center py-16 bg-white border border-teal-light rounded-[24px]">
                  <p className="text-[2.5rem] mb-3">{activeTab === 'wish' ? '🙏' : '🌱'}</p>
                  <p className="text-text-mid text-[0.95rem] mb-4">
                    {activeTab === 'wish' ? 'No wishes yet — be the first to share one!' : 'No stories yet — be the first to share!'}
                  </p>
                  <button onClick={() => openForm(activeTab)}
                    className="bg-teal-deep text-white px-6 py-2.5 rounded-full font-semibold text-[0.88rem] hover:bg-teal-dark transition-colors">
                    {activeTab === 'wish' ? '🙏 Post a Wish' : '✍️ Share a Story'}
                  </button>
                </div>
              ) : activeTab === 'story' ? (
                <>
                  {/* Featured story */}
                  {stories[0] && (
                    <div className="mb-8 bg-gradient-to-br from-teal-ghost to-white border-2 border-teal-light rounded-[24px] p-7">
                      <div className="text-[0.72rem] font-bold text-teal-mid uppercase tracking-widest mb-4">🌟 Latest Story</div>
                      <div className="flex items-start gap-4">
                        <span className="text-[2.5rem] flex-shrink-0">{STORY_ICONS[stories[0].id % STORY_ICONS.length]}</span>
                        <div className="flex-1">
                          <h3 className="font-body font-bold text-[1.05rem] text-charcoal mb-2">{stories[0].title}</h3>
                          <p className="text-text-mid text-[0.93rem] leading-[1.8] mb-4">{stories[0].body}</p>
                          <div className="flex items-center gap-3 text-[0.8rem] text-text-xlight">
                            {stories[0].user?.avatarUrl && (
                              <Image src={stories[0].user.avatarUrl} alt={stories[0].user.name} width={24} height={24} className="rounded-full object-cover" />
                            )}
                            <span>— {stories[0].user
                              ? <Link href={`/profile/${stories[0].user.id}`} className="hover:text-teal-deep no-underline">{stories[0].user.name}</Link>
                              : stories[0].author}
                            </span>
                            <span>· {new Date(stories[0].createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                            <button
                              onClick={() => handleLike(stories[0].id)}
                              className={`flex items-center gap-1 ml-auto transition-colors ${stories[0].likedByMe ? 'text-red-400' : 'hover:text-red-400'}`}>
                              {stories[0].likedByMe ? '❤️' : '🤍'} {stories[0].likeCount ?? 0}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Remaining stories */}
                  {stories.length > 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {stories.slice(1).map(post => (
                        <StoryCard
                          key={post.id}
                          post={post}
                          onLike={() => handleLike(post.id)}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                /* Wishes grid */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {wishes.map(post => (
                    <WishCard
                      key={post.id}
                      post={post}
                      onReact={(emoji) => handleReact(post.id, emoji)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ── Sidebar ──────────────────────────────────────────── */}
            <div className="w-full lg:w-[320px] flex-shrink-0 space-y-5 sticky top-24" id="share-form">

              {/* Post type picker */}
              <div className="bg-white border border-teal-light rounded-[24px] p-6">
                <h2 className="font-display text-[1.1rem] text-charcoal font-semibold mb-1">Share with the community</h2>
                <p className="text-text-xlight text-[0.82rem] mb-4">Choose what you&apos;d like to share</p>
                <div role="group" aria-label="Post type" className="grid grid-cols-2 gap-2 mb-5">
                  {(['story', 'wish'] as const).map(t => (
                    <button key={t} onClick={() => setFormType(t)}
                      aria-pressed={formType === t}
                      className={`py-2.5 rounded-[12px] text-[0.83rem] font-semibold border transition-all ${
                        formType === t
                          ? t === 'story' ? 'bg-teal-deep text-white border-teal-deep' : 'bg-amber/20 text-charcoal border-amber/60'
                          : 'bg-teal-ghost text-text-mid border-teal-light hover:border-teal-mid'
                      }`}>
                      {t === 'story' ? '💛 Story' : '🙏 Wish / Prayer'}
                    </button>
                  ))}
                </div>

                {!session ? (
                  <div className="text-center space-y-3 py-2">
                    <p className="text-[0.82rem] text-text-mid leading-[1.6]">
                      {formType === 'wish'
                        ? 'Sign in to post a wish and receive reactions from the community.'
                        : 'Sign in to post instantly and earn the Story Sharer badge.'}
                    </p>
                    <Link href="/register"
                      className="block w-full bg-teal-deep text-white py-3 rounded-full font-semibold text-[0.88rem] text-center no-underline hover:bg-teal-dark transition-colors">
                      Create free account →
                    </Link>
                    <Link href="/login"
                      className="block text-center text-teal-mid text-[0.8rem] font-semibold hover:text-teal-deep no-underline transition-colors">
                      Sign in
                    </Link>
                  </div>
                ) : submitted ? (
                  <div className="text-center py-4">
                    <div className="text-[2.5rem] mb-3">{formType === 'wish' ? '🙏' : '🌱'}</div>
                    <h3 className="font-display text-[1rem] text-teal-deep font-semibold mb-1">
                      {formType === 'wish' ? 'Wish posted!' : 'Story shared!'}
                    </h3>
                    <p className="text-text-mid text-[0.82rem] mb-4">
                      {formType === 'wish' ? 'The community can now react to your post.' : 'Your story is live in the community.'}
                    </p>
                    <button onClick={() => { setSubmitted(false); setForm(f => ({ ...f, title: '', body: '', tags: '' })) }}
                      className="text-teal-mid text-[0.82rem] font-semibold hover:text-teal-deep transition-colors">
                      Share another →
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                      <label htmlFor="post-title" className="block text-[0.78rem] font-semibold text-text-mid mb-1.5">
                        {formType === 'wish' ? 'Your wish or prayer *' : 'Title / Headline *'}
                      </label>
                      <input id="post-title" required value={form.title}
                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                        placeholder={formType === 'wish' ? 'e.g. Praying for strength today…' : 'e.g. Something small that helped me…'}
                        className="w-full px-3.5 py-2.5 bg-teal-ghost border border-teal-light rounded-[12px] text-[0.88rem] outline-none focus:border-teal-mid transition-colors" />
                    </div>
                    <div>
                      <label htmlFor="post-body" className="block text-[0.78rem] font-semibold text-text-mid mb-1.5">
                        {formType === 'wish' ? 'Share more (optional)' : 'Your story *'}
                      </label>
                      <textarea
                        id="post-body"
                        required={formType === 'story'}
                        rows={4}
                        value={form.body}
                        onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                        placeholder={formType === 'wish' ? 'Add context or details if you wish…' : 'Share what happened, how you felt, and what helped…'}
                        className="w-full px-3.5 py-2.5 bg-teal-ghost border border-teal-light rounded-[12px] text-[0.88rem] outline-none focus:border-teal-mid transition-colors resize-none" />
                    </div>
                    {formType === 'story' && (
                      <div>
                        <label htmlFor="post-tags" className="block text-[0.78rem] font-semibold text-text-mid mb-1.5">Tags (optional)</label>
                        <input id="post-tags" value={form.tags}
                          onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                          placeholder="#gratitude #mindfulness"
                          className="w-full px-3.5 py-2.5 bg-teal-ghost border border-teal-light rounded-[12px] text-[0.88rem] outline-none focus:border-teal-mid transition-colors" />
                      </div>
                    )}
                    <button type="submit" disabled={submitting}
                      className={`w-full py-3 rounded-full font-semibold text-[0.9rem] transition-colors disabled:opacity-60 ${
                        formType === 'wish'
                          ? 'bg-amber text-charcoal hover:bg-amber-soft'
                          : 'bg-teal-deep text-white hover:bg-teal-dark'
                      }`}>
                      {submitting ? 'Posting…' : formType === 'wish' ? '🙏 Post Wish' : '✍️ Share Story'}
                    </button>
                  </form>
                )}
              </div>

              {/* Tip card */}
              <div className="bg-amber/8 border border-amber/25 rounded-[20px] p-5">
                <p className="text-[0.75rem] font-bold text-amber uppercase tracking-wider mb-2">Community tip</p>
                <p className="text-text-mid text-[0.83rem] leading-[1.7]">
                  {activeTab === 'wish'
                    ? 'A kind reaction takes one second but can make someone\'s whole day. Don\'t hold back 🙏'
                    : 'Stories of struggle and growth are equally welcome here. Your honesty helps others feel less alone. 💛'}
                </p>
              </div>

              {/* Circles CTA */}
              <div className="bg-teal-ghost border border-teal-light rounded-[20px] p-5">
                <p className="font-semibold text-charcoal text-[0.9rem] mb-1.5">Join a Circle</p>
                <p className="text-text-mid text-[0.82rem] leading-[1.6] mb-3">
                  Circles are small groups around specific wellness topics. Find your people.
                </p>
                <Link href="/circles"
                  className="block text-center text-teal-deep text-[0.83rem] font-semibold hover:text-teal-dark no-underline transition-colors">
                  Explore Circles →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Floating Action Button (mobile) ─────────────────────────────── */}
      {session && (
        <button
          onClick={() => openForm('story')}
          aria-label="Share a story"
          className="fixed bottom-[76px] right-5 z-40 sm:hidden w-14 h-14 bg-teal-deep text-white rounded-full shadow-lift flex items-center justify-center hover:bg-teal-dark hover:scale-105 active:scale-95 transition-all">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      )}
    </>
  )
}
