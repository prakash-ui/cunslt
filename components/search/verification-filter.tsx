"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle } from "lucide-react"

interface VerificationFilterProps {
  onChange: (isVerified: boolean | null) => void
  defaultValue?: boolean | null
}

export function VerificationFilter({ onChange, defaultValue = null }: VerificationFilterProps) {
  const [isVerified, setIsVerified] = useState<boolean | null>(defaultValue)

  const handleChange = (checked: boolean) => {
    setIsVerified(checked ? true : null)
    onChange(checked ? true : null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Label className="text-base font-medium cursor-pointer">Verified Experts</Label>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        </div>
        <Switch checked={isVerified === true} onCheckedChange={handleChange} />
      </div>
      <p className="text-sm text-gray-500">Show only experts with verified credentials</p>
    </div>
  )
}

