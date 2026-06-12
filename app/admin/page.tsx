'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Report {
  id: number; postType: string; postId: number; reason: string; details?: string
  status: string; adminNote?: string; createdAt: string; resolvedAt?: string
  postSnippet: string; postAuthor: string; postDeleted: boolean
  reporter: { id: number; name: string; email: string; avatarUrl?: string }
}

interface BlogComment {
  id: number
  slug: string
  body: string
  author: string
  approved: boolean
  createdAt: string
  user?: { id: number; name: string; avatarUrl?: string } | null
}

interface UserBlogPost {
  id: number
  title: string
  excerpt: string
  body: string
  category: string
  subCategory?: string
  status: string
  createdAt: string
  slug?: string
  images: string // JSON array
  user: { id: number; name: string; email: string; avatarUrl?: string | null }
}

type AdminSection = 'reports' | 'comments' | 'blog-posts' | 'story' | 'new-users' | 'leads'

interface LaunchLead {
  id: number; email: string; countryCode?: string | null; countryName?: string | null
  source: string; createdAt: string; registered: boolean
}

interface RecentUser {
  id: number; name: string; email: string; avatarUrl?: string
  createdAt: string; currentStreak: number
  _count: { blogSubmissions: number; posts: number }
}

interface FeaturedStory {
  id: number
  title: string
  body?: string
  excerpt?: string
  author?: string
  slug?: string
  createdAt: string
  user?: { name: string } | null
}

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (d === 0) return 'Today'
  if (d === 1) return 'Yesterday'
  if (d  < 7)  return `${d}d ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export default function AdminPage() {
  // required:true → NextAuth auto-redirects to /login?callbackUrl=/admin if not signed in
  // Eliminates the manual redirect race that was causing the spinner to hang
  const { data: session, status } = useSession({ required: true })
  const router = useRouter()

  const [section,     setSection]     = useState<AdminSection>('reports')

  // ── Reports ──────────────────────────────────────────────────────
  const [reports,     setReports]     = useState<Report[]>([])
  const [filter,      setFilter]      = useState<'pending' | 'resolved' | 'all'>('pending')
  const [loading,     setLoading]     = useState(true)
  const [activeId,    setActiveId]    = useState<number | null>(null)
  const [adminNote,   setAdminNote]   = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [toast,       setToast]       = useState('')

  // ── Blog Comments ─────────────────────────────────────────────────
  const [comments,    setComments]    = useState<BlogComment[]>([])
  const [cmtFilter,   setCmtFilter]   = useState<'pending' | 'approved' | 'all'>('pending')
  const [cmtLoading,  setCmtLoading]  = useState(false)
  const [cmtPending,  setCmtPending]  = useState(0)

  // ── User Blog Posts ───────────────────────────────────────────────
  const [blogPosts,       setBlogPosts]       = useState<UserBlogPost[]>([])
  const [bpFilter,        setBpFilter]        = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
  const [bpLoading,       setBpLoading]       = useState(false)
  const [bpPending,       setBpPending]       = useState(0)
  const [bpExpanded,      setBpExpanded]      = useState<number | null>(null)
  const [bpSubmitting,    setBpSubmitting]    = useState<number | null>(null)

  // ── Recent Signups ────────────────────────────────────────────────
  const [recentUsers,     setRecentUsers]     = useState<RecentUser[]>([])
  const [ruLoading,       setRuLoading]       = useState(false)

  // ── Launch Signups (pre-launch leads) ─────────────────────────────
  const [leads,           setLeads]           = useState<LaunchLead[]>([])
  const [leadsLoading,    setLeadsLoading]    = useState(false)

  // ── Story of the Week ────────────────────────────────────────────
  const [storyLoading,    setStoryLoading]    = useState(false)
  const [currentStory,    setCurrentStory]    = useState<FeaturedStory | null>(null)
  const [currentStoryType, setCurrentStoryType] = useState<'community' | 'blog' | null>(null)
  const [storyPostId,     setStoryPostId]     = useState('')
  const [storyPostType,   setStoryPostType]   = useState<'community' | 'blog'>('community')
  const [storyMsg,        setStoryMsg]        = useState('')

  const loadBlogPosts = useCallback(async (f: string) => {
    setBpLoading(true)
    try {
      const res  = await fetch(`/api/admin/blog-posts?status=${f}`)
      if (!res.ok) { setBpLoading(false); return }
      const data = await res.json()
      setBlogPosts(Array.isArray(data) ? data : [])
    } catch { /* ignore */ }
    setBpLoading(false)
  }, [])

  const loadBpPendingCount = useCallback(async () => {
    try {
      const res  = await fetch('/api/admin/blog-posts?status=pending')
      const data = await res.json()
      if (Array.isArray(data)) setBpPending(data.length)
    } catch { /* ignore */ }
  }, [])

  async function handleBlogPost(id: number, action: 'approve' | 'reject') {
    setBpSubmitting(id)
    const res = await fetch('/api/admin/blog-posts', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id, action }),
    })
    if (res.ok) {
      setToast(action === 'approve' ? '✅ Post approved & published!' : '✗ Post rejected')
      setBpExpanded(null)
      loadBlogPosts(bpFilter)
      loadBpPendingCount()
      setTimeout(() => setToast(''), 3000)
    }
    setBpSubmitting(null)
  }

  const loadCurrentStory = useCallback(async () => {
    setStoryLoading(true)
    try {
      const res  = await fetch('/api/admin/story-of-week')
      const data = await res.json()
      setCurrentStory(data.story ?? null)
      setCurrentStoryType(data.type ?? null)
    } catch { /* ignore */ }
    setStoryLoading(false)
  }, [])

  const loadReports = useCallback(async (f: string) => {
    setLoading(true)
    const res  = await fetch(`/api/admin/reports?status=${f}`)
    if (res.status === 403) { router.push('/'); return }
    const data = await res.json()
    setReports(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [router])

  const loadComments = useCallback(async (f: string) => {
    setCmtLoading(true)
    const res  = await fetch(`/api/admin/blog-comments?status=${f}`)
    if (res.status === 403) { router.push('/'); return }
    const data = await res.json()
    setComments(Array.isArray(data) ? data : [])
    setCmtLoading(false)
  }, [router])

  // Pending comment count for badge
  const loadPendingCount = useCallback(async () => {
    try {
      const res  = await fetch('/api/admin/blog-comments?status=pending')
      const data = await res.json()
      if (Array.isArray(data)) setCmtPending(data.length)
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    if (status !== 'authenticated') return
    // loadReports acts as the admin gate — 403 redirects to home
    loadReports(filter)
    loadPendingCount()
    loadBpPendingCount()
  }, [status, filter, loadReports, loadPendingCount, loadBpPendingCount])

  useEffect(() => {
    if (section === 'comments') loadComments(cmtFilter)
  }, [section, cmtFilter, loadComments])

  useEffect(() => {
    if (section === 'blog-posts') loadBlogPosts(bpFilter)
  }, [section, bpFilter, loadBlogPosts])

  useEffect(() => {
    if (section === 'story') loadCurrentStory()
  }, [section, loadCurrentStory])

  useEffect(() => {
    if (section !== 'new-users') return
    setRuLoading(true)
    fetch('/api/admin/users?page=1&filter=all')
      .then(r => r.json())
      .then(d => setRecentUsers(d.users ?? []))
      .catch(() => {})
      .finally(() => setRuLoading(false))
  }, [section])

  useEffect(() => {
    if (section !== 'leads') return
    setLeadsLoading(true)
    fetch('/api/admin/launch-signups')
      .then(r => r.json())
      .then(d => setLeads(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLeadsLoading(false))
  }, [section])

  async function resolve(reportId: number, action: 'remove' | 'keep' | 'dismiss') {
    if (!adminNote.trim() && action !== 'dismiss') {
      setToast('Please add a note for the reporter before resolving.')
      setTimeout(() => setToast(''), 3000)
      return
    }
    setSubmitting(true)
    const res = await fetch(`/api/admin/reports/${reportId}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ adminNote, action }),
    })
    if (res.ok) {
      setToast(action === 'remove' ? '✓ Post removed & reporter notified' : '✓ Report resolved & reporter notified')
      setActiveId(null); setAdminNote('')
      setTimeout(() => { setToast(''); loadReports(filter) }, 2000)
    }
    setSubmitting(false)
  }

  async function handleComment(id: number, action: 'approve' | 'reject') {
    const res = await fetch(`/api/admin/blog-comments`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id, action }),
    })
    if (res.ok) {
      setToast(action === 'approve' ? '✓ Comment approved' : '✓ Comment rejected & deleted')
      loadComments(cmtFilter)
      loadPendingCount()
      setTimeout(() => setToast(''), 2500)
    }
  }

  async function featureStory(e: React.FormEvent) {
    e.preventDefault()
    if (!storyPostId.trim()) {
      setStoryMsg('Please enter a post ID.')
      return
    }
    const res = await fetch('/api/admin/story-of-week', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ postId: Number(storyPostId), postType: storyPostType }),
    })
    if (res.ok) {
      setStoryMsg('✓ Story featured for this week!')
      setStoryPostId('')
      loadCurrentStory()
    } else {
      const err = await res.json()
      setStoryMsg(`Error: ${err.error ?? 'Something went wrong'}`)
    }
    setTimeout(() => setStoryMsg(''), 4000)
  }

  if (status !== 'authenticated') return (
    <div className="min-h-screen flex items-center justify-center pt-[72px]">
      <div className="flex gap-1.5">{[0,1,2].map(i => <span key={i} className="w-2 h-2 rounded-full bg-teal-mid animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}</div>
    </div>
  )

  const activeReport = reports.find(r => r.id === activeId)

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-ghost to-ivory pt-[72px]">
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-teal-deep text-white px-6 py-3 rounded-full shadow-lift text-[0.88rem] font-semibold pointer-events-none">
          {toast}
        </div>
      )}

      {/* Top bar */}
      <div className="bg-white border-b border-teal-light px-[5%] py-5 sticky top-[72px] z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display font-bold text-[1.2rem] text-charcoal">Admin Dashboard</h1>
            <p className="text-[0.75rem] text-text-xlight mt-0.5">Manage reports, comments and community content</p>
          </div>
          {/* Section tabs */}
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => router.push('/admin/users')}
              className="px-4 py-1.5 rounded-full text-[0.82rem] font-semibold transition-all flex items-center gap-1.5 border border-purple-200 text-purple-700 hover:bg-purple-50 bg-white">
              👥 Users
            </button>
            <button onClick={() => setSection('blog-posts')}
              className={`px-4 py-1.5 rounded-full text-[0.82rem] font-semibold transition-all flex items-center gap-1.5
                ${section === 'blog-posts' ? 'bg-teal-deep text-white' : 'border border-teal-light text-text-mid hover:bg-teal-ghost'}`}>
              ✍️ Blog Posts
              {bpPending > 0 && (
                <span className="bg-red-500 text-white text-[0.65rem] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {bpPending}
                </span>
              )}
            </button>
            <button onClick={() => setSection('reports')}
              className={`px-4 py-1.5 rounded-full text-[0.82rem] font-semibold transition-all flex items-center gap-1.5
                ${section === 'reports' ? 'bg-teal-deep text-white' : 'border border-teal-light text-text-mid hover:bg-teal-ghost'}`}>
              🚩 Reports
            </button>
            <button onClick={() => setSection('comments')}
              className={`px-4 py-1.5 rounded-full text-[0.82rem] font-semibold transition-all flex items-center gap-1.5
                ${section === 'comments' ? 'bg-teal-deep text-white' : 'border border-teal-light text-text-mid hover:bg-teal-ghost'}`}>
              💬 Blog Comments
              {cmtPending > 0 && (
                <span className="bg-amber text-charcoal text-[0.65rem] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cmtPending > 9 ? '9+' : cmtPending}
                </span>
              )}
            </button>
            <button onClick={() => setSection('story')}
              className={`px-4 py-1.5 rounded-full text-[0.82rem] font-semibold transition-all flex items-center gap-1.5
                ${section === 'story' ? 'bg-amber text-charcoal' : 'border border-teal-light text-text-mid hover:bg-teal-ghost'}`}>
              📖 Story of the Week
            </button>
            <button onClick={() => setSection('new-users')}
              className={`px-4 py-1.5 rounded-full text-[0.82rem] font-semibold transition-all flex items-center gap-1.5
                ${section === 'new-users' ? 'bg-green-600 text-white' : 'border border-green-200 text-green-700 hover:bg-green-50'}`}>
              🆕 New Users
            </button>
            <button onClick={() => setSection('leads')}
              className={`px-4 py-1.5 rounded-full text-[0.82rem] font-semibold transition-all flex items-center gap-1.5
                ${section === 'leads' ? 'bg-sky-600 text-white' : 'border border-sky-200 text-sky-700 hover:bg-sky-50'}`}>
              🚀 Launch Signups
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-[5%] py-8">

        {/* ── Blog Posts review ────────────────────────────────────── */}
        {section === 'blog-posts' && (
          <>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h2 className="font-display font-bold text-[1.1rem] text-charcoal">User Blog Post Submissions</h2>
                <p className="text-text-xlight text-[0.78rem] mt-0.5">Review, preview and approve or reject posts before they go live</p>
              </div>
              <div className="flex gap-2">
                {(['pending', 'approved', 'rejected', 'all'] as const).map(f => (
                  <button key={f} onClick={() => setBpFilter(f)}
                    className={`px-3 py-1.5 rounded-full text-[0.78rem] font-semibold capitalize transition-all
                      ${bpFilter === f ? 'bg-teal-deep text-white' : 'border border-teal-light text-text-mid hover:bg-teal-ghost'}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {bpLoading ? (
              <div className="flex justify-center py-12"><div className="flex gap-1.5">{[0,1,2].map(i => <span key={i} className="w-2 h-2 rounded-full bg-teal-mid animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}</div></div>
            ) : blogPosts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-[20px] border border-teal-light">
                <p className="text-[2rem] mb-3">✍️</p>
                <p className="text-text-mid">No {bpFilter === 'all' ? '' : bpFilter} blog posts</p>
              </div>
            ) : (
              <div className="space-y-4">
                {blogPosts.map(post => {
                  const images = (() => { try { return JSON.parse(post.images) as string[] } catch { return [] } })()
                  const isExpanded = bpExpanded === post.id
                  const statusColor = post.status === 'approved' ? 'bg-teal-ghost text-teal-deep border-teal-light'
                    : post.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-200'
                    : 'bg-amber/15 text-amber border-amber/40'

                  return (
                    <div key={post.id} className="bg-white rounded-[20px] border border-teal-light shadow-card overflow-hidden">
                      {/* Header row */}
                      <div className="flex items-start gap-4 p-5">
                        {/* Author avatar */}
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-teal-ghost flex items-center justify-center flex-shrink-0 mt-0.5">
                          {post.user.avatarUrl
                            ? <img src={post.user.avatarUrl} alt={post.user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            : <span className="font-bold text-teal-deep text-[0.9rem]">{post.user.name.charAt(0)}</span>
                          }
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div>
                              <h3 className="font-display font-bold text-charcoal text-[1rem] leading-snug">{post.title}</h3>
                              <p className="text-text-xlight text-[0.72rem] mt-0.5">
                                by <span className="font-semibold text-teal-deep">{post.user.name}</span>
                                <span className="mx-1">·</span>{post.user.email}
                                <span className="mx-1">·</span>{timeAgo(post.createdAt)}
                              </p>
                            </div>
                            <span className={`text-[0.68rem] font-bold px-2.5 py-1 rounded-full border capitalize flex-shrink-0 ${statusColor}`}>
                              {post.status}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="text-[0.7rem] bg-teal-ghost text-teal-deep px-2 py-0.5 rounded-full font-medium">{post.category}</span>
                            {post.subCategory && <span className="text-[0.7rem] bg-teal-ghost/60 text-teal-mid px-2 py-0.5 rounded-full">{post.subCategory}</span>}
                            {images.length > 0 && <span className="text-[0.7rem] text-text-xlight">📎 {images.length} image{images.length > 1 ? 's' : ''}</span>}
                          </div>

                          {post.excerpt && (
                            <p className="text-text-mid text-[0.83rem] mt-2 leading-[1.6] line-clamp-2">{post.excerpt}</p>
                          )}
                        </div>
                      </div>

                      {/* Action bar */}
                      <div className="flex items-center gap-3 px-5 pb-4 pt-0 border-t border-teal-light/40 mt-1 pt-3">
                        <button onClick={() => setBpExpanded(isExpanded ? null : post.id)}
                          className="flex items-center gap-1.5 text-[0.8rem] font-semibold text-teal-mid hover:text-teal-deep transition-colors">
                          {isExpanded ? '▲ Hide' : '▼ Read full post'}
                        </button>
                        <div className="flex-1" />
                        {post.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleBlogPost(post.id, 'reject')}
                              disabled={bpSubmitting === post.id}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-red-200 text-red-500 text-[0.8rem] font-semibold hover:bg-red-50 disabled:opacity-50 transition-colors">
                              ✗ Reject
                            </button>
                            <button
                              onClick={() => handleBlogPost(post.id, 'approve')}
                              disabled={bpSubmitting === post.id}
                              className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-teal-deep text-white text-[0.8rem] font-semibold hover:bg-teal-dark disabled:opacity-50 transition-colors">
                              {bpSubmitting === post.id
                                ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing…</>
                                : '✓ Approve & Publish'}
                            </button>
                          </>
                        )}
                        {post.status === 'approved' && (
                          <button onClick={() => handleBlogPost(post.id, 'reject')} disabled={bpSubmitting === post.id}
                            className="px-4 py-2 rounded-full border border-red-200 text-red-500 text-[0.78rem] font-semibold hover:bg-red-50 disabled:opacity-50 transition-colors">
                            Unpublish
                          </button>
                        )}
                        {post.status === 'rejected' && (
                          <button onClick={() => handleBlogPost(post.id, 'approve')} disabled={bpSubmitting === post.id}
                            className="px-4 py-2 rounded-full bg-teal-ghost border border-teal-mid text-teal-deep text-[0.78rem] font-semibold hover:bg-teal-light/30 disabled:opacity-50 transition-colors">
                            Re-approve
                          </button>
                        )}
                      </div>

                      {/* Expanded body */}
                      {isExpanded && (
                        <div className="border-t border-teal-light px-5 py-5 bg-ivory/50">
                          {images.length > 0 && (
                            <div className="flex gap-3 mb-4 overflow-x-auto pb-2">
                              {images.map((url, i) => (
                                <img key={i} src={url} alt="" className="h-32 rounded-[12px] object-cover flex-shrink-0" />
                              ))}
                            </div>
                          )}
                          <div
                            className="prose prose-sm max-w-none text-text-mid text-[0.88rem] leading-[1.75]"
                            dangerouslySetInnerHTML={{ __html: post.body }}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ── Reports section ──────────────────────────────────────── */}
        {section === 'reports' && (
          <>
            {/* Filter */}
            <div className="flex gap-2 mb-6">
              {(['pending', 'resolved', 'all'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-[0.8rem] font-semibold capitalize transition-all
                    ${filter === f ? 'bg-teal-deep text-white' : 'border border-teal-light text-text-mid hover:bg-teal-ghost'}`}>
                  {f}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="flex gap-1.5">{[0,1,2].map(i => <span key={i} className="w-2 h-2 rounded-full bg-teal-mid animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}</div>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-[3rem] mb-4">✅</p>
                <p className="text-text-mid font-semibold">No {filter} reports</p>
                <p className="text-text-xlight text-[0.85rem] mt-1">Community is looking healthy!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map(r => (
                  <div key={r.id} className={`bg-white rounded-[20px] border overflow-hidden transition-all
                    ${r.status === 'pending' ? 'border-amber/60 shadow-card' : 'border-teal-light'}`}>

                    <div className="flex items-start gap-4 p-5">
                      <div className="w-9 h-9 rounded-full bg-teal-ghost flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {r.reporter.avatarUrl
                          ? <Image src={r.reporter.avatarUrl} alt={r.reporter.name} width={36} height={36} className="object-cover" />
                          : <span className="text-[0.8rem]">🌿</span>}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide
                            ${r.status === 'pending' ? 'bg-amber/20 text-amber-700' : 'bg-teal-ghost text-teal-deep'}`}>
                            {r.status}
                          </span>
                          <span className="text-[0.65rem] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full uppercase tracking-wide">
                            {r.postType.replace('_', ' ')}
                          </span>
                          {r.postDeleted && (
                            <span className="text-[0.65rem] bg-red-50 text-red-500 px-2 py-0.5 rounded-full">Post already deleted</span>
                          )}
                        </div>

                        <p className="text-[0.82rem] text-text-mid mb-1">
                          <strong className="text-charcoal">{r.reporter.name}</strong>
                          <span className="text-text-xlight"> · {r.reporter.email} · {timeAgo(r.createdAt)}</span>
                        </p>
                        <p className="text-[0.85rem] font-semibold text-red-500 mb-1">⚑ {r.reason}</p>
                        {r.details && <p className="text-[0.8rem] text-text-mid italic mb-2">&ldquo;{r.details}&rdquo;</p>}

                        {r.postSnippet && !r.postDeleted && (
                          <div className="bg-teal-ghost/50 rounded-[10px] px-3 py-2 mt-2">
                            <p className="text-[0.73rem] text-text-xlight mb-0.5">Reported post by <strong>{r.postAuthor}</strong>:</p>
                            <p className="text-[0.8rem] text-text-mid line-clamp-3">{r.postSnippet}</p>
                          </div>
                        )}

                        {r.adminNote && r.status === 'resolved' && (
                          <div className="border-l-4 border-teal-mid bg-teal-ghost/30 px-3 py-2 mt-3 rounded-r-[8px]">
                            <p className="text-[0.72rem] text-text-xlight mb-0.5">Admin response sent to reporter:</p>
                            <p className="text-[0.82rem] text-teal-deep italic">{r.adminNote}</p>
                          </div>
                        )}
                      </div>

                      {r.status === 'pending' && (
                        <button onClick={() => { setActiveId(activeId === r.id ? null : r.id); setAdminNote('') }}
                          className="flex-shrink-0 bg-teal-deep text-white px-4 py-2 rounded-full text-[0.8rem] font-semibold hover:bg-teal-dark transition-colors">
                          {activeId === r.id ? 'Cancel' : 'Review →'}
                        </button>
                      )}
                    </div>

                    {/* Action panel */}
                    {activeId === r.id && activeReport && (
                      <div className="border-t border-teal-light px-5 py-5 bg-teal-ghost/10 space-y-4">
                        <div>
                          <label className="block text-[0.78rem] font-semibold text-charcoal mb-1.5">
                            Message to reporter <span className="text-text-xlight font-normal">(will be emailed to them — required for Remove/Keep)</span>
                          </label>
                          <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)}
                            placeholder='e.g. "We reviewed this post and removed it as it violated our community guidelines."'
                            rows={3}
                            className="w-full border border-teal-light rounded-[12px] px-4 py-2.5 text-[0.85rem] outline-none focus:border-teal-mid bg-white resize-none" />
                        </div>

                        <div className="flex gap-3 flex-wrap">
                          <button onClick={() => resolve(r.id, 'remove')} disabled={submitting || r.postDeleted}
                            className="bg-red-500 text-white px-5 py-2.5 rounded-full text-[0.85rem] font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors">
                            🗑️ Remove post &amp; notify reporter
                          </button>
                          <button onClick={() => resolve(r.id, 'keep')} disabled={submitting}
                            className="bg-teal-deep text-white px-5 py-2.5 rounded-full text-[0.85rem] font-semibold hover:bg-teal-dark disabled:opacity-50 transition-colors">
                            ✓ Keep post &amp; notify reporter
                          </button>
                          <button onClick={() => resolve(r.id, 'dismiss')} disabled={submitting}
                            className="border border-teal-light text-text-mid px-5 py-2.5 rounded-full text-[0.85rem] font-semibold hover:bg-teal-ghost disabled:opacity-50 transition-colors">
                            Dismiss silently
                          </button>
                        </div>
                        <p className="text-[0.72rem] text-text-xlight leading-[1.6]">
                          The reporter&apos;s email address will receive your message automatically. All actions are logged.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Blog Comments section ─────────────────────────────────── */}
        {section === 'comments' && (
          <>
            <div className="flex gap-2 mb-6">
              {(['pending', 'approved', 'all'] as const).map(f => (
                <button key={f} onClick={() => setCmtFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-[0.8rem] font-semibold capitalize transition-all
                    ${cmtFilter === f ? 'bg-teal-deep text-white' : 'border border-teal-light text-text-mid hover:bg-teal-ghost'}`}>
                  {f}
                </button>
              ))}
            </div>

            {cmtLoading ? (
              <div className="flex justify-center py-20">
                <div className="flex gap-1.5">{[0,1,2].map(i => <span key={i} className="w-2 h-2 rounded-full bg-teal-mid animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}</div>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-[3rem] mb-4">💬</p>
                <p className="text-text-mid font-semibold">No {cmtFilter} comments</p>
                <p className="text-text-xlight text-[0.85rem] mt-1">Nothing to moderate right now.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map(c => {
                  const authorName = c.user?.name ?? c.author ?? 'Anonymous'
                  const avatar     = c.user?.avatarUrl
                  return (
                    <div key={c.id} className={`bg-white rounded-[20px] border p-5 ${c.approved ? 'border-teal-light' : 'border-amber/50 shadow-card'}`}>
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-teal-ghost flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {avatar
                            ? <Image src={avatar} alt={authorName} width={36} height={36} className="object-cover" />
                            : <span className="text-[0.8rem]">🌿</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide
                              ${c.approved ? 'bg-teal-ghost text-teal-deep' : 'bg-amber/20 text-amber-700'}`}>
                              {c.approved ? 'Approved' : 'Pending'}
                            </span>
                            <span className="text-[0.75rem] text-text-xlight">
                              <strong className="text-charcoal">{authorName}</strong> · on post <code className="text-[0.7rem] bg-slate-100 px-1 rounded">{c.slug}</code> · {timeAgo(c.createdAt)}
                            </span>
                          </div>
                          <p className="text-[0.88rem] text-text-mid leading-[1.7] mt-1">{c.body}</p>
                        </div>
                        {!c.approved && (
                          <div className="flex gap-2 flex-shrink-0">
                            <button onClick={() => handleComment(c.id, 'approve')}
                              className="bg-teal-deep text-white px-3.5 py-2 rounded-full text-[0.78rem] font-semibold hover:bg-teal-dark transition-colors">
                              ✓ Approve
                            </button>
                            <button onClick={() => handleComment(c.id, 'reject')}
                              className="bg-red-50 text-red-500 border border-red-200 px-3.5 py-2 rounded-full text-[0.78rem] font-semibold hover:bg-red-100 transition-colors">
                              🗑 Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
        {/* ── Story of the Week section ────────────────────────────── */}
        {section === 'story' && (
          <div className="space-y-6">
            {/* Current featured story */}
            <div className="bg-white rounded-[20px] border border-amber/40 shadow-card p-6">
              <h2 className="font-display font-semibold text-[1.05rem] text-charcoal mb-4 flex items-center gap-2">
                📖 This Week&apos;s Featured Story
              </h2>
              {storyLoading ? (
                <div className="flex gap-1.5 py-4">
                  {[0,1,2].map(i => <span key={i} className="w-2 h-2 rounded-full bg-amber animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}
                </div>
              ) : currentStory ? (
                <div className="bg-[#FFF8EC] rounded-[14px] border border-amber/20 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide bg-amber/20 text-amber-700">
                      {currentStoryType === 'community' ? 'Community Post' : 'Blog Post'}
                    </span>
                  </div>
                  <p className="font-display font-semibold text-[1.05rem] text-charcoal mb-1">{currentStory.title}</p>
                  <p className="text-[0.82rem] text-text-xlight">
                    By <strong className="text-text-mid">{currentStory.user?.name ?? currentStory.author ?? 'Anonymous'}</strong>
                    {' · '}ID: <code className="bg-slate-100 px-1 rounded text-[0.72rem]">{currentStory.id}</code>
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-[2rem] mb-2">📭</p>
                  <p className="text-text-mid font-semibold text-[0.88rem]">No story featured this week yet.</p>
                  <p className="text-text-xlight text-[0.78rem] mt-1">Use the form below to pick one.</p>
                </div>
              )}
            </div>

            {/* Feature a new story */}
            <div className="bg-white rounded-[20px] border border-teal-light shadow-card p-6">
              <h2 className="font-display font-semibold text-[1.05rem] text-charcoal mb-1">Feature a Story</h2>
              <p className="text-[0.78rem] text-text-xlight mb-5">
                Enter the Post ID and select whether it&apos;s a Community post or a Blog post. Any existing featured story this week will be replaced.
              </p>
              <form onSubmit={featureStory} className="space-y-4">
                <div>
                  <label className="block text-[0.78rem] font-semibold text-charcoal mb-1.5">Post ID</label>
                  <input
                    type="number"
                    value={storyPostId}
                    onChange={e => setStoryPostId(e.target.value)}
                    placeholder="e.g. 42"
                    className="w-full max-w-[240px] border border-teal-light rounded-[10px] px-4 py-2.5 text-[0.88rem] outline-none focus:border-teal-mid bg-teal-ghost/20"
                  />
                </div>
                <div>
                  <p className="text-[0.78rem] font-semibold text-charcoal mb-2">Post Type</p>
                  <div className="flex gap-4">
                    {(['community', 'blog'] as const).map(t => (
                      <label key={t} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="postType"
                          value={t}
                          checked={storyPostType === t}
                          onChange={() => setStoryPostType(t)}
                          className="accent-teal-deep"
                        />
                        <span className="text-[0.85rem] text-text-mid capitalize">{t} post</span>
                      </label>
                    ))}
                  </div>
                </div>
                {storyMsg && (
                  <p className={`text-[0.82rem] font-semibold ${storyMsg.startsWith('✓') ? 'text-teal-deep' : 'text-red-500'}`}>
                    {storyMsg}
                  </p>
                )}
                <button
                  type="submit"
                  className="bg-amber text-charcoal px-6 py-2.5 rounded-full text-[0.85rem] font-semibold hover:bg-amber-soft hover:-translate-y-0.5 transition-all"
                >
                  ⭐ Feature this story
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── Recent Signups ───────────────────────────────────────── */}
        {section === 'new-users' && (
          <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h2 className="font-display font-bold text-[1.1rem] text-charcoal">Recent Signups</h2>
                <p className="text-text-xlight text-[0.78rem] mt-0.5">Latest 20 users · newest first · click a name to manage them</p>
              </div>
              <button onClick={() => router.push('/admin/users')}
                className="px-4 py-2 rounded-full border border-purple-200 text-purple-700 text-[0.82rem] font-semibold hover:bg-purple-50 transition-colors">
                Full User Management →
              </button>
            </div>

            {ruLoading ? (
              <div className="flex justify-center py-12">
                <div className="flex gap-1.5">{[0,1,2].map(i => <span key={i} className="w-2 h-2 rounded-full bg-teal-mid animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}</div>
              </div>
            ) : (
              <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm overflow-hidden">
                {recentUsers.length === 0 ? (
                  <p className="text-center py-12 text-text-xlight">No users found</p>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {recentUsers.map((u, i) => {
                      const joinedAgo = timeAgo(u.createdAt)
                      const isNew = Date.now() - new Date(u.createdAt).getTime() < 7 * 86400000
                      return (
                        <div key={u.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/60 transition-colors">
                          {/* Rank */}
                          <span className="text-[0.72rem] font-bold text-text-xlight w-5 text-right flex-shrink-0">{i + 1}</span>

                          {/* Avatar */}
                          {u.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={u.avatarUrl} alt={u.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-teal-light" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-mid to-teal-deep flex items-center justify-center text-white font-bold text-[0.9rem] flex-shrink-0">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                          )}

                          {/* Name + email */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-[0.88rem] text-charcoal leading-none truncate">{u.name}</p>
                              {isNew && (
                                <span className="bg-green-100 text-green-700 text-[0.62rem] font-bold px-2 py-0.5 rounded-full flex-shrink-0">🆕 New</span>
                              )}
                            </div>
                            <p className="text-[0.72rem] text-text-xlight mt-0.5 truncate">{u.email}</p>
                          </div>

                          {/* Joined */}
                          <div className="text-right flex-shrink-0 hidden sm:block">
                            <p className="text-[0.78rem] font-semibold text-charcoal">{joinedAgo}</p>
                            <p className="text-[0.68rem] text-text-xlight">joined</p>
                          </div>

                          {/* Activity pills */}
                          <div className="flex gap-1.5 flex-shrink-0">
                            {u.currentStreak > 0 && (
                              <span className="bg-amber/10 text-amber text-[0.68rem] font-bold px-2 py-0.5 rounded-full">🔥 {u.currentStreak}d</span>
                            )}
                            {u._count.posts > 0 && (
                              <span className="bg-teal-ghost text-teal-deep text-[0.68rem] font-bold px-2 py-0.5 rounded-full">💬 {u._count.posts}</span>
                            )}
                          </div>

                          {/* Manage link */}
                          <button
                            onClick={() => router.push('/admin/users')}
                            className="flex-shrink-0 text-[0.72rem] text-text-xlight hover:text-teal-deep transition-colors px-2 py-1 rounded-lg hover:bg-teal-ghost">
                            Manage →
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Launch Signups (pre-launch leads) ────────────────────── */}
        {section === 'leads' && (
          <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h2 className="font-display font-bold text-[1.1rem] text-charcoal">🚀 Launch Signups</h2>
                <p className="text-text-xlight text-[0.78rem] mt-0.5">
                  Pre-launch landing-page leads · {leads.length} collected ·
                  {' '}{leads.filter(l => l.registered).length} became members
                </p>
              </div>
              <button
                onClick={() => {
                  const csv = ['email,country,source,date',
                    ...leads.map(l => `${l.email},${l.countryName ?? ''},${l.source},${new Date(l.createdAt).toISOString().slice(0, 10)}`),
                  ].join('\n')
                  const a = document.createElement('a')
                  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
                  a.download = 'launch-signups.csv'
                  a.click()
                  URL.revokeObjectURL(a.href)
                }}
                disabled={leads.length === 0}
                className="px-4 py-2 rounded-full border border-sky-200 text-sky-700 text-[0.82rem] font-semibold hover:bg-sky-50 transition-colors disabled:opacity-50">
                ⬇️ Export CSV
              </button>
            </div>

            {leadsLoading ? (
              <div className="flex justify-center py-12">
                <div className="flex gap-1.5">{[0,1,2].map(i => <span key={i} className="w-2 h-2 rounded-full bg-teal-mid animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}</div>
              </div>
            ) : (
              <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm overflow-hidden">
                {leads.length === 0 ? (
                  <p className="text-center py-12 text-text-xlight">No launch signups found</p>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {leads.map((l, i) => (
                      <div key={l.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/60 transition-colors">
                        <span className="text-[0.72rem] font-bold text-text-xlight w-5 text-right flex-shrink-0">{i + 1}</span>
                        <div className="w-9 h-9 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center text-[0.95rem] flex-shrink-0">
                          ✉️
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-[0.88rem] text-charcoal leading-none truncate">{l.email}</p>
                            {l.registered && (
                              <span className="bg-green-100 text-green-700 text-[0.62rem] font-bold px-2 py-0.5 rounded-full flex-shrink-0">✓ Member</span>
                            )}
                          </div>
                          <p className="text-[0.72rem] text-text-xlight mt-0.5">
                            {l.countryName ?? 'Unknown location'} · via {l.source.replace(/_/g, ' ')}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0 hidden sm:block">
                          <p className="text-[0.78rem] font-semibold text-charcoal">{timeAgo(l.createdAt)}</p>
                          <p className="text-[0.68rem] text-text-xlight">signed up</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
