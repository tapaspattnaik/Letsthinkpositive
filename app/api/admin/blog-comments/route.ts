import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminUser } from '@/lib/admin'

async function requireAdmin() {
  return getAdminUser()
}

// GET — pending blog comments
export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') ?? 'pending'

  const comments = await prisma.blogComment.findMany({
    where:   status === 'all' ? {} : { approved: status === 'approved' },
    orderBy: { createdAt: 'desc' },
    take:    50,
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
    },
  })

  return NextResponse.json(comments)
}

// PATCH — approve or reject a comment
export async function PATCH(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  // Support both { id, action: 'approve'|'reject' } and legacy { id, approved: bool }
  const id     = body.id
  const approve = body.action ? body.action === 'approve' : !!body.approved

  if (approve) {
    await prisma.blogComment.update({ where: { id }, data: { approved: true } })
  } else {
    await prisma.blogComment.delete({ where: { id } })
  }

  return NextResponse.json({ ok: true })
}
