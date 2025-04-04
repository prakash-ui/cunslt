import { createNotification, type NotificationData } from "@/app/actions/notifications"

// Helper function to send a booking notification
export async function sendBookingNotification(
  userId: string,
  type: "booking_created" | "booking_canceled" | "booking_rescheduled" | "booking_reminder",
  bookingData: {
    expertName: string
    bookingDate: string
    bookingId: string
  },
) {
  const data: NotificationData = {
    expert_name: bookingData.expertName,
    booking_date: bookingData.bookingDate,
  }

  const link = `/dashboard/bookings/${bookingData.bookingId}`

  return createNotification(userId, type, data, link)
}

// Helper function to send a payment notification
export async function sendPaymentNotification(
  userId: string,
  type: "payment_received" | "payment_failed",
  paymentData: {
    amount: string
    service: string
    paymentId: string
  },
) {
  const data: NotificationData = {
    amount: paymentData.amount,
    service: paymentData.service,
  }

  const link = `/dashboard/payments/${paymentData.paymentId}`

  return createNotification(userId, type, data, link)
}

// Helper function to send a message notification
export async function sendMessageNotification(
  userId: string,
  messageData: {
    senderName: string
    conversationId: string
  },
) {
  const data: NotificationData = {
    sender_name: messageData.senderName,
  }

  const link = `/dashboard/messages/${messageData.conversationId}`

  return createNotification(userId, "message_received", data, link)
}

// Helper function to send a security alert
export async function sendSecurityAlert(userId: string, alertMessage: string, link?: string) {
  const data: NotificationData = {
    alert_message: alertMessage,
  }

  return createNotification(userId, "security_alert", data, link)
}

// Helper function to send a platform update notification
export async function sendPlatformUpdate(userId: string, updateMessage: string, link?: string) {
  const data: NotificationData = {
    update_message: updateMessage,
  }

  return createNotification(userId, "platform_update", data, link)
}

