import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: { slug: string; postId: string } }) {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in to comment.' }, { status: 401 })

  const userId = Number(session.user.id)
  const postId = Number(params.postId)
  const { body } = await req.json()

  if (!body?.trim()) return NextResponse.json({ error: 'Comment required.' }, { status: 400 })

  // verify post exists
  const post = await prisma.groupPost.findUnique({ where: { id: postId } })
  if (!post) return NextResponse.json({ error: 'Post not found.' }, { status: 404 })

  const comment = await prisma.postComment.create({
    data: { postId, userId, body: body.trim().slice(0, 500) },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  })

  return NextResponse.json(comment)
}
