import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

// SQLite Performance Optimization
// Enable WAL mode for better concurrency and performance
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Execute PRAGMA commands for SQLite optimization
// Use $queryRawUnsafe because PRAGMA commands return results
prisma.$queryRawUnsafe('PRAGMA journal_mode = WAL;').catch(() => {})
prisma.$queryRawUnsafe('PRAGMA synchronous = NORMAL;').catch(() => {})
prisma.$queryRawUnsafe('PRAGMA cache_size = -64000;').catch(() => {}) // 64MB cache
prisma.$queryRawUnsafe('PRAGMA temp_store = MEMORY;').catch(() => {})
prisma.$queryRawUnsafe('PRAGMA mmap_size = 30000000000;').catch(() => {}) // 30GB mmap
prisma.$queryRawUnsafe('PRAGMA page_size = 4096;').catch(() => {})
