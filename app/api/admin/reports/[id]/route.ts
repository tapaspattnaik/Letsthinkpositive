import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminUser } from '@/lib/admin'
import nodemailer from 'nodemailer'
import { createNotification } from '@/lib/notifications'

async function requireAdmin() {
  return getAdminUser()
}

async function sendReporterEmail(to: string, reporterName: string, adminNote: string, action: string) {
  if (!process.env.SMTP_HOST) return
  try {
    const transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   Number(process.env.SMTP_PORT ?? 465),
      secure: process.env.SMTP_SECURE === 'true',
      auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
    const subject = action === 'removed'
      ? 'Update on your report — post removed'
      : action === 'kept'
      ? 'Update on your report — post kept'
      : 'Update on your report'

    await transporter.sendMail({
      from:    `letsthinkpositive <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #333;">
          <h2 style="color: #1a7a6e;">Hello ${reporterName},</h2>
          <p>Thank you for helping keep our community safe. Here's an update on the post you reported:</p>
          <div style="background: #f0f9f7; border-left: 4px solid #1a7a6e; padding: 16px; border-radius: 0 8px 8px 0; margin: 16px 0;">
            <p style="margin: 0; font-style: italic;">${adminNote}</p>
          </div>
          ${action === 'removed'
            ? '<p>The post has been <strong>removed</strong> from our platform. Thank you for bringing this to our attention.</p>'
            : action === 'kept'
            ? '<p>After review, we have decided to <strong>keep the post</strong> as it does not violate our community guidelines.</p>'
            : ''}
          <p>We appreciate your contribution to keeping letsthinkpositive.com a safe, positive space.</p>
          <p style="color: #888; font-size: 0.85em;">— The letsthinkpositive team</p>
        </div>`,
    })
  } catch (err) {
    console.error('Report email error:', err)
  }
}

// PATCH — admin resolves a report (adds note, optionally deletes post)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const reportId = Number(id)
  const { adminNote, action } = await req.json()
  // action: 'remove' | 'keep' | 'dismiss'

  const report = await prisma.postReport.findUnique({
    where:   { id: reportId },
    include: { reporter: { select: { name: true, email: true } } },
  })
  if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 })

  // ── Take action on the post ──────────────────────────────
  if (action === 'remove') {
    try {
      if (report.postType === 'community') {
        await prisma.communityPost.delete({ where: { id: report.postId } })
      } else if (report.postType === 'circle') {
        await prisma.groupPost.delete({ where: { id: report.postId } })
      } else if (report.postType === 'user_blog') {
        await prisma.userBlogPost.delete({ where: { id: report.postId } })
      }
    } catch { /* post may already be deleted */ }
  }

  // ── Resolve all pending reports for this post ─────────────
  await prisma.postReport.updateMany({
    where:  { postType: report.postType, postId: report.postId, status: 'pending' },
    data:   { status: 'resolved', adminNote: adminNote ?? null, resolvedAt: new Date() },
  })

  // ── Email the reporter ────────────────────────────────────
  const actionLabel = action === 'remove' ? 'removed' : action === 'keep' ? 'kept' : 'reviewed'
  if (report.reporter.email && adminNote) {
    await sendReporterEmail(report.reporter.email, report.reporter.name, adminNote, actionLabel)
  }

  // ── In-app notification for reporter ─────────────────────
  if (action !== 'dismiss' && adminNote) {
    const notifMsg = action === 'remove'
      ? `Your report was reviewed — the post has been removed. "${adminNote.slice(0, 100)}"`
      : `Your report was reviewed — the post was kept. "${adminNote.slice(0, 100)}"`
    await createNotification(report.reporterId, 'report_resolved', notifMsg)
  }

  return NextResponse.json({ message: 'Report resolved.' })
}
