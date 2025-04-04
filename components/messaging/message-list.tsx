"use client"

import { useRef, useEffect } from "react"
import { formatRelative } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Message } from "@/app/actions/messaging"
import { cn } from "@/lib/utils"
import { FileIcon, FileTextIcon, ImageIcon } from "lucide-react"

interface MessageListProps {
  messages: Message[]
  currentUserId: string
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <p className="text-muted-foreground">No messages yet</p>
        <p className="text-sm text-muted-foreground mt-2">Send a message to start the conversation</p>
      </div>
    )
  }

  // Group messages by date
  const groupedMessages: { [date: string]: Message[] } = {}

  messages.forEach((message) => {
    const date = new Date(message.created_at).toDateString()
    if (!groupedMessages[date]) {
      groupedMessages[date] = []
    }
    groupedMessages[date].push(message)
  })

  return (
    <div className="flex flex-col space-y-4 p-4 overflow-y-auto">
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date} className="space-y-4">
          <div className="flex justify-center">
            <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded-full">
              {formatRelative(new Date(date), new Date())}
            </span>
          </div>

          {dateMessages.map((message) => {
            const isCurrentUser = message.sender_id === currentUserId

            return (
              <div key={message.id} className={cn("flex", isCurrentUser ? "justify-end" : "justify-start")}>
                <div className={cn("flex max-w-[80%]", isCurrentUser ? "flex-row-reverse" : "flex-row")}>
                  <Avatar className={cn("h-8 w-8", isCurrentUser ? "ml-2" : "mr-2")}>
                    <AvatarImage src={message.sender?.avatar_url || ""} alt={message.sender?.full_name || ""} />
                    <AvatarFallback>{message.sender?.full_name?.charAt(0) || "?"}</AvatarFallback>
                  </Avatar>

                  <div>
                    <div
                      className={cn(
                        "rounded-lg p-3",
                        isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted",
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>

                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {message.attachments.map((attachment) => {
                            const isImage = attachment.file_type.startsWith("image/")
                            const isPdf = attachment.file_type === "application/pdf"

                            return (
                              <a
                                key={attachment.id}
                                href={attachment.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                  "flex items-center p-2 rounded",
                                  isCurrentUser
                                    ? "bg-primary-foreground/10 hover:bg-primary-foreground/20"
                                    : "bg-background hover:bg-accent",
                                )}
                              >
                                {isImage ? (
                                  <ImageIcon className="h-4 w-4 mr-2" />
                                ) : isPdf ? (
                                  <FileTextIcon className="h-4 w-4 mr-2" />
                                ) : (
                                  <FileIcon className="h-4 w-4 mr-2" />
                                )}
                                <span className="text-sm truncate">{attachment.file_name}</span>
                              </a>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    <div
                      className={cn("text-xs text-muted-foreground mt-1", isCurrentUser ? "text-right" : "text-left")}
                    >
                      {formatRelative(new Date(message.created_at), new Date())}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}

