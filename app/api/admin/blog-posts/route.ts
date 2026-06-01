import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? process.env.SMTP_USER ?? ''

async function requireAdmin() {
  const session = await getSession()
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) return null
  return session
}

// GET — list blog posts by status
export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const status = req.nextUrl.searchParams.get('status') ?? 'pending'

  const posts = await prisma.userBlogPost.findMany({
    where:   status === 'all' ? {} : { status },
    orderBy: { createdAt: 'desc' },
    take:    50,
    include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
  })

  return NextResponse.json(posts)
}

// PATCH — approve or reject a post
export async function PATCH(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, action, adminNote } = await req.json()
  if (!id || !['approve', 'reject'].includes(action))
    return NextResponse.json({ error: 'id and action (approve|reject) required' }, { status: 400 })

  const newStatus = action === 'approve' ? 'approved' : 'rejected'

  const post = await prisma.userBlogPost.update({
    where: { id: Number(id) },
    data:  { status: newStatus },
  })

  return NextResponse.json({ ok: true, post })
}
