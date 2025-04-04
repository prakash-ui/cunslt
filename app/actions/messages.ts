"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getCurrentUser } from "./auth"
import { StorageService } from "@/lib/storage-service"

// Get conversations for the current user
export async function getConversations() {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    return { error: "Unauthorized", conversations: [] }
  }

  const { data: conversations, error } = await supabase
    .from("conversations")
    .select(`
      id,
      title,
      created_at,
      updated_at,
      booking_id,
      conversation_participants!inner(user_id, last_read_at),
      messages!messages_conversation_id_fkey(
        id,
        content,
        created_at,
        sender_id,
        is_read
      )
    `)
    .eq("conversation_participants.user_id", user.id)
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("Error fetching conversations:", error)
    return { error: error.message, conversations: [] }
  }

  // Get the latest message for each conversation
  const conversationsWithLatestMessage = await Promise.all(
    conversations.map(async (conversation) => {
      // Get the other participants in the conversation
      const { data: participants } = await supabase
        .from("conversation_participants")
        .select(`
          user_id,
          profiles(
            id,
            full_name,
            avatar_url
          )
        `)
        .eq("conversation_id", conversation.id)
        .neq("user_id", user.id)

      // Get the latest message
      const { data: latestMessage } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      // Count unread messages
      const { count: unreadCount } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("conversation_id", conversation.id)
        .eq("is_read", false)
        .neq("sender_id", user.id)

      return {
        ...conversation,
        participants: participants || [],
        latestMessage: latestMessage || null,
        unreadCount: unreadCount || 0,
      }
    }),
  )

  return { conversations: conversationsWithLatestMessage, error: null }
}

// Get a single conversation by ID
export async function getConversation(conversationId: string) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    return { error: "Unauthorized", conversation: null }
  }

  // Check if user is a participant
  const { data: participant, error: participantError } = await supabase
    .from("conversation_participants")
    .select("*")
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)
    .single()

  if (participantError || !participant) {
    return { error: "Not authorized to view this conversation", conversation: null }
  }

  // Get conversation details
  const { data: conversation, error } = await supabase
    .from("conversations")
    .select(`
      id,
      title,
      created_at,
      updated_at,
      booking_id,
      bookings(
        id,
        status,
        date,
        start_time,
        end_time,
        experts(
          id,
          title,
          bio
        )
      )
    `)
    .eq("id", conversationId)
    .single()

  if (error) {
    console.error("Error fetching conversation:", error)
    return { error: error.message, conversation: null }
  }

  // Get all participants
  const { data: participants } = await supabase
    .from("conversation_participants")
    .select(`
      user_id,
      last_read_at,
      profiles(
        id,
        full_name,
        avatar_url,
        role
      )
    `)
    .eq("conversation_id", conversationId)

  // Mark messages as read
  await supabase.rpc("mark_messages_as_read", {
    p_conversation_id: conversationId,
    p_user_id: user.id,
  })

  return {
    conversation: {
      ...conversation,
      participants: participants || [],
    },
    error: null,
  }
}

// Get messages for a conversation
export async function getMessages(conversationId: string) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    return { error: "Unauthorized", messages: [] }
  }

  // Check if user is a participant
  const { data: participant, error: participantError } = await supabase
    .from("conversation_participants")
    .select("*")
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)
    .single()

  if (participantError || !participant) {
    return { error: "Not authorized to view these messages", messages: [] }
  }

  const { data: messages, error } = await supabase
    .from("messages")
    .select(`
      id,
      content,
      created_at,
      updated_at,
      sender_id,
      is_read,
      attachment_url,
      attachment_type,
      attachment_name,
      profiles(
        id,
        full_name,
        avatar_url
      )
    `)
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching messages:", error)
    return { error: error.message, messages: [] }
  }

  return { messages, error: null }
}

// Send a message
export async function sendMessage(conversationId: string, content: string, attachment?: File) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    return { error: "Unauthorized", message: null }
  }

  // Check if user is a participant
  const { data: participant, error: participantError } = await supabase
    .from("conversation_participants")
    .select("*")
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)
    .single()

  if (participantError || !participant) {
    return { error: "Not authorized to send messages in this conversation", message: null }
  }

  let attachmentUrl = null
  let attachmentType = null
  let attachmentName = null

  // Upload attachment if provided
  if (attachment) {
    const storageService = new StorageService()
    const { url, error: uploadError } = await storageService.uploadFile(
      attachment,
      `conversations/${conversationId}`,
      user.id,
    )

    if (uploadError) {
      console.error("Error uploading attachment:", uploadError)
      return { error: uploadError, message: null }
    }

    attachmentUrl = url
    attachmentType = attachment.type
    attachmentName = attachment.name
  }

  // Insert message
  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content,
      attachment_url: attachmentUrl,
      attachment_type: attachmentType,
      attachment_name: attachmentName,
    })
    .select(`
      id,
      content,
      created_at,
      sender_id,
      is_read,
      attachment_url,
      attachment_type,
      attachment_name
    `)
    .single()

  if (error) {
    console.error("Error sending message:", error)
    return { error: error.message, message: null }
  }

  // Update last_read_at for the sender
  await supabase
    .from("conversation_participants")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)

  revalidatePath(`/messages/${conversationId}`)

  return { message, error: null }
}

// Create a new conversation
export async function createConversation(
  participantIds: string[],
  title?: string,
  bookingId?: string,
  initialMessage?: string,
) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    return { error: "Unauthorized", conversation: null }
  }

  // Make sure the current user is included in participants
  if (!participantIds.includes(user.id)) {
    participantIds.push(user.id)
  }

  // Start a transaction
  const { data: conversation, error: conversationError } = await supabase
    .from("conversations")
    .insert({
      title,
      booking_id: bookingId,
    })
    .select("id")
    .single()

  if (conversationError) {
    console.error("Error creating conversation:", conversationError)
    return { error: conversationError.message, conversation: null }
  }

  // Add participants
  const participantsToInsert = participantIds.map((participantId) => ({
    conversation_id: conversation.id,
    user_id: participantId,
  }))

  const { error: participantsError } = await supabase.from("conversation_participants").insert(participantsToInsert)

  if (participantsError) {
    console.error("Error adding participants:", participantsError)
    return { error: participantsError.message, conversation: null }
  }

  // Add initial message if provided
  if (initialMessage) {
    const { error: messageError } = await supabase.from("messages").insert({
      conversation_id: conversation.id,
      sender_id: user.id,
      content: initialMessage,
    })

    if (messageError) {
      console.error("Error adding initial message:", messageError)
      // We don't return an error here as the conversation was created successfully
    }
  }

  revalidatePath("/messages")

  return { conversation, error: null }
}

// Create a conversation for a booking
export async function createBookingConversation(bookingId: string) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    return { error: "Unauthorized", conversation: null }
  }

  // Get booking details
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select(`
      id,
      client_id,
      expert_id,
      title,
      experts(
        user_id
      )
    `)
    .eq("id", bookingId)
    .single()

  if (bookingError || !booking) {
    console.error("Error fetching booking:", bookingError)
    return { error: bookingError?.message || "Booking not found", conversation: null }
  }

  // Check if user is either the client or the expert
  const isClient = booking.client_id === user.id
  const isExpert = booking.experts?.user_id === user.id

  if (!isClient && !isExpert) {
    return { error: "Not authorized to create a conversation for this booking", conversation: null }
  }

  // Check if a conversation already exists for this booking
  const { data: existingConversation, error: existingError } = await supabase
    .from("conversations")
    .select("id")
    .eq("booking_id", bookingId)
    .single()

  if (existingConversation) {
    // Conversation already exists, redirect to it
    redirect(`/messages/${existingConversation.id}`)
  }

  // Create a new conversation
  const expertUserId = booking.experts?.user_id
  const clientUserId = booking.client_id

  if (!expertUserId || !clientUserId) {
    return { error: "Missing expert or client user ID", conversation: null }
  }

  const { conversation, error } = await createConversation(
    [expertUserId, clientUserId],
    `Consultation: ${booking.title || "Untitled"}`,
    bookingId,
    "This conversation has been created for your upcoming consultation.",
  )

  if (error) {
    return { error, conversation: null }
  }

  redirect(`/messages/${conversation.id}`)
}

// Mark all messages in a conversation as read
export async function markConversationAsRead(conversationId: string) {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    return { error: "Unauthorized" }
  }

  // Check if user is a participant
  const { data: participant, error: participantError } = await supabase
    .from("conversation_participants")
    .select("*")
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)
    .single()

  if (participantError || !participant) {
    return { error: "Not authorized to access this conversation" }
  }

  // Mark messages as read using the RPC function
  const { error } = await supabase.rpc("mark_messages_as_read", {
    p_conversation_id: conversationId,
    p_user_id: user.id,
  })

  if (error) {
    console.error("Error marking messages as read:", error)
    return { error: error.message }
  }

  revalidatePath(`/messages/${conversationId}`)

  return { error: null }
}

// Get total unread message count for the current user
export async function getUnreadMessageCount() {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    return { error: "Unauthorized", count: 0 }
  }

  // Get all conversations the user is part of
  const { data: conversations, error: conversationsError } = await supabase
    .from("conversation_participants")
    .select("conversation_id, last_read_at")
    .eq("user_id", user.id)

  if (conversationsError) {
    console.error("Error fetching conversations:", conversationsError)
    return { error: conversationsError.message, count: 0 }
  }

  let totalUnread = 0

  // For each conversation, count unread messages
  for (const conversation of conversations || []) {
    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("conversation_id", conversation.conversation_id)
      .eq("is_read", false)
      .neq("sender_id", user.id)

    totalUnread += count || 0
  }

  return { count: totalUnread, error: null }
}

