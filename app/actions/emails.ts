"use server"

import { sendEmail } from "@/lib/email"
import { db } from "@/lib/db"
import { formatDateTime } from "@/lib/utils"

export async function sendBookingConfirmationEmail(consultationId: string) {
  try {
    const consultation = await db.consultation.findUnique({
      where: {
        id: consultationId,
      },
      include: {
        user: true,
        expert: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!consultation) {
      return { success: false, error: "Consultation not found" }
    }

    const { user, expert, startTime, endTime } = consultation

    const html = `
      <h1>Booking Confirmation</h1>
      <p>Dear ${user.name},</p>
      <p>Your consultation with ${expert.user.name} has been confirmed.</p>
      <p>Date and Time: ${formatDateTime(startTime)} - ${formatDateTime(endTime)}</p>
      <p>Thank you for using our platform!</p>
    `

    await sendEmail({
      to: user.email,
      subject: "Consultation Booking Confirmation",
      html,
    })

    return { success: true }
  } catch (error) {
    console.error("Error sending booking confirmation email:", error)
    return { success: false, error: "Failed to send email" }
  }
}

export async function sendBookingRequestEmail(consultationId: string) {
  try {
    const consultation = await db.consultation.findUnique({
      where: {
        id: consultationId,
      },
      include: {
        user: true,
        expert: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!consultation) {
      return { success: false, error: "Consultation not found" }
    }

    const { user, expert, startTime, endTime } = consultation

    const html = `
      <h1>New Booking Request</h1>
      <p>Dear ${expert.user.name},</p>
      <p>You have received a new consultation request from ${user.name}.</p>
      <p>Date and Time: ${formatDateTime(startTime)} - ${formatDateTime(endTime)}</p>
      <p>Please log in to your account to accept or decline this request.</p>
    `

    await sendEmail({
      to: expert.user.email,
      subject: "New Consultation Request",
      html,
    })

    return { success: true }
  } catch (error) {
    console.error("Error sending booking request email:", error)
    return { success: false, error: "Failed to send email" }
  }
}

