"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { rescheduleBooking, cancelBooking } from "@/app/actions/bookings"
import { useToast } from "@/hooks/use-toast"
import { AlertTriangle } from "lucide-react"
import { format, addDays, isAfter } from "date-fns"

interface BookingActionsProps {
  booking: any
  userRole: "client" | "expert"
  availableTimeSlots?: { date: string; startTime: string; endTime: string }[]
}

export function BookingActions({ booking, userRole, availableTimeSlots = [] }: BookingActionsProps) {
  const { toast } = useToast()
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false)
  const [isCancelOpen, setIsCancelOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Calculate if cancellation would incur a fee (for clients)
  const now = new Date()
  const cancellationDeadline = new Date(booking.cancellation_deadline)
  const pastCancellationDeadline = isAfter(now, cancellationDeadline)
  const cancellationFee = booking.cancellation_fee || 0

  // Filter available time slots for the selected date
  const availableTimesForDate = selectedDate
    ? availableTimeSlots.filter((slot) => slot.date === format(selectedDate, "yyyy-MM-dd"))
    : []

  // Handle reschedule submission
  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedDate || !selectedTime) {
      toast({
        title: "Missing information",
        description: "Please select a date and time for rescheduling.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("bookingId", booking.id)
      formData.append("newDate", format(selectedDate, "yyyy-MM-dd"))
      formData.append("newStartTime", selectedTime)
      formData.append("reason", reason)

      await rescheduleBooking(formData)

      toast({
        title: "Booking rescheduled",
        description: "The consultation has been successfully rescheduled.",
      })

      setIsRescheduleOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reschedule booking",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle cancel submission
  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("bookingId", booking.id)
      formData.append("reason", reason)

      await cancelBooking(formData)

      toast({
        title: "Booking cancelled",
        description: "The consultation has been successfully cancelled.",
      })

      setIsCancelOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel booking",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Disable dates in the past and more than 30 days in the future
  const disabledDates = {
    before: addDays(new Date(), 1),
    after: addDays(new Date(), 30),
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      {/* Reschedule Dialog */}
      <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Reschedule</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reschedule Consultation</DialogTitle>
            <DialogDescription>Select a new date and time for your consultation.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleReschedule} className="space-y-4">
            <div className="space-y-2">
              <Label>Select Date</Label>
              <div className="border rounded-md p-2">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={disabledDates}
                  initialFocus
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Select Time</Label>
              <Select
                value={selectedTime}
                onValueChange={setSelectedTime}
                disabled={!selectedDate || availableTimesForDate.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {availableTimesForDate.length > 0 ? (
                    availableTimesForDate.map((slot) => (
                      <SelectItem key={slot.startTime} value={slot.startTime}>
                        {slot.startTime} - {slot.endTime}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      {selectedDate ? "No available times on this date" : "Select a date first"}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Reason for Rescheduling (Optional)</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a reason for rescheduling"
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRescheduleOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!selectedDate || !selectedTime || isSubmitting}>
                {isSubmitting ? "Rescheduling..." : "Confirm Reschedule"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive">Cancel Booking</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Cancel Consultation</DialogTitle>
            <DialogDescription>Are you sure you want to cancel this consultation?</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCancel} className="space-y-4">
            {userRole === "client" && pastCancellationDeadline && cancellationFee > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">Cancellation Fee Applies</p>
                  <p className="text-sm text-amber-700">
                    You are cancelling after the free cancellation deadline. A fee of ${cancellationFee.toFixed(2)} will
                    be charged.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Reason for Cancellation (Optional)</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a reason for cancellation"
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCancelOpen(false)} disabled={isSubmitting}>
                Go Back
              </Button>
              <Button type="submit" variant="destructive" disabled={isSubmitting}>
                {isSubmitting ? "Cancelling..." : "Confirm Cancellation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

