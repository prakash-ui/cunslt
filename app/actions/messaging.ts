"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"

// Types
export type Conversation = {
  id: string
  client_id: string
  expert_id: string
  booking_id?: string
  status: "active" | "archived"
  last_message_at: string
  created_at: string
  updated_at: string
  expert?: {
    id: string
    user_id: string
    profiles?: {
      full_name: string
      avatar_url?: string
    }
  }
  client?: {
    id: string
    full_name: string
    avatar_url?: string
  }
  unread_count?: number
}

export type Message = {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  read: boolean
  created_at: string
  updated_at: string
  sender?: {
    id: string
    full_name: string
    avatar_url?: string
  }
  attachments?: MessageAttachment[]
}

export type MessageAttachment = {
  id: string
  message_id: string
  file_name: string
  file_type: string
  file_size: number
  file_url: string
  created_at: string
}

export type MessageTemplate = {
  id: string
  user_id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

// Get conversations for a user
export async function getConversations(userId: string) {
  const supabase = createClient()

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("id, role").eq("user_id", userId).single()

  if (!profile) {
    return { error: "User profile not found" }
  }

  let query

  if (profile.role === "expert") {
    // Get expert ID
    const { data: expert } = await supabase.from("experts").select("id").eq("user_id", userId).single()

    if (!expert) {
      return { error: "Expert profile not found" }
    }

    // Get conversations where user is the expert
    query = supabase
      .from("conversations")
      .select(`
        *,
        client:client_id(
          id,
          full_name,
          avatar_url
        )
      `)
      .eq("expert_id", expert.id)
      .eq("status", "active")
      .order("last_message_at", { ascending: false })
  } else {
    // Get conversations where user is the client
    query = supabase
      .from("conversations")
      .select(`
        *,
        expert:expert_id(
          id,
          user_id,
          profiles:profiles(
            full_name,
            avatar_url
          )
        )
      `)
      .eq("client_id", profile.id)
      .eq("status", "active")
      .order("last_message_at", { ascending: false })
  }

  const { data: conversations, error } = await query

  if (error) {
    return { error: error.message }
  }

  // Get unread message counts for each conversation
  const conversationsWithUnreadCount = await Promise.all(
    conversations.map(async (conversation) => {
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("conversation_id", conversation.id)
        .eq("read", false)
        .not("sender_id", "eq", profile.id)

      return {
        ...conversation,
        unread_count: count || 0,
      }
    }),
  )

  return { conversations: conversationsWithUnreadCount }
}

// Get a single conversation
export async function getConversation(conversationId: string, userId: string) {
  const supabase = createClient()

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("id, role").eq("user_id", userId).single()

  if (!profile) {
    return { error: "User profile not found" }
  }

  // Get the conversation
  const { data: conversation, error } = await supabase
    .from("conversations")
    .select(`
      *,
      client:client_id(
        id,
        full_name,
        avatar_url
      ),
      expert:expert_id(
        id,
        user_id,
        profiles:profiles(
          full_name,
          avatar_url
        )
      )
    `)
    .eq("id", conversationId)
    .single()

  if (error) {
    return { error: error.message }
  }

  // Check if user is part of this conversation
  const isClient = conversation.client_id === profile.id
  const isExpert = profile.role === "expert" && conversation.expert.user_id === userId

  if (!isClient && !isExpert) {
    return { error: "Unauthorized access to conversation" }
  }

  return { conversation }
}

// Get messages for a conversation
export async function getMessages(conversationId: string, userId: string) {
  const supabase = createClient()

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("id, role").eq("user_id", userId).single()

  if (!profile) {
    return { error: "User profile not found" }
  }

  // Get the conversation to verify access
  const { data: conversation } = await supabase
    .from("conversations")
    .select(`
      client_id,
      expert_id,
      expert:expert_id(user_id)
    `)
    .eq("id", conversationId)
    .single()

  if (!conversation) {
    return { error: "Conversation not found" }
  }

  // Check if user is part of this conversation
  const isClient = conversation.client_id === profile.id
  const isExpert = profile.role === "expert" && conversation.expert.user_id === userId

  if (!isClient && !isExpert) {
    return { error: "Unauthorized access to conversation" }
  }

  // Get messages
  const { data: messages, error } = await supabase
    .from("messages")
    .select(`
      *,
      sender:sender_id(
        id,
        full_name,
        avatar_url
      ),
      attachments:message_attachments(*)
    `)
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })

  if (error) {
    return { error: error.message }
  }

  // Mark messages as read if the user is the recipient
  const unreadMessages = messages.filter((message) => !message.read && message.sender_id !== profile.id)

  if (unreadMessages.length > 0) {
    const unreadIds = unreadMessages.map((message) => message.id)

    await supabase.from("messages").update({ read: true, updated_at: new Date().toISOString() }).in("id", unreadIds)
  }

  return { messages }
}

// Send a message
export async function sendMessage(conversationId: string, content: string, userId: string, attachments?: File[]) {
  const supabase = createClient()

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("id, role").eq("user_id", userId).single()

  if (!profile) {
    return { error: "User profile not found" }
  }

  // Get the conversation to verify access
  const { data: conversation } = await supabase
    .from("conversations")
    .select(`
      client_id,
      expert_id,
      expert:expert_id(user_id)
    `)
    .eq("id", conversationId)
    .single()

  if (!conversation) {
    return { error: "Conversation not found" }
  }

  // Check if user is part of this conversation
  const isClient = conversation.client_id === profile.id
  const isExpert = profile.role === "expert" && conversation.expert.user_id === userId

  if (!isClient && !isExpert) {
    return { error: "Unauthorized access to conversation" }
  }

  // Create the message
  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      id: uuidv4(),
      conversation_id: conversationId,
      sender_id: profile.id,
      content,
      read: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Handle attachments if any
  if (attachments && attachments.length > 0) {
    for (const file of attachments) {
      const fileExt = file.name.split(".").pop()
      const fileName = `${uuidv4()}.${fileExt}`
      const filePath = `message-attachments/${conversationId}/${fileName}`

      // Upload file to storage
      const { error: uploadError, data: uploadData } = await supabase.storage.from("attachments").upload(filePath, file)

      if (uploadError) {
        return { error: uploadError.message }
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from("attachments").getPublicUrl(filePath)

      // Save attachment record
      await supabase.from("message_attachments").insert({
        message_id: message.id,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_url: urlData.publicUrl,
      })
    }
  }

  revalidatePath(`/messages/${conversationId}`)
  return { success: true, message }
}

// Create a new conversation
export async function createConversation(expertId: string, userId: string, bookingId?: string) {
  const supabase = createClient()

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", userId).single()

  if (!profile) {
    return { error: "User profile not found" }
  }

  // Check if expert exists
  const { data: expert } = await supabase.from("experts").select("id").eq("id", expertId).single()

  if (!expert) {
    return { error: "Expert not found" }
  }

  // Check if conversation already exists
  const { data: existingConversation } = await supabase
    .from("conversations")
    .select("id")
    .eq("client_id", profile.id)
    .eq("expert_id", expertId)
    .eq("status", "active")
    .maybeSingle()

  if (existingConversation) {
    return { conversation: existingConversation }
  }

  // Create new conversation
  const { data: conversation, error } = await supabase
    .from("conversations")
    .insert({
      client_id: profile.id,
      expert_id: expertId,
      booking_id: bookingId,
      status: "active",
      last_message_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  return { conversation }
}

// Archive a conversation
export async function archiveConversation(conversationId: string, userId: string) {
  const supabase = createClient()

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("id, role").eq("user_id", userId).single()

  if (!profile) {
    return { error: "User profile not found" }
  }

  // Get the conversation to verify access
  const { data: conversation } = await supabase
    .from("conversations")
    .select(`
      client_id,
      expert_id,
      expert:expert_id(user_id)
    `)
    .eq("id", conversationId)
    .single()

  if (!conversation) {
    return { error: "Conversation not found" }
  }

  // Check if user is part of this conversation
  const isClient = conversation.client_id === profile.id
  const isExpert = profile.role === "expert" && conversation.expert.user_id === userId

  if (!isClient && !isExpert) {
    return { error: "Unauthorized access to conversation" }
  }

  // Archive the conversation
  const { error } = await supabase
    .from("conversations")
    .update({
      status: "archived",
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversationId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/messages")
  return { success: true }
}

// Get message templates
export async function getMessageTemplates(userId: string) {
  const supabase = createClient()

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", userId).single()

  if (!profile) {
    return { error: "User profile not found" }
  }

  // Get templates
  const { data: templates, error } = await supabase
    .from("message_templates")
    .select("*")
    .eq("user_id", profile.id)
    .order("title", { ascending: true })

  if (error) {
    return { error: error.message }
  }

  return { templates }
}

// Create message template
export async function createMessageTemplate(title: string, content: string, userId: string) {
  const supabase = createClient()

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", userId).single()

  if (!profile) {
    return { error: "User profile not found" }
  }

  // Create template
  const { data: template, error } = await supabase
    .from("message_templates")
    .insert({
      user_id: profile.id,
      title,
      content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/messages/templates")
  return { template }
}

// Update message template
export async function updateMessageTemplate(templateId: string, title: string, content: string, userId: string) {
  const supabase = createClient()

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", userId).single()

  if (!profile) {
    return { error: "User profile not found" }
  }

  // Verify template ownership
  const { data: template } = await supabase
    .from("message_templates")
    .select("id")
    .eq("id", templateId)
    .eq("user_id", profile.id)
    .single()

  if (!template) {
    return { error: "Template not found or unauthorized" }
  }

  // Update template
  const { error } = await supabase
    .from("message_templates")
    .update({
      title,
      content,
      updated_at: new Date().toISOString(),
    })
    .eq("id", templateId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/messages/templates")
  return { success: true }
}

// Delete message template
export async function deleteMessageTemplate(templateId: string, userId: string) {
  const supabase = createClient()

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", userId).single()

  if (!profile) {
    return { error: "User profile not found" }
  }

  // Verify template ownership
  const { data: template } = await supabase
    .from("message_templates")
    .select("id")
    .eq("id", templateId)
    .eq("user_id", profile.id)
    .single()

  if (!template) {
    return { error: "Template not found or unauthorized" }
  }

  // Delete template
  const { error } = await supabase.from("message_templates").delete().eq("id", templateId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/messages/templates")
  return { success: true }
}

// Get unread message count
export async function getUnreadMessageCount(userId: string) {
  const supabase = createClient()

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("id, role").eq("user_id", userId).single()

  if (!profile) {
    return { count: 0 }
  }

  let query

  if (profile.role === "expert") {
    // Get expert ID
    const { data: expert } = await supabase.from("experts").select("id").eq("user_id", userId).single()

    if (!expert) {
      return { count: 0 }
    }

    // Get conversations where user is the expert
    const { data: conversations } = await supabase
      .from("conversations")
      .select("id")
      .eq("expert_id", expert.id)
      .eq("status", "active")

    if (!conversations || conversations.length === 0) {
      return { count: 0 }
    }

    const conversationIds = conversations.map((c) => c.id)

    // Count unread messages in these conversations
    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .in("conversation_id", conversationIds)
      .eq("read", false)
      .not("sender_id", "eq", profile.id)

    return { count: count || 0 }
  } else {
    // Get conversations where user is the client
    const { data: conversations } = await supabase
      .from("conversations")
      .select("id")
      .eq("client_id", profile.id)
      .eq("status", "active")

    if (!conversations || conversations.length === 0) {
      return { count: 0 }
    }

    const conversationIds = conversations.map((c) => c.id)

    // Count unread messages in these conversations
    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .in("conversation_id", conversationIds)
      .eq("read", false)
      .not("sender_id", "eq", profile.id)

    return { count: count || 0 }
  }
}

