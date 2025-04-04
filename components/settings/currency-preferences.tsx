"use client"

import { useState } from "react"
import { useCurrency } from "@/context/currency-provider"
import { useLanguage } from "@/i18n/language-provider"
import { currencies } from "@/utils/currency"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

export function CurrencyPreferences() {
  const { currency, setCurrency } = useCurrency()
  const { t } = useLanguage()
  const [selectedCurrency, setSelectedCurrency] = useState(currency)

  const handleSave = () => {
    setCurrency(selectedCurrency)
    toast({
      title: t("settings.changesSuccessfullySaved"),
      description: t("settings.currencyUpdated"),
    })
  }

  return (
    <div className="space-y-6">
      <RadioGroup
        value={selectedCurrency}
        onValueChange={setSelectedCurrency}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {currencies.map((c) => (
          <div key={c.code} className="flex items-center space-x-2">
            <RadioGroupItem value={c.code} id={`currency-${c.code}`} />
            <Label htmlFor={`currency-${c.code}`} className="flex items-center">
              <span className="mr-2">{c.symbol}</span>
              {c.name} ({c.code})
            </Label>
          </div>
        ))}
      </RadioGroup>

      <Button onClick={handleSave} disabled={selectedCurrency === currency}>
        {t("settings.saveChanges")}
      </Button>
    </div>
  )
}

