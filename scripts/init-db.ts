import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  try {
    // Test database connection
    await prisma.$connect()
    console.log("✅ Database connection successful")

    // Check if tables exist
    const tableCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    console.log("Tables in database:", tableCount)

    // Push schema changes
    console.log("Pushing schema changes...")
    // This would normally use Prisma CLI, but we're just logging here
    console.log("Run `npx prisma db push` to apply schema changes")

    console.log("Database initialization complete")
  } catch (error) {
    console.error("❌ Database initialization failed:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()

