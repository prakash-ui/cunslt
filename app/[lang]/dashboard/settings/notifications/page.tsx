import type { Metadata } from "next"
import { NotificationPreferences } from "@/components/notifications/notification-preferences"

export async function generateMetadata({ params }: { params: { lang: string } }) {
  const lang = params.lang || "en";
  return {
    title: lang === "en" ? "Notification Settings" : "Paramètres de notification",
    description: lang === "en"
      ? "Manage your notification preferences"
      : "Gérez vos préférences de notification",
  };
}

export default function NotificationSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Notification Settings</h3>
        <p className="text-sm text-muted-foreground">Manage how you receive notifications from the platform</p>
      </div>
      <NotificationPreferences />
    </div>
  )
}

