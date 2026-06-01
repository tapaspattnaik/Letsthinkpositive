'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Circle {
  id: number; slug: string; name: string; description: string
  icon: string; memberCount: number; postCount: number; isMember: boolean
  memberRole?: string  // 'admin' | 'member' | undefined
}

const ICON_OPTIONS = ['🌿','💛','🧘','🌙','🔥','💙','🌸','🏃','📓','🎨','🌍','💪','🌱','🎵','🍃','✨','🤝','💬','🦋','☀️']

export default function CirclesPage() {
  const { data: session } = useSession()
  const [circles,       setCircles]       = useState<Circle[]>([])
  const [joining,       setJoining]       = useState<string | null>(null)
  const [leaving,       setLeaving]       = useState<string | null>(null)
  const [confirmLeave,  setConfirmLeave]  = useState<string | null>(null)
  const [loading,       setLoading]       = useState(true)
  const [joinError,     setJoinError]     = useState<string | null>(null)

  // Create circle modal state
  const [showCreate,   setShowCreate]   = useState(false)
  const [newName,      setNewName]      = useState('')
  const [newDesc,      setNewDesc]      = useState('')
  const [newIcon,      setNewIcon]      = useState('🌿')
  const [newPrivate,   setNewPrivate]   = useState(true)
  const [creating,     setCreating]     = useState(false)
  const [createErr,    setCreateErr]    = useState('')

  const fetchCircles = async () => {
    try {
      const res = await fetch('/api/circles')
      const ct  = res.headers.get('content-type') ?? ''
      if (res.ok && ct.includes('application/json')) {
        const d = await res.json()
        if (Array.isArray(d)) setCircles(d)
      }
    } catch { /* network error — keep existing circles */ }
    finally { setLoading(false) }
  }

  // Re-fetch when session is confirmed so isMember reflects the logged-in user
  useEffect(() => { fetchCircles() }, [session?.user?.id])

  async function createCircle(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) { setCreateErr('Please enter a name.'); return }
    if (!newDesc.trim()) { setCreateErr('Please enter a description.'); return }
    setCreating(true); setCreateErr('')
    const res  = await fetch('/api/circles', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, description: newDesc, icon: newIcon, isPrivate: newPrivate }),
    })
    const data = await res.json()
    if (!res.ok) { setCreateErr(data.error || 'Something went wrong.'); setCreating(false); return }
    // Add to top and close
    setCircles(prev => [data, ...prev])
    setShowCreate(false)
    setNewName(''); setNewDesc(''); setNewIcon('🌿'); setNewPrivate(true)
    setCreating(false)
  }

  async function join(slug: string) {
    if (!session) return
    setJoining(slug)
    setJoinError(null)
    try {
      const res  = await fetch(`/api/circles/${slug}/join`, { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setJoinError(data.error || 'Could not join. Please try again.')
        setTimeout(() => setJoinError(null), 4000)
      } else {
        await fetchCircles()
      }
    } catch {
      setJoinError('Network error. Please check your connection.')
      setTimeout(() => setJoinError(null), 4000)
    } finally {
      setJoining(null)
    }
  }

  async function leave(slug: string) {
    if (!session) return
    setLeaving(slug)
    await fetch(`/api/circles/${slug}/leave`, { method: 'POST' })
    await fetchCircles()
    setLeaving(null)
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-deep to-teal-dark py-20 px-[5%] text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 text-amber-soft text-[0.75rem] font-semibold tracking-[0.18em] uppercase mb-4">
            <span className="w-6 h-0.5 bg-amber rounded" /> Circles
          </div>
          <h1 className="font-display text-[clamp(2rem,3.5vw,3rem)] font-bold leading-snug mb-4">
            Private spaces for <em className="italic text-amber-soft">real conversations.</em>
          </h1>
          <p className="text-white/72 text-[1.05rem] leading-[1.8] max-w-[520px] mb-6">
            Circles are small, closed groups built around a shared practice. Join one, share freely, and connect with people on the same path.
          </p>
          <div className="flex gap-3 flex-wrap">
            {session ? (
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 bg-amber text-charcoal px-6 py-2.5 rounded-full font-semibold text-[0.9rem] hover:bg-amber-soft hover:-translate-y-0.5 transition-all shadow-md">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                Create a Circle
              </button>
            ) : (
              <>
                <Link href="/register" className="bg-amber text-charcoal px-6 py-2.5 rounded-full font-semibold text-[0.9rem] no-underline hover:bg-amber-soft transition-colors">
                  Join free →
                </Link>
                <Link href="/login" className="border border-white/30 text-white px-6 py-2.5 rounded-full font-medium text-[0.9rem] no-underline hover:border-white transition-colors">
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Join error toast */}
      {joinError && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-full shadow-lift text-[0.88rem] font-semibold animate-fade-in">
          ⚠️ {joinError}
        </div>
      )}

      <div className="max-w-6xl mx-auto py-14 px-[5%]">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="flex gap-1.5">
              {[0,1,2].map(i => <span key={i} className="w-2 h-2 rounded-full bg-teal-mid animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}
            </div>
          </div>
        ) : circles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-[4rem] mb-4">🔒</span>
            <h2 className="font-display text-[1.4rem] text-charcoal font-bold mb-2">Circles are coming soon</h2>
            <p className="text-text-mid text-[0.92rem] max-w-[380px] leading-[1.75] mb-6">
              We&apos;re setting up private group spaces for the community. Check back soon — or{' '}
              <Link href="/community" className="text-teal-mid font-semibold hover:text-teal-deep no-underline">visit the community</Link>{' '}
              in the meantime.
            </p>
            <Link href="/community" className="bg-teal-deep text-white px-6 py-3 rounded-full font-semibold text-[0.9rem] no-underline hover:bg-teal-dark transition-colors">
              Go to Community →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {circles.map(c => (
              <div key={c.id} className="bg-white border border-teal-light rounded-[24px] p-8 flex flex-col hover:shadow-lift transition-all">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <span className="text-[2.8rem]">{c.icon}</span>
                  {c.isMember && (
                    <span className="bg-teal-ghost text-teal-deep text-[0.7rem] font-bold px-3 py-1 rounded-full tracking-wide flex-shrink-0">
                      ✓ Member
                    </span>
                  )}
                </div>
                <h2 className="font-display text-[1.25rem] font-bold text-charcoal mb-2">{c.name}</h2>
                <p className="text-text-mid text-[0.9rem] leading-[1.75] mb-5 flex-1">{c.description}</p>

                <div className="flex items-center gap-4 text-[0.78rem] text-text-xlight mb-5">
                  <span>👥 {c.memberCount} {c.memberCount === 1 ? 'member' : 'members'}</span>
                  <span>·</span>
                  <span>💬 {c.postCount} {c.postCount === 1 ? 'post' : 'posts'}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">🔒 Private</span>
                </div>

                {c.isMember ? (
                  <div className="flex gap-2">
                    <Link href={`/circles/${c.slug}`}
                      className="flex-1 text-center bg-teal-deep text-white py-3 rounded-full font-semibold text-[0.9rem] no-underline hover:bg-teal-dark transition-colors">
                      Enter Circle →
                    </Link>
                    {/* Admins/creators see "Owner" badge instead of Leave */}
                    {c.memberRole === 'admin' ? (
                      <span className="px-4 py-3 rounded-full bg-amber/15 text-amber text-[0.78rem] font-bold flex items-center">
                        👑 Owner
                      </span>
                    ) : confirmLeave === c.slug ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => { setConfirmLeave(null); leave(c.slug) }}
                          disabled={leaving === c.slug}
                          className="px-3 py-2 rounded-full border border-red-300 bg-red-50 text-red-500 text-[0.78rem] font-semibold hover:bg-red-100 disabled:opacity-50 transition-colors">
                          Leave
                        </button>
                        <button onClick={() => setConfirmLeave(null)}
                          className="px-3 py-2 rounded-full border border-teal-light text-text-mid text-[0.78rem] font-semibold hover:bg-teal-ghost transition-colors">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmLeave(c.slug)}
                        className="px-4 py-3 rounded-full border border-red-200 text-red-400 text-[0.82rem] font-semibold hover:bg-red-50 hover:border-red-300 transition-colors">
                        Leave
                      </button>
                    )}
                  </div>
                ) : session ? (
                  <button onClick={() => join(c.slug)} disabled={joining === c.slug}
                    className="w-full border-2 border-teal-mid text-teal-deep py-3 rounded-full font-semibold text-[0.9rem] hover:bg-teal-ghost disabled:opacity-60 transition-colors">
                    {joining === c.slug ? 'Joining…' : 'Join this Circle'}
                  </button>
                ) : (
                  <Link href="/register"
                    className="block w-full text-center border-2 border-teal-mid text-teal-deep py-3 rounded-full font-semibold text-[0.9rem] no-underline hover:bg-teal-ghost transition-colors">
                    Sign up to join
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Create Circle Modal ───────────────────────────────────── */}
      {showCreate && (
        <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-[28px] w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-7 pt-7 pb-4">
              <div>
                <h2 className="font-display text-[1.3rem] font-bold text-charcoal">Create a Circle</h2>
                <p className="text-text-xlight text-[0.78rem]">Build a private space for a shared practice</p>
              </div>
              <button onClick={() => setShowCreate(false)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-teal-ghost transition-colors text-text-mid">✕</button>
            </div>

            <form onSubmit={createCircle} className="px-7 pb-7 space-y-5">
              {/* Icon picker */}
              <div>
                <label className="block text-[0.78rem] font-semibold text-teal-deep mb-2">Choose an icon</label>
                <div className="flex flex-wrap gap-2">
                  {ICON_OPTIONS.map(icon => (
                    <button key={icon} type="button" onClick={() => setNewIcon(icon)}
                      className={`w-10 h-10 rounded-[10px] text-[1.4rem] flex items-center justify-center transition-all
                        ${newIcon === icon ? 'bg-teal-deep shadow-md scale-110' : 'bg-teal-ghost hover:bg-teal-light/40'}`}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-[0.78rem] font-semibold text-teal-deep mb-1.5">
                  Circle name * <span className="text-text-xlight font-normal">({newName.length}/60)</span>
                </label>
                <input
                  value={newName} onChange={e => setNewName(e.target.value)} maxLength={60}
                  placeholder="e.g. Morning Gratitude, Anxiety Support, Book Lovers…"
                  className="w-full border border-teal-light rounded-[14px] px-4 py-2.5 text-[0.93rem] outline-none focus:border-teal-mid bg-ivory transition-colors" />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[0.78rem] font-semibold text-teal-deep mb-1.5">Description *</label>
                <textarea
                  value={newDesc} onChange={e => setNewDesc(e.target.value)} maxLength={500} rows={3}
                  placeholder="What is this circle about? Who should join? What will members share?"
                  className="w-full border border-teal-light rounded-[14px] px-4 py-2.5 text-[0.93rem] outline-none focus:border-teal-mid bg-ivory resize-none transition-colors" />
              </div>

              {/* Privacy toggle */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input type="checkbox" checked={newPrivate} onChange={e => setNewPrivate(e.target.checked)} className="sr-only peer" />
                  <div className={`w-11 h-6 rounded-full transition-colors ${newPrivate ? 'bg-teal-deep' : 'bg-teal-light'}`} />
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${newPrivate ? 'translate-x-5' : ''}`} />
                </div>
                <div>
                  <p className="text-[0.85rem] font-semibold text-charcoal">{newPrivate ? '🔒 Private circle' : '🌍 Public circle'}</p>
                  <p className="text-[0.72rem] text-text-xlight">{newPrivate ? 'Members must join to see posts' : 'Anyone can read posts'}</p>
                </div>
              </label>

              {/* Preview */}
              <div className="bg-teal-ghost/50 border border-teal-light rounded-[16px] p-4 flex items-center gap-3">
                <span className="text-[2rem]">{newIcon}</span>
                <div>
                  <p className="font-bold text-charcoal text-[0.95rem]">{newName || 'Your circle name'}</p>
                  <p className="text-text-xlight text-[0.75rem]">You · 1 member · 0 posts</p>
                </div>
              </div>

              {createErr && <p className="text-red-500 text-[0.82rem] text-center">{createErr}</p>}

              <button type="submit" disabled={creating}
                className="w-full bg-teal-deep text-white py-3.5 rounded-full font-bold text-[0.95rem] hover:bg-teal-dark disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                {creating
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating…</>
                  : `${newIcon} Create Circle`}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
