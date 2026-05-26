import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({})

  const rows = await prisma.challengeProgress.findMany({
    where: { userId: Number(session.user.id) },
  })

  const result: Record<string, {
    enrolled: boolean
    completedDays: string[]
    completedAt: string | null
    startedAt: string
  }> = {}

  for (const r of rows) {
    result[r.challengeSlug] = {
      enrolled:      true,
      completedDays: JSON.parse(r.completedDays || '[]'),
      completedAt:   r.completedAt?.toISOString() ?? null,
      startedAt:     r.startedAt.toISOString(),
    }
  }

  return NextResponse.json(result)
}
