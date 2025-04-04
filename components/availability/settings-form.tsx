"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { updateAvailabilitySettings } from "@/app/actions/availability"
import { toast } from "@/hooks/use-toast"

interface SettingsFormProps {
  initialSettings: {
    timezone: string
    advance_notice_hours: number
    max_booking_days_ahead: number
  }
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [isPending, setIsPending] = useState(false)
  const form = useForm({
    defaultValues: {
      timezone: initialSettings.timezone,
      advanceNoticeHours: initialSettings.advance_notice_hours.toString(),
      maxBookingDaysAhead: initialSettings.max_booking_days_ahead.toString(),
    },
  })

  const onSubmit = async (data: any) => {
    try {
      setIsPending(true)
      const formData = new FormData()
      formData.append("timezone", data.timezone)
      formData.append("advanceNoticeHours", data.advanceNoticeHours)
      formData.append("maxBookingDaysAhead", data.maxBookingDaysAhead)

      await updateAvailabilitySettings(formData)
      toast({
        title: "Settings updated",
        description: "Your availability settings have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update settings",
        variant: "destructive",
      })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Availability Settings</CardTitle>
        <CardDescription>Configure your availability preferences for bookings</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Timezone</FormLabel>
                <Select disabled={isPending} onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="Europe/London">London (GMT)</SelectItem>
                    <SelectItem value="Europe/Paris">Central European Time (CET)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Japan (JST)</SelectItem>
                    <SelectItem value="Australia/Sydney">Sydney (AEST)</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>All times will be displayed in this timezone</FormDescription>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="advanceNoticeHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Advance Notice (hours)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" max="168" disabled={isPending} {...field} />
                </FormControl>
                <FormDescription>Minimum hours of notice required for bookings</FormDescription>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxBookingDaysAhead"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Booking Days Ahead</FormLabel>
                <FormControl>
                  <Input type="number" min="1" max="365" disabled={isPending} {...field} />
                </FormControl>
                <FormDescription>How far in advance clients can book consultations</FormDescription>
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

