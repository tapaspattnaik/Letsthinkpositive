import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { randomBytes } from 'crypto'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email?.trim())
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 })

  // Always respond with success to avoid email enumeration
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })

  if (user && user.password) {
    // Invalidate old tokens
    await prisma.passwordReset.updateMany({
      where: { userId: user.id, used: false },
      data:  { used: true },
    })

    const token     = randomBytes(48).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.passwordReset.create({ data: { userId: user.id, token, expiresAt } })

    const siteUrl   = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://letsthinkpositive.com'
    const resetLink = `${siteUrl}/reset-password/${token}`

    try {
      const transporter = nodemailer.createTransport({
        host:   process.env.SMTP_HOST ?? 'smtp.hostinger.com',
        port:   Number(process.env.SMTP_PORT ?? 465),
        secure: process.env.SMTP_SECURE !== 'false',
        auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        tls:    { rejectUnauthorized: false },
      })

      await transporter.sendMail({
        from:    `"letsthinkpositive" <${process.env.SMTP_USER}>`,
        to:      user.email,
        subject: 'Reset your letsthinkpositive password',
        html: `
          <div style="font-family:sans-serif;max-width:560px;color:#2E4A4A">
            <h2 style="color:#1A6B6B;border-bottom:2px solid #E8A020;padding-bottom:8px">
              Password Reset Request
            </h2>
            <p>Hello ${user.name},</p>
            <p>We received a request to reset your password. Click the link below — it's valid for <strong>1 hour</strong>.</p>
            <div style="text-align:center;margin:28px 0">
              <a href="${resetLink}" style="background:#1A7A6E;color:#fff;text-decoration:none;padding:14px 32px;border-radius:50px;font-weight:600;display:inline-block">
                Reset My Password →
              </a>
            </div>
            <p style="font-size:0.85rem;color:#7A9898">
              If you didn't request this, you can safely ignore this email.<br/>
              This link will expire in 1 hour.
            </p>
            <p style="font-size:0.82rem;color:#7A9898;margin-top:24px">
              — The letsthinkpositive team
            </p>
          </div>`,
      })
    } catch (err) {
      console.error('Forgot-password email error:', err)
    }
  }

  return NextResponse.json({ ok: true })
}
