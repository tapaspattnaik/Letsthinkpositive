import Link from 'next/link'
import { prisma } from '@/lib/db'

/** Returns the ISO week string for today, e.g. "2025-W21" */
function currentISOWeek(): string {
  const now = new Date()
  const jan1 = new Date(now.getFullYear(), 0, 1)
  const jan1DayOfWeek = (jan1.getDay() + 6) % 7
  const weekNum = Math.ceil(
    ((now.getTime() - jan1.getTime()) / 86400000 + jan1DayOfWeek + 1) / 7
  )
  return `${now.getFullYear()}-W${String(weekNum).padStart(2, '0')}`
}

function truncate(text: string, max: number) {
  if (text.length <= max) return text
  return text.slice(0, max).replace(/\s+\S*$/, '') + '…'
}

export async function StoryOfWeek() {
  try {
    const week = currentISOWeek()

    const [community, blog] = await Promise.all([
      prisma.communityPost.findFirst({
        where: { featuredWeek: week, approved: true },
        select: {
          id: true, title: true, body: true, author: true, createdAt: true,
          user: { select: { name: true } },
        },
      }),
      prisma.userBlogPost.findFirst({
        where: { featuredWeek: week, status: 'approved' },
        select: {
          id: true, title: true, excerpt: true, body: true, slug: true,
          createdAt: true,
          user: { select: { name: true } },
        },
      }),
    ])

    const story = community
      ? {
          title:   community.title,
          excerpt: truncate(community.body, 180),
          author:  community.user?.name ?? community.author,
          date:    community.createdAt,
          href:    '/community',
          type:    'community' as const,
        }
      : blog
      ? {
          title:   blog.title,
          excerpt: truncate(blog.excerpt ?? blog.body, 180),
          author:  blog.user?.name ?? 'Anonymous',
          date:    blog.createdAt,
          href:    blog.slug ? `/blog/${blog.slug}` : '/blog',
          type:    'blog' as const,
        }
      : null

    if (!story) return null

    const formattedDate = story.date.toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    })

    return (
      <section className="relative py-20 px-[5%] overflow-hidden bg-gradient-to-br from-[#F5C96A]/30 via-[#F8F8F4] to-[#E8A020]/20">
        {/* Decorative large quote mark */}
        <span
          aria-hidden="true"
          className="absolute -top-4 left-[4%] font-display text-[14rem] leading-none text-amber/10 select-none pointer-events-none"
          style={{ lineHeight: 1 }}
        >
          &ldquo;
        </span>

        <div className="relative max-w-4xl mx-auto">
          {/* Label */}
          <div className="flex items-center gap-2 mb-5">
            <span className="text-[0.72rem] font-bold tracking-[0.2em] uppercase text-[#B07818]">
              📖 Story of the Week
            </span>
            <span className="h-px flex-1 max-w-[60px] bg-amber/40" />
          </div>

          {/* Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-[28px] border border-amber/30 shadow-[0_8px_40px_rgba(232,160,32,0.12)] p-8 md:p-12">
            <h2 className="font-display text-[clamp(1.6rem,3.2vw,2.4rem)] text-charcoal leading-tight mb-5 max-w-[680px]">
              {story.title}
            </h2>

            <p className="text-[1rem] text-[#3a3a3a]/80 leading-[1.85] mb-8 max-w-[640px]">
              {story.excerpt}
            </p>

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-mid to-teal-deep flex items-center justify-center text-white text-[0.85rem] font-bold flex-shrink-0">
                  {story.author.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-[0.85rem] font-semibold text-charcoal leading-none mb-0.5">
                    {story.author}
                  </p>
                  <p className="text-[0.75rem] text-[#888]">{formattedDate}</p>
                </div>
              </div>

              <Link
                href={story.href}
                className="inline-flex items-center gap-2 bg-amber text-charcoal px-7 py-3 rounded-full font-semibold text-[0.9rem] no-underline hover:bg-amber-soft hover:-translate-y-0.5 transition-all shadow-sm"
              >
                Read the full story →
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  } catch {
    // Gracefully hide if DB is unavailable
    return null
  }
}
