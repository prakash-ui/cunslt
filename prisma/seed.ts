import { PrismaClient } from "@prisma/client"
import { hash } from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  // Create admin user if it doesn't exist
  const adminEmail = "admin@example.com"
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (!existingAdmin) {
    const hashedPassword = await hash("Admin123!", 10)
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Admin User",
        password: hashedPassword,
        role: "ADMIN",
      },
    })
    console.log("Admin user created")
  }

  // Create categories
  const categories = [
    "Web Development",
    "Mobile Development",
    "UI/UX Design",
    "Data Science",
    "Machine Learning",
    "DevOps",
    "Cybersecurity",
    "Blockchain",
    "Cloud Computing",
    "Digital Marketing",
  ]

  for (const category of categories) {
    const existingCategory = await prisma.category.findUnique({
      where: { name: category },
    })

    if (!existingCategory) {
      await prisma.category.create({
        data: { name: category },
      })
    }
  }
  console.log("Categories created")

  // Create skills
  const skills = [
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "Python",
    "Java",
    "C#",
    "PHP",
    "Ruby",
    "Swift",
    "Kotlin",
    "Flutter",
    "React Native",
    "Angular",
    "Vue.js",
    "Docker",
    "Kubernetes",
    "AWS",
    "Azure",
    "GCP",
    "SQL",
    "NoSQL",
    "MongoDB",
    "PostgreSQL",
    "MySQL",
    "Redis",
    "GraphQL",
    "REST API",
    "Figma",
    "Adobe XD",
    "Sketch",
  ]

  for (const skill of skills) {
    const existingSkill = await prisma.skill.findUnique({
      where: { name: skill },
    })

    if (!existingSkill) {
      await prisma.skill.create({
        data: { name: skill },
      })
    }
  }
  console.log("Skills created")

  console.log("Database seeded successfully")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

