import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Cache for 5 minutes — this is public data that doesn't need to be real-time
export const revalidate = 300

export async function GET() {
  try {
    // Limit rows — enough for accurate counts without loading entire table
    const rows = await prisma.challengeProgress.findMany({
      select: {
        challengeSlug: true,
        user: { select: { avatarUrl: true, name: true } },
      },
      orderBy: { startedAt: 'desc' },
      take: 500,
    })

    const map: Record<string, { count: number; avatars: { url: string | null; name: string }[] }> = {}
    for (const row of rows) {
      if (!map[row.challengeSlug]) map[row.challengeSlug] = { count: 0, avatars: [] }
      map[row.challengeSlug].count++
      if (map[row.challengeSlug].avatars.length < 5) {
        map[row.challengeSlug].avatars.push({
          url:  row.user.avatarUrl ?? null,
          name: row.user.name,
        })
      }
    }

    return NextResponse.json(map)
  } catch {
    return NextResponse.json({})
  }
}
