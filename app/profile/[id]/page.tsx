import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { TIER_STYLES } from '@/lib/badges'
import type { Metadata } from 'next'

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await prisma.user.findUnique({ where: { id: Number(params.id) } })
  if (!user) return { title: 'Member not found' }
  return { title: `${user.name} — letsthinkpositive`, description: user.bio ?? undefined }
}

export default async function PublicProfilePage({ params }: Props) {
  const id = Number(params.id)
  if (isNaN(id)) notFound()

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      badges:  { include: { badge: true }, orderBy: { earnedAt: 'desc' } },
      posts:   { where: { approved: true }, orderBy: { createdAt: 'desc' }, take: 5 },
      progress:{ where: { completedAt: { not: null } }, orderBy: { completedAt: 'desc' } },
    },
  })

  if (!user) notFound()

  const interests  = user.interests ? user.interests.split(',').filter(Boolean) : []
  const joinedYear = new Date(user.createdAt).getFullYear()

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-ghost to-ivory py-14 px-[5%]">
      <div className="max-w-2xl mx-auto">

        {/* Profile card */}
        <div className="bg-white rounded-[28px] p-8 shadow-lift border border-teal-light mb-6 text-center">
          <div className="w-[90px] h-[90px] rounded-full overflow-hidden border-4 border-teal-light bg-teal-ghost flex items-center justify-center mx-auto mb-4">
            {user.avatarUrl
              ? <Image src={user.avatarUrl} alt={user.name} fill className="object-cover" sizes="90px" />
              : <span className="text-[2.2rem]">🌿</span>}
          </div>
          <h1 className="font-display text-[1.8rem] font-bold text-charcoal mb-1">{user.name}</h1>
          <p className="text-[0.82rem] text-text-xlight mb-3">Member since {joinedYear}</p>
          {user.bio && <p className="text-text-mid text-[0.93rem] leading-[1.7] mb-4 max-w-[420px] mx-auto">{user.bio}</p>}
          {interests.length > 0 && (
            <div className="flex flex-wrap gap-1.5 justify-center">
              {interests.map(i => (
                <span key={i} className="bg-teal-ghost text-teal-deep text-[0.76rem] font-medium px-3 py-1 rounded-full">{i}</span>
              ))}
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="bg-white rounded-[28px] p-8 shadow-lift border border-teal-light mb-6">
          <h2 className="font-display text-[1.2rem] font-bold text-charcoal mb-1">
            Badges <span className="text-text-xlight font-normal text-[0.9rem]">({user.badges.length})</span>
          </h2>
          {user.badges.length === 0 ? (
            <p className="text-text-xlight text-[0.88rem] py-4">No badges yet — challenges are in progress!</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
              {user.badges.map(({ badge, earnedAt }) => {
                const style = TIER_STYLES[badge.tier] ?? TIER_STYLES.bronze
                return (
                  <div key={badge.slug} className={`${style.bg} border-2 ${style.border} rounded-[16px] p-4 text-center`}>
                    <span className="text-[2rem] block mb-1.5">{badge.icon}</span>
                    <p className={`font-bold text-[0.85rem] ${style.text} leading-tight mb-1`}>{badge.name}</p>
                    <span className={`text-[0.65rem] font-bold uppercase tracking-wider ${style.text} opacity-70`}>{style.label}</span>
                    <p className="text-[0.65rem] text-text-xlight mt-1">
                      {new Date(earnedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Community stories */}
        {user.posts.length > 0 && (
          <div className="bg-white rounded-[28px] p-8 shadow-lift border border-teal-light mb-6">
            <h2 className="font-display text-[1.2rem] font-bold text-charcoal mb-4">
              Stories <span className="text-text-xlight font-normal text-[0.9rem]">({user.posts.length})</span>
            </h2>
            <div className="space-y-4">
              {user.posts.map(post => (
                <div key={post.id} className="border-b border-teal-light/40 pb-4 last:border-0 last:pb-0">
                  <p className="font-semibold text-[0.93rem] text-charcoal mb-1">{post.title}</p>
                  <p className="text-text-mid text-[0.85rem] leading-[1.7] line-clamp-2">{post.body}</p>
                  <p className="text-[0.75rem] text-text-xlight mt-1">
                    {new Date(post.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <Link href="/community" className="text-teal-mid text-[0.85rem] font-semibold no-underline hover:text-teal-deep transition-colors">
            ← Back to Community
          </Link>
        </div>
      </div>
    </div>
  )
}
