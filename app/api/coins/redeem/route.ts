import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { spendCoins } from '@/lib/coins'

// ── Rewards store catalog ───────────────────────────────────────────────────
// Streak freezes protect the streak; exclusive badges show on the profile.
// Extend here when adding real-world rewards later.

const STORE: Record<string, {
  cost: number
  label: string
  type: 'freeze' | 'badge'
  badge?: { slug: string; name: string; description: string; icon: string; tier: string }
}> = {
  freeze: {
    cost: 100, label: 'Streak Freeze', type: 'freeze',
  },
  'badge-star': {
    cost: 250, label: 'Star Supporter badge', type: 'badge',
    badge: { slug: 'coin-star-supporter', name: 'Star Supporter', description: 'Redeemed with Hope Coins — a true regular of the community.', icon: '🌟', tier: 'gold' },
  },
  'badge-butterfly': {
    cost: 500, label: 'Butterfly of Hope badge', type: 'badge',
    badge: { slug: 'coin-butterfly-hope', name: 'Butterfly of Hope', description: 'The rarest coin reward — earned through remarkable consistency.', icon: '🦋', tier: 'platinum' },
  },
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const userId = Number(session.user.id)

  const { item } = await req.json().catch(() => ({}))
  const product = STORE[item as string]
  if (!product) return NextResponse.json({ error: 'Unknown item.' }, { status: 400 })

  try {
    // Pre-checks before spending
    if (product.type === 'freeze') {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { streakFreezes: true } })
      if ((user?.streakFreezes ?? 0) >= 3) {
        return NextResponse.json({ error: 'You already hold the maximum of 3 streak freezes.' }, { status: 400 })
      }
    }
    if (product.type === 'badge' && product.badge) {
      const badge = await prisma.badge.findUnique({ where: { slug: product.badge.slug } })
      if (badge) {
        const owned = await prisma.userBadge.findUnique({ where: { userId_badgeId: { userId, badgeId: badge.id } } })
        if (owned) return NextResponse.json({ error: 'You already own this badge.' }, { status: 400 })
      }
    }

    const balance = await spendCoins(userId, product.cost, `redeem_${item}`)
    if (balance === null) {
      return NextResponse.json({ error: `Not enough coins — ${product.label} costs ${product.cost} 🪙.` }, { status: 400 })
    }

    // Apply the reward
    if (product.type === 'freeze') {
      await prisma.user.update({ where: { id: userId }, data: { streakFreezes: { increment: 1 } } })
    } else if (product.badge) {
      const badge = await prisma.badge.upsert({
        where:  { slug: product.badge.slug },
        create: { ...product.badge, challenge: null },
        update: {},
      })
      await prisma.userBadge.create({ data: { userId, badgeId: badge.id } })
    }

    await prisma.notification.create({
      data: {
        userId,
        type:    'reward_redeemed',
        message: `🎁 Redeemed: ${product.label} for ${product.cost} 🪙. Balance: ${balance}.`,
        link:    '/rewards',
      },
    }).catch(() => {})

    return NextResponse.json({ ok: true, balance, item: product.label })
  } catch (err) {
    console.error('Redeem error:', err)
    return NextResponse.json({ error: 'Redemption failed — try again.' }, { status: 500 })
  }
}
