import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

function calcDuration(bedtime: string, wakeTime: string): number {
  const [bh, bm] = bedtime.split(':').map(Number)
  const [wh, wm] = wakeTime.split(':').map(Number)
  let bedMins  = bh * 60 + bm
  let wakeMins = wh * 60 + wm
  if (wakeMins <= bedMins) wakeMins += 24 * 60  // crossed midnight
  return wakeMins - bedMins
}

// GET — last 30 days of sleep logs
export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user?.id) return NextResponse.json([], { status: 401 })

    const logs = await prisma.sleepLog.findMany({
      where:   { userId: Number(session.user.id) },
      orderBy: { date: 'desc' },
      take:    30,
    })
    return NextResponse.json(logs)
  } catch (err) {
    console.error('Sleep GET error:', err)
    return NextResponse.json([], { status: 500 })
  }
}

// POST — log a sleep entry
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 })

    const { date, bedtime, wakeTime, quality, notes } = await req.json()

    if (!date || !bedtime || !wakeTime || !quality)
      return NextResponse.json({ error: 'Date, bedtime, wake time and quality are required.' }, { status: 400 })
    if (quality < 1 || quality > 5)
      return NextResponse.json({ error: 'Quality must be 1–5.' }, { status: 400 })

    const durationMins = calcDuration(bedtime, wakeTime)
    if (durationMins < 30 || durationMins > 1440)
      return NextResponse.json({ error: 'Please check your sleep times.' }, { status: 400 })

    const log = await prisma.sleepLog.upsert({
      where:  { userId_date: { userId: Number(session.user.id), date } },
      update: { bedtime, wakeTime, durationMins, quality, notes: notes || null },
      create: { userId: Number(session.user.id), date, bedtime, wakeTime, durationMins, quality, notes: notes || null },
    })

    return NextResponse.json(log)
  } catch (err) {
    console.error('Sleep POST error:', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

// DELETE — remove a log
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    const { id } = await req.json()
    await prisma.sleepLog.deleteMany({ where: { id: Number(id), userId: Number(session.user.id) } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Could not delete.' }, { status: 500 })
  }
}
