"use client"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DaySelectorProps {
  selectedDay: number
  onChange: (day: number) => void
}

const days = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
]

export function DaySelector({ selectedDay, onChange }: DaySelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {days.map((day) => (
        <Button
          key={day.value}
          type="button"
          variant={selectedDay === day.value ? "default" : "outline"}
          className={cn("w-12", selectedDay === day.value ? "bg-primary text-primary-foreground" : "")}
          onClick={() => onChange(day.value)}
        >
          {day.label}
        </Button>
      ))}
    </div>
  )
}

