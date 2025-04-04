"use client"

import { useState } from "react"
import { Check, ChevronDown, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useCurrency } from "@/context/currency-provider"
import { currencies } from "@/utils/currency"

export function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency()
  const [open, setOpen] = useState(false)

  const currentCurrency = currencies.find((c) => c.code === currency)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
          <DollarSign className="h-4 w-4" />
          <span>{currentCurrency?.code}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {currencies.map((c) => (
          <DropdownMenuItem
            key={c.code}
            onClick={() => {
              setCurrency(c.code)
              setOpen(false)
            }}
            className="flex items-center gap-2"
          >
            <span className="mr-1">{c.symbol}</span>
            <span>{c.name}</span>
            <span className="ml-1 text-gray-500">({c.code})</span>
            {currency === c.code && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

