import { prisma } from '@/lib/db'

// ── Hope Coins 🪙 ───────────────────────────────────────────────────────────
// Earned through showing up; spent in the rewards store. User.coins is the
// balance, CoinTransaction is the append-only ledger.

export const COIN_RULES = {
  DAILY_BASE:          10,  // daily claim
  DAILY_WEEK_BONUS:     5,  // extra when streak ≥ 7
  DAILY_MONTH_BONUS:   10,  // extra when streak ≥ 30 (replaces week bonus)
  CHALLENGE_COMPLETE:  50,
  BADGE_EARNED:        25,
} as const

/** Daily claim amount for a given streak — longer streaks earn more, the comeback hook. */
export function dailyClaimAmount(streak: number): number {
  if (streak >= 30) return COIN_RULES.DAILY_BASE + COIN_RULES.DAILY_MONTH_BONUS
  if (streak >= 7)  return COIN_RULES.DAILY_BASE + COIN_RULES.DAILY_WEEK_BONUS
  return COIN_RULES.DAILY_BASE
}

/** Append a ledger entry and adjust the balance. Returns the new balance. */
export async function awardCoins(userId: number, amount: number, reason: string): Promise<number> {
  const [, user] = await prisma.$transaction([
    prisma.coinTransaction.create({ data: { userId, amount, reason } }),
    prisma.user.update({
      where: { id: userId },
      data:  { coins: { increment: amount } },
      select: { coins: true },
    }),
  ])
  return user.coins
}

/** Spend coins if the balance allows. Returns new balance, or null if insufficient. */
export async function spendCoins(userId: number, amount: number, reason: string): Promise<number | null> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { coins: true } })
  if (!user || user.coins < amount) return null
  return awardCoins(userId, -amount, reason)
}

/** Has the user already claimed today's daily bonus? (server-local midnight) */
export async function claimedToday(userId: number): Promise<boolean> {
  const midnight = new Date()
  midnight.setHours(0, 0, 0, 0)
  const txn = await prisma.coinTransaction.findFirst({
    where: { userId, reason: 'daily_claim', createdAt: { gte: midnight } },
    select: { id: true },
  })
  return !!txn
}
