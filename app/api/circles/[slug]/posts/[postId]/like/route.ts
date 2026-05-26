import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(_: NextRequest, { params }: { params: { slug: string; postId: string } }) {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in to like.' }, { status: 401 })

  const userId = Number(session.user.id)
  const postId = Number(params.postId)

  const existing = await prisma.postLike.findUnique({
    where: { postId_userId: { postId, userId } },
  })

  if (existing) {
    await prisma.postLike.delete({ where: { id: existing.id } })
    const count = await prisma.postLike.count({ where: { postId } })
    return NextResponse.json({ liked: false, count })
  } else {
    await prisma.postLike.create({ data: { postId, userId } })
    const count = await prisma.postLike.count({ where: { postId } })
    return NextResponse.json({ liked: true, count })
  }
}
