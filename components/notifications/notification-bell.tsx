"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationPanel } from "@/components/notifications/notification-panel"
import { getUnreadNotificationCount } from "@/app/actions/notifications"
import { useRouter } from "next/navigation"

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const router = useRouter()

  // Fetch unread notification count on mount and periodically
  useEffect(() => {
    const fetchUnreadCount = async () => {
      const count = await getUnreadNotificationCount()
      setUnreadCount(count)
    }

    fetchUnreadCount()

    // Refresh count every minute
    const interval = setInterval(fetchUnreadCount, 60000)

    return () => clearInterval(interval)
  }, [])

  // Handle click on the bell
  const handleClick = () => {
    setIsOpen(!isOpen)
  }

  // Handle view all notifications
  const handleViewAll = () => {
    setIsOpen(false)
    router.push("/notifications")
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && <NotificationPanel onViewAll={handleViewAll} onClose={() => setIsOpen(false)} />}
    </div>
  )
}

