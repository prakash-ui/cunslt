"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createBooking } from "@/app/actions/bookings"
import { getExpertAvailability } from "@/app/actions/availability"
import { formatTime } from "@/lib/utils"

interface BookingFormProps {
  expertId: string
  hourlyRate: number
}

export function BookingForm({ expertId, hourlyRate }: BookingFormProps) {
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [duration, setDuration] = useState("1")
  const [problem, setProblem] = useState("")
  const [availableSlots, setAvailableSlots] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Set default date to today
  useEffect(() => {
    const today = new Date()
    setDate(today.toISOString().split("T")[0])
  }, [])

  // Fetch available slots when date changes
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!date) return

      try {
        setIsLoading(true)
        const slots = await getExpertAvailability(expertId, date)
        setAvailableSlots(slots)

        // Reset start time if previously selected time is no longer available
        if (startTime && !slots.some((slot) => slot.start_time <= startTime && slot.end_time > startTime)) {
          setStartTime("")
        }
      } catch (error) {
        console.error("Failed to fetch availability:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAvailability()
  }, [date, expertId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const formData = new FormData()
    formData.append("expertId", expertId)
    formData.append("date", date)
    formData.append("startTime", startTime)
    formData.append("duration", duration)
    formData.append("problem", problem)

    await createBooking(formData)
  }

  // Generate time slots in 30-minute increments
  const generateTimeOptions = () => {
    if (!availableSlots.length) return []

    const options: { value: string; label: string }[] = []
    const durationHours = Number.parseInt(duration)

    availableSlots.forEach((slot) => {
      const start = new Date(`2000-01-01T${slot.start_time}`)
      const end = new Date(`2000-01-01T${slot.end_time}`)

      // Subtract duration from end time to ensure consultation fits
      end.setHours(end.getHours() - durationHours)

      // Generate 30-minute increments
      while (start <= end) {
        const timeString = start.toTimeString().substring(0, 5)
        options.push({
          value: timeString,
          label: formatTime(timeString),
        })

        // Add 30 minutes
        start.setMinutes(start.getMinutes() + 30)
      }
    })

    return options
  }

  const timeOptions = generateTimeOptions()
  const totalAmount = hourlyRate * Number.parseInt(duration)

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          <div>
            <Label htmlFor="duration">Duration</Label>
            <Select
              value={duration}
              onValueChange={(value) => {
                setDuration(value)
                // Reset start time when duration changes as available slots may change
                setStartTime("")
              }}
            >
              <SelectTrigger id="duration">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 hour</SelectItem>
                <SelectItem value="2">2 hours</SelectItem>
                <SelectItem value="3">3 hours</SelectItem>
                <SelectItem value="4">4 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="startTime">Start Time</Label>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading available times...</p>
            ) : timeOptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No available times for this date and duration</p>
            ) : (
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger id="startTime">
                  <SelectValue placeholder="Select start time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div>
            <Label htmlFor="problem">Describe Your Problem</Label>
            <Textarea
              id="problem"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="Please describe what you'd like to discuss in the consultation"
              rows={4}
              required
            />
          </div>

          <div className="pt-2">
            <p className="text-lg font-medium">Total: ${totalAmount.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">
              ${hourlyRate.toFixed(2)} per hour × {duration} hour{Number.parseInt(duration) > 1 ? "s" : ""}
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || !startTime || !date || !problem}>
            Book Consultation
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

