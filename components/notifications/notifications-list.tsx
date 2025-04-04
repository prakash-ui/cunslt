"use client"

import { useState } from "react"
import { Check, Archive, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  archiveNotification,
} from "@/app/actions/notifications"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface NotificationsListProps {
  initialNotifications: any[]
  initialCount: number
}

export function NotificationsList({ initialNotifications, initialCount }: NotificationsListProps) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(initialCount > initialNotifications.length)

  // Load more notifications
  const loadMore = async () => {
    setLoading(true)
    const offset = (page + 1) * 20
    const includeRead = activeTab === "all"

    const { notifications: newNotifications, count: newCount } = await getNotifications(20, offset, includeRead)

    setNotifications([...notifications, ...newNotifications])
    setCount(newCount)
    setPage(page + 1)
    setHasMore(offset + 20 < newCount)
    setLoading(false)
  }

  // Handle tab change
  const handleTabChange = async (value: string) => {
    setActiveTab(value)
    setLoading(true)

    const includeRead = value === "all"
    const { notifications: newNotifications, count: newCount } = await getNotifications(20, 0, includeRead)

    setNotifications(newNotifications)
    setCount(newCount)
    setPage(0)
    setHasMore(20 < newCount)
    setLoading(false)
  }

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
    setCount(count - 1)
  }

  // Handle marking all as read
  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead()
    setNotifications(notifications.map((notification) => ({ ...notification, is_read: true })))
  }

  // Get notification type display name
  const getNotificationTypeDisplay = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Get notification badge color
  const getNotificationBadgeColor = (type: string) => {
    switch (type) {
      case "booking_created":
        return "bg-green-100 text-green-800"
      case "booking_canceled":
        return "bg-red-100 text-red-800"
      case "payment_failed":
      case "security_alert":
        return "bg-red-100 text-red-800"
      case "message_received":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Your Notifications</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleMarkAllAsRead}>
                <Check className="mr-2 h-4 w-4" />
                Mark all as read
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription>
          You have {count} {count === 1 ? "notification" : "notifications"}
        </CardDescription>
      </CardHeader>

      <Tabs defaultValue="all" onValueChange={handleTabChange}>
        <div className="px-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="m-0">
          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <p className="text-muted-foreground">No notifications</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn("p-4 transition-colors", !notification.is_read && "bg-accent/50")}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className={cn("text-sm font-medium", !notification.is_read && "font-semibold")}>
                            {notification.title}
                          </h4>
                          <Badge variant="outline" className={getNotificationBadgeColor(notification.type)}>
                            {getNotificationTypeDisplay(notification.type)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.body}</p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>{notification.timeAgo}</span>
                          {notification.link && (
                            <>
                              <Separator orientation="vertical" className="h-3" />
                              <Link
                                href={notification.link}
                                className="text-blue-500 hover:underline"
                                onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                              >
                                View details
                              </Link>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-1">
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleMarkAsRead(notification.id)}
                            aria-label="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleArchive(notification.id)}
                          aria-label="Archive"
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </TabsContent>

        <TabsContent value="unread" className="m-0">
          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <p className="text-muted-foreground">No unread notifications</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications
                  .filter((n) => !n.is_read)
                  .map((notification) => (
                    <div key={notification.id} className="p-4 bg-accent/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-medium font-semibold">{notification.title}</h4>
                            <Badge variant="outline" className={getNotificationBadgeColor(notification.type)}>
                              {getNotificationTypeDisplay(notification.type)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{notification.body}</p>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <span>{notification.timeAgo}</span>
                            {notification.link && (
                              <>
                                <Separator orientation="vertical" className="h-3" />
                                <Link
                                  href={notification.link}
                                  className="text-blue-500 hover:underline"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                >
                                  View details
                                </Link>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleMarkAsRead(notification.id)}
                            aria-label="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleArchive(notification.id)}
                            aria-label="Archive"
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </TabsContent>
      </Tabs>

      <CardFooter className="flex justify-center p-4">
        {hasMore && (
          <Button variant="outline" onClick={loadMore} disabled={loading}>
            {loading ? "Loading..." : "Load more"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

