"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getCurrentUser } from "./auth"
import { createPaymentIntent, confirmPaymentIntent, refundPayment } from "./payments"
import {
  sendBookingConfirmationEmail,
  sendBookingRequestEmail,
  sendBookingCancellationEmail,
  sendBookingRescheduleEmail,
  sendBookingReminderEmail,
} from "./emails"

// ... existing code ...

export async function createBooking(formData: FormData) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const expertId = formData.get("expertId") as string
  const date = formData.get("date") as string
  const startTime = formData.get("startTime") as string
  const duration = Number.parseInt(formData.get("duration") as string)
  const problem = formData.get("problem") as string
  const cancellationPolicy = (formData.get("cancellationPolicy") as string) || "standard"
  const notesClient = (formData.get("notesClient") as string) || ""

  if (!expertId || !date || !startTime || !duration || !problem) {
    throw new Error("Missing required fields")
  }

  // Get expert details
  const { data: expert } = await supabase
    .from("experts")
    .select(`
      *,
      user_profiles (
        first_name,
        last_name,
        email
      ),
      expert_rates (
        hourly_rate
      )
    `)
    .eq("id", expertId)
    .single()

  if (!expert) {
    throw new Error("Expert not found")
  }

  // Calculate end time
  const startDateTime = new Date(`${date}T${startTime}`)
  const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 60 * 1000)
  const endTime = endDateTime.toTimeString().split(" ")[0].substring(0, 5)

  // Calculate total amount
  const hourlyRate = expert.expert_rates?.hourly_rate || 0
  const totalAmount = hourlyRate * duration

  // Get user profile
  const { data: userProfile } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single()

  if (!userProfile) {
    throw new Error("User profile not found")
  }

  // Get tax rate based on expert's location
  const { data: taxRate } = await supabase
    .from("tax_rates")
    .select("rate")
    .eq("country", expert.country || "US")
    .single()

  const taxPercentage = taxRate?.rate || 0
  const taxAmount = (totalAmount * taxPercentage) / 100
  const totalWithTax = totalAmount + taxAmount

  // Calculate platform fee (15% commission)
  const platformFeePercentage = 15
  const platformFee = (totalAmount * platformFeePercentage) / 100
  const expertAmount = totalAmount - platformFee

  // Create payment intent
  const paymentIntent = await createPaymentIntent({
    amount: Math.round(totalWithTax * 100), // Convert to cents
    currency: "usd",
    metadata: {
      expertId,
      userId: user.id,
      duration,
      date,
      startTime,
      endTime,
      totalAmount: totalAmount.toString(),
      taxAmount: taxAmount.toString(),
      platformFee: platformFee.toString(),
      expertAmount: expertAmount.toString(),
    },
  })

  if (!paymentIntent || !paymentIntent.id) {
    throw new Error("Failed to create payment intent")
  }

  // Create booking
  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      user_id: user.id,
      expert_id: expertId,
      date,
      start_time: startTime,
      end_time: endTime,
      duration,
      problem,
      status: "pending_payment",
      amount: totalAmount,
      tax_amount: taxAmount,
      platform_fee: platformFee,
      expert_amount: expertAmount,
      payment_intent_id: paymentIntent.id,
      cancellation_policy: cancellationPolicy,
      notes_client: notesClient,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create booking: ${error.message}`)
  }

  // Update payment intent with booking ID
  await supabase
    .from("payment_intents")
    .update({
      booking_id: booking.id,
    })
    .eq("id", paymentIntent.id)

  // Log booking history
  await supabase.rpc("log_booking_history", {
    p_booking_id: booking.id,
    p_action: "created",
    p_previous_status: null,
    p_new_status: "pending_payment",
    p_previous_date: null,
    p_new_date: date,
    p_previous_time_start: null,
    p_new_time_start: startTime,
    p_previous_time_end: null,
    p_new_time_end: endTime,
    p_performed_by: user.id,
    p_performed_by_role: "client",
    p_reason: "Initial booking creation",
  })

  // Send booking request email to expert
  await sendBookingRequestEmail({
    expertName: `${expert.user_profiles.first_name} ${expert.user_profiles.last_name}`,
    expertEmail: expert.user_profiles.email,
    clientName: `${userProfile.first_name} ${userProfile.last_name}`,
    date,
    startTime,
    endTime,
    duration,
    problem,
    amount: totalAmount,
  })

  revalidatePath("/bookings")
  redirect(`/checkout/${paymentIntent.id}`)
}

// ... existing code ...

export async function confirmBookingPayment(formData: FormData) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const paymentIntentId = formData.get("paymentIntentId") as string

  if (!paymentIntentId) {
    throw new Error("Payment intent ID is required")
  }

  // Get payment intent
  const { data: paymentIntent } = await supabase.from("payment_intents").select("*").eq("id", paymentIntentId).single()

  if (!paymentIntent) {
    throw new Error("Payment intent not found")
  }

  // Get booking
  const { data: booking } = await supabase
    .from("bookings")
    .select(`
      *,
      experts (
        id,
        user_id,
        user_profiles (
          first_name,
          last_name,
          email
        )
      ),
      user_profiles (
        first_name,
        last_name,
        email
      )
    `)
    .eq("id", paymentIntent.booking_id)
    .single()

  if (!booking) {
    throw new Error("Booking not found")
  }

  // Confirm payment intent
  const confirmedPaymentIntent = await confirmPaymentIntent(paymentIntentId)

  if (!confirmedPaymentIntent) {
    throw new Error("Failed to confirm payment")
  }

  // Update booking status
  const { error: bookingError } = await supabase
    .from("bookings")
    .update({
      status: "confirmed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", booking.id)

  if (bookingError) {
    throw new Error(`Failed to update booking: ${bookingError.message}`)
  }

  // Update expert wallet
  const { data: expertWallet } = await supabase
    .from("expert_wallets")
    .select("*")
    .eq("expert_id", booking.expert_id)
    .single()

  if (expertWallet) {
    // Update existing wallet
    await supabase
      .from("expert_wallets")
      .update({
        pending_balance: expertWallet.pending_balance + booking.expert_amount,
        lifetime_earnings: expertWallet.lifetime_earnings + booking.expert_amount,
        updated_at: new Date().toISOString(),
      })
      .eq("expert_id", booking.expert_id)
  } else {
    // Create new wallet
    await supabase.from("expert_wallets").insert({
      expert_id: booking.expert_id,
      pending_balance: booking.expert_amount,
      available_balance: 0,
      lifetime_earnings: booking.expert_amount,
    })
  }

  // Add transaction record
  await supabase.from("wallet_transactions").insert({
    expert_id: booking.expert_id,
    amount: booking.expert_amount,
    type: "booking",
    status: "pending",
    description: `Booking on ${booking.date} (${booking.start_time} - ${booking.end_time})`,
    reference: booking.id,
  })

  // Send confirmation emails
  await sendBookingConfirmationEmail({
    clientName: `${booking.user_profiles.first_name} ${booking.user_profiles.last_name}`,
    clientEmail: booking.user_profiles.email,
    expertName: `${booking.experts.user_profiles.first_name} ${booking.experts.user_profiles.last_name}`,
    expertEmail: booking.experts.user_profiles.email,
    bookingId: booking.id,
    date: booking.date,
    startTime: booking.start_time,
    endTime: booking.end_time,
    duration: booking.duration,
    problem: booking.problem,
    amount: booking.amount,
    taxAmount: booking.tax_amount,
    totalAmount: booking.amount + booking.tax_amount,
  })

  revalidatePath("/bookings")
  redirect("/bookings?success=payment-confirmed")
}

// ... existing code ...

export async function completeBooking(formData: FormData) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const bookingId = formData.get("bookingId") as string

  if (!bookingId) {
    throw new Error("Booking ID is required")
  }

  // Get booking
  const { data: booking } = await supabase.from("bookings").select("*").eq("id", bookingId).single()

  if (!booking) {
    throw new Error("Booking not found")
  }

  // Check if user is the expert
  const { data: expert } = await supabase.from("experts").select("id").eq("user_id", user.id).single()

  if (!expert || expert.id !== booking.expert_id) {
    throw new Error("Unauthorized")
  }

  // Update booking status
  const { error: bookingError } = await supabase
    .from("bookings")
    .update({
      status: "completed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId)

  if (bookingError) {
    throw new Error(`Failed to update booking: ${bookingError.message}`)
  }

  // Release funds from pending to available balance
  const { data: expertWallet } = await supabase.from("expert_wallets").select("*").eq("expert_id", expert.id).single()

  if (expertWallet) {
    await supabase.rpc("release_expert_funds", {
      p_expert_id: expert.id,
      p_amount: booking.expert_amount,
    })

    // Update transaction status
    await supabase
      .from("wallet_transactions")
      .update({
        status: "completed",
      })
      .eq("reference", bookingId)
      .eq("type", "booking")
  }

  revalidatePath("/bookings")
  redirect("/expert/bookings?success=booking-completed")
}

export async function joinConsultation(formData: FormData) {
  const bookingId = formData.get("bookingId") as string

  if (!bookingId) {
    throw new Error("Booking ID is required")
  }

  // Redirect to the consultation page
  redirect(`/consultation/${bookingId}`)
}

export async function rescheduleBooking(formData: FormData) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const bookingId = formData.get("bookingId") as string
  const newDate = formData.get("newDate") as string
  const newStartTime = formData.get("newStartTime") as string
  const reason = (formData.get("reason") as string) || ""

  if (!bookingId || !newDate || !newStartTime) {
    throw new Error("Missing required fields")
  }

  // Get booking details
  const { data: booking } = await supabase
    .from("bookings")
    .select(`
      *,
      experts (
        id,
        user_id,
        user_profiles (
          first_name,
          last_name,
          email
        )
      ),
      user_profiles (
        first_name,
        last_name,
        email
      )
    `)
    .eq("id", bookingId)
    .single()

  if (!booking) {
    throw new Error("Booking not found")
  }

  // Check if user is authorized to reschedule
  const isClient = booking.user_id === user.id
  const isExpert = booking.experts.user_id === user.id

  if (!isClient && !isExpert) {
    throw new Error("Not authorized to reschedule this booking")
  }

  // Check if booking can be rescheduled
  if (!["confirmed", "pending_confirmation"].includes(booking.status)) {
    throw new Error("This booking cannot be rescheduled")
  }

  // Calculate new end time
  const newStartDateTime = new Date(`${newDate}T${newStartTime}`)
  const newEndDateTime = new Date(newStartDateTime.getTime() + booking.duration * 60 * 60 * 1000)
  const newEndTime = newEndDateTime.toTimeString().split(" ")[0].substring(0, 5)

  // Check if the new time slot is available
  const { data: conflictingBookings } = await supabase
    .from("bookings")
    .select("id")
    .eq("expert_id", booking.expert_id)
    .eq("date", newDate)
    .neq("id", bookingId)
    .not("status", "in", '("cancelled", "rejected")')
    .or(`start_time,lt,${newEndTime},end_time,gt,${newStartTime}`)

  if (conflictingBookings && conflictingBookings.length > 0) {
    throw new Error("The selected time slot is not available")
  }

  // Store old values for history
  const oldDate = booking.date
  const oldStartTime = booking.start_time
  const oldEndTime = booking.end_time
  const oldStatus = booking.status

  // Update booking
  const { error: updateError } = await supabase
    .from("bookings")
    .update({
      date: newDate,
      start_time: newStartTime,
      end_time: newEndTime,
      reschedule_count: booking.reschedule_count + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId)

  if (updateError) {
    throw new Error(`Failed to reschedule booking: ${updateError.message}`)
  }

  // Log booking history
  await supabase.rpc("log_booking_history", {
    p_booking_id: bookingId,
    p_action: "rescheduled",
    p_previous_status: oldStatus,
    p_new_status: oldStatus,
    p_previous_date: oldDate,
    p_new_date: newDate,
    p_previous_time_start: oldStartTime,
    p_new_time_start: newStartTime,
    p_previous_time_end: oldEndTime,
    p_new_time_end: newEndTime,
    p_performed_by: user.id,
    p_performed_by_role: isClient ? "client" : "expert",
    p_reason: reason,
  })

  // Send rescheduling emails
  if (isClient) {
    // Client rescheduled, notify expert
    await sendBookingRescheduleEmail({
      recipientName: `${booking.experts.user_profiles.first_name} ${booking.experts.user_profiles.last_name}`,
      recipientEmail: booking.experts.user_profiles.email,
      rescheduledBy: "client",
      clientName: `${booking.user_profiles.first_name} ${booking.user_profiles.last_name}`,
      oldDate,
      oldStartTime,
      oldEndTime,
      newDate,
      newStartTime,
      newEndTime,
      bookingId,
      reason,
    })
  } else {
    // Expert rescheduled, notify client
    await sendBookingRescheduleEmail({
      recipientName: `${booking.user_profiles.first_name} ${booking.user_profiles.last_name}`,
      recipientEmail: booking.user_profiles.email,
      rescheduledBy: "expert",
      expertName: `${booking.experts.user_profiles.first_name} ${booking.experts.user_profiles.last_name}`,
      oldDate,
      oldStartTime,
      oldEndTime,
      newDate,
      newStartTime,
      newEndTime,
      bookingId,
      reason,
    })
  }

  revalidatePath("/bookings")
  revalidatePath(`/bookings/${bookingId}`)

  if (isClient) {
    redirect("/bookings?success=booking-rescheduled")
  } else {
    redirect("/expert/bookings?success=booking-rescheduled")
  }
}

export async function cancelBooking(formData: FormData) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const bookingId = formData.get("bookingId") as string
  const reason = (formData.get("reason") as string) || ""

  if (!bookingId) {
    throw new Error("Booking ID is required")
  }

  // Get booking details
  const { data: booking } = await supabase
    .from("bookings")
    .select(`
      *,
      experts (
        id,
        user_id,
        user_profiles (
          first_name,
          last_name,
          email
        )
      ),
      user_profiles (
        first_name,
        last_name,
        email
      )
    `)
    .eq("id", bookingId)
    .single()

  if (!booking) {
    throw new Error("Booking not found")
  }

  // Check if user is authorized to cancel
  const isClient = booking.user_id === user.id
  const isExpert = booking.experts.user_id === user.id

  if (!isClient && !isExpert) {
    throw new Error("Not authorized to cancel this booking")
  }

  // Check if booking can be cancelled
  if (!["confirmed", "pending_confirmation"].includes(booking.status)) {
    throw new Error("This booking cannot be cancelled")
  }

  // Determine cancellation fee
  let refundAmount = booking.amount + booking.tax_amount
  let cancellationFee = 0

  if (isClient) {
    // Check if cancellation is within policy deadline
    const now = new Date()
    const cancellationDeadline = new Date(booking.cancellation_deadline)

    if (now > cancellationDeadline) {
      // Past deadline, apply cancellation fee
      cancellationFee = booking.cancellation_fee
      refundAmount = booking.amount + booking.tax_amount - cancellationFee
    }
  }

  // Store old values for history
  const oldStatus = booking.status

  // Update booking status
  const { error: updateError } = await supabase
    .from("bookings")
    .update({
      status: "cancelled",
      cancelled_by: isClient ? "client" : "expert",
      cancellation_reason: reason,
      cancellation_fee: cancellationFee,
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId)

  if (updateError) {
    throw new Error(`Failed to cancel booking: ${updateError.message}`)
  }

  // Process refund if applicable
  if (refundAmount > 0) {
    try {
      await refundPayment(booking.payment_intent_id, Math.round(refundAmount * 100), reason)
    } catch (error) {
      console.error("Error processing refund:", error)
      // Continue with cancellation even if refund fails
    }
  }

  // Log booking history
  await supabase.rpc("log_booking_history", {
    p_booking_id: bookingId,
    p_action: "cancelled",
    p_previous_status: oldStatus,
    p_new_status: "cancelled",
    p_previous_date: booking.date,
    p_new_date: booking.date,
    p_previous_time_start: booking.start_time,
    p_new_time_start: booking.start_time,
    p_previous_time_end: booking.end_time,
    p_new_time_end: booking.end_time,
    p_performed_by: user.id,
    p_performed_by_role: isClient ? "client" : "expert",
    p_reason: reason,
  })

  // Send cancellation emails
  await sendBookingCancellationEmail({
    clientName: `${booking.user_profiles.first_name} ${booking.user_profiles.last_name}`,
    clientEmail: booking.user_profiles.email,
    expertName: `${booking.experts.user_profiles.first_name} ${booking.experts.user_profiles.last_name}`,
    expertEmail: booking.experts.user_profiles.email,
    cancelledBy: isClient ? "client" : "expert",
    date: booking.date,
    startTime: booking.start_time,
    endTime: booking.end_time,
    reason,
    refundAmount,
    cancellationFee,
  })

  revalidatePath("/bookings")
  revalidatePath(`/bookings/${bookingId}`)

  if (isClient) {
    redirect("/bookings?success=booking-cancelled")
  } else {
    redirect("/expert/bookings?success=booking-cancelled")
  }
}

export async function getBookingHistory(bookingId: string) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Get booking to check authorization
  const { data: booking } = await supabase
    .from("bookings")
    .select("user_id, expert_id, experts(user_id)")
    .eq("id", bookingId)
    .single()

  if (!booking) {
    throw new Error("Booking not found")
  }

  // Check if user is authorized to view history
  const isClient = booking.user_id === user.id
  const isExpert = booking.experts.user_id === user.id

  if (!isClient && !isExpert) {
    throw new Error("Not authorized to view this booking's history")
  }

  // Get booking history
  const { data: history, error } = await supabase
    .from("booking_history")
    .select(`
      *,
      profiles:performed_by (
        full_name
      )
    `)
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch booking history: ${error.message}`)
  }

  return history
}

export async function getUpcomingBookings() {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const now = new Date()
  const today = now.toISOString().split("T")[0]
  const currentTime = now.toTimeString().split(" ")[0].substring(0, 5)

  // Get upcoming bookings for client
  const { data: clientBookings } = await supabase
    .from("bookings")
    .select(`
      *,
      experts (
        id,
        title,
        user_profiles (
          first_name,
          last_name,
          profile_image
        )
      )
    `)
    .eq("user_id", user.id)
    .in("status", ["confirmed", "pending_confirmation"])
    .or(`date.gt.${today},and(date.eq.${today},start_time.gt.${currentTime})`)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true })

  // Get upcoming bookings for expert
  const { data: expertProfile } = await supabase.from("experts").select("id").eq("user_id", user.id).single()

  let expertBookings = []
  if (expertProfile) {
    const { data } = await supabase
      .from("bookings")
      .select(`
        *,
        user_profiles (
          first_name,
          last_name,
          profile_image
        )
      `)
      .eq("expert_id", expertProfile.id)
      .in("status", ["confirmed", "pending_confirmation"])
      .or(`date.gt.${today},and(date.eq.${today},start_time.gt.${currentTime})`)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true })

    expertBookings = data || []
  }

  return {
    clientBookings: clientBookings || [],
    expertBookings,
  }
}

export async function sendBookingReminders() {
  const supabase = createClient()

  const now = new Date()
  const today = now.toISOString().split("T")[0]
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]

  // Get bookings that need reminders
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(`
      *,
      experts (
        id,
        title,
        user_profiles (
          first_name,
          last_name,
          email
        )
      ),
      user_profiles (
        first_name,
        last_name,
        email
      )
    `)
    .in("status", ["confirmed"])
    .or(`date.eq.${today},date.eq.${tomorrow}`)
    .is("last_reminder_sent", null)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch bookings for reminders: ${error.message}`)
  }

  if (!bookings || bookings.length === 0) {
    return { sent: 0 }
  }

  let sentCount = 0

  for (const booking of bookings) {
    try {
      // Send reminder to client
      await sendBookingReminderEmail({
        recipientName: `${booking.user_profiles.first_name} ${booking.user_profiles.last_name}`,
        recipientEmail: booking.user_profiles.email,
        recipientType: "client",
        expertName: `${booking.experts.user_profiles.first_name} ${booking.experts.user_profiles.last_name}`,
        date: booking.date,
        startTime: booking.start_time,
        endTime: booking.end_time,
        bookingId: booking.id,
      })

      // Send reminder to expert
      await sendBookingReminderEmail({
        recipientName: `${booking.experts.user_profiles.first_name} ${booking.experts.user_profiles.last_name}`,
        recipientEmail: booking.experts.user_profiles.email,
        recipientType: "expert",
        clientName: `${booking.user_profiles.first_name} ${booking.user_profiles.last_name}`,
        date: booking.date,
        startTime: booking.start_time,
        endTime: booking.end_time,
        bookingId: booking.id,
      })

      // Update booking to mark reminder as sent
      await supabase
        .from("bookings")
        .update({
          last_reminder_sent: new Date().toISOString(),
        })
        .eq("id", booking.id)

      sentCount += 2 // Count both client and expert reminders
    } catch (error) {
      console.error(`Error sending reminder for booking ${booking.id}:`, error)
    }
  }

  return { sent: sentCount }
}

