"use client"

import { useEffect, useState } from "react"
import { getUnreadMessageCount } from "@/app/actions/messaging"
import { cn } from "@/lib/utils"

interface UnreadBadgeProps {
  userId: string
  className?: string
}

export function UnreadBadge({ userId, className }: UnreadBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const { count } = await getUnreadMessageCount(userId)
      setUnreadCount(count || 0)
    }

    fetchUnreadCount()

    // Set up polling to check for new messages
    const interval = setInterval(fetchUnreadCount, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [userId])

  if (unreadCount === 0) return null

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-primary rounded-full",
        className,
      )}
    >
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  )
}

