import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

// ── Shared admin guard ──────────────────────────────────────────────────────
// A user is admin when their DB role is 'admin' (set via admin panel or SQL),
// OR their email matches the ADMIN_EMAIL / SMTP_USER env fallback. The DB role
// is the primary mechanism — it needs no env vars and no rebuild.

const ENV_ADMIN = process.env.ADMIN_EMAIL ?? process.env.SMTP_USER ?? ''

export async function getAdminUser(): Promise<{ id: number; email: string } | null> {
  const session = await getSession()
  const email   = session?.user?.email
  if (!email) return null

  const user = await prisma.user.findUnique({
    where:  { email },
    select: { id: true, email: true, role: true, blocked: true },
  })
  if (!user || user.blocked) return null

  if (user.role === 'admin') return { id: user.id, email: user.email }
  if (ENV_ADMIN && user.email === ENV_ADMIN) return { id: user.id, email: user.email }
  return null
}
