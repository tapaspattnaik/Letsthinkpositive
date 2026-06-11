import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { awardCoins, claimedToday, dailyClaimAmount } from '@/lib/coins'

// GET — coin status: balance, today's claim state, recent ledger
export async function GET() {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const userId = Number(session.user.id)

  try {
    const [user, claimed, ledger] = await Promise.all([
      prisma.user.findUnique({
        where:  { id: userId },
        select: { coins: true, currentStreak: true, streakFreezes: true },
      }),
      claimedToday(userId),
      prisma.coinTransaction.findMany({
        where:   { userId },
        orderBy: { createdAt: 'desc' },
        take:    20,
        select:  { id: true, amount: true, reason: true, createdAt: true },
      }),
    ])

    return NextResponse.json({
      balance:       user?.coins ?? 0,
      streak:        user?.currentStreak ?? 0,
      streakFreezes: user?.streakFreezes ?? 0,
      claimedToday:  claimed,
      todayAmount:   dailyClaimAmount(user?.currentStreak ?? 0),
      ledger,
    })
  } catch (err) {
    console.error('Coins GET error:', err)
    return NextResponse.json({ error: 'Could not load coins.' }, { status: 500 })
  }
}

// POST — claim today's daily bonus (idempotent per day)
export async function POST() {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const userId = Number(session.user.id)

  try {
    if (await claimedToday(userId)) {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { coins: true } })
      return NextResponse.json({ ok: true, alreadyClaimed: true, balance: user?.coins ?? 0 })
    }

    const user = await prisma.user.findUnique({
      where:  { id: userId },
      select: { currentStreak: true },
    })
    const amount  = dailyClaimAmount(user?.currentStreak ?? 0)
    const balance = await awardCoins(userId, amount, 'daily_claim')

    return NextResponse.json({ ok: true, claimed: amount, balance })
  } catch (err) {
    console.error('Coins claim error:', err)
    return NextResponse.json({ error: 'Could not claim today.' }, { status: 500 })
  }
}
