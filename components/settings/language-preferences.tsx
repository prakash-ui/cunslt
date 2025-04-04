"use client"

import { useState } from "react"
import { useLanguage } from "@/i18n/language-provider"
import { locales } from "@/i18n/config"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

export function LanguagePreferences() {
  const { locale, setLocale, t } = useLanguage()
  const [selectedLocale, setSelectedLocale] = useState(locale)

  const handleSave = () => {
    setLocale(selectedLocale)
    toast({
      title: t("settings.changesSuccessfullySaved"),
      description: t("settings.languageUpdated"),
    })
  }

  return (
    <div className="space-y-6">
      <RadioGroup
        value={selectedLocale}
        onValueChange={setSelectedLocale}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {locales.map((l) => (
          <div key={l.code} className="flex items-center space-x-2">
            <RadioGroupItem value={l.code} id={`language-${l.code}`} />
            <Label htmlFor={`language-${l.code}`} className="flex items-center">
              <span className="mr-2">{l.flag}</span>
              {l.name}
            </Label>
          </div>
        ))}
      </RadioGroup>

      <Button onClick={handleSave} disabled={selectedLocale === locale}>
        {t("settings.saveChanges")}
      </Button>
    </div>
  )
}

