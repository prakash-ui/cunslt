import nodemailer from "nodemailer"
import { Resend } from "resend"

// Initialize Resend if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// Create a nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: Number(process.env.EMAIL_SERVER_PORT) === 465,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

type EmailPayload = {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

export async function sendEmail(payload: EmailPayload) {
  const from = payload.from || process.env.EMAIL_FROM || "noreply@cunslt.com"

  // Try to use Resend first if available
  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from,
        to: Array.isArray(payload.to) ? payload.to : [payload.to],
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        attachments: payload.attachments,
      })

      if (error) {
        console.error("Error sending email with Resend:", error)
        throw error
      }

      return { success: true, messageId: data?.id }
    } catch (error) {
      console.error("Failed to send email with Resend, falling back to nodemailer:", error)
      // Fall back to nodemailer
    }
  }

  // Use nodemailer as fallback
  try {
    const result = await transporter.sendMail({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      attachments: payload.attachments,
    })

    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error("Error sending email with nodemailer:", error)
    throw error
  }
}

// Email templates
export const emailTemplates = {
  welcomeEmail: (name: string) => ({
    subject: "Welcome to Cunslt",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome to Cunslt!</h1>
        <p>Hello ${name},</p>
        <p>Thank you for joining Cunslt. We're excited to have you on board!</p>
        <p>With Cunslt, you can:</p>
        <ul>
          <li>Connect with experts in various fields</li>
          <li>Schedule consultations at your convenience</li>
          <li>Get personalized advice and solutions</li>
        </ul>
        <p>If you have any questions, feel free to reply to this email.</p>
        <p>Best regards,<br>The Cunslt Team</p>
      </div>
    `,
  }),

  passwordReset: (resetLink: string) => ({
    subject: "Reset Your Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Reset Your Password</h1>
        <p>You requested a password reset for your Cunslt account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetLink}" style="display: inline-block; background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
        <p>Best regards,<br>The Cunslt Team</p>
      </div>
    `,
  }),

  consultationConfirmation: (
    userName: string,
    expertName: string,
    dateTime: string,
    duration: number,
    joinLink: string,
  ) => ({
    subject: "Consultation Confirmed",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Consultation Confirmed</h1>
        <p>Hello ${userName},</p>
        <p>Your consultation with ${expertName} has been confirmed.</p>
        <p><strong>Date and Time:</strong> ${dateTime}</p>
        <p><strong>Duration:</strong> ${duration} minutes</p>
        <p>When it's time for your consultation, click the button below to join:</p>
        <a href="${joinLink}" style="display: inline-block; background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Join Consultation</a>
        <p>If you need to reschedule or cancel, please do so at least 24 hours in advance.</p>
        <p>Best regards,<br>The Cunslt Team</p>
      </div>
    `,
  }),

  consultationReminder: (userName: string, expertName: string, dateTime: string, joinLink: string) => ({
    subject: "Consultation Reminder",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Consultation Reminder</h1>
        <p>Hello ${userName},</p>
        <p>This is a reminder that your consultation with ${expertName} is scheduled for ${dateTime}.</p>
        <p>When it's time for your consultation, click the button below to join:</p>
        <a href="${joinLink}" style="display: inline-block; background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Join Consultation</a>
        <p>Best regards,<br>The Cunslt Team</p>
      </div>
    `,
  }),
}

