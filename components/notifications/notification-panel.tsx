"use client"

import { useState, useEffect } from "react"
import { X, Check, Archive, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  archiveNotification,
} from "@/app/actions/notifications"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface NotificationPanelProps {
  onViewAll: () => void
  onClose: () => void
}

export function NotificationPanel({ onViewAll, onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  // Fetch notifications on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true)
      const { notifications, count } = await getNotifications(5)
      setNotifications(notifications)
      setTotalCount(count)
      setLoading(false)
    }

    fetchNotifications()
  }, [])

  // Handle marking a notification as read
  const handleMarkAsRead = async (id: number) => {
    await markNotificationAsRead(id)
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, is_read: true } : notification)),
    )
  }

  // Handle archiving a notification
  const handleArchive = async (id: number) => {
    await archiveNotification(id)
    setNotifications(notifications.filter((notification) => notification.id !== id))
    setTotalCount(totalCount - 1)
  }

  // Handle marking all as read
  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead()
    setNotifications(notifications.map((notification) => ({ ...notification, is_read: true })))
  }

  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    // This would be expanded to include all notification types
    switch (type) {
      case "booking_created":
      case "booking_canceled":
      case "booking_rescheduled":
      case "booking_reminder":
        return "calendar"
      case "payment_received":
      case "payment_failed":
        return "credit-card"
      case "message_received":
        return "message-square"
      case "security_alert":
        return "shield-alert"
      default:
        return "bell"
    }
  }

  // Get color based on notification type
  const getNotificationColor = (type: string) => {
    // This would be expanded to include all notification types
    switch (type) {
      case "booking_created":
        return "text-green-500"
      case "booking_canceled":
        return "text-red-500"
      case "payment_failed":
      case "security_alert":
        return "text-red-500"
      case "message_received":
        return "text-blue-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <div className="absolute right-0 top-10 z-50 w-80 md:w-96 rounded-md border bg-background shadow-md">
      <div className="flex items-center justify-between p-4">
        <h3 className="font-semibold">Notifications</h3>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Separator />

      <div className="flex items-center justify-between p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMarkAllAsRead}
          disabled={notifications.every((n) => n.is_read)}
        >
          <Check className="mr-2 h-4 w-4" />
          Mark all as read
        </Button>

        <Button variant="ghost" size="sm" onClick={onViewAll}>
          View all
        </Button>
      </div>

      <ScrollArea className="h-[300px]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">No new notifications</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "flex items-start space-x-4 rounded-md p-3 transition-colors hover:bg-accent",
                  !notification.is_read && "bg-accent/50",
                )}
              >
                <div className={cn("mt-1", getNotificationColor(notification.type))}>
                  {/* This would use the actual icon based on the type */}
                  <span className="h-5 w-5">{getNotificationIcon(notification.type)}</span>
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className={cn("text-sm font-medium", !notification.is_read && "font-semibold")}>
                      {notification.title}
                    </p>
                    <span className="text-xs text-muted-foreground">{notification.timeAgo}</span>
                  </div>

                  <p className="text-sm text-muted-foreground">{notification.body}</p>

                  {notification.link && (
                    <Link
                      href={notification.link}
                      className="text-xs text-blue-500 hover:underline flex items-center mt-1"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      View details
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </Link>
                  )}
                </div>

                <div className="flex space-x-1">
                  {!notification.is_read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleMarkAsRead(notification.id)}
                      aria-label="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleArchive(notification.id)}
                    aria-label="Archive"
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <Separator />

      <div className="p-4">
        <Button variant="outline" className="w-full" onClick={onViewAll}>
          View all notifications
          {totalCount > 0 && ` (${totalCount})`}
        </Button>
      </div>
    </div>
  )
}

