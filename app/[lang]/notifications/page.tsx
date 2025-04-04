import type { Metadata } from "next"
import { getNotifications } from "@/app/actions/notifications"
import { NotificationsList } from "@/components/notifications/notifications-list"

export const metadata: Metadata = {
  title: "Notifications",
  description: "View and manage your notifications",
}

export default async function NotificationsPage() {
  const { notifications, count } = await getNotifications(20, 0, true)

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>
      <NotificationsList initialNotifications={notifications} initialCount={count} />
    </div>
  )
}

