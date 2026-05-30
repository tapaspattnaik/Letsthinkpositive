import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// Always use the global singleton — in production this prevents a new
// PrismaClient (and new DB connection pool) being created on every request.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error'] : [],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

// Cache globally in ALL environments (fixes the production process leak)
globalForPrisma.prisma = prisma
