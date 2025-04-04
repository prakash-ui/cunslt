"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getCurrentUser } from "./auth"

// Add this function to the existing booking.ts file
export async function createBookingWithPackage(formData: FormData) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const expertId = formData.get("expertId") as string
  const date = formData.get("date") as string
  const startTime = formData.get("startTime") as string
  const duration = Number.parseInt(formData.get("duration") as string)
  const notes = formData.get("notes") as string
  const clientPackageId = formData.get("clientPackageId") as string

  // Validate inputs
  if (!expertId || !date || !startTime || !duration) {
    throw new Error("Missing required fields")
  }

  // Get the expert details
  const { data: expert, error: expertError } = await supabase.from("experts").select("*").eq("id", expertId).single()

  if (expertError || !expert) {
    throw new Error("Expert not found")
  }

  // Get the client package
  const { data: clientPackage, error: packageError } = await supabase
    .from("client_packages")
    .select(`
      *,
      consultation_packages (*)
    `)
    .eq("id", clientPackageId)
    .eq("client_id", user.id)
    .single()

  if (packageError || !clientPackage) {
    throw new Error("Package not found or doesn't belong to you")
  }

  // Check if package is active and has enough hours
  if (clientPackage.status !== "active") {
    throw new Error("Package is not active")
  }

  if (new Date(clientPackage.expires_at) < new Date()) {
    throw new Error("Package has expired")
  }

  const hoursNeeded = duration / 60

  if (clientPackage.hours_remaining < hoursNeeded) {
    throw new Error("Not enough hours remaining in your package")
  }

  // Create the booking
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      client_id: user.id,
      expert_id: expertId,
      date,
      start_time: startTime,
      end_time: calculateEndTime(startTime, duration),
      duration,
      status: "confirmed",
      payment_status: "paid",
      amount: 0, // No charge since using package
      subtotal: 0,
      tax_amount: 0,
      notes,
      is_package_booking: true,
      client_package_id: clientPackageId,
    })
    .select()
    .single()

  if (bookingError) {
    throw new Error("Failed to create booking")
  }

  // Update the client package hours remaining
  const newHoursRemaining = clientPackage.hours_remaining - hoursNeeded

  const { error: updateError } = await supabase
    .from("client_packages")
    .update({
      hours_remaining: newHoursRemaining,
      status: newHoursRemaining <= 0 ? "completed" : "active",
      updated_at: new Date().toISOString(),
    })
    .eq("id", clientPackageId)

  if (updateError) {
    throw new Error("Failed to update package hours")
  }

  revalidatePath("/bookings")
  redirect(`/bookings/${booking.id}?success=booked`)
}

// Helper function to calculate end time
function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(":").map(Number)

  const startDate = new Date()
  startDate.setHours(hours, minutes, 0, 0)

  const endDate = new Date(startDate.getTime() + durationMinutes * 60000)

  return `${endDate.getHours().toString().padStart(2, "0")}:${endDate.getMinutes().toString().padStart(2, "0")}`
}

