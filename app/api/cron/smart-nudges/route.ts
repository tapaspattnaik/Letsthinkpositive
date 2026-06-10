import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import nodemailer from 'nodemailer'

// Smart nudge cron — call HOURLY from Hostinger cron: GET /api/cron/smart-nudges?secret=YOUR_CRON_SECRET
// Checks user behaviour and sends targeted in-app + email nudges.
//
// Smart timing: streak nudges go out in the hour window just before each user's
// natural logging time (median hour of their recent mood logs) instead of one
// fixed hour for everyone. Users without history fall back to DEFAULT_NUDGE_HOUR.
// Dedupe guards make hourly invocation safe — each nudge fires at most once/day.

const CRON_SECRET = process.env.CRON_SECRET ?? ''
const SITE_URL    = process.env.NEXTAUTH_URL ?? 'https://letsthinkpositive.com'
const DEFAULT_NUDGE_HOUR = 18  // fallback send hour (server time) for users with no log history

// Median hour-of-day of a user's recent mood logs (server timezone — consistent
// since their own timestamps are stored in the same clock)
function medianLogHour(timestamps: Date[]): number | null {
  if (timestamps.length < 5) return null
  const hours = timestamps.map(t => t.getHours()).sort((a, b) => a - b)
  return hours[Math.floor(hours.length / 2)]
}

interface NudgeType {
  type:    string
  message: string
  link:    string
  subject: string
  html:    string
}

function makeTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
}

async function sendNudgeEmail(to: string, name: string, nudge: NudgeType) {
  try {
    const transport = makeTransport()
    await transport.sendMail({
      from:    `"Let's Think Positive" <${process.env.SMTP_USER}>`,
      to,
      subject: nudge.subject,
      html:    nudge.html,
    })
  } catch (err) {
    console.error('Nudge email failed:', err)
  }
}

export async function GET(req: NextRequest) {
  // Verify cron secret
  const secret = req.nextUrl.searchParams.get('secret')
  if (CRON_SECRET && secret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const now         = new Date()
  const oneDayAgo   = new Date(now.getTime() - 86400000)
  const twoDaysAgo  = new Date(now.getTime() - 2 * 86400000)
  const fiveDaysAgo = new Date(now.getTime() - 5 * 86400000)

  let nudgesSent = 0

  const currentHour = now.getHours()

  // ── 1. Streak about to break (active streak, no activity in 20+ hrs) ────
  const streakUsers = await prisma.user.findMany({
    where: {
      blocked:       false,
      currentStreak: { gt: 1 },
      lastActiveDate: { lt: oneDayAgo, gte: twoDaysAgo },
    },
    select: { id: true, name: true, email: true, currentStreak: true },
    take: 100,
  })

  for (const u of streakUsers) {
    // Smart timing — send in the hour just before this user's natural log time
    const recentLogs = await prisma.moodEntry.findMany({
      where:   { userId: u.id },
      select:  { createdAt: true },
      orderBy: { createdAt: 'desc' },
      take:    20,
    })
    const naturalHour = medianLogHour(recentLogs.map(l => l.createdAt)) ?? DEFAULT_NUDGE_HOUR
    // Window: [naturalHour - 1, naturalHour] — catch them right before their usual moment
    const inWindow = currentHour === naturalHour || currentHour === (naturalHour + 23) % 24
    if (!inWindow) continue

    // Don't spam — check if we already sent this nudge today
    const already = await prisma.notification.findFirst({
      where: { userId: u.id, type: 'nudge_streak', createdAt: { gte: oneDayAgo } },
    })
    if (already) continue

    await prisma.notification.create({
      data: {
        userId:  u.id,
        type:    'nudge_streak',
        message: `⚡ Your ${u.currentStreak}-day streak ends tonight! Log your mood or journal to keep it alive.`,
        link:    '/mood',
      },
    })

    await sendNudgeEmail(u.email, u.name, {
      type:    'streak',
      message: '',
      link:    `${SITE_URL}/mood`,
      subject: `🔥 Don't break your ${u.currentStreak}-day streak!`,
      html:    `<p>Hi ${u.name},</p>
<p>You're on a <strong>${u.currentStreak}-day streak</strong> — don't let it slip away today!</p>
<p>Just a quick mood check-in or journal entry keeps it going 💪</p>
<p><a href="${SITE_URL}/mood" style="background:#1A6B6B;color:#fff;padding:10px 22px;border-radius:8px;text-decoration:none;display:inline-block;">Log my mood →</a></p>
<p style="color:#999;font-size:12px;">You can unsubscribe from nudge emails in your profile settings.</p>`,
    })
    nudgesSent++
  }

  // ── 2 & 3 run once daily at the default hour (cron itself is hourly) ────
  if (currentHour !== DEFAULT_NUDGE_HOUR) {
    return NextResponse.json({ success: true, nudgesSent, timestamp: now.toISOString() })
  }

  // ── 2. Mood has been low (≤ 2) for 3+ days ─────────────────────────────
  const threeDay = new Date(now.getTime() - 3 * 86400000)
  const lowMoodUsers = await prisma.moodEntry.groupBy({
    by:     ['userId'],
    where:  { createdAt: { gte: threeDay }, mood: { lte: 2 } },
    having: { mood: { _count: { gte: 3 } } },
  })

  for (const { userId } of lowMoodUsers.slice(0, 50)) {
    const already = await prisma.notification.findFirst({
      where: { userId, type: 'nudge_low_mood', createdAt: { gte: twoDaysAgo } },
    })
    if (already) continue

    const u = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true, blocked: true } })
    if (!u || u.blocked) continue

    await prisma.notification.create({
      data: {
        userId,
        type:    'nudge_low_mood',
        message: `💙 You've been feeling low lately. Your Calm Coach is here — even 5 minutes can help.`,
        link:    '/coach',
      },
    })

    await sendNudgeEmail(u.email, u.name, {
      type:    'low_mood',
      message: '',
      link:    `${SITE_URL}/coach`,
      subject: `💙 We noticed you've been having a tough few days`,
      html:    `<p>Hi ${u.name},</p>
<p>We noticed your mood has been low recently. That's okay — we all have those periods.</p>
<p>Your Calm Coach is here whenever you need to talk it through, at any hour of the day.</p>
<p><a href="${SITE_URL}/coach" style="background:#1A6B6B;color:#fff;padding:10px 22px;border-radius:8px;text-decoration:none;display:inline-block;">Chat with Calm Coach →</a></p>
<p>You're not alone. 💙</p>`,
    })
    nudgesSent++
  }

  // ── 3. No journal entry in 5+ days ─────────────────────────────────────
  const activeUsers = await prisma.user.findMany({
    where: {
      blocked:       false,
      lastActiveDate: { gte: fiveDaysAgo },  // active but not journalling
      gratitudeEntries: { none: { createdAt: { gte: fiveDaysAgo } } },
    },
    select: { id: true, name: true, email: true },
    take: 100,
  })

  for (const u of activeUsers) {
    const already = await prisma.notification.findFirst({
      where: { userId: u.id, type: 'nudge_journal', createdAt: { gte: fiveDaysAgo } },
    })
    if (already) continue

    await prisma.notification.create({
      data: {
        userId:  u.id,
        type:    'nudge_journal',
        message: `📓 You haven't journalled in a few days. Even one sentence can shift your perspective.`,
        link:    '/journal',
      },
    })
    nudgesSent++
    // Email only every 7 days to avoid fatigue
  }

  return NextResponse.json({
    success: true,
    nudgesSent,
    timestamp: now.toISOString(),
  })
}
