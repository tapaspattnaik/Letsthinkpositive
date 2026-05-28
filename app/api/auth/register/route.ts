import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone, bio, interests } = await req.json()

    if (!name || !email || !password)
      return NextResponse.json({ error: 'Name, email and password are required.' }, { status: 400 })

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing)
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })

    const hashed = await bcrypt.hash(password, 12)

    // Check if early adopter (first 100 users)
    const count = await prisma.user.count()

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        phone:     phone    || null,
        bio:       bio      || null,
        interests: Array.isArray(interests) ? interests.join(',') : (interests || ''),
      },
    })

    // Award Early Believer badge if in first 100
    if (count < 100) {
      const earlyBadge = await prisma.badge.findUnique({ where: { slug: 'early-adopter' } })
      if (earlyBadge) {
        await prisma.userBadge.create({ data: { userId: user.id, badgeId: earlyBadge.id } })
      }
    }

    // Welcome email — fire and forget
    sendWelcomeEmail({ email: user.email, name: user.name }).catch(e =>
      console.error('Welcome email error:', e)
    )

    return NextResponse.json({ success: true, userId: user.id })
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
