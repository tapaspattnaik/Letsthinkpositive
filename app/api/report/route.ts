import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in to report a post.' }, { status: 401 })
  }
  const reporterId = Number(session.user.id)

  const { postType, postId, reason, details } = await req.json()
  if (!postType || !postId || !reason) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  // Prevent duplicate pending reports from same user for same post
  const existing = await prisma.postReport.findFirst({
    where: { reporterId, postType, postId: Number(postId), status: 'pending' },
  })
  if (existing) {
    return NextResponse.json({ message: 'You have already reported this post.' })
  }

  await prisma.postReport.create({
    data: {
      reporterId,
      postType,
      postId:  Number(postId),
      reason,
      details: details?.trim() || null,
      status:  'pending',
    },
  })

  return NextResponse.json({ message: 'Report submitted. Our team will review it.' })
}
