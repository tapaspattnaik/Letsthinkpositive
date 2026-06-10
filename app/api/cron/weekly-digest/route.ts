import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { prisma } from '@/lib/db'
import { getAllPosts } from '@/lib/posts'
import { sendEmail } from '@/lib/email'

// ── Auth ───────────────────────────────────────────────────────────────────
const CRON_SECRET = process.env.CRON_SECRET ?? ''

// ── Groq singleton ─────────────────────────────────────────────────────────
const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null

// ── ISO Week helper ────────────────────────────────────────────────────────
function getISOWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

// Generate a generic warm community reflection (one Groq call, shared across non-users)
async function generateCommunityReflection(weekOf: string): Promise<string> {
  const fallback = `Every small step you take towards your wellbeing is worth celebrating — this week and always. The community around you is walking the same path, one mindful moment at a time.`

  if (!groq) return fallback

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      stream: false,
      max_tokens: 80,
      temperature: 0.75,
      messages: [
        {
          role: 'system',
          content: `You write warm, brief wellness email openers for a community wellness app.
Write exactly 2 sentences: one warm reflection on the value of showing up for yourself this week,
and one encouraging nudge for the week ahead. Tone: gentle, uplifting, never preachy.`,
        },
        {
          role: 'user',
          content: `Write this week's opening reflection for the wellness newsletter (week of ${weekOf}).`,
        },
      ],
    })
    const text = completion.choices[0]?.message?.content?.trim()
    return text || fallback
  } catch {
    return fallback
  }
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? ''
  if (CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const since = new Date()
  since.setDate(since.getDate() - 7)
  const currentWeek = getISOWeek(new Date())
  const weekLabel = since.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })

  // ── Fetch content ──────────────────────────────────────────────────────────
  const [stories, subscribers] = await Promise.all([
    prisma.communityPost.findMany({
      where:   { approved: true, postType: 'story', createdAt: { gte: since } },
      orderBy: { likes: { _count: 'desc' } },
      take:    3,
      select:  { id: true, title: true, body: true, author: true, user: { select: { name: true } } },
    }),
    prisma.subscriber.findMany({
      where:  { active: true },
      select: { email: true, name: true },
    }),
  ])

  if (subscribers.length === 0)
    return NextResponse.json({ ok: true, sent: 0, reason: 'No active subscribers' })

  const allPosts = getAllPosts()
  const latestPosts = allPosts.slice(0, 3)

  // ── Look up user accounts for subscribers (to personalise narrative) ──────
  const subEmails = subscribers.map(s => s.email)
  const usersByEmail = await prisma.user.findMany({
    where:  { email: { in: subEmails } },
    select: { id: true, email: true, currentStreak: true },
  })
  const userEmailMap = new Map(usersByEmail.map(u => [u.email, u]))

  // ── Fetch cached WeeklyInsights for users who have one this week ──────────
  const userIds = usersByEmail.map(u => u.id)
  const weeklyInsights = userIds.length > 0
    ? await prisma.weeklyInsight.findMany({
        where: { userId: { in: userIds }, week: currentWeek },
        select: { userId: true, insight: true },
      })
    : []
  const insightByUserId = new Map(weeklyInsights.map(w => [w.userId, w.insight]))

  // ── Generate one community reflection for non-users ───────────────────────
  const communityReflection = await generateCommunityReflection(weekLabel)

  // ── Build shared HTML blocks ───────────────────────────────────────────────
  const storyRows = stories.map(s =>
    `<li style="margin-bottom:12px">
      <strong>${s.title}</strong><br/>
      <span style="color:#666;font-size:14px">${s.body.slice(0, 120)}…</span><br/>
      <span style="color:#888;font-size:13px">— ${s.user?.name ?? s.author}</span>
    </li>`
  ).join('')

  const blogRows = latestPosts.map(p =>
    `<li style="margin-bottom:12px">
      <a href="https://letsthinkpositive.com/blog/${p.slug}" style="color:#0d9488;text-decoration:none;font-weight:600">${p.title}</a><br/>
      <span style="color:#666;font-size:14px">${p.excerpt}</span>
    </li>`
  ).join('')

  // ── Send personalised emails ───────────────────────────────────────────────
  const sentList: string[] = []

  for (const sub of subscribers) {
    const firstName = sub.name?.split(' ')[0] ?? 'Friend'

    // Determine narrative: personal AI insight > community reflection
    const user = userEmailMap.get(sub.email)
    const personalInsight = user ? insightByUserId.get(user.id) : undefined
    const narrative = personalInsight ?? communityReflection
    const isPersonal = !!personalInsight

    const narrativeBlock = `
  <div style="background:#f0faf8;border-left:4px solid #0d9488;border-radius:0 12px 12px 0;padding:20px 24px;margin:20px 0">
    ${isPersonal ? `<p style="font-size:0.7rem;font-weight:700;color:#0d9488;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 8px">✨ Your Week in Review</p>` : ''}
    <p style="font-size:0.97rem;line-height:1.75;color:#2d3b3b;margin:0;font-style:italic">${narrative}</p>
  </div>`

    const html = `
<!DOCTYPE html>
<html>
<body style="font-family:'Segoe UI',Arial,sans-serif;max-width:580px;margin:0 auto;padding:32px 24px;background:#f9fdfb;color:#2d3b3b">
  <div style="text-align:center;margin-bottom:28px">
    <span style="font-size:2rem">🌿</span>
    <h1 style="font-family:Georgia,serif;color:#0f5f5f;font-size:1.5rem;margin:8px 0 4px">
      Your Weekly Wellness Digest
    </h1>
    <p style="color:#999;font-size:0.85rem;margin:0">letsthinkpositive.com · Week of ${weekLabel}</p>
  </div>

  <p style="font-size:1rem;line-height:1.7;color:#444">Hi ${firstName},</p>

  ${narrativeBlock}

  ${stories.length > 0 ? `
  <div style="background:#fff;border-radius:16px;padding:24px;margin:20px 0;border:1px solid #d1ebe8">
    <h2 style="font-size:1rem;color:#0f5f5f;margin:0 0 16px">🌟 Community Highlights</h2>
    <ul style="padding-left:20px;margin:0">${storyRows}</ul>
    <a href="https://letsthinkpositive.com/community" style="display:inline-block;margin-top:16px;color:#0d9488;font-size:0.88rem;font-weight:600">Read all stories →</a>
  </div>` : ''}

  ${latestPosts.length > 0 ? `
  <div style="background:#fff;border-radius:16px;padding:24px;margin:20px 0;border:1px solid #d1ebe8">
    <h2 style="font-size:1rem;color:#0f5f5f;margin:0 0 16px">📖 Latest Articles</h2>
    <ul style="padding-left:20px;margin:0">${blogRows}</ul>
    <a href="https://letsthinkpositive.com/blog" style="display:inline-block;margin-top:16px;color:#0d9488;font-size:0.88rem;font-weight:600">Read the blog →</a>
  </div>` : ''}

  <div style="background:linear-gradient(135deg,#0f5f5f,#0d9488);border-radius:16px;padding:24px;margin:20px 0;text-align:center">
    <p style="color:#fff;font-size:1rem;margin:0 0 16px">Take 5 minutes for yourself today 🌿</p>
    <a href="https://letsthinkpositive.com/coach" style="display:inline-block;background:#f5c842;color:#2d3b3b;padding:12px 28px;border-radius:50px;font-weight:700;font-size:0.9rem;text-decoration:none">
      Chat with Calm Coach →
    </a>
  </div>

  <p style="text-align:center;color:#bbb;font-size:0.75rem;margin-top:32px">
    You're receiving this because you subscribed to letsthinkpositive.com<br/>
    <a href="https://letsthinkpositive.com/unsubscribe?email=${encodeURIComponent(sub.email)}" style="color:#bbb">Unsubscribe</a>
  </p>
</body>
</html>`

    try {
      await sendEmail({
        to:      sub.email,
        subject: `Your weekly dose of positivity 🌿`,
        html,
      })
      sentList.push(sub.email)
    } catch (err) {
      console.error(`Weekly digest failed for ${sub.email}:`, err)
    }
  }

  return NextResponse.json({ ok: true, sent: sentList.length, total: subscribers.length })
}
