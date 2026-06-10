import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { TIER_STYLES } from '@/lib/badges'
import { FollowButton } from '@/components/FollowButton'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const user = await prisma.user.findUnique({ where: { id: Number(id) } })
  if (!user) return { title: 'Member not found' }
  return {
    title: `${user.name} — letsthinkpositive`,
    description: user.bio ?? `${user.name} is on their wellness journey at letsthinkpositive.com.`,
  }
}

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params
  const id = Number(idStr)
  if (isNaN(id)) notFound()

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      badges:   { include: { badge: true }, orderBy: { earnedAt: 'desc' } },
      posts:    {
        where: { approved: true }, orderBy: { createdAt: 'desc' }, take: 4,
        select: { id: true, title: true, body: true, createdAt: true, tags: true,
          _count: { select: { likes: true } } },
      },
      progress: { where: { completedAt: { not: null } }, orderBy: { completedAt: 'desc' } },
      _count:   { select: { followers: true, following: true } },
    },
  })

  if (!user) notFound()

  const interests  = user.interests ? user.interests.split(',').filter(Boolean) : []
  const joinedDate = new Date(user.createdAt)
  const joinedStr  = joinedDate.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
  const memberDays = Math.floor((Date.now() - joinedDate.getTime()) / 86400000)

  const CHALLENGE_META: Record<string, { icon: string; label: string; color: string }> = {
    'gratitude-30':    { icon: '🍂', label: '30-Day Gratitude',    color: 'bg-amber/10 border-amber/30' },
    'mindfulness-7':   { icon: '🧘', label: '7-Day Mindfulness',    color: 'bg-teal-ghost border-teal-light' },
    'movement-7':      { icon: '👣', label: '7 Days of Movement',   color: 'bg-teal-ghost border-teal-light' },
    'sleep-21':        { icon: '🌙', label: '21-Day Sleep Reset',   color: 'bg-indigo-50 border-indigo-200' },
    'affirmations-21': { icon: '⭐', label: '21-Day Affirmations',  color: 'bg-amber/10 border-amber/30' },
    'journal-14':      { icon: '📓', label: '14-Day Journaling',    color: 'bg-teal-ghost border-teal-light' },
  }

  // Deterministic cover based on interests or ID
  const COVER_STYLES = [
    { bg: 'from-teal-deep via-[#1a7a6e] to-teal-dark', label: 'Teal' },
    { bg: 'from-[#2A1A4A] via-[#4a2a7a] to-teal-dark', label: 'Purple' },
    { bg: 'from-[#b5451b] via-[#c8640a] to-[#e8a020]', label: 'Sunset' },
    { bg: 'from-[#0a1a4a] via-[#1a3a6a] to-teal-deep', label: 'Ocean' },
    { bg: 'from-[#1a2e1a] via-[#2d5a27] to-teal-deep', label: 'Forest' },
    { bg: 'from-[#3d1a5a] via-[#6a2a9a] to-teal-deep', label: 'Aurora' },
  ]
  const coverStyle = COVER_STYLES[id % COVER_STYLES.length]

  const hasActivity = user.posts.length > 0 || user.progress.length > 0 || user.badges.length > 0

  return (
    <div className="min-h-screen bg-[#f0f9f7] pt-[72px]">

      {/* ── Hero cover ──────────────────────────────────────── */}
      <div className={`h-[180px] sm:h-[220px] bg-gradient-to-br ${coverStyle.bg} relative overflow-hidden`}>
        <div className="absolute -top-8 -right-8 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute bottom-0 left-24 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute top-8 left-1/3 w-24 h-24 rounded-full bg-black/5" />
        <div className="absolute top-1/2 right-1/4 w-16 h-16 rounded-full bg-amber/10" />
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* ── Avatar + Follow row ─────────────────────────────
             Negative margin pulls the avatar up into the cover.
             Follow button is offset DOWN so it always sits in
             the white area, not inside the dark gradient.         */}
        <div className="-mt-[60px] sm:-mt-[72px] flex items-start justify-between mb-1">

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] rounded-full overflow-hidden border-[5px] border-white shadow-lift bg-teal-ghost flex items-center justify-center">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt={user.name} referrerPolicy="no-referrer"
                  className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${coverStyle.bg} flex items-center justify-center`}>
                  <span className="text-white font-display font-bold text-[2.8rem] drop-shadow">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            {(user.currentStreak ?? 0) >= 7 && (
              <div className="absolute -bottom-1 -right-1 bg-amber text-white text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm whitespace-nowrap">
                🔥 {user.currentStreak}d
              </div>
            )}
          </div>

          {/* Follow button — pushed down past the cover so it sits in white area */}
          <div className="mt-[64px] sm:mt-[80px] flex-shrink-0">
            <FollowButton userId={id} showStats={false} />
          </div>
        </div>

        {/* ── Name + meta — always in white area, never in cover ── */}
        <div className="mb-4 mt-3">
          <h1 className="font-display text-[1.7rem] sm:text-[2rem] font-bold text-charcoal leading-tight">
            {user.name}
          </h1>
          <p className="text-text-xlight text-[0.78rem] mt-1 flex items-center gap-2 flex-wrap">
            <span>Joined {joinedStr}</span>
            <span className="text-teal-light">·</span>
            <span className="text-teal-mid font-medium">{memberDays} days on the journey</span>
          </p>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="mb-3 text-text-mid text-[0.9rem] leading-[1.75] bg-white rounded-[14px] px-4 py-3 border border-teal-light/60 shadow-sm">
            {user.bio}
          </p>
        )}

        {/* Interests */}
        {interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {interests.map(i => (
              <span key={i} className="bg-white text-teal-deep text-[0.72rem] font-semibold px-3 py-1 rounded-full border border-teal-light shadow-sm">
                {i}
              </span>
            ))}
          </div>
        )}

        {/* ── Stats strip ─────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-6">
          {[
            { n: user._count.followers,   label: 'Followers',  icon: '👥', color: 'text-teal-deep'   },
            { n: user._count.following,   label: 'Following',  icon: '🤝', color: 'text-teal-mid'    },
            { n: user.currentStreak ?? 0, label: 'Streak',     icon: '🔥', color: 'text-orange-500'  },
            { n: user.badges.length,      label: 'Badges',     icon: '🏅', color: 'text-amber'       },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-[16px] py-3 px-2 text-center shadow-card border border-teal-light/60 hover:shadow-lift transition-shadow">
              <span className="text-[1.2rem] block mb-0.5">{s.icon}</span>
              <p className={`font-display font-bold text-[1.3rem] leading-none ${s.color}`}>{s.n}</p>
              <p className="text-text-xlight text-[0.62rem] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Main content ────────────────────────────────── */}
        <div className="space-y-4 pb-14">

          {/* Badges */}
          {user.badges.length > 0 && (
            <div className="bg-white rounded-[20px] p-5 shadow-card border border-teal-light/60">
              <h2 className="font-bold text-charcoal text-[0.95rem] mb-4 flex items-center gap-2">
                🏅 Badges earned
                <span className="bg-teal-ghost text-teal-deep text-[0.68rem] font-bold px-2 py-0.5 rounded-full">{user.badges.length}</span>
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {user.badges.map(({ badge, earnedAt }) => {
                  const style = TIER_STYLES[badge.tier] ?? TIER_STYLES.bronze
                  return (
                    <div key={badge.slug}
                      className={`${style.bg} border ${style.border} rounded-[14px] p-3 text-center hover:-translate-y-0.5 transition-transform`}>
                      <span className="text-[1.6rem] block mb-1">{badge.icon}</span>
                      <p className={`font-bold text-[0.72rem] ${style.text} leading-tight`}>{badge.name}</p>
                      <p className="text-[0.58rem] text-text-xlight mt-1">
                        {new Date(earnedAt).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Challenges completed */}
          {user.progress.length > 0 && (
            <div className="bg-white rounded-[20px] p-5 shadow-card border border-teal-light/60">
              <h2 className="font-bold text-charcoal text-[0.95rem] mb-3 flex items-center gap-2">
                🏆 Challenges completed
                <span className="bg-teal-ghost text-teal-deep text-[0.68rem] font-bold px-2 py-0.5 rounded-full">{user.progress.length}</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {user.progress.slice(0, 6).map(p => {
                  const meta = CHALLENGE_META[p.challengeSlug] ?? { icon: '🏆', label: p.challengeSlug, color: 'bg-teal-ghost border-teal-light' }
                  return (
                    <div key={p.id} className={`flex items-center gap-3 ${meta.color} border rounded-[12px] px-3 py-2.5`}>
                      <span className="text-[1.4rem] flex-shrink-0">{meta.icon}</span>
                      <div className="min-w-0">
                        <p className="font-semibold text-charcoal text-[0.82rem] truncate">{meta.label}</p>
                        <p className="text-text-xlight text-[0.68rem]">
                          ✓ {p.completedAt ? new Date(p.completedAt).toLocaleDateString('en-GB', { day:'numeric', month:'short' }) : 'Completed'}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Community stories */}
          {user.posts.length > 0 && (
            <div className="bg-white rounded-[20px] p-5 shadow-card border border-teal-light/60">
              <h2 className="font-bold text-charcoal text-[0.95rem] mb-3 flex items-center gap-2">
                💛 Stories shared
              </h2>
              <div className="space-y-3">
                {user.posts.map(post => (
                  <div key={post.id} className="group bg-teal-ghost/30 hover:bg-teal-ghost border border-transparent hover:border-teal-light rounded-[14px] p-3.5 transition-all">
                    <p className="font-semibold text-charcoal text-[0.88rem] group-hover:text-teal-deep transition-colors leading-snug mb-1">{post.title}</p>
                    <p className="text-text-mid text-[0.78rem] leading-[1.65] line-clamp-2">
                      {post.body.replace(/<[^>]+>/g, '')}
                    </p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="text-text-xlight text-[0.68rem]">
                        {new Date(post.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                      {post._count.likes > 0 && (
                        <span className="text-text-xlight text-[0.68rem]">❤️ {post._count.likes}</span>
                      )}
                      {post.tags?.split(',').filter(Boolean).slice(0,2).map(t => (
                        <span key={t} className="bg-amber/10 text-amber text-[0.62rem] font-medium px-1.5 py-0.5 rounded-full">#{t.trim()}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/community" className="block mt-3 text-teal-mid text-[0.78rem] font-semibold no-underline hover:text-teal-deep transition-colors text-center">
                See more in Community →
              </Link>
            </div>
          )}

          {/* Empty — new member welcome card */}
          {!hasActivity && (
            <div className="bg-white rounded-[20px] p-8 shadow-card border border-teal-light/60 text-center">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${coverStyle.bg} flex items-center justify-center mx-auto mb-4 shadow-md`}>
                <span className="text-white font-display font-bold text-[1.8rem]">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <p className="font-display font-bold text-charcoal text-[1.1rem] mb-2">
                {user.name} just joined! 🌱
              </p>
              <p className="text-text-mid text-[0.88rem] leading-[1.7] max-w-xs mx-auto">
                They&apos;re {memberDays <= 7 ? 'brand new to the community' : 'on their wellness journey'} — give them a warm welcome by connecting!
              </p>
              {/* Follow button is already in the header — no duplicate here */}
            </div>
          )}

          {/* Connect footer */}
          <div className="flex gap-3 justify-center flex-wrap pt-2">
            <Link href="/tribe" className="flex items-center gap-2 bg-teal-deep text-white px-5 py-2.5 rounded-full font-semibold text-[0.85rem] no-underline hover:bg-teal-dark transition-colors shadow-md">
              🌿 My Tribe
            </Link>
            <Link href="/community" className="flex items-center gap-2 bg-white border border-teal-light text-text-mid px-5 py-2.5 rounded-full font-semibold text-[0.85rem] no-underline hover:border-teal-mid hover:text-teal-deep transition-colors shadow-sm">
              💛 Community
            </Link>
            <Link href="/circles" className="flex items-center gap-2 bg-white border border-teal-light text-text-mid px-5 py-2.5 rounded-full font-semibold text-[0.85rem] no-underline hover:border-teal-mid hover:text-teal-deep transition-colors shadow-sm">
              🔒 Circles
            </Link>
          </div>

          <p className="text-center">
            <Link href="/community" className="text-text-xlight text-[0.75rem] no-underline hover:text-teal-mid transition-colors">
              ← Back to Community
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
