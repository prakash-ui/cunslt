"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { addUnavailableDate } from "@/app/actions/availability"
import { toast } from "@/hooks/use-toast"

export function AddUnavailableDate() {
  const [isPending, setIsPending] = useState(false)

  const form = useForm({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      reason: "",
    },
  })

  const onSubmit = async (data: any) => {
    try {
      setIsPending(true)
      const formData = new FormData()
      formData.append("date", data.date)
      formData.append("reason", data.reason)

      await addUnavailableDate(formData)

      // Reset form
      form.reset({
        date: new Date().toISOString().split("T")[0],
        reason: "",
      })

      toast({
        title: "Date blocked",
        description: "The date has been marked as unavailable.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to block date",
        variant: "destructive",
      })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Block Date</CardTitle>
        <CardDescription>Mark specific dates as unavailable for bookings</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" disabled={isPending} {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reason (Optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Why you're unavailable on this date" disabled={isPending} {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isPending}>
            {isPending ? "Blocking..." : "Block Date"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

