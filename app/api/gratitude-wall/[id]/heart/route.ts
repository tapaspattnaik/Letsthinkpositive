import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10)
    if (isNaN(id))
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

    const entry = await prisma.gratitudeEntry.update({
      where: { id },
      data:  { hearts: { increment: 1 } },
      select: { hearts: true },
    })

    return NextResponse.json({ hearts: entry.hearts })
  } catch (err: unknown) {
    // Prisma throws P2025 when record not found
    if (
      err &&
      typeof err === 'object' &&
      'code' in err &&
      (err as { code: string }).code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }
    console.error('Heart error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
