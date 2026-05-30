'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { TIER_STYLES } from '@/lib/badges'

const INTERESTS = [
  'Mindfulness','Sleep','Gratitude','Anxiety Relief',
  'Movement','Affirmations','Self-Care','Meditation',
  'Journaling','Community','Kids Wellness','Creative Arts',
]

interface BadgeEntry {
  earnedAt: string
  badge: { slug: string; name: string; description: string; icon: string; tier: string }
}
interface ProgressEntry {
  id: number; challengeSlug: string; completedDays: string
  startedAt: string; completedAt: string | null
}
interface Circle {
  id: number; slug: string; name: string; icon: string; isMember: boolean
}
interface UserProfile {
  id: number; name: string; email: string; phone?: string; bio?: string
  interests: string; avatarUrl?: string; createdAt: string
  currentStreak?: number; longestStreak?: number
  badges: BadgeEntry[]
  progress: ProgressEntry[]
}

const CHALLENGE_META: Record<string, { icon: string; title: string; totalDays: number }> = {
  'gratitude-30':    { icon: '🍂', title: '30-Day Gratitude',           totalDays: 30 },
  'mindfulness-7':   { icon: '🧘', title: '7-Day Mindfulness',           totalDays: 7  },
  'movement-7':      { icon: '👣', title: '7 Days of Movement',          totalDays: 7  },
  'sleep-21':        { icon: '🌙', title: '21-Day Sleep Reset',          totalDays: 21 },
  'affirmations-21': { icon: '⭐', title: '21-Day Affirmations',         totalDays: 21 },
  'journal-14':      { icon: '📓', title: '14-Day Gratitude Journaling', totalDays: 14 },
}

const QUICK_TOOLS = [
  { href: '/mood',        icon: '📊', label: 'Mood Tracker',  desc: 'Log your mood' },
  { href: '/habits',      icon: '🎯', label: 'Habits',        desc: 'Daily habits'  },
  { href: '/breathing',   icon: '🌬️', label: 'Breathe',       desc: 'Calm now'      },
  { href: '/journal',     icon: '📓', label: 'Journal',       desc: 'Write today'   },
  { href: '/challenges',  icon: '🏆', label: 'Challenges',    desc: 'My progress'   },
  { href: '/community',   icon: '💛', label: 'Community',     desc: 'Share & connect'},
  { href: '/affirmation', icon: '💌', label: 'Affirmation',   desc: 'Daily card'    },
  { href: '/notifications',icon: '🔔',label: 'Notifications', desc: 'Updates'       },
]

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [profile,   setProfile]   = useState<UserProfile | null>(null)
  const [circles,   setCircles]   = useState<Circle[]>([])
  const [editing,   setEditing]   = useState(false)
  const [form,      setForm]      = useState({ name: '', phone: '', bio: '' })
  const [selected,  setSelected]  = useState<string[]>([])
  const [saving,    setSaving]    = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/profile').then(r => r.json()).then(data => {
      setProfile(data)
      setForm({ name: data.name, phone: data.phone ?? '', bio: data.bio ?? '' })
      setSelected(data.interests ? data.interests.split(',').filter(Boolean) : [])
    })
    fetch('/api/circles').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setCircles(data.filter((c: Circle) => c.isMember))
    })
  }, [status])

  async function saveProfile() {
    setSaving(true)
    const res = await fetch('/api/profile', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, interests: selected }),
    })
    const updated = await res.json()
    setProfile(p => p ? { ...p, ...updated } : p)
    setSaving(false); setSaved(true); setEditing(false)
    setTimeout(() => setSaved(false), 3000)
  }

  async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('avatar', file)
    const res  = await fetch('/api/profile/avatar', { method: 'POST', body: fd })
    const data = await res.json()
    if (data.avatarUrl) setProfile(p => p ? { ...p, avatarUrl: data.avatarUrl } : p)
    setUploading(false)
  }

  if (status === 'loading' || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-teal-ghost pt-[72px]">
        <div className="flex gap-1.5">
          {[0,1,2].map(i => <span key={i} className="w-2 h-2 rounded-full bg-teal-mid animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}
        </div>
      </div>
    )
  }

  const joinedYear = new Date(profile.createdAt).getFullYear()
  const interests  = profile.interests ? profile.interests.split(',').filter(Boolean) : []

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-ghost/60 to-ivory pt-[72px]">

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-teal-deep to-teal-dark text-white px-[5%] py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-white/60 text-[0.78rem] font-medium tracking-widest uppercase mb-1">Your space</p>
            <h1 className="font-display text-[1.8rem] sm:text-[2.2rem] font-bold leading-tight">
              Welcome back, {profile.name.split(' ')[0]} 👋
            </h1>
            <p className="text-white/60 text-[0.85rem] mt-1">{profile.email} · Member since {joinedYear}</p>
          </div>
          {/* Streak badge in header */}
          <div className="flex-shrink-0 text-center bg-white/10 border border-white/20 rounded-[20px] px-6 py-4 hidden sm:block">
            <span className="text-[2rem] block">🔥</span>
            <p className="text-white font-bold text-[1.4rem] leading-none">{profile.currentStreak ?? 0}</p>
            <p className="text-white/60 text-[0.72rem]">day streak</p>
            {(profile.longestStreak ?? 0) > 0 && (
              <p className="text-amber-soft text-[0.68rem] mt-0.5">Best: {profile.longestStreak}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-[5%] py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">

          {/* ══════════════════════════════════════════════════════════
              LEFT COLUMN — profile card + tools
          ══════════════════════════════════════════════════════════ */}
          <div className="space-y-5">

            {/* Profile card */}
            <div className="bg-white rounded-[24px] p-6 shadow-card border border-teal-light">
              <div className="flex items-start gap-5">
                {/* Avatar */}
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  <div className="relative w-[90px] h-[90px] rounded-full overflow-hidden border-4 border-teal-light bg-teal-ghost flex items-center justify-center">
                    {profile.avatarUrl
                      ? <Image src={profile.avatarUrl} alt="Avatar" fill className="object-cover" />
                      : <span className="text-[2.2rem]">🌿</span>}
                  </div>
                  <button onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="text-[0.73rem] text-teal-mid font-semibold hover:text-teal-deep transition-colors disabled:opacity-50 whitespace-nowrap">
                    {uploading ? 'Uploading…' : '📷 Change photo'}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
                </div>

                {/* Name + edit */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-display text-[1.25rem] font-bold text-charcoal leading-tight">{profile.name}</h2>
                    <button onClick={() => setEditing(true)}
                      className="text-[0.75rem] text-teal-mid font-semibold hover:text-teal-deep transition-colors flex-shrink-0 mt-0.5">
                      ✏️ Edit
                    </button>
                  </div>
                  {profile.bio && <p className="text-[0.83rem] text-text-mid leading-[1.65] mt-2">{profile.bio}</p>}
                  {saved && <p className="text-teal-mid text-[0.78rem] font-semibold mt-2">✓ Saved!</p>}
                </div>
              </div>

              {/* Interests */}
              {interests.length > 0 && !editing && (
                <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-teal-light">
                  {interests.map(i => (
                    <span key={i} className="bg-teal-ghost text-teal-deep text-[0.73rem] font-medium px-3 py-1 rounded-full">{i}</span>
                  ))}
                </div>
              )}

              {/* Edit form */}
              {editing && (
                <div className="mt-4 pt-4 border-t border-teal-light space-y-3">
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Full name"
                    className="w-full border border-teal-light rounded-[12px] px-3 py-2 text-[0.88rem] outline-none focus:border-teal-mid bg-ivory" />
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="Phone (optional)"
                    className="w-full border border-teal-light rounded-[12px] px-3 py-2 text-[0.88rem] outline-none focus:border-teal-mid bg-ivory" />
                  <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    placeholder="A little about you…" rows={3}
                    className="w-full border border-teal-light rounded-[12px] px-3 py-2 text-[0.88rem] outline-none focus:border-teal-mid bg-ivory resize-none" />
                  <div>
                    <p className="text-[0.75rem] font-semibold text-teal-deep mb-2">Interests</p>
                    <div className="flex flex-wrap gap-1.5">
                      {INTERESTS.map(i => (
                        <button key={i} type="button"
                          onClick={() => setSelected(s => s.includes(i) ? s.filter(x => x !== i) : [...s, i])}
                          className={`px-3 py-1 rounded-full border text-[0.75rem] font-medium transition-all
                            ${selected.includes(i) ? 'bg-teal-deep text-white border-teal-deep' : 'bg-teal-ghost text-text-mid border-teal-light'}`}>
                          {i}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveProfile} disabled={saving}
                      className="bg-teal-deep text-white px-5 py-2 rounded-full text-[0.83rem] font-semibold hover:bg-teal-dark disabled:opacity-60 transition-colors">
                      {saving ? 'Saving…' : 'Save changes'}
                    </button>
                    <button onClick={() => setEditing(false)}
                      className="border border-teal-light text-text-mid px-5 py-2 rounded-full text-[0.83rem] hover:bg-teal-ghost transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Streak — mobile only (desktop shows in header) */}
            <div className="sm:hidden bg-gradient-to-br from-teal-deep to-teal-dark rounded-[20px] p-5 text-center">
              <span className="text-[2rem] block">🔥</span>
              <p className="text-white font-bold text-[1.6rem] leading-none">{profile.currentStreak ?? 0}</p>
              <p className="text-white/60 text-[0.75rem] mt-0.5">day streak</p>
            </div>

            {/* Quick tools grid */}
            <div className="bg-white rounded-[24px] p-5 shadow-card border border-teal-light">
              <h3 className="font-semibold text-charcoal text-[0.9rem] mb-4">Quick Access</h3>
              <div className="grid grid-cols-4 lg:grid-cols-4 gap-2">
                {QUICK_TOOLS.map(({ href, icon, label }) => (
                  <Link key={href} href={href}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-[14px] no-underline hover:bg-teal-ghost transition-all group text-center">
                    <span className="text-[1.6rem]">{icon}</span>
                    <span className="text-[0.68rem] font-semibold text-text-mid group-hover:text-teal-deep transition-colors leading-tight">{label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Sign out */}
            <div className="text-center pb-2">
              <button onClick={() => signOut({ callbackUrl: '/' })}
                className="text-[0.8rem] text-text-xlight hover:text-red-400 transition-colors">
                🚪 Sign out
              </button>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              RIGHT COLUMN — badges, circles, challenges
          ══════════════════════════════════════════════════════════ */}
          <div className="space-y-5">

            {/* Badges */}
            <div className="bg-white rounded-[24px] p-6 shadow-card border border-teal-light">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-display text-[1.2rem] font-bold text-charcoal">My Badges</h2>
                  <p className="text-[0.78rem] text-text-xlight mt-0.5">Earned by completing challenges and being part of this community.</p>
                </div>
                <span className="text-[1.6rem]">🏅</span>
              </div>

              {profile.badges.length === 0 ? (
                <div className="flex flex-col sm:flex-row items-center gap-5 bg-teal-ghost/40 rounded-[18px] p-6">
                  <div className="text-[3rem] flex-shrink-0">🏅</div>
                  <div className="text-center sm:text-left">
                    <p className="font-semibold text-charcoal text-[0.95rem] mb-1">No badges yet</p>
                    <p className="text-text-mid text-[0.85rem] mb-3">Start a challenge to earn your first badge!</p>
                    <Link href="/challenges"
                      className="inline-block bg-teal-deep text-white px-5 py-2 rounded-full text-[0.85rem] font-semibold no-underline hover:bg-teal-dark transition-colors">
                      Browse Challenges →
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                  {profile.badges.map(({ badge, earnedAt }) => {
                    const style = TIER_STYLES[badge.tier] ?? TIER_STYLES.bronze
                    return (
                      <div key={badge.slug} className={`${style.bg} border-2 ${style.border} rounded-[18px] p-4 text-center`}>
                        <span className="text-[2rem] block mb-2">{badge.icon}</span>
                        <p className={`font-bold text-[0.85rem] ${style.text} leading-tight mb-1`}>{badge.name}</p>
                        <p className="text-[0.7rem] text-text-xlight leading-snug mb-2">{badge.description}</p>
                        <span className={`text-[0.65rem] font-bold uppercase tracking-widest ${style.text} opacity-70`}>{style.label}</span>
                        <p className="text-[0.65rem] text-text-xlight mt-1">
                          {new Date(earnedAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Active Challenges */}
            {profile.progress.length > 0 && (
              <div className="bg-white rounded-[24px] p-6 shadow-card border border-teal-light">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-display text-[1.2rem] font-bold text-charcoal">Active Challenges</h2>
                    <p className="text-[0.78rem] text-text-xlight mt-0.5">Your ongoing wellness journeys.</p>
                  </div>
                  <Link href="/challenges" className="text-[0.8rem] text-teal-mid hover:text-teal-deep font-semibold no-underline transition-colors">
                    All →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {profile.progress.map(p => {
                    const meta = CHALLENGE_META[p.challengeSlug]
                    if (!meta) return null
                    const days   = JSON.parse(p.completedDays) as string[]
                    const pct    = Math.round((days.length / meta.totalDays) * 100)
                    const isDone = !!p.completedAt
                    return (
                      <div key={p.id} className="flex items-center gap-4 bg-teal-ghost/30 rounded-[16px] px-4 py-4">
                        <span className="text-[1.8rem] flex-shrink-0">{meta.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <p className="font-semibold text-[0.88rem] text-charcoal truncate">{meta.title}</p>
                            {isDone
                              ? <span className="text-[0.68rem] font-bold text-teal-deep bg-teal-ghost px-2 py-0.5 rounded-full flex-shrink-0">Done 🎉</span>
                              : <span className="text-[0.72rem] text-text-xlight flex-shrink-0">{days.length}/{meta.totalDays}d</span>
                            }
                          </div>
                          <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                            <div className="h-full bg-teal-mid rounded-full transition-all duration-500" style={{ width: `${isDone ? 100 : pct}%` }} />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* My Circles */}
            <div className="bg-white rounded-[24px] p-6 shadow-card border border-teal-light">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-display text-[1.2rem] font-bold text-charcoal">My Circles</h2>
                  <p className="text-[0.78rem] text-text-xlight mt-0.5">Private groups you&apos;ve joined.</p>
                </div>
                <Link href="/circles" className="text-[0.8rem] text-teal-mid hover:text-teal-deep font-semibold no-underline transition-colors">
                  Browse all →
                </Link>
              </div>
              {circles.length === 0 ? (
                <div className="flex flex-col sm:flex-row items-center gap-5 bg-teal-ghost/40 rounded-[18px] p-6">
                  <div className="text-[3rem] flex-shrink-0">🔒</div>
                  <div className="text-center sm:text-left">
                    <p className="font-semibold text-charcoal text-[0.95rem] mb-1">No circles yet</p>
                    <p className="text-text-mid text-[0.85rem] mb-3">Join a private group and connect with like-minded people.</p>
                    <Link href="/circles"
                      className="inline-block bg-teal-deep text-white px-5 py-2 rounded-full text-[0.85rem] font-semibold no-underline hover:bg-teal-dark transition-colors">
                      Find a Circle →
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {circles.map(c => (
                    <Link key={c.id} href={`/circles/${c.slug}`}
                      className="flex items-center gap-3 bg-teal-ghost/30 hover:bg-teal-ghost border border-teal-light hover:border-teal-mid rounded-[16px] px-4 py-3.5 no-underline transition-all group">
                      <span className="text-[1.6rem] flex-shrink-0">{c.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[0.88rem] text-charcoal group-hover:text-teal-deep transition-colors truncate">{c.name}</p>
                        <p className="text-[0.72rem] text-teal-mid font-medium">✓ Member</p>
                      </div>
                      <span className="text-text-xlight text-[0.8rem] flex-shrink-0">→</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
