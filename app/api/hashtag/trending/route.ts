import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const TZ_REGION: Record<string, string> = {
  America: 'Americas', US: 'Americas', Canada: 'Americas', Brazil: 'Americas',
  Europe: 'Europe',
  Asia: 'Asia', Indian: 'Asia',
  Australia: 'Oceania', Pacific: 'Oceania',
  Africa: 'Africa',
  Atlantic: 'Americas',
}

function tzToRegion(tz: string | null | undefined): string {
  if (!tz) return 'Global'
  return TZ_REGION[tz.split('/')[0]] ?? 'Global'
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const timezone   = searchParams.get('timezone')
  const userRegion = tzToRegion(timezone)

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const posts = await prisma.communityPost.findMany({
    where: { approved: true, createdAt: { gte: since }, NOT: { tags: '' } },
    select: { tags: true, user: { select: { timezone: true } } },
    take: 2000,
  })

  const global:   Record<string, number> = {}
  const regional: Record<string, number> = {}

  for (const post of posts) {
    const postRegion = tzToRegion(post.user?.timezone)
    const tags = post.tags
      .split(',')
      .map(t => t.trim().replace(/^#/, '').toLowerCase())
      .filter(t => t.length > 0 && t.length <= 40)

    for (const tag of tags) {
      global[tag]   = (global[tag]   ?? 0) + 1
      if (postRegion === userRegion && userRegion !== 'Global') {
        regional[tag] = (regional[tag] ?? 0) + 1
      }
    }
  }

  const top = (counts: Record<string, number>, n: number) =>
    Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([tag, count]) => ({ tag, count }))

  return NextResponse.json({
    global:   top(global,   15),
    regional: top(regional,  8),
    region:   userRegion,
  })
}
