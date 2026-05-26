import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import crypto from 'crypto'

export async function GET(_: NextRequest, { params }: { params: { slug: string } }) {
  const session = await getSession()
  const userId  = session?.user?.id ? Number(session.user.id) : null
  const count   = await prisma.blogLike.count({ where: { slug: params.slug } })
  let likedByMe = false
  if (userId) {
    const mine = await prisma.blogLike.findUnique({ where: { slug_userId: { slug: params.slug, userId } } })
    likedByMe = !!mine
  }
  return NextResponse.json({ count, likedByMe })
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await getSession()
  const userId  = session?.user?.id ? Number(session.user.id) : null

  // For anonymous users use a hash of IP+UA so it's not stored raw
  const forwarded = req.headers.get('x-forwarded-for') ?? 'anon'
  const ua        = req.headers.get('user-agent') ?? ''
  const ipHash    = !userId ? crypto.createHash('sha256').update(forwarded + ua).digest('hex') : null

  if (userId) {
    const existing = await prisma.blogLike.findUnique({ where: { slug_userId: { slug: params.slug, userId } } })
    if (existing) {
      await prisma.blogLike.delete({ where: { id: existing.id } })
      const count = await prisma.blogLike.count({ where: { slug: params.slug } })
      return NextResponse.json({ liked: false, count })
    }
    await prisma.blogLike.create({ data: { slug: params.slug, userId } })
  } else {
    // anonymous — idempotent by ipHash
    const existing = await prisma.blogLike.findFirst({ where: { slug: params.slug, ipHash } })
    if (existing) {
      await prisma.blogLike.delete({ where: { id: existing.id } })
      const count = await prisma.blogLike.count({ where: { slug: params.slug } })
      return NextResponse.json({ liked: false, count })
    }
    await prisma.blogLike.create({ data: { slug: params.slug, ipHash } })
  }

  const count = await prisma.blogLike.count({ where: { slug: params.slug } })
  return NextResponse.json({ liked: true, count })
}
