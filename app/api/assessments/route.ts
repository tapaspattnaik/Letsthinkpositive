import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET — fetch all previous assessment scores for the logged-in user
export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user?.id) return NextResponse.json([], { status: 401 })

    const results = await prisma.wellnessAssessment.findMany({
      where:   { userId: Number(session.user.id) },
      orderBy: { createdAt: 'desc' },
      take:    50,
    })

    // Return latest score per test + all history
    const latest: Record<string, typeof results[0]> = {}
    for (const r of results) {
      if (!latest[r.testKey]) latest[r.testKey] = r
    }

    return NextResponse.json({ history: results, latest })
  } catch (err) {
    console.error('Assessments GET error:', err)
    return NextResponse.json({ history: [], latest: {} })
  }
}

// POST — save a completed assessment result
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

    const { testKey, score, band, answers } = await req.json()
    if (!testKey || score === undefined || !band)
      return NextResponse.json({ error: 'testKey, score and band required' }, { status: 400 })

    const result = await prisma.wellnessAssessment.create({
      data: {
        userId:  Number(session.user.id),
        testKey,
        score,
        band,
        answers: JSON.stringify(answers ?? []),
      },
    })

    return NextResponse.json({ ok: true, result })
  } catch (err) {
    console.error('Assessments POST error:', err)
    return NextResponse.json({ error: 'Could not save result' }, { status: 500 })
  }
}
