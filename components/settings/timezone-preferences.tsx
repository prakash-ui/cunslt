"use client"

import { useState } from "react"
import { useTimezone } from "@/context/timezone-provider"
import { useLanguage } from "@/i18n/language-provider"
import { timezones } from "@/utils/timezone"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

export function TimezonePreferences() {
  const { timezone, setTimezone } = useTimezone()
  const { t } = useLanguage()
  const [selectedTimezone, setSelectedTimezone] = useState(timezone)

  const handleSave = () => {
    setTimezone(selectedTimezone)
    toast({
      title: t("settings.changesSuccessfullySaved"),
      description: t("settings.timezoneUpdated"),
    })
  }

  return (
    <div className="space-y-6">
      <RadioGroup value={selectedTimezone} onValueChange={setSelectedTimezone} className="grid grid-cols-1 gap-4">
        {timezones.map((tz) => (
          <div key={tz.value} className="flex items-center space-x-2">
            <RadioGroupItem value={tz.value} id={`timezone-${tz.value}`} />
            <Label htmlFor={`timezone-${tz.value}`}>{tz.label}</Label>
          </div>
        ))}
      </RadioGroup>

      <Button onClick={handleSave} disabled={selectedTimezone === timezone}>
        {t("settings.saveChanges")}
      </Button>
    </div>
  )
}

