"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getCurrentUser } from "./auth"

export async function getExpertAvailabilitySettings() {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Get expert ID
  const { data: expert } = await supabase.from("experts").select("id").eq("user_id", user.id).single()

  if (!expert) {
    throw new Error("Expert not found")
  }

  // Get availability settings
  const { data: settings } = await supabase
    .from("availability_settings")
    .select("*")
    .eq("expert_id", expert.id)
    .single()

  if (!settings) {
    // Create default settings if none exist
    const { data: newSettings, error } = await supabase
      .from("availability_settings")
      .insert({
        expert_id: expert.id,
        timezone: "UTC",
        advance_notice_hours: 24,
        max_booking_days_ahead: 30,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create availability settings: ${error.message}`)
    }

    return newSettings
  }

  return settings
}

export async function updateAvailabilitySettings(formData: FormData) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const timezone = formData.get("timezone") as string
  const advanceNoticeHours = Number.parseInt(formData.get("advanceNoticeHours") as string)
  const maxBookingDaysAhead = Number.parseInt(formData.get("maxBookingDaysAhead") as string)

  if (!timezone || isNaN(advanceNoticeHours) || isNaN(maxBookingDaysAhead)) {
    throw new Error("Invalid form data")
  }

  // Get expert ID
  const { data: expert } = await supabase.from("experts").select("id").eq("user_id", user.id).single()

  if (!expert) {
    throw new Error("Expert not found")
  }

  // Update settings
  const { error } = await supabase.from("availability_settings").upsert({
    expert_id: expert.id,
    timezone,
    advance_notice_hours: advanceNoticeHours,
    max_booking_days_ahead: maxBookingDaysAhead,
    updated_at: new Date().toISOString(),
  })

  if (error) {
    throw new Error(`Failed to update availability settings: ${error.message}`)
  }

  revalidatePath("/expert/availability")
  return { success: true }
}

export async function getAvailabilitySlots() {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Get expert ID
  const { data: expert } = await supabase.from("experts").select("id").eq("user_id", user.id).single()

  if (!expert) {
    throw new Error("Expert not found")
  }

  // Get availability slots
  const { data: slots, error } = await supabase
    .from("availability_slots")
    .select("*")
    .eq("expert_id", expert.id)
    .order("day_of_week")
    .order("start_time")

  if (error) {
    throw new Error(`Failed to get availability slots: ${error.message}`)
  }

  return slots || []
}

export async function addAvailabilitySlot(formData: FormData) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const dayOfWeek = Number.parseInt(formData.get("dayOfWeek") as string)
  const startTime = formData.get("startTime") as string
  const endTime = formData.get("endTime") as string
  const isRecurring = formData.get("isRecurring") === "true"

  if (isNaN(dayOfWeek) || !startTime || !endTime) {
    throw new Error("Invalid form data")
  }

  // Get expert ID
  const { data: expert } = await supabase.from("experts").select("id").eq("user_id", user.id).single()

  if (!expert) {
    throw new Error("Expert not found")
  }

  // Add slot
  const { error } = await supabase.from("availability_slots").insert({
    expert_id: expert.id,
    day_of_week: dayOfWeek,
    start_time: startTime,
    end_time: endTime,
    is_recurring: isRecurring,
  })

  if (error) {
    throw new Error(`Failed to add availability slot: ${error.message}`)
  }

  revalidatePath("/expert/availability")
  return { success: true }
}

export async function deleteAvailabilitySlot(formData: FormData) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const slotId = formData.get("slotId") as string

  if (!slotId) {
    throw new Error("Slot ID is required")
  }

  // Get expert ID
  const { data: expert } = await supabase.from("experts").select("id").eq("user_id", user.id).single()

  if (!expert) {
    throw new Error("Expert not found")
  }

  // Delete slot
  const { error } = await supabase.from("availability_slots").delete().eq("id", slotId).eq("expert_id", expert.id)

  if (error) {
    throw new Error(`Failed to delete availability slot: ${error.message}`)
  }

  revalidatePath("/expert/availability")
  return { success: true }
}

export async function getUnavailableDates() {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Get expert ID
  const { data: expert } = await supabase.from("experts").select("id").eq("user_id", user.id).single()

  if (!expert) {
    throw new Error("Expert not found")
  }

  // Get unavailable dates
  const { data: dates, error } = await supabase
    .from("unavailable_dates")
    .select("*")
    .eq("expert_id", expert.id)
    .order("date")

  if (error) {
    throw new Error(`Failed to get unavailable dates: ${error.message}`)
  }

  return dates || []
}

export async function addUnavailableDate(formData: FormData) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const date = formData.get("date") as string
  const reason = formData.get("reason") as string

  if (!date) {
    throw new Error("Date is required")
  }

  // Get expert ID
  const { data: expert } = await supabase.from("experts").select("id").eq("user_id", user.id).single()

  if (!expert) {
    throw new Error("Expert not found")
  }

  // Add unavailable date
  const { error } = await supabase.from("unavailable_dates").insert({
    expert_id: expert.id,
    date,
    reason,
  })

  if (error) {
    throw new Error(`Failed to add unavailable date: ${error.message}`)
  }

  revalidatePath("/expert/availability")
  return { success: true }
}

export async function deleteUnavailableDate(formData: FormData) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const dateId = formData.get("dateId") as string

  if (!dateId) {
    throw new Error("Date ID is required")
  }

  // Get expert ID
  const { data: expert } = await supabase.from("experts").select("id").eq("user_id", user.id).single()

  if (!expert) {
    throw new Error("Expert not found")
  }

  // Delete unavailable date
  const { error } = await supabase.from("unavailable_dates").delete().eq("id", dateId).eq("expert_id", expert.id)

  if (error) {
    throw new Error(`Failed to delete unavailable date: ${error.message}`)
  }

  revalidatePath("/expert/availability")
  return { success: true }
}

export async function getExpertAvailability(expertId: string, date: string) {
  const supabase = createClient()

  // Get day of week (0 = Sunday, 6 = Saturday)
  const dayOfWeek = new Date(date).getDay()

  // Get availability slots for this day
  const { data: slots } = await supabase
    .from("availability_slots")
    .select("*")
    .eq("expert_id", expertId)
    .eq("day_of_week", dayOfWeek)
    .order("start_time")

  // Check if date is unavailable
  const { data: unavailableDates } = await supabase
    .from("unavailable_dates")
    .select("*")
    .eq("expert_id", expertId)
    .eq("date", date)

  const isDateUnavailable = unavailableDates && unavailableDates.length > 0

  if (isDateUnavailable) {
    return []
  }

  // Get existing bookings for this date
  const { data: bookings } = await supabase
    .from("bookings")
    .select("start_time, end_time")
    .eq("expert_id", expertId)
    .eq("date", date)
    .not("status", "in", '("cancelled", "rejected")')

  // Filter out slots that overlap with bookings
  const availableSlots =
    slots?.filter((slot) => {
      if (!bookings || bookings.length === 0) {
        return true
      }

      // Check if slot overlaps with any booking
      return !bookings.some((booking) => {
        const bookingStart = booking.start_time
        const bookingEnd = booking.end_time

        return (
          (slot.start_time <= bookingStart && slot.end_time > bookingStart) ||
          (slot.start_time < bookingEnd && slot.end_time >= bookingEnd) ||
          (slot.start_time >= bookingStart && slot.end_time <= bookingEnd)
        )
      })
    }) || []

  return availableSlots
}

