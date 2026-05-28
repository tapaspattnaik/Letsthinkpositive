import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAllPosts } from '@/lib/posts'
import { sendEmail } from '@/lib/email'

// Protect with a shared secret — add CRON_SECRET to your .env
const CRON_SECRET = process.env.CRON_SECRET ?? ''

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? ''
  if (CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const since = new Date()
  since.setDate(since.getDate() - 7)

  // ── Top community stories this week ─────────────────────────────────────
  const stories = await prisma.communityPost.findMany({
    where:   { approved: true, postType: 'story', createdAt: { gte: since } },
    orderBy: { likes: { _count: 'desc' } },
    take:    3,
    select:  { id: true, title: true, body: true, author: true, user: { select: { name: true } } },
  })

  // ── Latest blog posts ────────────────────────────────────────────────────
  const allPosts = getAllPosts()
  const latestPosts = allPosts.slice(0, 3)

  // ── All active subscribers ───────────────────────────────────────────────
  const subscribers = await prisma.subscriber.findMany({
    where:  { active: true },
    select: { email: true, name: true },
  })

  if (subscribers.length === 0)
    return NextResponse.json({ ok: true, sent: 0, reason: 'No active subscribers' })

  const storyRows = stories.map(s =>
    `<li style="margin-bottom:12px">
      <strong>${s.title}</strong><br/>
      <span style="color:#666;font-size:14px">${(s.body).slice(0, 120)}…</span><br/>
      <span style="color:#888;font-size:13px">— ${s.user?.name ?? s.author}</span>
    </li>`
  ).join('')

  const blogRows = latestPosts.map(p =>
    `<li style="margin-bottom:12px">
      <a href="https://letsthinkpositive.com/blog/${p.slug}" style="color:#0d9488;text-decoration:none;font-weight:600">${p.title}</a><br/>
      <span style="color:#666;font-size:14px">${p.excerpt}</span>
    </li>`
  ).join('')

  const sentList: string[] = []

  for (const sub of subscribers) {
    const firstName = sub.name?.split(' ')[0] ?? 'Friend'

    const html = `
<!DOCTYPE html>
<html>
<body style="font-family:'Segoe UI',Arial,sans-serif;max-width:580px;margin:0 auto;padding:32px 24px;background:#f9fdfb;color:#2d3b3b">
  <div style="text-align:center;margin-bottom:28px">
    <span style="font-size:2rem">🌿</span>
    <h1 style="font-family:Georgia,serif;color:#0f5f5f;font-size:1.5rem;margin:8px 0 4px">
      Your Weekly Wellness Digest
    </h1>
    <p style="color:#999;font-size:0.85rem;margin:0">letsthinkpositive.com · Week of ${since.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}</p>
  </div>

  <p style="font-size:1rem;line-height:1.7;color:#444">Hi ${firstName},</p>
  <p style="font-size:1rem;line-height:1.7;color:#444">
    Here's a curated dose of positivity from your community this week 💛
  </p>

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
