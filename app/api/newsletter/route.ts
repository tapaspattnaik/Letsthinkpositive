import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    // Save to DB (upsert so re-subscribing is graceful)
    await prisma.subscriber.upsert({
      where:  { email },
      update: { active: true, name: name || undefined },
      create: { email, name: name || null },
    })

    // Send welcome email (non-blocking — don't fail the request if email fails)
    sendWelcomeEmail({ email, name: name || 'Friend' }).catch(err =>
      console.error('Welcome email failed:', err)
    )

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Newsletter subscribe error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
