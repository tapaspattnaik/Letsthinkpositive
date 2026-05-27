import { prisma } from '@/lib/db'

/**
 * Fire-and-forget helper — silently swallows errors so
 * a notification failure never breaks the main action.
 */
export async function createNotification(
  userId: number,
  type: string,
  message: string,
  link?: string | null,
) {
  try {
    await prisma.notification.create({
      data: { userId, type, message, link: link ?? null },
    })
  } catch (err) {
    console.error('Notification create error:', err)
  }
}
