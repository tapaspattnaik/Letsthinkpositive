'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface TribeMember {
  id: number; name: string; avatarUrl: string | null; bio: string | null
  interests: string; currentStreak: number
  _count: { badges: number; followers: number; posts?: number }
}
interface FeedPost {
  id: number; title: string; body: string; createdAt: string; tags: string; likes: number
  user: { id: number; name: string; avatarUrl: string | null }
}
interface TribeData {
  following: TribeMember[]; followers: TribeMember[]
  suggestions: TribeMember[]; feed: FeedPost[]
}

type Tab = 'feed' | 'following' | 'followers' | 'discover'

function Avatar({ src, name, size = 44 }: { src?: string|null; name: string; size?: number }) {
  if (src) return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={name} referrerPolicy="no-referrer"
      className="rounded-full object-cover flex-shrink-0 border-2 border-white shadow-sm"
      style={{ width: size, height: size }} />
  )
  return (
    <div className="rounded-full bg-gradient-to-br from-teal-mid to-teal-deep flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

function MemberCard({ member, showFollow = true }: { member: TribeMember; showFollow?: boolean }) {
  const [following, setFollowing] = useState<boolean | null>(null)
  const [loading,   setLoading]   = useState(false)

  useEffect(() => {
    fetch(`/api/follow/${member.id}`)
      .then(r => r.json())
      .then(d => setFollowing(d.isFollowing))
      .catch(() => {})
  }, [member.id])

  async function toggle() {
    setLoading(true)
    const res = await fetch(`/api/follow/${member.id}`, { method: 'POST' })
    if (res.ok) { const d = await res.json(); setFollowing(d.following) }
    setLoading(false)
  }

  const interests = member.interests?.split(',').filter(Boolean).slice(0, 3) ?? []

  return (
    <div className="bg-white border border-teal-light rounded-[18px] p-4 flex items-start gap-3 hover:shadow-card hover:border-teal-mid transition-all">
      <Link href={`/profile/${member.id}`} className="no-underline flex-shrink-0">
        <Avatar src={member.avatarUrl} name={member.name} size={48} />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={`/profile/${member.id}`}
              className="font-bold text-charcoal text-[0.92rem] no-underline hover:text-teal-deep transition-colors block truncate">
              {member.name}
            </Link>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {member.currentStreak > 0 && (
                <span className="text-amber text-[0.68rem] font-bold">🔥 {member.currentStreak}d</span>
              )}
              {member._count.badges > 0 && (
                <span className="text-teal-mid text-[0.68rem]">🏅 {member._count.badges}</span>
              )}
              <span className="text-text-xlight text-[0.68rem]">👥 {member._count.followers}</span>
            </div>
          </div>
          {showFollow && following !== null && (
            <button onClick={toggle} disabled={loading}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[0.75rem] font-bold transition-all disabled:opacity-50
                ${following
                  ? 'bg-teal-ghost text-teal-deep border border-teal-light hover:bg-red-50 hover:text-red-400 hover:border-red-200'
                  : 'bg-teal-deep text-white hover:bg-teal-dark'}`}>
              {loading ? '…' : following ? 'Connected ✓' : '+ Connect'}
            </button>
          )}
        </div>
        {member.bio && (
          <p className="text-text-xlight text-[0.76rem] mt-1 line-clamp-1">{member.bio}</p>
        )}
        {interests.length > 0 && (
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {interests.map(i => (
              <span key={i} className="bg-teal-ghost text-teal-deep text-[0.62rem] font-medium px-2 py-0.5 rounded-full">{i}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function timeAgo(d: string) {
  const hrs = Math.floor((Date.now() - new Date(d).getTime()) / 3600000)
  if (hrs < 1)  return 'Just now'
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export default function TribePage() {
  const { data: session, status } = useSession()
  const [data,    setData]    = useState<TribeData | null>(null)
  const [loading, setLoading] = useState(false)
  const [tab,     setTab]     = useState<Tab>('feed')

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/login?callbackUrl=/tribe'
    }
  }, [status])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const controller = new AbortController()
      const tid = setTimeout(() => controller.abort(), 12000) // 12s timeout
      const res = await fetch('/api/tribe', { signal: controller.signal })
      clearTimeout(tid)
      if (res.ok) {
        const d = await res.json()
        setData(d)
      } else {
        // Non-ok (401, 503 etc) — show empty state rather than infinite spinner
        setData({ following: [], followers: [], suggestions: [], feed: [] })
      }
    } catch {
      // Timeout or network error — show empty state
      setData({ following: [], followers: [], suggestions: [], feed: [] })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'authenticated') fetchData()
  }, [status, fetchData])

  const TABS: { key: Tab; label: string; icon: string; count?: number }[] = [
    { key: 'feed',      label: 'Tribe Feed',  icon: '🌿', count: data?.feed.length },
    { key: 'following', label: 'Connected',   icon: '🤝', count: data?.following.length },
    { key: 'followers', label: 'Following Me',icon: '👥', count: data?.followers.length },
    { key: 'discover',  label: 'Discover',    icon: '✨' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-ghost/50 to-ivory pt-[72px]">

      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-deep to-teal-dark py-12 px-[5%] text-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-amber-soft text-[0.72rem] font-bold tracking-widest uppercase mb-1">Your Wellness Community</p>
              <h1 className="font-display text-[2rem] sm:text-[2.4rem] font-bold leading-tight mb-2">
                My Tribe 🌿
              </h1>
              <p className="text-white/65 text-[0.95rem] max-w-[480px]">
                Connect with like-minded people on their wellness journey. Share, support, and grow together.
              </p>
            </div>
            {data && (
              <div className="flex gap-5 text-center bg-white/10 border border-white/20 rounded-[20px] px-6 py-4">
                <div>
                  <p className="font-display font-bold text-[1.8rem] text-amber leading-none">{data.following.length}</p>
                  <p className="text-white/60 text-[0.72rem] mt-0.5">Connected</p>
                </div>
                <div className="w-px bg-white/15" />
                <div>
                  <p className="font-display font-bold text-[1.8rem] text-white leading-none">{data.followers.length}</p>
                  <p className="text-white/60 text-[0.72rem] mt-0.5">Following you</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-[5%] py-6">

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-teal-light rounded-[18px] p-1.5 mb-6 shadow-card overflow-x-auto">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-[12px] text-[0.85rem] font-semibold whitespace-nowrap flex-1 justify-center transition-all
                ${tab === t.key ? 'bg-teal-deep text-white shadow-sm' : 'text-text-mid hover:text-charcoal hover:bg-teal-ghost'}`}>
              <span>{t.icon}</span>
              <span>{t.label}</span>
              {t.count !== undefined && t.count > 0 && (
                <span className={`text-[0.65rem] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center
                  ${tab === t.key ? 'bg-white/20 text-white' : 'bg-teal-ghost text-teal-deep'}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {(loading || status === 'loading') && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="flex gap-1.5">
              {[0,1,2].map(i => <span key={i} className="w-3 h-3 rounded-full bg-teal-mid animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}
            </div>
            <p className="text-text-xlight text-[0.8rem]">Loading your tribe…</p>
          </div>
        )}

        {!loading && data && (

          <>
            {/* ── Tribe Feed ──────────────────────────────────────── */}
            {tab === 'feed' && (
              <div className="space-y-4">
                {data.feed.length === 0 ? (
                  <div className="bg-white rounded-[20px] p-10 shadow-card border border-teal-light text-center">
                    <p className="text-[3rem] mb-3">🌱</p>
                    <p className="font-bold text-charcoal text-[1.1rem] mb-2">Your tribe feed is empty</p>
                    <p className="text-text-mid text-[0.88rem] mb-6 max-w-sm mx-auto">
                      Connect with more members to see their posts, stories and activities here.
                    </p>
                    <button onClick={() => setTab('discover')}
                      className="bg-teal-deep text-white px-6 py-3 rounded-full font-semibold text-[0.88rem] hover:bg-teal-dark transition-colors">
                      Discover Members →
                    </button>
                  </div>
                ) : (
                  data.feed.map(post => (
                    <div key={post.id} className="bg-white border border-teal-light rounded-[20px] p-5 shadow-card hover:shadow-lift transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <Link href={`/profile/${post.user.id}`} className="no-underline">
                          <Avatar src={post.user.avatarUrl} name={post.user.name} size={40} />
                        </Link>
                        <div>
                          <Link href={`/profile/${post.user.id}`}
                            className="font-bold text-charcoal text-[0.9rem] no-underline hover:text-teal-deep transition-colors">
                            {post.user.name}
                          </Link>
                          <p className="text-text-xlight text-[0.72rem]">{timeAgo(post.createdAt)}</p>
                        </div>
                        <Link href="/community"
                          className="ml-auto text-[0.72rem] bg-teal-ghost text-teal-deep font-semibold px-3 py-1 rounded-full no-underline hover:bg-teal-light/40 transition-colors">
                          Community
                        </Link>
                      </div>
                      <p className="font-bold text-charcoal text-[0.95rem] mb-1.5">{post.title}</p>
                      <p className="text-text-mid text-[0.85rem] leading-[1.7] line-clamp-3">
                        {post.body.replace(/<[^>]+>/g, '')}
                      </p>
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-teal-light/40">
                        <span className="text-text-xlight text-[0.78rem]">❤️ {post.likes} likes</span>
                        {post.tags && post.tags.split(',').filter(Boolean).slice(0,3).map(t => (
                          <span key={t} className="bg-amber/10 text-amber text-[0.68rem] font-medium px-2 py-0.5 rounded-full">#{t.trim()}</span>
                        ))}
                        <Link href="/community" className="ml-auto text-teal-mid text-[0.78rem] font-semibold no-underline hover:text-teal-deep">
                          Read more →
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── Connected (following) ───────────────────────────── */}
            {tab === 'following' && (
              <div>
                {data.following.length === 0 ? (
                  <div className="bg-white rounded-[20px] p-10 shadow-card border border-teal-light text-center">
                    <p className="text-[3rem] mb-3">🤝</p>
                    <p className="font-bold text-charcoal text-[1.1rem] mb-2">You haven&apos;t connected with anyone yet</p>
                    <p className="text-text-mid text-[0.88rem] mb-6">Discover members and start building your tribe!</p>
                    <button onClick={() => setTab('discover')}
                      className="bg-teal-deep text-white px-6 py-3 rounded-full font-semibold text-[0.88rem] hover:bg-teal-dark transition-colors">
                      Discover Members →
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {data.following.map(m => <MemberCard key={m.id} member={m} />)}
                  </div>
                )}
              </div>
            )}

            {/* ── Followers ───────────────────────────────────────── */}
            {tab === 'followers' && (
              <div>
                {data.followers.length === 0 ? (
                  <div className="bg-white rounded-[20px] p-10 shadow-card border border-teal-light text-center">
                    <p className="text-[3rem] mb-3">👥</p>
                    <p className="font-bold text-charcoal text-[1.1rem] mb-2">No one is following you yet</p>
                    <p className="text-text-mid text-[0.88rem]">Share your story in the community and connect with others to grow your tribe.</p>
                  </div>
                ) : (
                  <>
                    <p className="text-text-xlight text-[0.82rem] mb-4">
                      <strong className="text-charcoal">{data.followers.length}</strong> {data.followers.length === 1 ? 'person is' : 'people are'} following you
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {data.followers.map(m => <MemberCard key={m.id} member={m} />)}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── Discover ────────────────────────────────────────── */}
            {tab === 'discover' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-bold text-charcoal text-[1rem]">✨ Members You Might Know</h2>
                    <p className="text-text-xlight text-[0.78rem] mt-0.5">Based on shared interests and recent activity</p>
                  </div>
                  <Link href="/search?type=users"
                    className="text-teal-mid text-[0.8rem] font-semibold no-underline hover:text-teal-deep transition-colors">
                    Search all →
                  </Link>
                </div>

                {data.suggestions.length === 0 ? (
                  <div className="bg-white rounded-[20px] p-10 shadow-card border border-teal-light text-center">
                    <p className="text-[3rem] mb-3">🌍</p>
                    <p className="font-bold text-charcoal text-[1.1rem] mb-2">You&apos;ve connected with everyone nearby!</p>
                    <p className="text-text-mid text-[0.88rem]">Use search to find more members across the community.</p>
                    <Link href="/search?type=users"
                      className="inline-block mt-5 bg-teal-deep text-white px-6 py-3 rounded-full font-semibold text-[0.88rem] no-underline hover:bg-teal-dark transition-colors">
                      Search Members →
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {data.suggestions.map(m => <MemberCard key={m.id} member={m} />)}
                  </div>
                )}

                {/* Invite prompt */}
                <div className="mt-8 bg-gradient-to-r from-teal-deep to-teal-dark rounded-[20px] p-6 text-white text-center">
                  <p className="text-[1.5rem] mb-2">💌</p>
                  <p className="font-display font-bold text-[1.1rem] mb-2">Invite a friend to your tribe</p>
                  <p className="text-white/65 text-[0.85rem] mb-5">Wellness is better together. Share letsthinkpositive with someone who needs it.</p>
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: 'Join my tribe on letsthinkpositive', url: 'https://letsthinkpositive.com' })
                      } else {
                        navigator.clipboard.writeText('https://letsthinkpositive.com')
                      }
                    }}
                    className="bg-amber text-charcoal px-7 py-3 rounded-full font-bold text-[0.9rem] hover:bg-amber-soft transition-colors">
                    Share with a Friend →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
