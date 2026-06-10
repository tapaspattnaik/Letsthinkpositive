import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminUser } from '@/lib/admin'

async function requireAdmin() {
  return getAdminUser()
}

// GET — list all users with search, filter, pagination
export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = req.nextUrl
  const search  = searchParams.get('search') ?? ''
  const filter  = searchParams.get('filter') ?? 'all'  // all | blocked | reported | admin
  const page    = Math.max(1, Number(searchParams.get('page') ?? '1'))
  const perPage = 20

  const where: Record<string, unknown> = {}

  if (search) {
    where.OR = [
      { name:  { contains: search } },
      { email: { contains: search } },
    ]
  }

  if (filter === 'blocked')  where.blocked = true
  if (filter === 'admin')    where.role    = { in: ['admin', 'moderator'] }
  if (filter === 'reported') {
    where.id = {
      in: (await prisma.postReport.findMany({
        where:  { status: 'pending' },
        select: { reportedUserId: true },
      })).map(r => r.reportedUserId).filter(Boolean) as number[],
    }
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip:  (page - 1) * perPage,
      take:  perPage,
      select: {
        id: true, name: true, email: true, role: true,
        blocked: true, blockedReason: true, blockedAt: true,
        avatarUrl: true, createdAt: true, lastLoginAt: true,
        currentStreak: true,
        _count: {
          select: {
            blogSubmissions: true,
            posts:           true,
            reports:         true,   // reports they filed
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ])

  // For each user, count how many reports were filed AGAINST them
  const userIds = users.map(u => u.id)
  const reportsAgainst = await prisma.postReport.groupBy({
    by:     ['reportedUserId'],
    where:  { reportedUserId: { in: userIds }, status: 'pending' },
    _count: { id: true },
  })
  const reportMap = Object.fromEntries(
    reportsAgainst.map(r => [r.reportedUserId, r._count.id])
  )

  // Platform-wide stats
  const [totalUsers, blockedCount, pendingReports, newThisWeek] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { blocked: true } }),
    prisma.postReport.count({ where: { status: 'pending' } }),
    prisma.user.count({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    }),
  ])

  return NextResponse.json({
    users: users.map(u => ({ ...u, reportsAgainst: reportMap[u.id] ?? 0 })),
    total,
    page,
    perPage,
    stats: { totalUsers, blockedCount, pendingReports, newThisWeek },
  })
}
