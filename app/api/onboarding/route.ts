/**
 * GET  /api/onboarding  → { needed: boolean }
 * POST /api/onboarding  → save goal + challenge, mark complete
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

const ONBOARDING_KEY = 'onboarding_completed'

export async function GET() {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ needed: false })

  const userId = Number(session.user.id)

  // Already completed?
  const done = await prisma.userMemory.findUnique({
    where: { userId_key: { userId, key: ONBOARDING_KEY } },
  })
  if (done) return NextResponse.json({ needed: false })

  // Check if new user (no mood entries yet)
  const moodCount = await prisma.moodEntry.count({ where: { userId } })
  if (moodCount > 0) {
    // Veteran user — mark onboarding done silently so we don't bother them
    await prisma.userMemory.upsert({
      where:  { userId_key: { userId, key: ONBOARDING_KEY } },
      create: { userId, key: ONBOARDING_KEY, value: 'skipped', source: 'system' },
      update: {},
    }).catch(() => {})
    return NextResponse.json({ needed: false })
  }

  return NextResponse.json({ needed: true })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ ok: false })

  const userId = Number(session.user.id)
  const body   = await req.json().catch(() => ({}))

  const { goal, challenge, time } = body as {
    goal?: string; challenge?: string; time?: string
  }

  // Save preferences
  const saves = [
    prisma.userMemory.upsert({
      where:  { userId_key: { userId, key: ONBOARDING_KEY } },
      create: { userId, key: ONBOARDING_KEY, value: 'completed', source: 'onboarding' },
      update: { value: 'completed' },
    }),
  ]

  if (goal) {
    saves.push(prisma.userMemory.upsert({
      where:  { userId_key: { userId, key: 'onboarding_goal' } },
      create: { userId, key: 'onboarding_goal', value: goal, source: 'onboarding' },
      update: { value: goal },
    }))
  }
  if (challenge) {
    saves.push(prisma.userMemory.upsert({
      where:  { userId_key: { userId, key: 'onboarding_challenge' } },
      create: { userId, key: 'onboarding_challenge', value: challenge, source: 'onboarding' },
      update: { value: challenge },
    }))
  }
  if (time) {
    saves.push(prisma.userMemory.upsert({
      where:  { userId_key: { userId, key: 'onboarding_time' } },
      create: { userId, key: 'onboarding_time', value: time, source: 'onboarding' },
      update: { value: time },
    }))
  }

  await Promise.all(saves).catch(() => {})

  // Also pre-set interests from goal mapping
  const GOAL_INTERESTS: Record<string, string> = {
    anxiety:    'Anxiety Relief,Mindfulness,Breathing',
    sleep:      'Sleep,Relaxation,Mindfulness',
    gratitude:  'Gratitude,Journaling,Mindfulness',
    wellbeing:  'Self-Care,Gratitude,Movement',
    movement:   'Movement,Self-Care,Habits',
  }
  if (goal && GOAL_INTERESTS[goal]) {
    await prisma.user.update({
      where: { id: userId },
      data:  { interests: GOAL_INTERESTS[goal] },
    }).catch(() => {})
  }

  return NextResponse.json({ ok: true })
}
