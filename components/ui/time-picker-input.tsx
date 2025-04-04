"use client"

import type * as React from "react"
import { Input } from "@/components/ui/input"

interface TimePickerInputProps {
  id: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}

export function TimePickerInput({ id, value, onChange, min = 0, max = 59 }: TimePickerInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number.parseInt(e.target.value, 10)
    if (isNaN(newValue)) return

    if (newValue > max) {
      onChange(max)
    } else if (newValue < min) {
      onChange(min)
    } else {
      onChange(newValue)
    }
  }

  const increment = () => {
    onChange(value === max ? min : value + 1)
  }

  const decrement = () => {
    onChange(value === min ? max : value - 1)
  }

  return (
    <div className="flex items-center">
      <Input id={id} type="number" value={value} onChange={handleChange} min={min} max={max} className="w-16 h-10" />
      <div className="flex flex-col ml-1">
        <button type="button" className="h-5 w-5 flex items-center justify-center cursor-pointer" onClick={increment}>
          ▲
        </button>
        <button type="button" className="h-5 w-5 flex items-center justify-center cursor-pointer" onClick={decrement}>
          ▼
        </button>
      </div>
    </div>
  )
}

