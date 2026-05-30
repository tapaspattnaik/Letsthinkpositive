'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'

interface GalleryPost {
  id: number
  title: string
  description: string | null
  imageUrl: string
  category: string
  createdAt: string
  user: { id: number; name: string; avatarUrl: string | null }
  heartCount: number
  heartedByMe: boolean
}

const CATEGORIES = [
  { id: 'all',        label: 'All',               icon: '🌟' },
  { id: 'volunteer',  label: 'Voluntary Work',     icon: '🤝' },
  { id: 'wellness',   label: 'Wellness Activity',  icon: '🌿' },
  { id: 'kindness',   label: 'Random Kindness',    icon: '💛' },
  { id: 'achievement',label: 'Achievement',         icon: '🏆' },
  { id: 'community',  label: 'Community Event',    icon: '🎉' },
  { id: 'nature',     label: 'Nature & Outdoors',  icon: '🌲' },
  { id: 'activity',   label: 'Other Activity',     icon: '✨' },
]

const CATEGORY_COLORS: Record<string, string> = {
  volunteer:   'bg-teal-ghost text-teal-deep border-teal-light',
  wellness:    'bg-green-50 text-green-700 border-green-200',
  kindness:    'bg-amber/15 text-amber border-amber/30',
  achievement: 'bg-purple-50 text-purple-700 border-purple-200',
  community:   'bg-pink-50 text-pink-600 border-pink-200',
  nature:      'bg-emerald-50 text-emerald-700 border-emerald-200',
  activity:    'bg-blue-50 text-blue-600 border-blue-200',
}

export default function GalleryPage() {
  const { data: session } = useSession()
  const [posts,      setPosts]      = useState<GalleryPost[]>([])
  const [loading,    setLoading]    = useState(true)
  const [filter,     setFilter]     = useState('all')
  const [showUpload, setShowUpload] = useState(false)
  const [selected,   setSelected]   = useState<GalleryPost | null>(null)

  // Upload form state
  const [title,       setTitle]       = useState('')
  const [description, setDescription] = useState('')
  const [category,    setCategory]    = useState('volunteer')
  const [imageFile,   setImageFile]   = useState<File | null>(null)
  const [preview,     setPreview]     = useState<string | null>(null)
  const [uploading,   setUploading]   = useState(false)
  const [submitErr,   setSubmitErr]   = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const fetchPosts = useCallback(async () => {
    const res = await fetch('/api/gallery')
    if (res.ok) setPosts(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
  }

  async function submitPost(e: React.FormEvent) {
    e.preventDefault()
    if (!imageFile) { setSubmitErr('Please select a photo.'); return }
    if (!title.trim()) { setSubmitErr('Please add a title.'); return }
    setUploading(true); setSubmitErr('')

    // 1. Upload image
    const fd = new FormData()
    fd.append('image', imageFile)
    const upRes  = await fetch('/api/gallery/upload', { method: 'POST', body: fd })
    const upData = await upRes.json()
    if (!upRes.ok) { setSubmitErr(upData.error || 'Upload failed.'); setUploading(false); return }

    // 2. Create post
    const res  = await fetch('/api/gallery', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, imageUrl: upData.imageUrl, category }),
    })
    const data = await res.json()
    if (!res.ok) { setSubmitErr(data.error || 'Something went wrong.'); setUploading(false); return }

    setPosts(prev => [data, ...prev])
    setShowUpload(false)
    setTitle(''); setDescription(''); setImageFile(null); setPreview(null); setCategory('volunteer')
    setUploading(false)
  }

  async function toggleHeart(post: GalleryPost) {
    if (!session) return
    const res  = await fetch(`/api/gallery/${post.id}/heart`, { method: 'POST' })
    const data = await res.json()
    if (res.ok) {
      setPosts(prev => prev.map(p => p.id === post.id
        ? { ...p, heartCount: data.count, heartedByMe: data.hearted }
        : p
      ))
      if (selected?.id === post.id) {
        setSelected(s => s ? { ...s, heartCount: data.count, heartedByMe: data.hearted } : s)
      }
    }
  }

  const filtered = filter === 'all' ? posts : posts.filter(p => p.category === filter)

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-deep to-teal-dark py-16 px-[5%] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-1/4 w-40 h-40 rounded-full bg-amber" />
          <div className="absolute bottom-0 right-1/3 w-60 h-60 rounded-full bg-teal-mid" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center gap-3 text-amber-soft text-[0.75rem] font-semibold tracking-[0.18em] uppercase mb-4">
            <span className="w-6 h-0.5 bg-amber rounded" /> Community · Gallery
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-5">
            <div>
              <h1 className="font-display text-[clamp(2rem,3.5vw,3rem)] font-bold leading-snug mb-3">
                Good deeds. <em className="italic text-amber-soft">Shared with heart.</em>
              </h1>
              <p className="text-white/72 text-[1rem] leading-[1.8] max-w-[520px]">
                A living gallery of kindness, voluntary work, and positive action from our community. Every post is proof that small acts matter.
              </p>
            </div>
            {session ? (
              <button
                onClick={() => setShowUpload(true)}
                className="flex-shrink-0 flex items-center gap-2 bg-amber text-charcoal px-6 py-3 rounded-full font-bold text-[0.92rem] hover:bg-amber-soft hover:-translate-y-0.5 transition-all shadow-lg">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Share Your Moment
              </button>
            ) : (
              <Link href="/login"
                className="flex-shrink-0 border border-white/30 text-white px-6 py-3 rounded-full font-semibold text-[0.92rem] no-underline hover:bg-white/10 transition-all">
                Sign in to post →
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 mt-8">
            {[
              { n: posts.length,                              label: 'moments shared' },
              { n: posts.reduce((a, p) => a + p.heartCount, 0), label: 'hearts given'   },
              { n: new Set(posts.map(p => p.user.id)).size,  label: 'contributors'    },
            ].map(s => (
              <div key={s.label} className="bg-white/10 border border-white/20 rounded-[14px] px-5 py-3 text-center">
                <p className="font-display font-bold text-[1.5rem] text-amber">{s.n}</p>
                <p className="text-white/60 text-[0.72rem]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category filter */}
      <div className="bg-white border-b border-teal-light sticky top-[72px] z-30 overflow-x-auto">
        <div className="max-w-6xl mx-auto px-[5%]">
          <div className="flex gap-1.5 py-3 min-w-max">
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setFilter(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[0.82rem] font-semibold transition-all whitespace-nowrap
                  ${filter === cat.id
                    ? 'bg-teal-deep text-white shadow-sm'
                    : 'text-text-mid hover:bg-teal-ghost hover:text-teal-deep'}`}>
                <span>{cat.icon}</span> {cat.label}
                {cat.id !== 'all' && (
                  <span className={`text-[0.65rem] ml-0.5 ${filter === cat.id ? 'opacity-70' : 'text-text-xlight'}`}>
                    {posts.filter(p => p.category === cat.id).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery grid */}
      <div className="max-w-6xl mx-auto px-[5%] py-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="flex gap-1.5">
              {[0,1,2].map(i => <span key={i} className="w-3 h-3 rounded-full bg-teal-mid animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-[4rem] mb-4">📷</span>
            <h2 className="font-display text-[1.4rem] text-charcoal font-bold mb-2">
              {filter === 'all' ? 'No posts yet' : `No ${CATEGORIES.find(c=>c.id===filter)?.label} posts yet`}
            </h2>
            <p className="text-text-mid text-[0.92rem] mb-6 max-w-sm">
              Be the first to share a moment of goodness with the community!
            </p>
            {session
              ? <button onClick={() => setShowUpload(true)} className="bg-teal-deep text-white px-6 py-3 rounded-full font-semibold text-[0.9rem] hover:bg-teal-dark transition-colors">Share the First Moment →</button>
              : <Link href="/login" className="bg-teal-deep text-white px-6 py-3 rounded-full font-semibold text-[0.9rem] no-underline hover:bg-teal-dark transition-colors">Sign in to post →</Link>
            }
          </div>
        ) : (
          /* Masonry-style grid */
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
            {filtered.map(post => (
              <div key={post.id}
                className="break-inside-avoid bg-white border border-teal-light rounded-[20px] overflow-hidden shadow-card hover:shadow-lift hover:-translate-y-1 transition-all group cursor-pointer"
                onClick={() => setSelected(post)}>
                {/* Image */}
                <div className="relative overflow-hidden">
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    width={600}
                    height={400}
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    style={{ height: 'auto' }}
                  />
                  {/* Category badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`text-[0.68rem] font-bold px-2.5 py-1 rounded-full border backdrop-blur-sm bg-white/80 ${CATEGORY_COLORS[post.category] ?? 'bg-teal-ghost text-teal-deep border-teal-light'}`}>
                      {CATEGORIES.find(c => c.id === post.category)?.icon} {CATEGORIES.find(c => c.id === post.category)?.label}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-display font-bold text-charcoal text-[1rem] leading-snug mb-1.5">{post.title}</h3>
                  {post.description && (
                    <p className="text-text-mid text-[0.83rem] leading-[1.7] mb-3 line-clamp-3">{post.description}</p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    {/* User */}
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-teal-ghost flex items-center justify-center flex-shrink-0">
                        {post.user.avatarUrl
                          ? <Image src={post.user.avatarUrl} alt={post.user.name} width={28} height={28} className="object-cover" />
                          : <span className="text-[0.8rem] font-bold text-teal-deep">{post.user.name.charAt(0)}</span>
                        }
                      </div>
                      <div>
                        <p className="text-[0.75rem] font-semibold text-charcoal leading-none">{post.user.name}</p>
                        <p className="text-[0.65rem] text-text-xlight">{new Date(post.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'short' })}</p>
                      </div>
                    </div>

                    {/* Heart */}
                    <button
                      onClick={e => { e.stopPropagation(); toggleHeart(post) }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-[0.8rem] font-semibold
                        ${post.heartedByMe
                          ? 'bg-red-50 text-red-500 border border-red-200'
                          : 'hover:bg-red-50 hover:text-red-400 text-text-xlight border border-transparent hover:border-red-200'}`}>
                      <svg className="w-4 h-4" fill={post.heartedByMe ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>
                      {post.heartCount}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Upload Modal ─────────────────────────────────────────────────── */}
      {showUpload && (
        <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-[28px] w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-8 pt-8 pb-4">
              <div>
                <h2 className="font-display text-[1.3rem] font-bold text-charcoal">Share Your Moment</h2>
                <p className="text-text-xlight text-[0.78rem]">Share a photo of your activity with the community</p>
              </div>
              <button onClick={() => setShowUpload(false)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-teal-ghost transition-colors text-text-mid text-[1.1rem]">✕</button>
            </div>

            <form onSubmit={submitPost} className="px-8 pb-8 space-y-5">
              {/* Image upload area */}
              <div>
                <label className="block text-[0.78rem] font-semibold text-teal-deep mb-2">Photo *</label>
                {preview ? (
                  <div className="relative rounded-[16px] overflow-hidden">
                    <Image src={preview} alt="Preview" width={500} height={300} className="w-full object-cover max-h-[240px]" />
                    <button type="button" onClick={() => { setImageFile(null); setPreview(null) }}
                      className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full text-white flex items-center justify-center text-[0.9rem] hover:bg-black/70 transition-colors">✕</button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-teal-light rounded-[16px] p-8 text-center cursor-pointer hover:border-teal-mid hover:bg-teal-ghost/30 transition-all">
                    <svg className="w-10 h-10 text-teal-light mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    <p className="text-text-mid text-[0.88rem] font-medium mb-1">Click to choose a photo</p>
                    <p className="text-text-xlight text-[0.75rem]">JPEG, PNG or WebP · max 5 MB</p>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={pickFile} />
              </div>

              {/* Title */}
              <div>
                <label className="block text-[0.78rem] font-semibold text-teal-deep mb-1.5">Title *</label>
                <input value={title} onChange={e => setTitle(e.target.value)} maxLength={200}
                  placeholder="e.g. Beach cleanup with 20 volunteers!"
                  className="w-full border border-teal-light rounded-[12px] px-4 py-2.5 text-[0.93rem] outline-none focus:border-teal-mid bg-ivory transition-colors" />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[0.78rem] font-semibold text-teal-deep mb-2">Category *</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                    <button key={cat.id} type="button" onClick={() => setCategory(cat.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[0.78rem] font-semibold transition-all
                        ${category === cat.id ? 'bg-teal-deep text-white border-teal-deep' : 'border-teal-light text-text-mid hover:border-teal-mid bg-teal-ghost'}`}>
                      {cat.icon} {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[0.78rem] font-semibold text-teal-deep mb-1.5">Tell the story <span className="text-text-xlight font-normal">(optional)</span></label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} maxLength={1000}
                  placeholder="What did you do? Who was involved? How did it feel?"
                  className="w-full border border-teal-light rounded-[12px] px-4 py-2.5 text-[0.93rem] outline-none focus:border-teal-mid bg-ivory resize-none transition-colors" />
              </div>

              {submitErr && <p className="text-red-500 text-[0.82rem] text-center">{submitErr}</p>}

              <button type="submit" disabled={uploading}
                className="w-full bg-teal-deep text-white py-3.5 rounded-full font-bold text-[0.95rem] hover:bg-teal-dark disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                {uploading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Uploading…</> : '📸 Share with Community'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Lightbox ─────────────────────────────────────────────────────── */}
      {selected && (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center px-4 py-8"
          onClick={() => setSelected(null)}>
          <div className="bg-white rounded-[24px] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}>
            {/* Image */}
            <div className="relative">
              <Image src={selected.imageUrl} alt={selected.title} width={800} height={500} className="w-full object-cover rounded-t-[24px] max-h-[60vh]" />
              <button onClick={() => setSelected(null)} className="absolute top-3 right-3 w-9 h-9 bg-black/40 rounded-full text-white flex items-center justify-center hover:bg-black/60 transition-colors text-[1rem]">✕</button>
              {/* Category */}
              <div className="absolute top-3 left-3">
                <span className={`text-[0.72rem] font-bold px-3 py-1.5 rounded-full border backdrop-blur-sm bg-white/85 ${CATEGORY_COLORS[selected.category] ?? 'bg-teal-ghost text-teal-deep border-teal-light'}`}>
                  {CATEGORIES.find(c => c.id === selected.category)?.icon} {CATEGORIES.find(c => c.id === selected.category)?.label}
                </span>
              </div>
            </div>

            <div className="p-6">
              <h2 className="font-display text-[1.4rem] font-bold text-charcoal mb-2">{selected.title}</h2>
              {selected.description && <p className="text-text-mid text-[0.92rem] leading-[1.8] mb-5">{selected.description}</p>}

              <div className="flex items-center justify-between border-t border-teal-light pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-teal-ghost flex items-center justify-center">
                    {selected.user.avatarUrl
                      ? <Image src={selected.user.avatarUrl} alt={selected.user.name} width={40} height={40} className="object-cover" />
                      : <span className="font-bold text-teal-deep">{selected.user.name.charAt(0)}</span>
                    }
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal text-[0.9rem]">{selected.user.name}</p>
                    <p className="text-text-xlight text-[0.72rem]">
                      {new Date(selected.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toggleHeart(selected)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-[0.88rem] transition-all border
                    ${selected.heartedByMe
                      ? 'bg-red-50 text-red-500 border-red-200'
                      : 'border-teal-light text-text-mid hover:bg-red-50 hover:text-red-400 hover:border-red-200'}`}>
                  <svg className="w-4 h-4" fill={selected.heartedByMe ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                  {selected.heartedByMe ? 'Hearted' : 'Heart this'} · {selected.heartCount}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
