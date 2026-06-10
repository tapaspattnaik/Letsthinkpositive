import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminUser } from '@/lib/admin'
import nodemailer from 'nodemailer'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

async function requireAdmin() {
  return getAdminUser()
}

// GET — fetch single user's full profile for admin
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params

  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
    select: {
      id: true, name: true, email: true, phone: true, bio: true, website: true,
      role: true, blocked: true, blockedReason: true, blockedAt: true,
      avatarUrl: true, createdAt: true, lastLoginAt: true,
      currentStreak: true, longestStreak: true,
      interests: true,
      _count: {
        select: {
          blogSubmissions: true, posts: true, reports: true,
          moodEntries: true, habits: true,
        },
      },
    },
  })

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Reports filed against this user
  const reportsAgainst = await prisma.postReport.findMany({
    where:   { reportedUserId: Number(id) },
    orderBy: { createdAt: 'desc' },
    take:    10,
    include: {
      reporter: { select: { id: true, name: true, email: true } },
    },
  })

  return NextResponse.json({ user, reportsAgainst })
}

// PATCH — update role, block/unblock, or reset password
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const { action, reason, role, newPassword } = await req.json()

  const userId = Number(id)

  try {
    if (action === 'block') {
      await prisma.user.update({
        where: { id: userId },
        data: {
          blocked:       true,
          blockedReason: reason ?? 'Blocked by admin',
          blockedAt:     new Date(),
        },
      })
      // Create notification (user can't see it while blocked, but logged)
      await prisma.notification.create({
        data: {
          userId,
          type:    'account_blocked',
          message: `Your account has been suspended. Reason: ${reason ?? 'Violation of community guidelines'}`,
          link:    '/contact',
        },
      })
      return NextResponse.json({ success: true, action: 'blocked' })
    }

    if (action === 'unblock') {
      await prisma.user.update({
        where: { id: userId },
        data:  { blocked: false, blockedReason: null, blockedAt: null },
      })
      await prisma.notification.create({
        data: {
          userId,
          type:    'account_unblocked',
          message: 'Your account has been reinstated. Welcome back!',
          link:    '/',
        },
      })
      return NextResponse.json({ success: true, action: 'unblocked' })
    }

    if (action === 'set_role') {
      if (!['user', 'moderator', 'admin'].includes(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
      }
      await prisma.user.update({ where: { id: userId }, data: { role } })
      return NextResponse.json({ success: true, action: 'role_updated', role })
    }

    if (action === 'send_reset') {
      // Generate a password reset token and email the user
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } })
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

      const token   = crypto.randomBytes(32).toString('hex')
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      await prisma.passwordReset.create({ data: { userId, token, expiresAt: expires } })

      const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${token}`

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT ?? 587),
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      })

      await transporter.sendMail({
        from:    `"Let's Think Positive" <${process.env.SMTP_USER}>`,
        to:      user.email,
        subject: 'Reset your password — Let\'s Think Positive',
        html: `<p>Hi ${user.name},</p>
          <p>An admin has initiated a password reset for your account.</p>
          <p><a href="${resetUrl}" style="background:#1A6B6B;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">Reset Password</a></p>
          <p>This link expires in 24 hours. If you did not expect this email, contact us.</p>`,
      })

      return NextResponse.json({ success: true, action: 'reset_sent' })
    }

    if (action === 'set_password') {
      // Admin directly sets a new temporary password
      if (!newPassword || newPassword.length < 8) {
        return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
      }
      const hashed = await bcrypt.hash(newPassword, 12)
      await prisma.user.update({ where: { id: userId }, data: { password: hashed } })
      return NextResponse.json({ success: true, action: 'password_set' })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    console.error('Admin user action error:', err)
    return NextResponse.json({ error: 'Action failed' }, { status: 500 })
  }
}
