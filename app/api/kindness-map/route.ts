import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const acts = await prisma.kindnessAct.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        act: true,
        city: true,
        country: true,
        lat: true,
        lng: true,
        createdAt: true,
      },
    })

    const total = await prisma.kindnessAct.count()

    return NextResponse.json({ acts, total })
  } catch (err) {
    console.error('Kindness map fetch error:', err)
    return NextResponse.json({ error: 'Could not load kindness acts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    const body = await req.json()
    const { act, city, country, lat, lng } = body

    if (!act?.trim() || act.trim().length < 1 || act.trim().length > 200)
      return NextResponse.json({ error: 'Act must be 1–200 characters' }, { status: 400 })

    if (!city?.trim() || !country?.trim())
      return NextResponse.json({ error: 'City and country are required' }, { status: 400 })

    const latNum = Number(lat)
    const lngNum = Number(lng)
    if (isNaN(latNum) || isNaN(lngNum) || latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180)
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })

    const kindnessAct = await prisma.kindnessAct.create({
      data: {
        act: act.trim().slice(0, 200),
        city: city.trim().slice(0, 100),
        country: country.trim().slice(0, 100),
        lat: latNum,
        lng: lngNum,
        userId: session?.user?.id ? Number(session.user.id) : null,
      },
    })

    return NextResponse.json({ ok: true, act: kindnessAct })
  } catch (err) {
    console.error('Kindness act create error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
