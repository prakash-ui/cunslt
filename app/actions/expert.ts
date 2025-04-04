"use server"

import { db } from "@/lib/db"

export async function getExpertProfile(expertId: string) {
  try {
    const expert = await db.expert.findUnique({
      where: {
        id: expertId,
      },
      include: {
        user: true,
        skills: true,
        availability: true,
        reviews: {
          include: {
            user: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
      },
    })

    if (!expert) {
      return { success: false, error: "Expert not found" }
    }

    return { success: true, expert }
  } catch (error) {
    console.error("Error getting expert profile:", error)
    return { success: false, error: "Failed to get expert profile" }
  }
}

export async function getExpertSkills(expertId: string) {
  try {
    const skills = await db.skill.findMany({
      where: {
        expertId,
      },
    })

    return { success: true, skills }
  } catch (error) {
    console.error("Error getting expert skills:", error)
    return { success: false, error: "Failed to get expert skills" }
  }
}

