"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export type Message = {
  id: string
  content: string
  created_at: string
  sender_id: string
  is_read: boolean
  attachment_url?: string
  attachment_type?: string
  attachment_name?: string
  profiles?: {
    id: string
    full_name: string
    avatar_url?: string
  }
}

export function useMessages(conversationId: string, initialMessages: Message[] = []) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  // Fetch messages
  const fetchMessages = async () => {
    setLoading(true)

    try {
      const { data, error } = await supabase
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
        throw error
      }

      setMessages(data || [])
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Error loading messages",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Subscribe to new messages
  useEffect(() => {
    if (!conversationId) return

    // Mark messages as read when component mounts
    const markAsRead = async () => {
      await supabase.rpc("mark_messages_as_read", {
        p_conversation_id: conversationId,
        p_user_id: supabase.auth.getUser().then((res) => res.data.user?.id),
      })
    }

    markAsRead()

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // Fetch the complete message with profile info
          const { data } = await supabase
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
            .eq("id", payload.new.id)
            .single()

          if (data) {
            setMessages((prev) => [...prev, data])

            // Mark message as read if it's not from the current user
            const currentUser = await supabase.auth.getUser()
            if (data.sender_id !== currentUser.data.user?.id) {
              await supabase.rpc("mark_messages_as_read", {
                p_conversation_id: conversationId,
                p_user_id: currentUser.data.user?.id,
              })
            }
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) =>
            prev.map((message) => (message.id === payload.new.id ? { ...message, ...payload.new } : message)),
          )
        },
      )
      .subscribe()

    // Fetch initial messages
    fetchMessages()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, supabase, toast])

  return { messages, loading, error, refetch: fetchMessages }
}

