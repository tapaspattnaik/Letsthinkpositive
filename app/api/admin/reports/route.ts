import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? process.env.SMTP_USER ?? ''

async function requireAdmin() {
  const session = await getSession()
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) return null
  return session
}

// GET — list all reports (admin only)
export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const status = req.nextUrl.searchParams.get('status') ?? 'pending'

  const reports = await prisma.postReport.findMany({
    where:   status === 'all' ? {} : { status },
    orderBy: { createdAt: 'desc' },
    include: {
      reporter: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  })

  // Enrich each report with the actual post content
  const enriched = await Promise.all(reports.map(async r => {
    let postSnippet = ''
    let postAuthor  = ''
    let postDeleted = false

    try {
      if (r.postType === 'community') {
        const p = await prisma.communityPost.findUnique({ where: { id: r.postId } })
        postSnippet = p?.body?.slice(0, 200) ?? ''
        postAuthor  = p?.author ?? ''
        postDeleted = !p
      } else if (r.postType === 'circle') {
        const p = await prisma.groupPost.findUnique({
          where: { id: r.postId }, include: { user: { select: { name: true } } }
        })
        postSnippet = p?.body?.slice(0, 200) ?? ''
        postAuthor  = p?.user?.name ?? ''
        postDeleted = !p
      } else if (r.postType === 'user_blog') {
        const p = await prisma.userBlogPost.findUnique({
          where: { id: r.postId }, include: { user: { select: { name: true } } }
        })
        postSnippet = p?.title ?? ''
        postAuthor  = p?.user?.name ?? ''
        postDeleted = !p
      }
    } catch { /* ignore */ }

    return { ...r, postSnippet, postAuthor, postDeleted }
  }))

  return NextResponse.json(enriched)
}
