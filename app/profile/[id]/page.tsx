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
    description: user.bio ?? `${user.name} is a member of the letsthinkpositive wellness community.`,
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
      posts:    { where: { approved: true }, orderBy: { createdAt: 'desc' }, take: 5,
                  select: { id: true, title: true, body: true, createdAt: true, tags: true,
                    _count: { select: { likes: true } } } },
      progress: { where: { completedAt: { not: null } }, orderBy: { completedAt: 'desc' } },
      followers:{ select: { id: true }, take: 1 }, // just count via _count below
      _count:   { select: { followers: true, following: true } },
    },
  })

  if (!user) notFound()

  const interests   = user.interests ? user.interests.split(',').filter(Boolean) : []
  const joinedDate  = new Date(user.createdAt)
  const joinedStr   = joinedDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  const memberDays  = Math.floor((Date.now() - joinedDate.getTime()) / 86400000)

  // Cover gradient based on user ID (deterministic)
  const COVERS = [
    'from-teal-deep to-teal-dark',
    'from-[#2A1A4A] to-teal-dark',
    'from-[#b5451b] to-[#e8a020]',
    'from-[#0a1a4a] to-teal-deep',
    'from-[#3d1a5a] to-teal-deep',
    'from-[#1a2e1a] to-teal-deep',
  ]
  const cover = COVERS[id % COVERS.length]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f9f7] to-ivory pt-[72px]">

      {/* ── Cover + Avatar ──────────────────────────────────────────── */}
      <div className={`h-[160px] sm:h-[200px] bg-gradient-to-r ${cover} relative overflow-hidden`}>
        <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full bg-white/5" />
        <div className="absolute bottom-0 left-20 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute top-6 left-1/3 w-20 h-20 rounded-full bg-black/5" />
      </div>

      <div className="max-w-3xl mx-auto px-[5%]">

        {/* Avatar + name row */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-14 sm:-mt-16 pb-6 border-b border-teal-light/50">
          <div className="relative flex-shrink-0">
            <div className="w-[110px] h-[110px] sm:w-[120px] sm:h-[120px] rounded-full overflow-hidden border-4 border-white shadow-lift bg-teal-ghost flex items-center justify-center">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt={user.name} referrerPolicy="no-referrer"
                  className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-teal-mid to-teal-deep flex items-center justify-center">
                  <span className="text-white font-display font-bold text-[2.8rem]">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            {/* Online-style streak dot */}
            {(user.currentStreak ?? 0) > 0 && (
              <div className="absolute bottom-2 right-2 w-5 h-5 bg-amber rounded-full border-2 border-white flex items-center justify-center"
                title={`${user.currentStreak}-day streak`}>
                <span className="text-[0.5rem]">🔥</span>
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left sm:pb-2">
            <h1 className="font-display text-[1.7rem] sm:text-[2rem] font-bold text-charcoal leading-tight">
              {user.name}
            </h1>
            <p className="text-text-xlight text-[0.82rem] mt-0.5">
              Member since {joinedStr} · {memberDays} days in the community
            </p>
            {user.bio && (
              <p className="text-text-mid text-[0.9rem] mt-1.5 leading-[1.65] max-w-[500px] mx-auto sm:mx-0">
                {user.bio}
              </p>
            )}
            {interests.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5 justify-center sm:justify-start">
                {interests.slice(0, 6).map(i => (
                  <span key={i} className="bg-teal-ghost text-teal-deep text-[0.72rem] font-semibold px-2.5 py-0.5 rounded-full border border-teal-light">
                    {i}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Follow button desktop */}
          <div className="hidden sm:block flex-shrink-0 pb-2">
            <FollowButton userId={id} />
          </div>
        </div>

        {/* ── Stats row ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-3 py-5">
          {[
            { value: user._count.followers, label: 'Followers',  icon: '👥' },
            { value: user._count.following, label: 'Following',  icon: '🤝' },
            { value: user.currentStreak ?? 0, label: 'Day Streak', icon: '🔥' },
            { value: user.badges.length,    label: 'Badges',     icon: '🏅' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-[16px] p-3 sm:p-4 text-center shadow-card border border-teal-light/60">
              <span className="text-[1.3rem] block mb-0.5">{s.icon}</span>
              <p className="font-display font-bold text-[1.3rem] sm:text-[1.5rem] leading-none text-charcoal">{s.value}</p>
              <p className="text-text-xlight text-[0.62rem] sm:text-[0.7rem] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Follow button mobile */}
        <div className="sm:hidden mb-5">
          <FollowButton userId={id} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5 pb-12">

          {/* Left — activity feed */}
          <div className="space-y-5">

            {/* Completed challenges */}
            {user.progress.length > 0 && (
              <div className="bg-white rounded-[20px] p-5 shadow-card border border-teal-light/60">
                <h2 className="font-display font-bold text-charcoal text-[1rem] mb-4 flex items-center gap-2">
                  🏆 Challenges Completed
                  <span className="text-text-xlight font-normal text-[0.8rem]">({user.progress.length})</span>
                </h2>
                <div className="space-y-2.5">
                  {user.progress.slice(0, 5).map(p => {
                    const META: Record<string, { icon: string; label: string }> = {
                      'gratitude-30':    { icon: '🍂', label: '30-Day Gratitude' },
                      'mindfulness-7':   { icon: '🧘', label: '7-Day Mindfulness' },
                      'movement-7':      { icon: '👣', label: '7 Days of Movement' },
                      'sleep-21':        { icon: '🌙', label: '21-Day Sleep Reset' },
                      'affirmations-21': { icon: '⭐', label: '21-Day Affirmations' },
                      'journal-14':      { icon: '📓', label: '14-Day Journaling' },
                    }
                    const meta = META[p.challengeSlug] ?? { icon: '🏆', label: p.challengeSlug }
                    return (
                      <div key={p.id} className="flex items-center gap-3 bg-teal-ghost/30 rounded-[12px] px-4 py-2.5">
                        <span className="text-[1.3rem]">{meta.icon}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-charcoal text-[0.85rem]">{meta.label}</p>
                          <p className="text-text-xlight text-[0.7rem]">
                            Completed {p.completedAt ? new Date(p.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                          </p>
                        </div>
                        <span className="text-teal-mid text-[0.72rem] font-bold bg-teal-ghost px-2 py-0.5 rounded-full">✓ Done</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Community posts */}
            {user.posts.length > 0 && (
              <div className="bg-white rounded-[20px] p-5 shadow-card border border-teal-light/60">
                <h2 className="font-display font-bold text-charcoal text-[1rem] mb-4 flex items-center gap-2">
                  💛 Community Stories
                  <span className="text-text-xlight font-normal text-[0.8rem]">({user.posts.length})</span>
                </h2>
                <div className="space-y-3">
                  {user.posts.map(post => (
                    <div key={post.id} className="border-b border-teal-light/40 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-charcoal text-[0.9rem] leading-snug">{post.title}</p>
                          <p className="text-text-mid text-[0.82rem] leading-[1.65] mt-0.5 line-clamp-2">
                            {post.body.replace(/<[^>]+>/g, '')}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-text-xlight text-[0.7rem]">
                              {new Date(post.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            </span>
                            {post._count.likes > 0 && (
                              <span className="text-text-xlight text-[0.7rem]">❤️ {post._count.likes}</span>
                            )}
                            {post.tags && post.tags.split(',').filter(Boolean).slice(0, 2).map(t => (
                              <span key={t} className="bg-amber/10 text-amber text-[0.62rem] font-medium px-1.5 py-0.5 rounded-full">#{t.trim()}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/community" className="block mt-4 text-teal-mid text-[0.8rem] font-semibold no-underline hover:text-teal-deep transition-colors">
                  View in Community →
                </Link>
              </div>
            )}

            {/* Empty state */}
            {user.posts.length === 0 && user.progress.length === 0 && (
              <div className="bg-white rounded-[20px] p-8 shadow-card border border-teal-light/60 text-center">
                <p className="text-[2.5rem] mb-3">🌱</p>
                <p className="font-semibold text-charcoal text-[0.95rem] mb-1">Just getting started</p>
                <p className="text-text-xlight text-[0.85rem]">{user.name} is on their wellness journey. Check back soon!</p>
              </div>
            )}
          </div>

          {/* Right — badges + sidebar */}
          <div className="space-y-5">

            {/* Badges */}
            <div className="bg-white rounded-[20px] p-5 shadow-card border border-teal-light/60">
              <h2 className="font-bold text-charcoal text-[0.95rem] mb-4 flex items-center gap-2">
                🏅 Badges
                <span className="text-text-xlight font-normal text-[0.8rem]">({user.badges.length})</span>
              </h2>
              {user.badges.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-[2rem] mb-2">🌱</p>
                  <p className="text-text-xlight text-[0.82rem]">No badges yet — challenges in progress!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {user.badges.map(({ badge, earnedAt }) => {
                    const style = TIER_STYLES[badge.tier] ?? TIER_STYLES.bronze
                    return (
                      <div key={badge.slug} className={`${style.bg} border ${style.border} rounded-[14px] p-3 text-center hover:-translate-y-0.5 transition-transform`}>
                        <span className="text-[1.6rem] block mb-1">{badge.icon}</span>
                        <p className={`font-bold text-[0.75rem] ${style.text} leading-tight mb-0.5`}>{badge.name}</p>
                        <span className={`text-[0.58rem] font-bold uppercase tracking-widest ${style.text} opacity-60`}>{style.label}</span>
                        <p className="text-[0.6rem] text-text-xlight mt-1">
                          {new Date(earnedAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="bg-gradient-to-br from-teal-ghost to-white border border-teal-light rounded-[20px] p-5">
              <h2 className="font-bold text-charcoal text-[0.9rem] mb-3">Connect</h2>
              <div className="space-y-2.5">
                <FollowButton userId={id} />
                <Link href="/community"
                  className="flex items-center gap-2 w-full justify-center bg-white border border-teal-light text-teal-deep px-4 py-2.5 rounded-full font-semibold text-[0.82rem] no-underline hover:border-teal-mid hover:shadow-card transition-all">
                  💛 See their posts
                </Link>
                <Link href="/circles"
                  className="flex items-center gap-2 w-full justify-center bg-white border border-teal-light text-text-mid px-4 py-2.5 rounded-full font-semibold text-[0.82rem] no-underline hover:border-teal-mid transition-all">
                  🔒 Browse Circles
                </Link>
              </div>
            </div>

            <div className="text-center">
              <Link href="/community" className="text-text-xlight text-[0.78rem] no-underline hover:text-teal-mid transition-colors">
                ← Back to Community
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
