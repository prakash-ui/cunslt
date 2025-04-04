"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Conversation } from "@/app/actions/messaging"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"

interface ConversationListProps {
  conversations: Conversation[]
  userRole: string
}

export function ConversationList({ conversations, userRole }: ConversationListProps) {
  const pathname = usePathname()
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredConversations, setFilteredConversations] = useState(conversations)

  useEffect(() => {
    if (!searchTerm) {
      setFilteredConversations(conversations)
      return
    }

    const filtered = conversations.filter((conversation) => {
      const name =
        userRole === "expert"
          ? conversation.client?.full_name.toLowerCase()
          : conversation.expert?.profiles?.full_name.toLowerCase()

      return name?.includes(searchTerm.toLowerCase())
    })

    setFilteredConversations(filtered)
  }, [searchTerm, conversations, userRole])

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search conversations..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <p className="text-muted-foreground mb-4">No conversations found</p>
            {userRole === "client" && (
              <Link href="/experts">
                <Button>Find Experts</Button>
              </Link>
            )}
          </div>
        ) : (
          <ul className="divide-y">
            {filteredConversations.map((conversation) => {
              const isActive = pathname === `/messages/${conversation.id}`
              const otherPerson =
                userRole === "expert"
                  ? conversation.client
                  : {
                      full_name: conversation.expert?.profiles?.full_name,
                      avatar_url: conversation.expert?.profiles?.avatar_url,
                    }

              return (
                <li key={conversation.id}>
                  <Link href={`/messages/${conversation.id}`}>
                    <div
                      className={cn(
                        "flex items-center p-4 hover:bg-muted/50 transition-colors",
                        isActive && "bg-muted",
                      )}
                    >
                      <Avatar className="h-10 w-10 mr-4">
                        <AvatarImage src={otherPerson?.avatar_url || ""} alt={otherPerson?.full_name || ""} />
                        <AvatarFallback>{otherPerson?.full_name?.charAt(0) || "?"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="font-medium truncate">{otherPerson?.full_name}</p>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                          </span>
                        </div>
                        {conversation.unread_count ? (
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-sm text-muted-foreground truncate">New messages</span>
                            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-primary rounded-full">
                              {conversation.unread_count}
                            </span>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground truncate mt-1">No new messages</p>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

