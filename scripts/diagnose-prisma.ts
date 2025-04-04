// This is a script you can run with: npx ts-node scripts/diagnose-prisma.ts
import { PrismaClient } from "@prisma/client"

async function main() {
  console.log("Diagnosing Prisma setup...")
  console.log("Node version:", process.version)
  console.log("Environment:", process.env.NODE_ENV)

  // Check DATABASE_URL
  const dbUrl = process.env.DATABASE_URL
  console.log("Database URL exists:", !!dbUrl)
  if (dbUrl) {
    // Print a sanitized version (hiding credentials)
    const sanitizedUrl = dbUrl.replace(/(postgres:\/\/)([^:]+):([^@]+)@/, "$1****:****@")
    console.log("Database URL format:", sanitizedUrl)
  } else {
    console.error("ERROR: DATABASE_URL is not defined")
    process.exit(1)
  }

  // Try to connect
  console.log("Attempting to connect to database...")
  const prisma = new PrismaClient({
    log: ["query", "info", "warn", "error"],
  })

  try {
    // Test connection with a simple query
    const result = await prisma.user.count()
    console.log("Connection successful! User count:", result)

    // Check schema
    console.log("Checking database schema...")
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    console.log("Tables found:", tables)
  } catch (error) {
    console.error("Connection failed with error:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error("Script failed:", e)
  process.exit(1)
})

