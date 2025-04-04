"use client"

import { useState, useEffect } from "react"
import { Check, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useTimezone } from "@/context/timezone-provider"
import { timezones, getTimezoneName } from "@/utils/timezone"

interface TimezoneSelectorProps {
  onSelect?: (timezone: string) => void
  className?: string
}

export function TimezoneSelector({ onSelect, className }: TimezoneSelectorProps) {
  const { timezone, setTimezone } = useTimezone()
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(timezone)
  const [search, setSearch] = useState("")

  useEffect(() => {
    setValue(timezone)
  }, [timezone])

  const handleSelect = (currentValue: string) => {
    setValue(currentValue)
    setTimezone(currentValue)
    setOpen(false)
    if (onSelect) onSelect(currentValue)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className={className}>
          <Clock className="mr-2 h-4 w-4" />
          {getTimezoneName(value)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search timezone..." value={search} onValueChange={setSearch} />
          <CommandList>
            <CommandEmpty>No timezone found.</CommandEmpty>
            <CommandGroup>
              {timezones.map((tz) => (
                <CommandItem key={tz.value} value={tz.value} onSelect={handleSelect}>
                  <Check className={`mr-2 h-4 w-4 ${value === tz.value ? "opacity-100" : "opacity-0"}`} />
                  {tz.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

