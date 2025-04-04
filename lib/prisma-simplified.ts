import { PrismaClient } from "@prisma/client"

// Use a single PrismaClient instance
// This approach avoids issues with multiple instances during development
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export default prisma

