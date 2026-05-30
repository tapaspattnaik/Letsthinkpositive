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
interface Circle { id: number; slug: string; name: string; icon: string; isMember: boolean }

interface FeedPost {
  id: number; type: 'community' | 'circle'
  title?: string; body: string; author?: string
  user: { id: number; name: string; avatarUrl: string | null } | null
  circle?: { slug: string; name: string; icon: string }
  tags?: string; likeCount: number; likedByMe: boolean
  commentCount?: number; createdAt: string
}
interface UserProfile {
  id: number; name: string; email: string; phone?: string; bio?: string
  interests: string; avatarUrl?: string; createdAt: string
  currentStreak?: number; longestStreak?: number
  badges: BadgeEntry[]; progress: ProgressEntry[]
}

const CHALLENGE_META: Record<string, { icon: string; title: string; totalDays: number; color: string }> = {
  'gratitude-30':    { icon: '🍂', title: '30-Day Gratitude',           totalDays: 30, color: 'from-amber/20 to-amber/5'   },
  'mindfulness-7':   { icon: '🧘', title: '7-Day Mindfulness',           totalDays: 7,  color: 'from-teal-ghost to-white'   },
  'movement-7':      { icon: '👣', title: '7 Days of Movement',          totalDays: 7,  color: 'from-teal-ghost to-white'   },
  'sleep-21':        { icon: '🌙', title: '21-Day Sleep Reset',          totalDays: 21, color: 'from-[#1A2B4A]/10 to-white' },
  'affirmations-21': { icon: '⭐', title: '21-Day Affirmations',         totalDays: 21, color: 'from-amber/15 to-white'     },
  'journal-14':      { icon: '📓', title: '14-Day Gratitude Journaling', totalDays: 14, color: 'from-teal-ghost to-white'   },
}

const QUICK_TOOLS = [
  { href: '/mood',         icon: '📊', label: 'Mood',        bg: 'bg-blue-50',   iconBg: 'bg-blue-100'   },
  { href: '/habits',       icon: '🎯', label: 'Habits',      bg: 'bg-orange-50', iconBg: 'bg-orange-100' },
  { href: '/journal',      icon: '📓', label: 'Journal',     bg: 'bg-teal-ghost',iconBg: 'bg-teal-light/40' },
  { href: '/breathing',    icon: '🌬️', label: 'Breathe',     bg: 'bg-sky-50',    iconBg: 'bg-sky-100'    },
  { href: '/meditation',   icon: '🧘', label: 'Meditate',    bg: 'bg-purple-50', iconBg: 'bg-purple-100' },
  { href: '/challenges',   icon: '🏆', label: 'Challenges',  bg: 'bg-amber/10',  iconBg: 'bg-amber/20'   },
  { href: '/affirmation',  icon: '💌', label: 'Affirm',      bg: 'bg-pink-50',   iconBg: 'bg-pink-100'   },
  { href: '/notifications',icon: '🔔', label: 'Alerts',      bg: 'bg-green-50',  iconBg: 'bg-green-100'  },
]

type Tab = 'overview' | 'badges' | 'challenges' | 'circles'

export default function ProfilePage() {
  // required:true → NextAuth auto-redirects to /login?callbackUrl=/profile if unauthenticated
  const { data: session, status } = useSession({ required: true })
  const router = useRouter()

  const [profile,     setProfile]     = useState<UserProfile | null>(null)
  const [circles,     setCircles]     = useState<Circle[]>([])
  const [feed,        setFeed]        = useState<FeedPost[]>([])
  const [feedLoading, setFeedLoading] = useState(false)
  const [feedFilter,  setFeedFilter]  = useState<'all' | 'community' | 'circles'>('all')
  const [editing,     setEditing]     = useState(false)
  const [form,        setForm]        = useState({ name: '', phone: '', bio: '' })
  const [selected,    setSelected]    = useState<string[]>([])
  const [saving,      setSaving]      = useState(false)
  const [saved,       setSaved]       = useState(false)
  const [uploading,   setUploading]   = useState(false)
  const [activeTab,   setActiveTab]   = useState<Tab>('overview')
  const fileRef = useRef<HTMLInputElement>(null)

  // Remove manual redirect — useSession({ required: true }) handles it with callbackUrl
  useEffect(() => {
    if (false) router.push('/login') // kept to avoid unused import warning
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/profile').then(r => r.json()).then(data => {
      setProfile(data)
      setForm({ name: data.name, phone: data.phone ?? '', bio: data.bio ?? '' })
      setSelected(data.interests ? data.interests.split(',').filter(Boolean) : [])
    })
    setFeedLoading(true)
    fetch('/api/feed/home').then(r => r.ok ? r.json() : { community: [], circles: [] }).then(data => {
      const combined: FeedPost[] = [
        ...(data.community ?? []),
        ...(data.circles ?? []),
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setFeed(combined)
      setFeedLoading(false)
    }).catch(() => setFeedLoading(false))
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
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-1.5">
            {[0,1,2].map(i => <span key={i} className="w-3 h-3 rounded-full bg-teal-mid animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}
          </div>
          <p className="text-text-xlight text-[0.85rem]">Loading your space…</p>
        </div>
      </div>
    )
  }

  const joinedDate    = new Date(profile.createdAt)
  const joinedYear    = joinedDate.getFullYear()
  const memberDays    = Math.floor((Date.now() - joinedDate.getTime()) / 86400000)
  const interests     = profile.interests ? profile.interests.split(',').filter(Boolean) : []
  const completedChallenges = profile.progress.filter(p => p.completedAt).length
  const activeChallenges    = profile.progress.filter(p => !p.completedAt)

  const TABS: { id: Tab; label: string; icon: string; count?: number }[] = [
    { id: 'overview',    label: 'Overview',   icon: '🏠' },
    { id: 'badges',      label: 'Badges',     icon: '🏅', count: profile.badges.length },
    { id: 'challenges',  label: 'Challenges', icon: '🏆', count: profile.progress.length },
    { id: 'circles',     label: 'Circles',    icon: '🔒', count: circles.length },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f9f7] to-ivory pt-[72px]">

      {/* ══════════════════════════════════════════════════════════
          HERO — cover + avatar + name + stats
      ══════════════════════════════════════════════════════════ */}
      <div className="relative">
        {/* Cover */}
        <div className="h-[160px] sm:h-[200px] bg-gradient-to-r from-teal-deep via-[#1a7a6e] to-teal-dark relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full bg-white/5" />
          <div className="absolute top-8 right-32 w-32 h-32 rounded-full bg-white/5" />
          <div className="absolute -bottom-6 left-20 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute top-4 left-1/3 w-20 h-20 rounded-full bg-amber/10" />
          {/* Edit profile button */}
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="absolute top-4 right-4 sm:right-6 flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/25 text-white text-[0.78rem] font-semibold px-4 py-2 rounded-full transition-all backdrop-blur-sm">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
              </svg>
              Edit Profile
            </button>
          )}
        </div>

        {/* Avatar + name — overlaps the cover */}
        <div className="max-w-7xl mx-auto px-[5%]">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-14 sm:-mt-16 pb-6 border-b border-teal-light/50">

            {/* Avatar */}
            <div className="relative flex-shrink-0 group">
              <div className="w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] rounded-full overflow-hidden border-4 border-white shadow-lift bg-teal-ghost flex items-center justify-center">
                {profile.avatarUrl
                  ? (
                    /* Use plain <img> to bypass Next.js domain restrictions for Google/external avatars */
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  )
                  : (
                    <div className="w-full h-full bg-gradient-to-br from-teal-mid to-teal-deep flex items-center justify-center">
                      <span className="text-white font-display font-bold text-[2.8rem]">{profile.name.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
              </div>
              {/* Upload overlay */}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 cursor-pointer">
                {uploading
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <>
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                    </svg>
                    <span className="text-white text-[0.62rem] font-semibold">Change</span>
                  </>
                }
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
            </div>

            {/* Name + meta */}
            <div className="flex-1 text-center sm:text-left sm:pb-2">
              <h1 className="font-display text-[1.7rem] sm:text-[2rem] font-bold text-charcoal leading-tight">
                {profile.name}
              </h1>
              <p className="text-text-xlight text-[0.83rem] mt-0.5">
                {profile.email} · Member since {joinedYear}
              </p>
              {profile.bio && (
                <p className="text-text-mid text-[0.88rem] mt-1.5 max-w-[500px] leading-[1.65]">{profile.bio}</p>
              )}
              {interests.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5 justify-center sm:justify-start">
                  {interests.slice(0, 5).map(i => (
                    <span key={i} className="bg-teal-ghost text-teal-deep text-[0.72rem] font-semibold px-2.5 py-1 rounded-full border border-teal-light">{i}</span>
                  ))}
                  {interests.length > 5 && (
                    <span className="text-text-xlight text-[0.72rem] px-2.5 py-1">+{interests.length - 5} more</span>
                  )}
                </div>
              )}
              {saved && (
                <div className="mt-2 inline-flex items-center gap-1.5 bg-teal-ghost text-teal-deep text-[0.78rem] font-semibold px-3 py-1.5 rounded-full">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  Profile saved!
                </div>
              )}
            </div>

            {/* Sign out — desktop right */}
            <div className="hidden sm:flex items-center gap-3 sm:pb-2 flex-shrink-0">
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-1.5 text-[0.78rem] text-text-xlight hover:text-red-400 transition-colors border border-transparent hover:border-red-200 px-3 py-1.5 rounded-full hover:bg-red-50">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                Sign out
              </button>
            </div>
          </div>

          {/* ── Stats bar ─────────────────────────────────────────── */}
          <div className="grid grid-cols-4 gap-3 py-5">
            {[
              { value: profile.currentStreak ?? 0, label: 'Day Streak',       icon: '🔥', color: 'text-orange-500' },
              { value: profile.badges.length,       label: 'Badges Earned',   icon: '🏅', color: 'text-amber'      },
              { value: completedChallenges,          label: 'Challenges Done', icon: '🏆', color: 'text-teal-deep'  },
              { value: memberDays,                   label: 'Days as Member',  icon: '🌱', color: 'text-green-600'  },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-[18px] p-4 text-center shadow-card border border-teal-light/60 hover:shadow-lift transition-shadow">
                <span className="text-[1.4rem] block mb-1">{s.icon}</span>
                <p className={`font-display font-bold text-[1.5rem] sm:text-[1.8rem] leading-none ${s.color}`}>{s.value}</p>
                <p className="text-text-xlight text-[0.65rem] sm:text-[0.72rem] mt-1 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit form modal */}
      {editing && (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-[28px] p-8 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-[1.3rem] font-bold text-charcoal">Edit Profile</h2>
              <button onClick={() => setEditing(false)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-teal-ghost transition-colors text-text-mid text-[1.1rem]">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[0.78rem] font-semibold text-teal-deep mb-1.5">Full name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-teal-light rounded-[14px] px-4 py-3 text-[0.93rem] outline-none focus:border-teal-mid bg-ivory transition-colors" />
              </div>
              <div>
                <label className="block text-[0.78rem] font-semibold text-teal-deep mb-1.5">Phone (optional)</label>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+44 7700 900000"
                  className="w-full border border-teal-light rounded-[14px] px-4 py-3 text-[0.93rem] outline-none focus:border-teal-mid bg-ivory transition-colors" />
              </div>
              <div>
                <label className="block text-[0.78rem] font-semibold text-teal-deep mb-1.5">Bio</label>
                <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  placeholder="A little about you — what brings you here?"
                  rows={3}
                  className="w-full border border-teal-light rounded-[14px] px-4 py-3 text-[0.93rem] outline-none focus:border-teal-mid bg-ivory resize-none transition-colors" />
              </div>
              <div>
                <label className="block text-[0.78rem] font-semibold text-teal-deep mb-2">Interests</label>
                <div className="flex flex-wrap gap-1.5">
                  {INTERESTS.map(i => (
                    <button key={i} type="button"
                      onClick={() => setSelected(s => s.includes(i) ? s.filter(x => x !== i) : [...s, i])}
                      className={`px-3 py-1.5 rounded-full border text-[0.78rem] font-medium transition-all
                        ${selected.includes(i) ? 'bg-teal-deep text-white border-teal-deep shadow-sm' : 'bg-teal-ghost text-text-mid border-teal-light hover:border-teal-mid'}`}>
                      {i}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={saveProfile} disabled={saving}
                className="flex-1 bg-teal-deep text-white py-3 rounded-full font-semibold text-[0.93rem] hover:bg-teal-dark disabled:opacity-60 transition-colors">
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              <button onClick={() => setEditing(false)}
                className="px-6 py-3 border border-teal-light text-text-mid rounded-full font-semibold text-[0.93rem] hover:bg-teal-ghost transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-[5%] pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">

          {/* ── LEFT SIDEBAR ──────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Quick tools */}
            <div className="bg-white rounded-[24px] p-5 shadow-card border border-teal-light/60">
              <h3 className="font-display font-bold text-charcoal text-[1rem] mb-4">Your Wellness Tools</h3>
              <div className="grid grid-cols-4 gap-2">
                {QUICK_TOOLS.map(({ href, icon, label, bg, iconBg }) => (
                  <Link key={href} href={href}
                    className={`flex flex-col items-center gap-2 p-2.5 rounded-[14px] no-underline ${bg} hover:scale-105 transition-all group`}>
                    <div className={`w-10 h-10 rounded-[10px] ${iconBg} flex items-center justify-center text-[1.3rem] shadow-sm`}>
                      {icon}
                    </div>
                    <span className="text-[0.62rem] font-semibold text-charcoal leading-tight text-center">{label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Longest streak card */}
            {(profile.longestStreak ?? 0) > 0 && (
              <div className="bg-gradient-to-br from-orange-50 to-amber/10 border border-amber/30 rounded-[20px] p-5">
                <div className="flex items-center gap-3">
                  <span className="text-[2rem]">🔥</span>
                  <div>
                    <p className="font-bold text-charcoal text-[0.9rem]">Personal Best</p>
                    <p className="text-amber font-display font-bold text-[1.4rem] leading-none">{profile.longestStreak} days</p>
                    <p className="text-text-xlight text-[0.72rem]">longest streak ever</p>
                  </div>
                </div>
              </div>
            )}

            {/* Today's suggestion */}
            <div className="bg-gradient-to-br from-teal-deep to-teal-dark rounded-[20px] p-5 text-white">
              <p className="text-white/60 text-[0.68rem] font-semibold uppercase tracking-widest mb-2">✨ Today&apos;s Suggestion</p>
              <p className="font-display font-bold text-[1rem] leading-snug mb-3">
                {(profile.currentStreak ?? 0) === 0
                  ? 'Start your first check-in today and begin your streak! 🌱'
                  : (profile.currentStreak ?? 0) < 7
                  ? `${7 - (profile.currentStreak ?? 0)} more days to your first week milestone! Keep going 💪`
                  : 'You\'re on fire! Take 5 minutes of calm breathing to recharge today 🌬️'}
              </p>
              <Link href={(profile.currentStreak ?? 0) === 0 ? '/mood' : '/breathing'}
                className="inline-block bg-white/15 hover:bg-white/25 text-white text-[0.78rem] font-semibold px-4 py-2 rounded-full no-underline transition-colors border border-white/20">
                {(profile.currentStreak ?? 0) === 0 ? 'Log Mood →' : 'Breathe Now →'}
              </Link>
            </div>

            {/* Sign out — mobile */}
            <div className="sm:hidden text-center py-2">
              <button onClick={() => signOut({ callbackUrl: '/' })}
                className="text-[0.8rem] text-text-xlight hover:text-red-400 transition-colors">
                🚪 Sign out
              </button>
            </div>
          </div>

          {/* ── RIGHT MAIN ────────────────────────────────────────── */}
          <div>
            {/* Tab bar */}
            <div className="flex gap-1 bg-white border border-teal-light/60 rounded-[18px] p-1.5 mb-5 shadow-card overflow-x-auto">
              {TABS.map(tab => (
                <button key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-[12px] text-[0.85rem] font-semibold whitespace-nowrap flex-1 justify-center transition-all
                    ${activeTab === tab.id
                      ? 'bg-teal-deep text-white shadow-sm'
                      : 'text-text-mid hover:text-charcoal hover:bg-teal-ghost'}`}>
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`text-[0.68rem] font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-teal-ghost text-teal-deep'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ── OVERVIEW TAB — Social Home Feed ──────────────────── */}
            {activeTab === 'overview' && (
              <div className="space-y-4">

                {/* Active challenges mini strip */}
                {activeChallenges.length > 0 && (
                  <div className="bg-gradient-to-r from-teal-deep to-teal-dark rounded-[20px] px-5 py-4 flex items-center gap-4 flex-wrap">
                    <span className="text-[1.5rem]">🏆</span>
                    <div className="flex-1">
                      <p className="text-white font-semibold text-[0.88rem]">{activeChallenges.length} active challenge{activeChallenges.length > 1 ? 's' : ''}</p>
                      <p className="text-white/60 text-[0.75rem]">{activeChallenges[0] && CHALLENGE_META[activeChallenges[0].challengeSlug]?.title}</p>
                    </div>
                    <Link href="/challenges" className="text-amber text-[0.8rem] font-bold no-underline hover:text-amber-soft transition-colors flex-shrink-0">Check in →</Link>
                  </div>
                )}

                {/* Circles joined strip */}
                {circles.length > 0 && (
                  <div className="bg-white rounded-[20px] px-5 py-4 shadow-card border border-teal-light/60 flex items-center gap-3 flex-wrap">
                    <span className="text-text-xlight text-[0.75rem] font-semibold uppercase tracking-wide">Your Circles:</span>
                    {circles.map(c => (
                      <Link key={c.id} href={`/circles/${c.slug}`}
                        className="flex items-center gap-1.5 bg-teal-ghost hover:bg-teal-light/30 border border-teal-light hover:border-teal-mid rounded-full px-3 py-1.5 no-underline transition-all group">
                        <span className="text-[0.85rem]">{c.icon}</span>
                        <span className="text-[0.75rem] font-semibold text-teal-deep">{c.name}</span>
                      </Link>
                    ))}
                    <Link href="/circles" className="text-teal-mid text-[0.75rem] font-semibold no-underline hover:text-teal-deep">+ Find more</Link>
                  </div>
                )}

                {/* Feed filter */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 bg-teal-ghost/60 rounded-full p-1">
                    {(['all', 'community', 'circles'] as const).map(f => (
                      <button key={f} onClick={() => setFeedFilter(f)}
                        className={`px-4 py-1.5 rounded-full text-[0.78rem] font-semibold transition-all capitalize
                          ${feedFilter === f ? 'bg-white text-teal-deep shadow-sm' : 'text-text-xlight hover:text-charcoal'}`}>
                        {f === 'circles' ? '🔒 Circles' : f === 'community' ? '💛 Community' : '🌍 All'}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Link href="/community" className="text-[0.78rem] text-teal-mid font-semibold no-underline hover:text-teal-deep transition-colors">Community →</Link>
                  </div>
                </div>

                {/* Feed posts */}
                {feedLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="flex gap-1.5">{[0,1,2].map(i => <span key={i} className="w-2 h-2 rounded-full bg-teal-mid animate-bounce" style={{ animationDelay:`${i*150}ms` }} />)}</div>
                  </div>
                ) : (() => {
                  const filtered = feed.filter(p => feedFilter === 'all' || p.type === feedFilter)
                  if (filtered.length === 0) return (
                    <div className="bg-white rounded-[20px] p-8 shadow-card border border-teal-light/60 text-center">
                      <span className="text-[3rem] block mb-3">
                        {feedFilter === 'circles' ? '🔒' : '💛'}
                      </span>
                      <p className="font-semibold text-charcoal text-[0.95rem] mb-2">
                        {feedFilter === 'circles' ? 'No circle updates yet' : 'No community posts yet'}
                      </p>
                      <p className="text-text-mid text-[0.85rem] mb-4">
                        {feedFilter === 'circles' ? 'Join a circle to see posts from its members.' : 'Be the first to share something with the community.'}
                      </p>
                      <Link href={feedFilter === 'circles' ? '/circles' : '/community'}
                        className="inline-block bg-teal-deep text-white px-6 py-2.5 rounded-full font-semibold text-[0.85rem] no-underline hover:bg-teal-dark transition-colors">
                        {feedFilter === 'circles' ? 'Browse Circles →' : 'Visit Community →'}
                      </Link>
                    </div>
                  )
                  return (
                    <div className="space-y-4">
                      {filtered.slice(0, 20).map(post => (
                        <FeedCard key={`${post.type}-${post.id}`} post={post} />
                      ))}
                      {filtered.length > 0 && (
                        <div className="text-center pt-2">
                          <Link href={feedFilter === 'circles' ? '/circles' : '/community'}
                            className="text-teal-mid text-[0.82rem] font-semibold hover:text-teal-deep no-underline transition-colors">
                            See more in {feedFilter === 'circles' ? 'Circles' : 'Community'} →
                          </Link>
                        </div>
                      )}
                    </div>
                  )
                })()}

                {/* Circles CTA — when no circles joined */}
                {circles.length === 0 && (
                  <div className="bg-white rounded-[20px] p-5 shadow-card border border-teal-light/60 flex items-center gap-4">
                    <span className="text-[2rem]">🔒</span>
                    <div className="flex-1">
                      <p className="font-semibold text-charcoal text-[0.9rem]">No circles joined yet</p>
                      <p className="text-text-mid text-[0.8rem]">Join a private wellness group to see their updates here.</p>
                    </div>
                    <Link href="/circles" className="flex-shrink-0 bg-teal-deep text-white px-4 py-2 rounded-full text-[0.78rem] font-semibold no-underline hover:bg-teal-dark transition-colors">
                      Find Circles →
                    </Link>
                  </div>
                )}

              </div>
            )}

            {/* ── BADGES TAB ───────────────────────────────────────── */}
            {activeTab === 'badges' && (
              <div className="bg-white rounded-[24px] p-6 shadow-card border border-teal-light/60">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="font-display text-[1.2rem] font-bold text-charcoal">My Badges</h2>
                    <p className="text-text-xlight text-[0.78rem]">Earned by completing challenges and being part of this community.</p>
                  </div>
                  <span className="text-[1.8rem]">🏅</span>
                </div>
                {profile.badges.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-[4rem] block mb-4">🏅</span>
                    <h3 className="font-display font-bold text-charcoal text-[1.1rem] mb-2">Your badge collection is empty</h3>
                    <p className="text-text-mid text-[0.88rem] mb-6 max-w-sm mx-auto">Complete a wellness challenge to earn your first badge. Every one you earn represents real growth.</p>
                    <Link href="/challenges"
                      className="inline-block bg-teal-deep text-white px-7 py-3 rounded-full font-semibold text-[0.9rem] no-underline hover:bg-teal-dark transition-colors">
                      Start a Challenge →
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {profile.badges.map(({ badge, earnedAt }) => {
                      const style = TIER_STYLES[badge.tier] ?? TIER_STYLES.bronze
                      return (
                        <div key={badge.slug}
                          className={`${style.bg} border-2 ${style.border} rounded-[20px] p-5 text-center hover:-translate-y-1 hover:shadow-lift transition-all`}>
                          <span className="text-[2.5rem] block mb-2">{badge.icon}</span>
                          <p className={`font-bold text-[0.88rem] ${style.text} leading-tight mb-1`}>{badge.name}</p>
                          <p className="text-[0.72rem] text-text-xlight leading-snug mb-3">{badge.description}</p>
                          <span className={`inline-block text-[0.65rem] font-bold uppercase tracking-widest bg-white/50 ${style.text} px-2 py-0.5 rounded-full`}>
                            {style.label}
                          </span>
                          <p className="text-[0.65rem] text-text-xlight mt-2">
                            {new Date(earnedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── CHALLENGES TAB ───────────────────────────────────── */}
            {activeTab === 'challenges' && (
              <div className="bg-white rounded-[24px] p-6 shadow-card border border-teal-light/60">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="font-display text-[1.2rem] font-bold text-charcoal">My Challenges</h2>
                    <p className="text-text-xlight text-[0.78rem]">{completedChallenges} completed · {activeChallenges.length} in progress</p>
                  </div>
                  <Link href="/challenges" className="text-[0.8rem] text-teal-mid font-semibold hover:text-teal-deep no-underline transition-colors">Browse more →</Link>
                </div>
                {profile.progress.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-[4rem] block mb-4">🏆</span>
                    <h3 className="font-display font-bold text-charcoal text-[1.1rem] mb-2">No challenges started yet</h3>
                    <p className="text-text-mid text-[0.88rem] mb-6 max-w-sm mx-auto">Pick a 7, 14, or 30-day challenge that resonates with you and start your journey today.</p>
                    <Link href="/challenges"
                      className="inline-block bg-teal-deep text-white px-7 py-3 rounded-full font-semibold text-[0.9rem] no-underline hover:bg-teal-dark transition-colors">
                      Find a Challenge →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {profile.progress.map(p => {
                      const meta   = CHALLENGE_META[p.challengeSlug]
                      if (!meta) return null
                      const days   = JSON.parse(p.completedDays) as string[]
                      const pct    = Math.round((days.length / meta.totalDays) * 100)
                      const isDone = !!p.completedAt
                      return (
                        <div key={p.id} className={`bg-gradient-to-r ${meta.color} rounded-[18px] p-5 flex items-center gap-4 border ${isDone ? 'border-teal-mid/30' : 'border-teal-light/40'}`}>
                          <span className="text-[2.2rem] flex-shrink-0">{meta.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <p className="font-bold text-[0.93rem] text-charcoal truncate">{meta.title}</p>
                              {isDone
                                ? <span className="text-[0.72rem] font-bold text-teal-deep bg-white/70 px-2.5 py-1 rounded-full flex-shrink-0">✓ Complete 🎉</span>
                                : <span className="text-[0.72rem] text-text-mid font-medium flex-shrink-0">{days.length}/{meta.totalDays} days</span>
                              }
                            </div>
                            <div className="w-full h-2.5 bg-white/60 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-700 ${isDone ? 'bg-teal-deep' : 'bg-teal-mid'}`}
                                style={{ width: `${isDone ? 100 : pct}%` }} />
                            </div>
                            {!isDone && <p className="text-[0.7rem] text-text-xlight mt-1">{pct}% — keep going! 💪</p>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── CIRCLES TAB ──────────────────────────────────────── */}
            {activeTab === 'circles' && (
              <div className="bg-white rounded-[24px] p-6 shadow-card border border-teal-light/60">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="font-display text-[1.2rem] font-bold text-charcoal">My Circles</h2>
                    <p className="text-text-xlight text-[0.78rem]">Private wellness groups you&apos;ve joined.</p>
                  </div>
                  <Link href="/circles" className="text-[0.8rem] text-teal-mid font-semibold hover:text-teal-deep no-underline transition-colors">Browse all →</Link>
                </div>
                {circles.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-[4rem] block mb-4">🔒</span>
                    <h3 className="font-display font-bold text-charcoal text-[1.1rem] mb-2">You haven&apos;t joined any circles yet</h3>
                    <p className="text-text-mid text-[0.88rem] mb-6 max-w-sm mx-auto">Circles are small, private spaces built around a shared wellness practice. Join one and find your people.</p>
                    <Link href="/circles"
                      className="inline-block bg-teal-deep text-white px-7 py-3 rounded-full font-semibold text-[0.9rem] no-underline hover:bg-teal-dark transition-colors">
                      Find a Circle →
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {circles.map(c => (
                      <Link key={c.id} href={`/circles/${c.slug}`}
                        className="flex items-center gap-4 bg-teal-ghost/30 hover:bg-teal-ghost border border-teal-light hover:border-teal-mid rounded-[18px] px-5 py-4 no-underline transition-all group">
                        <span className="text-[2rem] flex-shrink-0">{c.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[0.93rem] text-charcoal group-hover:text-teal-deep transition-colors truncate">{c.name}</p>
                          <p className="text-[0.75rem] text-teal-mid font-medium">✓ Member · tap to enter</p>
                        </div>
                        <svg className="w-4 h-4 text-text-xlight group-hover:text-teal-mid transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Feed Card component ──────────────────────────────────────────────────────
function FeedCard({ post }: { post: FeedPost }) {
  function timeAgo(d: string) {
    const diff = Date.now() - new Date(d).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1)  return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24)  return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  const displayName = post.user?.name ?? post.author ?? 'Community member'
  const initial     = displayName.charAt(0).toUpperCase()

  return (
    <div className="bg-white border border-teal-light/60 rounded-[20px] p-5 shadow-card hover:shadow-lift transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full overflow-hidden bg-teal-ghost flex items-center justify-center flex-shrink-0 border-2 border-teal-light">
            {post.user?.avatarUrl
              ? <img src={post.user.avatarUrl} alt={displayName} width={36} height={36} className="object-cover w-full h-full" referrerPolicy="no-referrer" />
              : <span className="text-[0.85rem] font-bold text-teal-deep">{initial}</span>
            }
          </div>
          <div>
            <p className="font-semibold text-charcoal text-[0.88rem] leading-none">{displayName}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-text-xlight text-[0.7rem]">{timeAgo(post.createdAt)}</span>
              {post.type === 'circle' && post.circle && (
                <>
                  <span className="text-text-xlight text-[0.65rem]">·</span>
                  <Link href={`/circles/${post.circle.slug}`}
                    className="flex items-center gap-1 text-[0.7rem] text-teal-mid font-semibold no-underline hover:text-teal-deep transition-colors">
                    <span>{post.circle.icon}</span>{post.circle.name}
                  </Link>
                </>
              )}
              {post.type === 'community' && (
                <>
                  <span className="text-text-xlight text-[0.65rem]">·</span>
                  <span className="text-[0.68rem] text-amber font-semibold bg-amber/10 px-2 py-0.5 rounded-full">Community</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {post.title && <p className="font-bold text-charcoal text-[0.95rem] mb-1">{post.title}</p>}
      <p className="text-text-mid text-[0.88rem] leading-[1.7] line-clamp-4">{post.body}</p>

      {/* Tags */}
      {post.tags && post.tags.trim() && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {post.tags.split(',').filter(Boolean).slice(0, 4).map(t => (
            <span key={t} className="bg-teal-ghost text-teal-deep text-[0.68rem] font-medium px-2.5 py-0.5 rounded-full">#{t.trim()}</span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-teal-light/40">
        <div className="flex items-center gap-1.5 text-text-xlight text-[0.78rem]">
          <svg className={`w-3.5 h-3.5 ${post.likedByMe ? 'text-red-400 fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          <span>{post.likeCount}</span>
        </div>
        {post.commentCount !== undefined && (
          <div className="flex items-center gap-1.5 text-text-xlight text-[0.78rem]">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
            <span>{post.commentCount}</span>
          </div>
        )}
        <Link href={post.type === 'community' ? '/community' : `/circles/${post.circle?.slug ?? ''}`}
          className="ml-auto text-teal-mid text-[0.75rem] font-semibold hover:text-teal-deep no-underline transition-colors">
          View →
        </Link>
      </div>
    </div>
  )
}
