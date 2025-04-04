"use client"

import { useEffect, useRef } from "react"
import { useMessages } from "@/hooks/use-messages"
import { Message } from "@/components/messaging/message"
import { MessageInput } from "@/components/messaging/message-input"
import { Skeleton } from "@/components/ui/skeleton"
import { markConversationAsRead } from "@/app/actions/messages"

interface ConversationProps {
  conversationId: string
  initialMessages: any[]
}

export function Conversation({ conversationId, initialMessages }: ConversationProps) {
  const { messages, loading } = useMessages(conversationId, initialMessages)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Mark conversation as read when component mounts
  useEffect(() => {
    markConversationAsRead(conversationId)
  }, [conversationId])

  if (loading && messages.length === 0) {
    return (
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No messages yet</p>
            <p className="text-sm text-muted-foreground">Start the conversation by sending a message</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <Message key={message.id} message={message} isLastMessage={index === messages.length - 1} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput conversationId={conversationId} />
    </>
  )
}

