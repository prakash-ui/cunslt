"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useForm } from "react-hook-form"
import { addAvailabilitySlot } from "@/app/actions/availability"
import { toast } from "@/hooks/use-toast"
import { DaySelector } from "./day-selector"

export function AddTimeSlot() {
  const [isPending, setIsPending] = useState(false)
  const [selectedDay, setSelectedDay] = useState(1) // Monday by default

  const form = useForm({
    defaultValues: {
      startTime: "09:00",
      endTime: "17:00",
      isRecurring: true,
    },
  })

  const onSubmit = async (data: any) => {
    try {
      setIsPending(true)
      const formData = new FormData()
      formData.append("dayOfWeek", selectedDay.toString())
      formData.append("startTime", data.startTime)
      formData.append("endTime", data.endTime)
      formData.append("isRecurring", data.isRecurring.toString())

      await addAvailabilitySlot(formData)

      // Reset form
      form.reset({
        startTime: "09:00",
        endTime: "17:00",
        isRecurring: true,
      })

      toast({
        title: "Time slot added",
        description: "Your availability time slot has been added successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add time slot",
        variant: "destructive",
      })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Availability</CardTitle>
        <CardDescription>Add time slots when you're available for consultations</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <FormLabel>Day of Week</FormLabel>
            <DaySelector selectedDay={selectedDay} onChange={setSelectedDay} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <Input type="time" disabled={isPending} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time</FormLabel>
                  <FormControl>
                    <Input type="time" disabled={isPending} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="isRecurring"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Recurring Weekly</FormLabel>
                  <FormDescription>Repeat this time slot every week</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isPending} />
                </FormControl>
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isPending}>
            {isPending ? "Adding..." : "Add Time Slot"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

