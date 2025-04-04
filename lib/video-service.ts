"use server"

import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/app/actions/auth"

// Daily.co API key would be stored in environment variables
const DAILY_API_KEY = process.env.DAILY_API_KEY

// Create a room for a consultation
export async function createVideoRoom(bookingId: string) {
  try {
    const response = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        name: `consultation-${bookingId}`,
        properties: {
          enable_chat: true,
          enable_screenshare: true,
          start_audio_off: false,
          start_video_off: false,
          exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // Expires in 24 hours
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to create video room: ${response.statusText}`)
    }

    const room = await response.json()

    // Store room information in database
    const supabase = createClient()
    await supabase.from("video_rooms").insert({
      booking_id: bookingId,
      room_name: room.name,
      room_url: room.url,
      expires_at: new Date(room.config.exp * 1000).toISOString(),
    })

    return room
  } catch (error) {
    console.error("Error creating video room:", error)
    throw error
  }
}

// Get a token for a participant
export async function getVideoToken(bookingId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error("Not authenticated")
    }

    const supabase = createClient()

    // Get the room information
    const { data: room } = await supabase.from("video_rooms").select("*").eq("booking_id", bookingId).single()

    if (!room) {
      throw new Error("Video room not found")
    }

    // Get user profile for participant name
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("first_name, last_name")
      .eq("user_id", user.id)
      .single()

    if (!profile) {
      throw new Error("User profile not found")
    }

    // Create a token for this participant
    const response = await fetch("https://api.daily.co/v1/meeting-tokens", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        properties: {
          room_name: room.room_name,
          user_name: `${profile.first_name} ${profile.last_name}`,
          user_id: user.id,
          exp: Math.floor(Date.now() / 1000) + 2 * 60 * 60, // Token expires in 2 hours
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to create token: ${response.statusText}`)
    }

    const token = await response.json()
    return {
      token: token.token,
      roomUrl: room.room_url,
    }
  } catch (error) {
    console.error("Error getting video token:", error)
    throw error
  }
}

// Check if a user is authorized to join a consultation
export async function checkConsultationAccess(bookingId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { authorized: false, message: "Not authenticated" }
    }

    const supabase = createClient()

    // Get the booking
    const { data: booking } = await supabase
      .from("bookings")
      .select(`
        *,
        experts (
          user_id
        )
      `)
      .eq("id", bookingId)
      .single()

    if (!booking) {
      return { authorized: false, message: "Booking not found" }
    }

    // Check if user is either the client or the expert
    if (booking.user_id !== user.id && booking.experts.user_id !== user.id) {
      return { authorized: false, message: "Not authorized to join this consultation" }
    }

    // Check if booking is confirmed
    if (booking.status !== "confirmed" && booking.status !== "in_progress") {
      return { authorized: false, message: "Booking is not confirmed" }
    }

    // Check if it's time for the consultation
    const bookingDate = new Date(`${booking.date}T${booking.start_time}`)
    const now = new Date()
    const diffMinutes = (bookingDate.getTime() - now.getTime()) / (1000 * 60)

    if (diffMinutes > 15) {
      return {
        authorized: false,
        message: "Consultation has not started yet. You can join 15 minutes before the scheduled time.",
      }
    }

    return { authorized: true }
  } catch (error) {
    console.error("Error checking consultation access:", error)
    return { authorized: false, message: "Error checking access" }
  }
}

