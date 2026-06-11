'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { TIER_STYLES } from '@/lib/badges'
import { ALL_TOOLS } from '@/components/home/FavouriteToolsBar'
import { MoodSleepCard }   from '@/components/profile/MoodSleepCard'
import { WellnessScore }   from '@/components/profile/WellnessScore'
import { GentleBanner }    from '@/components/GentleBanner'

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
  id: number; name: string; email: string; phone?: string; bio?: string; role?: string
  interests: string; avatarUrl?: string; coverStyle?: string; coverUrl?: string; createdAt: string
  currentStreak?: number; longestStreak?: number; streakFreezes?: number
  badges: BadgeEntry[]; progress: ProgressEntry[]
}

// ── Cover presets ─────────────────────────────────────────────────────────────
const COVER_PRESETS = [
  { key: 'teal',    label: 'Forest Teal',   css: 'linear-gradient(135deg,#0F4040,#1A6B6B,#2D9B8A)' },
  { key: 'sunset',  label: 'Sunset',        css: 'linear-gradient(135deg,#b5451b,#e8a020,#f5c96a)' },
  { key: 'ocean',   label: 'Deep Ocean',    css: 'linear-gradient(135deg,#0a1a4a,#0093E9,#80D0C7)' },
  { key: 'aurora',  label: 'Aurora',        css: 'linear-gradient(135deg,#1a1a2e,#a18cd1,#2D9B8A)' },
  { key: 'rose',    label: 'Rose Gold',     css: 'linear-gradient(135deg,#4a1a2e,#c95b8a,#f5c96a)' },
  { key: 'forest',  label: 'Forest',        css: 'linear-gradient(135deg,#1a2e1a,#2d5a27,#56ab2f)' },
  { key: 'night',   label: 'Starry Night',  css: 'linear-gradient(135deg,#0d0d2b,#1a1a4a,#4a6b8a)' },
  { key: 'lavender',label: 'Lavender',      css: 'linear-gradient(135deg,#3d1a5a,#a18cd1,#fbc2eb)' },
  { key: 'sand',    label: 'Desert Sand',   css: 'linear-gradient(135deg,#4a3000,#c8860a,#f5c96a)' },
  { key: 'mint',    label: 'Mint Fresh',    css: 'linear-gradient(135deg,#004040,#2D9B8A,#A8D8D0)' },
]

function getCoverStyle(profile: UserProfile): React.CSSProperties {
  if (profile.coverUrl) return { backgroundImage: `url(${profile.coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  const preset = COVER_PRESETS.find(p => p.key === (profile.coverStyle ?? 'teal'))
  return { background: preset?.css ?? COVER_PRESETS[0].css }
}

const CHALLENGE_META: Record<string, { icon: string; title: string; totalDays: number; color: string }> = {
  'gratitude-30':    { icon: '🍂', title: '30-Day Gratitude',           totalDays: 30, color: 'from-amber/20 to-amber/5'   },
  'mindfulness-7':   { icon: '🧘', title: '7-Day Mindfulness',           totalDays: 7,  color: 'from-teal-ghost to-white'   },
  'movement-7':      { icon: '👣', title: '7 Days of Movement',          totalDays: 7,  color: 'from-teal-ghost to-white'   },
  'sleep-21':        { icon: '🌙', title: '21-Day Sleep Reset',          totalDays: 21, color: 'from-[#1A2B4A]/10 to-white' },
  'affirmations-21': { icon: '⭐', title: '21-Day Affirmations',         totalDays: 21, color: 'from-amber/15 to-white'     },
  'journal-14':      { icon: '📓', title: '14-Day Gratitude Journaling', totalDays: 14, color: 'from-teal-ghost to-white'   },
}

// All tools organised by category for the profile dashboard
const TOOL_CATEGORIES = [
  {
    label: '🪞 Reflect & Track',
    tools: [
      { href: '/mood',      icon: '📊', label: 'Mood',       bg: 'bg-blue-50',     iconBg: 'bg-blue-100'      },
      { href: '/journal',   icon: '📓', label: 'Journal',    bg: 'bg-teal-ghost',  iconBg: 'bg-teal-light/40' },
      { href: '/sleep',     icon: '🌙', label: 'Sleep',      bg: 'bg-indigo-50',   iconBg: 'bg-indigo-100'    },
      { href: '/water',     icon: '💧', label: 'Water',      bg: 'bg-sky-50',      iconBg: 'bg-sky-100'       },
      { href: '/calendar',  icon: '📅', label: 'Calendar',   bg: 'bg-teal-ghost',  iconBg: 'bg-teal-light/40' },
      { href: '/snapshot',  icon: '📈', label: 'Snapshot',   bg: 'bg-green-50',    iconBg: 'bg-green-100'     },
      { href: '/intention', icon: '🌅', label: 'Intention',  bg: 'bg-amber/10',    iconBg: 'bg-amber/20'      },
      { href: '/habits',    icon: '🎯', label: 'Habits',     bg: 'bg-orange-50',   iconBg: 'bg-orange-100'    },
    ],
  },
  {
    label: '🧘 Calm & Heal',
    tools: [
      { href: '/breathing',  icon: '🌬️', label: 'Breathe',   bg: 'bg-sky-50',     iconBg: 'bg-sky-100'     },
      { href: '/meditation', icon: '🧘', label: 'Meditate',  bg: 'bg-purple-50',  iconBg: 'bg-purple-100'  },
      { href: '/sounds',     icon: '🎧', label: 'Sounds',    bg: 'bg-slate-50',   iconBg: 'bg-slate-100'   },
      { href: '/coach',      icon: '🌿', label: 'Coach',     bg: 'bg-teal-ghost', iconBg: 'bg-teal-light/40'},
      { href: '/yoga',       icon: '🧘‍♀️', label: 'Yoga',     bg: 'bg-green-50',   iconBg: 'bg-green-100'   },
      { href: '/reframe',    icon: '🧠', label: 'Reframe',   bg: 'bg-violet-50',  iconBg: 'bg-violet-100'  },
    ],
  },
  {
    label: '💪 Grow',
    tools: [
      { href: '/challenges',    icon: '🏆', label: 'Challenges',  bg: 'bg-amber/10',  iconBg: 'bg-amber/20'   },
      { href: '/habits-lab',    icon: '⚡', label: 'Habits Lab',  bg: 'bg-yellow-50', iconBg: 'bg-yellow-100' },
      { href: '/wisdom-coaching',icon:'👴', label: 'Wisdom',      bg: 'bg-purple-50', iconBg: 'bg-purple-100' },
      { href: '/quiz',          icon: '🎯', label: 'Wellness Quiz',bg:'bg-rose-50',   iconBg: 'bg-rose-100'   },
    ],
  },
  {
    label: '🎨 Create',
    tools: [
      { href: '/affirmation',  icon: '💌', label: 'Affirmation', bg: 'bg-pink-50',   iconBg: 'bg-pink-100'   },
      { href: '/quotes',       icon: '🎨', label: 'Quotes',      bg: 'bg-amber/10',  iconBg: 'bg-amber/20'   },
      { href: '/vision-board', icon: '⭐', label: 'Vision Board',bg: 'bg-purple-50', iconBg: 'bg-purple-100' },
      { href: '/drawing',      icon: '✏️', label: 'Drawing',     bg: 'bg-orange-50', iconBg: 'bg-orange-100' },
    ],
  },
  {
    label: '🌿 Wellbeing',
    tools: [
      { href: '/positive-eating', icon: '🥗', label: 'Eat Well',  bg: 'bg-green-50', iconBg: 'bg-green-100' },
      { href: '/happy-foods',     icon: '😊', label: 'Happy Foods',bg:'bg-amber/10',  iconBg: 'bg-amber/20'  },
      { href: '/kids',            icon: '🌈', label: 'Kids Zone', bg: 'bg-pink-50',  iconBg: 'bg-pink-100'  },
    ],
  },
  {
    label: '💛 Community',
    tools: [
      { href: '/tribe',          icon: '🌿', label: 'My Tribe',   bg: 'bg-teal-ghost', iconBg: 'bg-teal-light/40' },
      { href: '/community',      icon: '💛', label: 'Community',  bg: 'bg-amber/10',   iconBg: 'bg-amber/20'      },
      { href: '/circles',        icon: '🔒', label: 'Circles',    bg: 'bg-teal-ghost', iconBg: 'bg-teal-light/40' },
      { href: '/gratitude-wall', icon: '🙏', label: 'Gratitude',  bg: 'bg-rose-50',    iconBg: 'bg-rose-100'      },
      { href: '/kindness-map',   icon: '🗺️', label: 'Kindness',   bg: 'bg-blue-50',    iconBg: 'bg-blue-100'      },
      { href: '/community/gallery',icon:'📸',label: 'Gallery',    bg: 'bg-purple-50',  iconBg: 'bg-purple-100'    },
      { href: '/search',         icon: '🔍', label: 'Search',     bg: 'bg-slate-50',   iconBg: 'bg-slate-100'     },
      { href: '/notifications',  icon: '🔔', label: 'Alerts',     bg: 'bg-green-50',   iconBg: 'bg-green-100'     },
    ],
  },
]

// Flat list still used for backward compat in a few spots
const QUICK_TOOLS = TOOL_CATEGORIES.flatMap(c => c.tools).slice(0, 8)

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
  const [tribeFollowing, setTribeFollowing] = useState<{id:number;name:string;avatarUrl:string|null}[]>([])
  const [tribeFollowers, setTribeFollowers] = useState<{id:number;name:string;avatarUrl:string|null}[]>([])
  const [editing,     setEditing]     = useState(false)
  const [form,        setForm]        = useState({ name: '', phone: '', bio: '', website: '' })
  const [selected,      setSelected]      = useState<string[]>([])
  const [favTools,      setFavTools]      = useState<string[]>([])
  const [savingFavs,    setSavingFavs]    = useState(false)
  const [saving,      setSaving]      = useState(false)
  const [saved,       setSaved]       = useState(false)
  const [uploading,     setUploading]     = useState(false)
  const [activeTab,     setActiveTab]     = useState<Tab>('overview')
  const [showCoverPick, setShowCoverPick] = useState(false)
  const [uploadingCover,setUploadingCover]= useState(false)
  const fileRef      = useRef<HTMLInputElement>(null)
  const coverFileRef = useRef<HTMLInputElement>(null)
  const tabsRef      = useRef<HTMLDivElement>(null)

  // Remove manual redirect — useSession({ required: true }) handles it with callbackUrl
  useEffect(() => {
    if (false) router.push('/login') // kept to avoid unused import warning
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    // Sync badges first (seeds definitions + retroactively awards any missed badges)
    // then fetch profile so the returned badges array is already complete
    fetch('/api/badges/sync')
      .catch(() => {})
      .finally(() => {
        fetch('/api/profile').then(r => r.json()).then(data => {
          setProfile(data)
          setForm({ name: data.name, phone: data.phone ?? '', bio: data.bio ?? '', website: data.website ?? '' })
          setSelected(data.interests ? data.interests.split(',').filter(Boolean) : [])
          // Load favourite tools
          fetch('/api/favourite-tools').then(r => r.json()).then(({ tools }) => {
            if (Array.isArray(tools)) setFavTools(tools)
          }).catch(() => {})
        })
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
    // Fetch tribe (following + followers)
    fetch('/api/tribe').then(r => r.ok ? r.json() : null).then(data => {
      if (data) {
        setTribeFollowing(data.following ?? [])
        setTribeFollowers(data.followers ?? [])
      }
    }).catch(() => {})
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

  function jumpToTab(tab: Tab) {
    setActiveTab(tab)
    setTimeout(() => {
      if (tabsRef.current) {
        const y = tabsRef.current.getBoundingClientRect().top + window.scrollY - 84
        window.scrollTo({ top: y, behavior: 'smooth' })
      }
    }, 50)
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

  async function selectCoverPreset(key: string) {
    setProfile(p => p ? { ...p, coverStyle: key, coverUrl: undefined } : p)
    setShowCoverPick(false)
    await fetch('/api/profile', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coverStyle: key, coverUrl: null }),
    })
  }

  async function uploadCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingCover(true)
    const fd = new FormData()
    fd.append('cover', file)
    const res  = await fetch('/api/profile/cover', { method: 'POST', body: fd })
    const data = await res.json()
    if (data.coverUrl) {
      setProfile(p => p ? { ...p, coverUrl: data.coverUrl, coverStyle: undefined } : p)
      setShowCoverPick(false)
    }
    setUploadingCover(false)
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
        <div className="h-[160px] sm:h-[200px] relative overflow-hidden"
          style={getCoverStyle(profile)}>
          {/* Decorative overlay circles */}
          <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full bg-white/5" />
          <div className="absolute top-8 right-32 w-32 h-32 rounded-full bg-white/5" />
          <div className="absolute -bottom-6 left-20 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute top-4 left-1/3 w-20 h-20 rounded-full bg-black/5" />

          {/* Top-right action buttons */}
          <div className="absolute top-4 right-4 sm:right-6 flex gap-2">
            <button onClick={() => setShowCoverPick(true)}
              className="flex items-center gap-1.5 bg-black/30 hover:bg-black/50 border border-white/20 text-white text-[0.75rem] font-semibold px-3.5 py-2 rounded-full transition-all backdrop-blur-sm">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {uploadingCover ? 'Uploading…' : '🖼️ Cover'}
            </button>
            {!editing && (
              <button onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/25 text-white text-[0.75rem] font-semibold px-3.5 py-2 rounded-full transition-all backdrop-blur-sm">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                </svg>
                ✏️ Edit Profile
              </button>
            )}
          </div>
          <input ref={coverFileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={uploadCover} />
        </div>

        {/* Avatar + name — overlaps the cover */}
        <div className="max-w-7xl mx-auto px-[5%]">
          {/* Row 1: avatar (overlaps cover) + actions (below cover edge) */}
          <div className="-mt-14 sm:-mt-16 flex items-start justify-between">

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

            {/* Sign out + Admin link — desktop right, pushed below the cover edge */}
            <div className="hidden sm:flex items-center gap-3 flex-shrink-0 mt-[72px]">
              {/* Admin link — only visible to admin (DB role or env email) */}
              {(profile.role === 'admin' || session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) && (
                <Link href="/admin"
                  className="flex items-center gap-1.5 text-[0.78rem] font-semibold text-amber bg-amber/10 border border-amber/30 hover:bg-amber/20 px-3 py-1.5 rounded-full transition-colors no-underline">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Admin
                </Link>
              )}
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

          {/* Row 2: name + meta — always in the white area below the cover */}
          <div className="mt-3 pb-6 border-b border-teal-light/50">
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
              <div className="flex flex-wrap gap-1.5 mt-2.5">
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

          {/* ── Stats bar ─────────────────────────────────────────── */}
          <div className="grid grid-cols-4 gap-3 py-5">
            {([
              { value: profile.currentStreak ?? 0, label: 'Day Streak',       icon: '🔥', color: 'text-orange-500', tab: null,           href: '/mood'  },
              { value: profile.badges.length,       label: 'Badges Earned',   icon: '🏅', color: 'text-amber',      tab: 'badges',       href: null     },
              { value: completedChallenges,          label: 'Challenges Done', icon: '🏆', color: 'text-teal-deep',  tab: 'challenges',   href: null     },
              { value: tribeFollowing.length,        label: 'Tribe',           icon: '🌿', color: 'text-teal-mid',   tab: null,           href: '/tribe' },
            ] as { value: number; label: string; icon: string; color: string; tab: Tab | null; href: string | null }[]).map(s => {
              const cardClass = "bg-white rounded-[18px] p-4 text-center shadow-card border border-teal-light/60 hover:shadow-lift hover:scale-[1.04] active:scale-[0.97] transition-all cursor-pointer"
              const inner = (
                <>
                  <span className="text-[1.4rem] block mb-1">{s.icon}</span>
                  <p className={`font-display font-bold text-[1.5rem] sm:text-[1.8rem] leading-none ${s.color}`}>{s.value}</p>
                  <p className="text-text-xlight text-[0.65rem] sm:text-[0.72rem] mt-1 leading-tight">{s.label}</p>
                  {s.label === 'Day Streak' && (profile.streakFreezes ?? 0) > 0 && (
                    <p className="text-[0.6rem] text-sky-500 font-semibold mt-1" title="Streak freezes — automatically save your streak if you miss a single day">
                      🧊 ×{profile.streakFreezes} protected
                    </p>
                  )}
                </>
              )
              if (s.tab) {
                return (
                  <button key={s.label} className={cardClass} onClick={() => jumpToTab(s.tab as Tab)}>
                    {inner}
                  </button>
                )
              }
              return (
                <Link key={s.label} href={s.href!} className={`${cardClass} block no-underline`}>
                  {inner}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Cover Picker Modal ──────────────────────────────────────────── */}
      {showCoverPick && (
        <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-[28px] w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-7 pt-7 pb-4">
              <div>
                <h2 className="font-display text-[1.3rem] font-bold text-charcoal">Choose Cover</h2>
                <p className="text-text-xlight text-[0.78rem]">Pick a gradient or upload your own photo</p>
              </div>
              <button onClick={() => setShowCoverPick(false)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-teal-ghost transition-colors text-text-mid">✕</button>
            </div>

            <div className="px-7 pb-7 space-y-5">
              {/* Gradient presets */}
              <div>
                <p className="text-[0.75rem] font-bold text-text-xlight uppercase tracking-widest mb-3">Gradient Presets</p>
                <div className="grid grid-cols-5 gap-3">
                  {COVER_PRESETS.map(p => (
                    <button key={p.key} onClick={() => selectCoverPreset(p.key)}
                      title={p.label}
                      className={`relative h-14 rounded-[12px] overflow-hidden transition-all hover:scale-105
                        ${(profile.coverStyle === p.key && !profile.coverUrl) ? 'ring-3 ring-teal-deep scale-105 shadow-lift' : ''}`}
                      style={{ background: p.css, outline: (profile.coverStyle === p.key && !profile.coverUrl) ? '3px solid #1A6B6B' : 'none', outlineOffset: '2px' }}>
                      {(profile.coverStyle === p.key && !profile.coverUrl) && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg className="w-5 h-5 text-white drop-shadow" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5"/></svg>
                        </div>
                      )}
                      <span className="absolute bottom-1 left-0 right-0 text-center text-white text-[0.55rem] font-semibold drop-shadow leading-none">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-teal-light" />
                <span className="text-text-xlight text-[0.72rem] font-medium">or upload a photo</span>
                <div className="flex-1 h-px bg-teal-light" />
              </div>

              {/* Upload custom photo */}
              <button onClick={() => coverFileRef.current?.click()} disabled={uploadingCover}
                className="w-full flex items-center justify-center gap-3 border-2 border-dashed border-teal-light rounded-[16px] py-5 hover:border-teal-mid hover:bg-teal-ghost/30 transition-all disabled:opacity-60">
                {uploadingCover ? (
                  <><span className="w-5 h-5 border-2 border-teal-mid border-t-transparent rounded-full animate-spin" /><span className="text-teal-mid font-semibold text-[0.88rem]">Uploading…</span></>
                ) : (
                  <>
                    <svg className="w-6 h-6 text-teal-mid" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <div className="text-left">
                      <p className="text-teal-deep font-semibold text-[0.88rem]">Upload custom cover photo</p>
                      <p className="text-text-xlight text-[0.72rem]">JPEG, PNG or WebP · max 5 MB · recommended 1500×400px</p>
                    </div>
                  </>
                )}
              </button>

              {/* Live preview */}
              <div>
                <p className="text-[0.75rem] font-bold text-text-xlight uppercase tracking-widest mb-2">Preview</p>
                <div className="h-20 rounded-[14px] overflow-hidden" style={getCoverStyle(profile)} />
              </div>
            </div>
          </div>
        </div>
      )}

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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[0.78rem] font-semibold text-teal-deep">Bio</label>
                  <span className={`text-[0.72rem] ${form.bio.length > 360 ? 'text-red-400' : form.bio.length > 280 ? 'text-amber' : 'text-text-xlight'}`}>
                    {form.bio.length}/400
                  </span>
                </div>
                <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value.slice(0, 400) }))}
                  placeholder="A little about you — what brings you here? This appears under every blog post you write."
                  rows={3}
                  maxLength={400}
                  className="w-full border border-teal-light rounded-[14px] px-4 py-3 text-[0.93rem] outline-none focus:border-teal-mid bg-ivory resize-none transition-colors" />
                <p className="text-[0.7rem] text-text-xlight mt-1">Shown at the bottom of your blog posts and on your public profile.</p>
              </div>
              <div>
                <label className="block text-[0.78rem] font-semibold text-teal-deep mb-1.5">Website / Social link</label>
                <input type="url" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                  placeholder="https://linkedin.com/in/yourname"
                  className="w-full border border-teal-light rounded-[14px] px-4 py-3 text-[0.93rem] outline-none focus:border-teal-mid bg-ivory transition-colors" />
                <p className="text-[0.7rem] text-text-xlight mt-1">LinkedIn, Twitter/X, or personal website — linked from your author card.</p>
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
              {/* Favourite tools */}
              <div>
                <label className="block text-[0.78rem] font-semibold text-teal-deep mb-1">⚡ Quick-Access Tools</label>
                <p className="text-[0.71rem] text-text-xlight mb-2">Pin up to 6 tools for fast access from the home page.</p>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {ALL_TOOLS.map(t => {
                    const pinned = favTools.includes(t.slug)
                    return (
                      <button key={t.slug} type="button"
                        onClick={() => setFavTools(f => pinned ? f.filter(s => s !== t.slug) : f.length < 6 ? [...f, t.slug] : f)}
                        className={`px-3 py-1.5 rounded-full border text-[0.76rem] font-medium transition-all flex items-center gap-1.5
                          ${pinned ? 'bg-amber/20 text-amber border-amber/40' : 'bg-teal-ghost text-text-mid border-teal-light hover:border-teal-mid'}`}>
                        <span>{t.emoji}</span>{t.label}
                        {pinned && <span className="text-amber">★</span>}
                      </button>
                    )
                  })}
                </div>
                <button type="button" disabled={savingFavs}
                  onClick={async () => {
                    setSavingFavs(true)
                    await fetch('/api/favourite-tools', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tools: favTools }) })
                    setSavingFavs(false)
                  }}
                  className="text-[0.76rem] text-teal-deep border border-teal-light px-3 py-1.5 rounded-full hover:bg-teal-ghost transition-colors disabled:opacity-50">
                  {savingFavs ? 'Saving…' : '⚡ Save quick access'}
                </button>
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

            {/* All Wellness Tools — categorised */}
            <div className="bg-white rounded-[24px] p-5 shadow-card border border-teal-light/60">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-charcoal text-[1rem]">Your Wellness Tools</h3>
                <Link href="/tools" className="text-teal-mid text-[0.72rem] font-semibold no-underline hover:text-teal-deep transition-colors">
                  All →
                </Link>
              </div>
              <div className="space-y-4">
                {TOOL_CATEGORIES.map(cat => (
                  <div key={cat.label}>
                    <p className="text-[0.6rem] font-bold text-text-xlight uppercase tracking-widest mb-2">{cat.label}</p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {cat.tools.map(({ href, icon, label, bg, iconBg }) => (
                        <Link key={href} href={href}
                          className={`flex flex-col items-center gap-1.5 p-2 rounded-[12px] no-underline ${bg} hover:scale-105 transition-all group`}>
                          <div className={`w-8 h-8 rounded-[8px] ${iconBg} flex items-center justify-center text-[1.1rem]`}>
                            {icon}
                          </div>
                          <span className="text-[0.56rem] font-semibold text-charcoal leading-tight text-center line-clamp-1">{label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Personal Wellness Index */}
            <WellnessScore />

            {/* Hope Coins — rewards */}
            <Link href="/rewards"
              className="block bg-gradient-to-br from-amber/20 to-amber/5 border border-amber/30 rounded-[20px] p-5 no-underline hover:shadow-lift hover:-translate-y-0.5 transition-all group">
              <div className="flex items-center gap-3">
                <span className="text-[1.8rem]">🪙</span>
                <div>
                  <p className="text-amber text-[0.65rem] font-bold uppercase tracking-widest mb-0.5">Hope Coins</p>
                  <p className="text-charcoal font-display font-bold text-[0.95rem] leading-snug">Daily rewards & store</p>
                  <p className="text-text-xlight text-[0.72rem] mt-0.5 group-hover:text-text-mid transition-colors">Collect coins, redeem perks →</p>
                </div>
              </div>
            </Link>

            {/* Year in Positivity — wrapped */}
            <Link href="/wrapped"
              className="block bg-gradient-to-br from-[#0F4040] to-teal-mid rounded-[20px] p-5 no-underline hover:shadow-lift hover:-translate-y-0.5 transition-all group">
              <div className="flex items-center gap-3">
                <span className="text-[1.8rem]">🎁</span>
                <div>
                  <p className="text-amber text-[0.65rem] font-bold uppercase tracking-widest mb-0.5">✨ {new Date().getFullYear()} wrapped</p>
                  <p className="text-white font-display font-bold text-[0.95rem] leading-snug">Your Year in Positivity</p>
                  <p className="text-white/55 text-[0.72rem] mt-0.5 group-hover:text-white/75 transition-colors">See your year in numbers →</p>
                </div>
              </div>
            </Link>

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

            {/* Mood × Sleep Correlation */}
            <MoodSleepCard />

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

            {/* My Tribe mini section */}
            <div className="bg-white rounded-[20px] p-4 shadow-card border border-teal-light/60">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-charcoal text-[0.88rem]">🌿 My Tribe</h3>
                <Link href="/tribe" className="text-teal-mid text-[0.72rem] font-semibold no-underline hover:text-teal-deep transition-colors">
                  View all →
                </Link>
              </div>

              {/* Connected (following) */}
              <div className="mb-3">
                <p className="text-[0.65rem] font-bold text-text-xlight uppercase tracking-widest mb-2">
                  Connected · {tribeFollowing.length}
                </p>
                {tribeFollowing.length === 0 ? (
                  <p className="text-text-xlight text-[0.75rem]">Not connected with anyone yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {tribeFollowing.slice(0, 8).map(u => (
                      <Link key={u.id} href={`/profile/${u.id}`} title={u.name} className="no-underline">
                        {u.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={u.avatarUrl} alt={u.name} referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm hover:scale-110 transition-transform" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-mid to-teal-deep flex items-center justify-center text-white font-bold text-[0.7rem] border-2 border-white shadow-sm hover:scale-110 transition-transform">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </Link>
                    ))}
                    {tribeFollowing.length > 8 && (
                      <div className="w-8 h-8 rounded-full bg-teal-ghost border-2 border-white flex items-center justify-center text-teal-deep text-[0.62rem] font-bold">
                        +{tribeFollowing.length - 8}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Followers */}
              <div>
                <p className="text-[0.65rem] font-bold text-text-xlight uppercase tracking-widest mb-2">
                  Following you · {tribeFollowers.length}
                </p>
                {tribeFollowers.length === 0 ? (
                  <p className="text-text-xlight text-[0.75rem]">No one following you yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {tribeFollowers.slice(0, 8).map(u => (
                      <Link key={u.id} href={`/profile/${u.id}`} title={u.name} className="no-underline">
                        {u.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={u.avatarUrl} alt={u.name} referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm hover:scale-110 transition-transform" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber/60 to-amber flex items-center justify-center text-white font-bold text-[0.7rem] border-2 border-white shadow-sm hover:scale-110 transition-transform">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </Link>
                    ))}
                    {tribeFollowers.length > 8 && (
                      <div className="w-8 h-8 rounded-full bg-amber/10 border-2 border-white flex items-center justify-center text-amber text-[0.62rem] font-bold">
                        +{tribeFollowers.length - 8}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Link href="/tribe?tab=discover"
                className="mt-3 flex items-center justify-center gap-1.5 w-full border border-teal-light text-teal-deep text-[0.75rem] font-semibold py-2 rounded-full no-underline hover:bg-teal-ghost transition-colors">
                ✨ Discover more members
              </Link>
            </div>

            {/* Admin + Sign out — mobile */}
            <div className="sm:hidden flex flex-col items-center gap-2 py-2">
              {(profile.role === 'admin' || session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) && (
                <Link href="/admin"
                  className="flex items-center gap-1.5 text-[0.82rem] font-semibold text-amber bg-amber/10 border border-amber/30 px-4 py-2 rounded-full no-underline hover:bg-amber/20 transition-colors">
                  ⚙️ Admin Dashboard
                </Link>
              )}
              <button onClick={() => signOut({ callbackUrl: '/' })}
                className="text-[0.8rem] text-text-xlight hover:text-red-400 transition-colors">
                🚪 Sign out
              </button>
            </div>
          </div>

          {/* ── RIGHT MAIN ────────────────────────────────────────── */}
          <div>
            {/* Tab bar */}
            <div ref={tabsRef} className="flex gap-1 bg-white border border-teal-light/60 rounded-[18px] p-1.5 mb-5 shadow-card overflow-x-auto">
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

                {/* Gentle mode — soft support during rough patches */}
                <GentleBanner />

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
