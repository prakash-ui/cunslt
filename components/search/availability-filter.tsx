"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"

interface AvailabilityFilterProps {
  onChange: (day: number | null, time: string | null) => void
  defaultDay?: number | null
  defaultTime?: string | null
}

export function AvailabilityFilter({ onChange, defaultDay = null, defaultTime = null }: AvailabilityFilterProps) {
  const [day, setDay] = useState<number | null>(defaultDay)
  const [time, setTime] = useState<string | null>(defaultTime)
  const [date, setDate] = useState<Date | undefined>(undefined)

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  const handleDayChange = (value: string) => {
    const newDay = value === "any" ? null : Number.parseInt(value, 10)
    setDay(newDay)
    onChange(newDay, time)
  }

  const handleTimeChange = (value: string) => {
    setTime(value)
    onChange(day, value)
  }

  const handleDateChange = (date: Date | undefined) => {
    setDate(date)
    if (date) {
      const newDay = date.getDay()
      setDay(newDay)
      onChange(newDay, time)
    }
  }

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Availability</Label>

      <div className="space-y-2">
        <Label className="text-sm">Day</Label>
        <div className="flex space-x-2">
          <Select value={day === null ? "any" : day.toString()} onValueChange={handleDayChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Any day" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any day</SelectItem>
              {dayNames.map((name, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={handleDateChange} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Time</Label>
        <div className="flex space-x-2">
          <Select value={time || "any"} onValueChange={handleTimeChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Any time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any time</SelectItem>
              {Array.from({ length: 24 }).map((_, hour) => (
                <SelectItem key={hour} value={`${hour.toString().padStart(2, "0")}:00:00`}>
                  {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

