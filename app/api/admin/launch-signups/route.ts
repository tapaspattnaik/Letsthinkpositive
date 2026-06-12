import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminUser } from '@/lib/admin'

// GET — pre-launch landing-page leads (admin only)
export async function GET() {
  if (!await getAdminUser()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const signups = await prisma.launchSignup.findMany({
      orderBy: { createdAt: 'desc' },
      take:    200,
      select:  {
        id: true, email: true, countryCode: true, countryName: true,
        source: true, createdAt: true,
      },
    })

    // Flag leads that have since become registered users
    const userEmails = new Set(
      (await prisma.user.findMany({
        where:  { email: { in: signups.map(s => s.email) } },
        select: { email: true },
      })).map(u => u.email)
    )

    return NextResponse.json(signups.map(s => ({
      ...s,
      registered: userEmails.has(s.email),
    })))
  } catch (err) {
    console.error('Launch signups error:', err)
    return NextResponse.json({ error: 'Could not load signups.' }, { status: 500 })
  }
}
