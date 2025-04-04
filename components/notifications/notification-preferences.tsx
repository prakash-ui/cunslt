"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { getNotificationPreferences, updateNotificationPreferences } from "@/app/actions/notifications"
import { toast } from "@/components/ui/use-toast"

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Fetch notification preferences on mount
  useEffect(() => {
    const fetchPreferences = async () => {
      setLoading(true)
      const prefs = await getNotificationPreferences()
      setPreferences(
        prefs || {
          email_notifications: true,
          push_notifications: true,
          in_app_notifications: true,
          booking_reminders: true,
          booking_updates: true,
          messages: true,
          payment_updates: true,
          platform_updates: true,
          security_alerts: true,
          marketing_emails: true,
        },
      )
      setLoading(false)
    }

    fetchPreferences()
  }, [])

  // Handle preference change
  const handlePreferenceChange = (key: string, value: boolean) => {
    setPreferences({ ...preferences, [key]: value })
  }

  // Save preferences
  const savePreferences = async () => {
    setSaving(true)
    const result = await updateNotificationPreferences(preferences)
    setSaving(false)

    if (result.success) {
      toast({
        title: "Preferences saved",
        description: "Your notification preferences have been updated.",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to save notification preferences.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Loading your notification preferences...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Choose how and when you want to be notified</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notification Channels</h3>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications" className="font-medium">
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch
                id="email-notifications"
                checked={preferences.email_notifications}
                onCheckedChange={(checked) => handlePreferenceChange("email_notifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-notifications" className="font-medium">
                  Push Notifications
                </Label>
                <p className="text-sm text-muted-foreground">Receive notifications on your device</p>
              </div>
              <Switch
                id="push-notifications"
                checked={preferences.push_notifications}
                onCheckedChange={(checked) => handlePreferenceChange("push_notifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="in-app-notifications" className="font-medium">
                  In-App Notifications
                </Label>
                <p className="text-sm text-muted-foreground">Receive notifications within the platform</p>
              </div>
              <Switch
                id="in-app-notifications"
                checked={preferences.in_app_notifications}
                onCheckedChange={(checked) => handlePreferenceChange("in_app_notifications", checked)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notification Types</h3>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="booking-reminders" className="font-medium">
                  Booking Reminders
                </Label>
                <p className="text-sm text-muted-foreground">Reminders about upcoming bookings</p>
              </div>
              <Switch
                id="booking-reminders"
                checked={preferences.booking_reminders}
                onCheckedChange={(checked) => handlePreferenceChange("booking_reminders", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="booking-updates" className="font-medium">
                  Booking Updates
                </Label>
                <p className="text-sm text-muted-foreground">Updates about your bookings</p>
              </div>
              <Switch
                id="booking-updates"
                checked={preferences.booking_updates}
                onCheckedChange={(checked) => handlePreferenceChange("booking_updates", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="messages" className="font-medium">
                  Messages
                </Label>
                <p className="text-sm text-muted-foreground">Notifications about new messages</p>
              </div>
              <Switch
                id="messages"
                checked={preferences.messages}
                onCheckedChange={(checked) => handlePreferenceChange("messages", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="payment-updates" className="font-medium">
                  Payment Updates
                </Label>
                <p className="text-sm text-muted-foreground">Updates about payments and transactions</p>
              </div>
              <Switch
                id="payment-updates"
                checked={preferences.payment_updates}
                onCheckedChange={(checked) => handlePreferenceChange("payment_updates", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="platform-updates" className="font-medium">
                  Platform Updates
                </Label>
                <p className="text-sm text-muted-foreground">Updates about new features and changes</p>
              </div>
              <Switch
                id="platform-updates"
                checked={preferences.platform_updates}
                onCheckedChange={(checked) => handlePreferenceChange("platform_updates", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="security-alerts" className="font-medium">
                  Security Alerts
                </Label>
                <p className="text-sm text-muted-foreground">Important security-related notifications</p>
              </div>
              <Switch
                id="security-alerts"
                checked={preferences.security_alerts}
                onCheckedChange={(checked) => handlePreferenceChange("security_alerts", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="marketing-emails" className="font-medium">
                  Marketing Emails
                </Label>
                <p className="text-sm text-muted-foreground">Promotional emails and newsletters</p>
              </div>
              <Switch
                id="marketing-emails"
                checked={preferences.marketing_emails}
                onCheckedChange={(checked) => handlePreferenceChange("marketing_emails", checked)}
              />
            </div>
          </div>
        </div>

        <Button onClick={savePreferences} disabled={saving}>
          {saving ? "Saving..." : "Save Preferences"}
        </Button>
      </CardContent>
    </Card>
  )
}

