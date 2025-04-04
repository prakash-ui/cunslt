"use server"

import { db } from "@/lib/db"
import { stripe } from "@/lib/stripe"
import { getCurrentUser } from "@/lib/session"

export async function createPaymentIntent({
  amount,
  consultationId,
}: {
  amount: number
  consultationId: string
}) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: "usd",
      metadata: {
        consultationId,
        userId: user.id,
      },
    })

    await db.payment.create({
      data: {
        amount,
        status: "pending",
        paymentIntentId: paymentIntent.id,
        consultationId,
        userId: user.id,
      },
    })

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
    }
  } catch (error) {
    console.error("Error creating payment intent:", error)
    return { success: false, error: "Failed to create payment intent" }
  }
}

export async function confirmPaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status === "succeeded") {
      await db.payment.update({
        where: {
          paymentIntentId,
        },
        data: {
          status: "completed",
        },
      })

      // Update consultation status
      if (paymentIntent.metadata.consultationId) {
        await db.consultation.update({
          where: {
            id: paymentIntent.metadata.consultationId,
          },
          data: {
            status: "confirmed",
          },
        })
      }

      return { success: true }
    }

    return { success: false, error: "Payment not succeeded" }
  } catch (error) {
    console.error("Error confirming payment intent:", error)
    return { success: false, error: "Failed to confirm payment" }
  }
}

export async function refundPayment(paymentId: string) {
  try {
    const payment = await db.payment.findUnique({
      where: {
        id: paymentId,
      },
    })

    if (!payment || payment.status !== "completed") {
      return { success: false, error: "Payment not found or not completed" }
    }

    const refund = await stripe.refunds.create({
      payment_intent: payment.paymentIntentId,
    })

    await db.payment.update({
      where: {
        id: paymentId,
      },
      data: {
        status: "refunded",
        refundId: refund.id,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Error refunding payment:", error)
    return { success: false, error: "Failed to refund payment" }
  }
}

