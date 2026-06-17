import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { awardCoins } from '@/lib/coins'

// ── Birthday check ──────────────────────────────────────────────────────────
// Returns whether today is the signed-in user's birthday. On their birthday,
// awards a one-time bonus (idempotent per year via the coin ledger reason).

const BIRTHDAY_BONUS = 50

export async function GET() {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ isBirthday: false })
  const userId = Number(session.user.id)

  try {
    const user = await prisma.user.findUnique({
      where:  { id: userId },
      select: { name: true, dateOfBirth: true },
    })
    if (!user?.dateOfBirth) return NextResponse.json({ isBirthday: false })

    const now = new Date()
    const dob = new Date(user.dateOfBirth)
    const isBirthday = dob.getMonth() === now.getMonth() && dob.getDate() === now.getDate()
    if (!isBirthday) return NextResponse.json({ isBirthday: false })

    const age = now.getFullYear() - dob.getFullYear()
    const reason = `birthday_bonus_${now.getFullYear()}`

    // Award once per year
    const already = await prisma.coinTransaction.findFirst({
      where: { userId, reason }, select: { id: true },
    })
    let awarded = false
    if (!already) {
      await awardCoins(userId, BIRTHDAY_BONUS, reason)
      awarded = true
    }

    return NextResponse.json({
      isBirthday: true,
      name: user.name.split(' ')[0],
      age: age > 0 && age < 130 ? age : null,
      bonus: BIRTHDAY_BONUS,
      awarded,
    })
  } catch {
    return NextResponse.json({ isBirthday: false })
  }
}
