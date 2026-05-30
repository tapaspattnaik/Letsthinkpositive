import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getSession()
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Sign in to heart.' }, { status: 401 })

  const postId = Number(id)
  const userId = Number(session.user.id)

  const existing = await prisma.galleryHeart.findUnique({
    where: { postId_userId: { postId, userId } },
  })

  if (existing) {
    await prisma.galleryHeart.delete({ where: { id: existing.id } })
  } else {
    await prisma.galleryHeart.create({ data: { postId, userId } })
  }

  const count = await prisma.galleryHeart.count({ where: { postId } })
  return NextResponse.json({ hearted: !existing, count })
}
