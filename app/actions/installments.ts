"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getCurrentUser } from "./auth"

export async function createPaymentPlan(formData: FormData) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const bookingId = formData.get("bookingId") as string
  const numberOfInstallments = Number.parseInt(formData.get("numberOfInstallments") as string)

  if (numberOfInstallments < 2 || numberOfInstallments > 6) {
    throw new Error("Number of installments must be between 2 and 6")
  }

  // Get the booking details
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .eq("client_id", user.id)
    .single()

  if (bookingError || !booking) {
    throw new Error("Booking not found")
  }

  if (booking.payment_status !== "pending") {
    throw new Error("Booking is already paid or payment is in progress")
  }

  // Calculate installment amount
  const installmentAmount = Number.parseFloat((booking.amount / numberOfInstallments).toFixed(2))
  // Adjust the last installment to account for rounding errors
  const lastInstallmentAmount = Number.parseFloat(
    (booking.amount - installmentAmount * (numberOfInstallments - 1)).toFixed(2),
  )

  // Create the payment plan
  const { data: paymentPlan, error: planError } = await supabase
    .from("payment_plans")
    .insert({
      booking_id: bookingId,
      client_id: user.id,
      expert_id: booking.expert_id,
      total_amount: booking.amount,
      number_of_installments: numberOfInstallments,
      installment_amount: installmentAmount,
      status: "active",
    })
    .select()
    .single()

  if (planError) {
    throw new Error("Failed to create payment plan")
  }

  // Create the installments
  const installments = []
  const now = new Date()

  for (let i = 0; i < numberOfInstallments; i++) {
    const dueDate = new Date(now)
    dueDate.setMonth(now.getMonth() + i)

    installments.push({
      payment_plan_id: paymentPlan.id,
      amount: i === numberOfInstallments - 1 ? lastInstallmentAmount : installmentAmount,
      due_date: dueDate.toISOString(),
      status: i === 0 ? "paid" : "pending", // First installment is paid immediately
    })
  }

  const { error: installmentsError } = await supabase.from("installments").insert(installments)

  if (installmentsError) {
    throw new Error("Failed to create installments")
  }

  // Update the booking to link it to the payment plan
  await supabase
    .from("bookings")
    .update({
      has_payment_plan: true,
      payment_plan_id: paymentPlan.id,
      payment_status: "partial", // Mark as partially paid
    })
    .eq("id", bookingId)

  // Create a payment record for the first installment
  await supabase.from("payments").insert({
    booking_id: bookingId,
    client_id: user.id,
    amount: installmentAmount,
    payment_method: "card",
    status: "completed",
    stripe_payment_id: `pi_${Math.random().toString(36).substring(2, 15)}`, // Simulated Stripe ID
  })

  revalidatePath(`/bookings/${bookingId}`)
  redirect(`/bookings/${bookingId}?success=payment-plan-created`)
}

export async function getPaymentPlan(bookingId: string) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const { data: paymentPlan, error: planError } = await supabase
    .from("payment_plans")
    .select("*")
    .eq("booking_id", bookingId)
    .single()

  if (planError && planError.code !== "PGRST116") {
    // PGRST116 is the error code for no rows returned
    throw new Error("Failed to fetch payment plan")
  }

  if (!paymentPlan) {
    return null
  }

  const { data: installments, error: installmentsError } = await supabase
    .from("installments")
    .select("*")
    .eq("payment_plan_id", paymentPlan.id)
    .order("due_date", { ascending: true })

  if (installmentsError) {
    throw new Error("Failed to fetch installments")
  }

  return {
    ...paymentPlan,
    installments,
  }
}

export async function payInstallment(formData: FormData) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const installmentId = formData.get("installmentId") as string
  const paymentPlanId = formData.get("paymentPlanId") as string

  // Get the installment details
  const { data: installment, error: installmentError } = await supabase
    .from("installments")
    .select("*")
    .eq("id", installmentId)
    .single()

  if (installmentError || !installment) {
    throw new Error("Installment not found")
  }

  if (installment.status !== "pending") {
    throw new Error("Installment is already paid or overdue")
  }

  // Get the payment plan details
  const { data: paymentPlan, error: planError } = await supabase
    .from("payment_plans")
    .select("*")
    .eq("id", paymentPlanId)
    .single()

  if (planError || !paymentPlan) {
    throw new Error("Payment plan not found")
  }

  if (paymentPlan.client_id !== user.id) {
    throw new Error("Unauthorized")
  }

  // Create a payment record
  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .insert({
      booking_id: paymentPlan.booking_id,
      client_id: user.id,
      amount: installment.amount,
      payment_method: "card",
      status: "completed",
      stripe_payment_id: `pi_${Math.random().toString(36).substring(2, 15)}`, // Simulated Stripe ID
    })
    .select()
    .single()

  if (paymentError) {
    throw new Error("Failed to create payment record")
  }

  // Update the installment
  await supabase
    .from("installments")
    .update({
      status: "paid",
      payment_id: payment.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", installmentId)

  // Check if all installments are paid
  const { data: remainingInstallments, error: remainingError } = await supabase
    .from("installments")
    .select("id")
    .eq("payment_plan_id", paymentPlanId)
    .eq("status", "pending")

  if (remainingError) {
    throw new Error("Failed to check remaining installments")
  }

  // If all installments are paid, update the payment plan and booking
  if (remainingInstallments.length === 0) {
    await supabase
      .from("payment_plans")
      .update({
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", paymentPlanId)

    await supabase
      .from("bookings")
      .update({
        payment_status: "paid",
      })
      .eq("id", paymentPlan.booking_id)
  }

  revalidatePath(`/bookings/${paymentPlan.booking_id}`)
  redirect(`/bookings/${paymentPlan.booking_id}?success=installment-paid`)
}

