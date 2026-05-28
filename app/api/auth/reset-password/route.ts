import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { token, password } = await req.json()

  if (!token || !password || password.length < 8)
    return NextResponse.json({ error: 'Token and a password of at least 8 characters are required.' }, { status: 400 })

  const record = await prisma.passwordReset.findUnique({ where: { token } })

  if (!record || record.used || record.expiresAt < new Date())
    return NextResponse.json({ error: 'This reset link has expired or already been used.' }, { status: 400 })

  const hashed = await bcrypt.hash(password, 12)

  await prisma.user.update({
    where: { id: record.userId },
    data:  { password: hashed },
  })

  await prisma.passwordReset.update({
    where: { id: record.id },
    data:  { used: true },
  })

  return NextResponse.json({ ok: true })
}
