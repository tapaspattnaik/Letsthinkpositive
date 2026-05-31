import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error'] : [],
    datasources: {
      db: {
        // connection_limit prevents more than 5 DB connections accumulating
        // pool_timeout releases stuck connections after 20s
        url: process.env.DATABASE_URL?.includes('connection_limit')
          ? process.env.DATABASE_URL
          : `${process.env.DATABASE_URL}${process.env.DATABASE_URL?.includes('?') ? '&' : '?'}connection_limit=5&pool_timeout=20&connect_timeout=10`,
      },
    },
  })

// Cache globally in ALL environments — prevents new PrismaClient per request
globalForPrisma.prisma = prisma

// Graceful disconnect on process exit — releases all DB connections cleanly
// preventing connection accumulation that hits Hostinger's process limit
if (process.env.NODE_ENV === 'production') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
}
