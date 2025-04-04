"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { Trash2 } from "lucide-react"
import { deleteUnavailableDate } from "@/app/actions/availability"

interface UnavailableDateProps {
  id: string
  date: string
  reason?: string
}

export function UnavailableDate({ id, date, reason }: UnavailableDateProps) {
  const handleDelete = async () => {
    const formData = new FormData()
    formData.append("dateId", id)
    await deleteUnavailableDate(formData)
  }

  return (
    <Card className="mb-2">
      <CardContent className="p-4 flex justify-between items-center">
        <div>
          <p className="font-medium">{formatDate(date)}</p>
          {reason && <p className="text-sm text-muted-foreground">{reason}</p>}
        </div>
        <Button variant="ghost" size="icon" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </CardContent>
    </Card>
  )
}

