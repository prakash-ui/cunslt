"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { TimePickerInput } from "./time-picker-input"

interface TimePickerDemoProps {
  setTime: (time: string) => void
  defaultTime?: string
}

export function TimePickerDemo({ setTime, defaultTime }: TimePickerDemoProps) {
  const [hours, setHours] = React.useState<number>(defaultTime ? Number.parseInt(defaultTime.split(":")[0]) : 12)
  const [minutes, setMinutes] = React.useState<number>(defaultTime ? Number.parseInt(defaultTime.split(":")[1]) : 0)
  const [isPM, setIsPM] = React.useState<boolean>(
    defaultTime ? Number.parseInt(defaultTime.split(":")[0]) >= 12 : false,
  )

  const handleHoursChange = (hours: number) => {
    setHours(hours)
    updateTime(hours, minutes, isPM)
  }

  const handleMinutesChange = (minutes: number) => {
    setMinutes(minutes)
    updateTime(hours, minutes, isPM)
  }

  const handlePeriodChange = (isPM: boolean) => {
    setIsPM(isPM)
    updateTime(hours, minutes, isPM)
  }

  const updateTime = (hours: number, minutes: number, isPM: boolean) => {
    let h = hours
    if (isPM && hours < 12) h += 12
    if (!isPM && hours === 12) h = 0

    const timeString = `${h.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`
    setTime(timeString)
  }

  return (
    <div className="flex items-end gap-2">
      <div className="grid gap-1 text-center">
        <Label htmlFor="hours" className="text-xs">
          Hours
        </Label>
        <TimePickerInput id="hours" value={hours} onChange={handleHoursChange} max={12} min={1} />
      </div>
      <div className="grid gap-1 text-center">
        <Label htmlFor="minutes" className="text-xs">
          Minutes
        </Label>
        <TimePickerInput id="minutes" value={minutes} onChange={handleMinutesChange} max={59} min={0} />
      </div>
      <div className="grid gap-1 text-center">
        <Label htmlFor="period" className="text-xs">
          Period
        </Label>
        <select
          id="period"
          className="h-10 w-16 rounded-md border border-input bg-background px-3"
          value={isPM ? "PM" : "AM"}
          onChange={(e) => handlePeriodChange(e.target.value === "PM")}
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
  )
}

