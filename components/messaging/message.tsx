"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Check, CheckCheck, Download, FileText, Image } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { getInitials } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import type { Message as MessageType } from "@/hooks/use-messages"

interface MessageProps {
  message: MessageType
  isLastMessage?: boolean
}

export function Message({ message, isLastMessage }: MessageProps) {
  const { user } = useAuth()
  const [imageLoaded, setImageLoaded] = useState(false)
  const isCurrentUser = message.sender_id === user?.id

  const hasAttachment = !!message.attachment_url
  const isImage = message.attachment_type?.startsWith("image/")
  const isDocument = !isImage && hasAttachment

  return (
    <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} mb-4`}>
      {!isCurrentUser && (
        <Avatar className="h-8 w-8 mr-2">
          <AvatarImage src={message.profiles?.avatar_url} alt={message.profiles?.full_name || "User"} />
          <AvatarFallback>{getInitials(message.profiles?.full_name || "User")}</AvatarFallback>
        </Avatar>
      )}

      <div className={`max-w-[80%] ${isCurrentUser ? "order-1" : "order-2"}`}>
        <Card
          className={`
          ${isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"}
          shadow-none
        `}
        >
          <CardContent className="p-3">
            {message.content && <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>}

            {isImage && message.attachment_url && (
              <div className="mt-2 relative">
                {!imageLoaded && (
                  <div className="h-32 bg-muted animate-pulse rounded-md flex items-center justify-center">
                    <Image className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <img
                  src={message.attachment_url || "/placeholder.svg"}
                  alt="Attachment"
                  className={`max-h-64 rounded-md ${!imageLoaded ? "hidden" : "block"}`}
                  onLoad={() => setImageLoaded(true)}
                />
              </div>
            )}

            {isDocument && message.attachment_url && (
              <div className="mt-2">
                <a
                  href={message.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-2 bg-background/20 rounded-md hover:bg-background/30 transition-colors"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  <span className="text-sm truncate flex-1">{message.attachment_name || "Document"}</span>
                  <Download className="h-4 w-4 ml-2" />
                </a>
              </div>
            )}
          </CardContent>

          <CardFooter className="p-2 pt-0 flex justify-end">
            <span className="text-xs opacity-70">
              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
              {isCurrentUser && (
                <span className="ml-1 inline-flex">
                  {message.is_read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                </span>
              )}
            </span>
          </CardFooter>
        </Card>

        {!isCurrentUser && <div className="text-xs text-muted-foreground mt-1 ml-1">{message.profiles?.full_name}</div>}
      </div>
    </div>
  )
}

