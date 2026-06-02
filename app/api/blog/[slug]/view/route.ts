import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import crypto from 'crypto'

// POST — record a view (upsert so same visitor only counts once)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const forwarded = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'anon'
    const ua        = req.headers.get('user-agent') ?? ''
    const ipHash    = crypto.createHash('sha256').update(forwarded + ua + slug).digest('hex').slice(0, 64)

    await prisma.blogView.upsert({
      where:  { slug_ipHash: { slug, ipHash } },
      update: {},   // already viewed — don't increment
      create: { slug, ipHash },
    })

    const count = await prisma.blogView.count({ where: { slug } })
    return NextResponse.json({ views: count })
  } catch (err) {
    console.error('View track error:', err)
    return NextResponse.json({ views: 0 })
  }
}

// GET — just fetch the count
export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const count = await prisma.blogView.count({ where: { slug } })
    return NextResponse.json({ views: count })
  } catch {
    return NextResponse.json({ views: 0 })
  }
}
