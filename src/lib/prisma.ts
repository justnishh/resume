import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient | undefined

declare global {
  var __prisma: PrismaClient | undefined
}

function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set - Prisma client not initialized')
    return null
  }
  return new PrismaClient()
}

if (process.env.NODE_ENV === 'production') {
  prisma = createPrismaClient() ?? undefined
} else {
  if (!global.__prisma) {
    global.__prisma = createPrismaClient() ?? undefined
  }
  prisma = global.__prisma
}

export default prisma