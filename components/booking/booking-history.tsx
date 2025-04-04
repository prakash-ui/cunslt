"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getBookingHistory } from "@/app/actions/bookings"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"
import { Clock, Calendar, ArrowRight, RotateCcw, XCircle, CheckCircle } from "lucide-react"

interface BookingHistoryProps {
  bookingId: string
}

export function BookingHistory({ bookingId }: BookingHistoryProps) {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const historyData = await getBookingHistory(bookingId)
        setHistory(historyData)
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load booking history",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [bookingId, toast])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Booking History</CardTitle>
          <CardDescription>Loading history...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Booking History</CardTitle>
          <CardDescription>No history available for this booking.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "created":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "rescheduled":
        return <RotateCcw className="h-4 w-4 text-blue-500" />
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getActionBadge = (action: string) => {
    switch (action) {
      case "created":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Created
          </Badge>
        )
      case "rescheduled":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Rescheduled
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Cancelled
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Completed
          </Badge>
        )
      default:
        return <Badge variant="outline">{action}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking History</CardTitle>
        <CardDescription>Timeline of changes to this booking</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {history.map((item, index) => (
            <div key={item.id} className="relative pl-6 pb-6">
              {/* Timeline connector */}
              {index < history.length - 1 && <div className="absolute left-2.5 top-3 h-full w-px bg-gray-200" />}

              {/* Timeline dot */}
              <div className="absolute left-0 top-1.5 h-5 w-5 rounded-full border-2 border-white bg-white flex items-center justify-center">
                {getActionIcon(item.action)}
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  {getActionBadge(item.action)}
                  <span className="text-sm text-muted-foreground">{new Date(item.created_at).toLocaleString()}</span>
                </div>

                <p className="text-sm">
                  {item.performed_by_role === "client" ? "Client" : "Expert"}
                  {item.profiles?.full_name && ` (${item.profiles.full_name})`}
                  {item.action === "created" ? " created this booking" : ` ${item.action} this booking`}
                </p>

                {item.reason && <p className="text-sm text-muted-foreground mt-1">Reason: {item.reason}</p>}

                {item.action === "rescheduled" && (
                  <div className="mt-2 p-3 bg-muted rounded-md">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(item.previous_date)}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{formatDate(item.new_date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {item.previous_time_start} - {item.previous_time_end}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {item.new_time_start} - {item.new_time_end}
                      </span>
                    </div>
                  </div>
                )}

                {item.action === "cancelled" && item.previous_status && item.new_status && (
                  <div className="mt-2 text-sm">
                    <span className="text-muted-foreground">Status changed from </span>
                    <Badge variant="outline" className="mx-1">
                      {item.previous_status}
                    </Badge>
                    <span className="text-muted-foreground">to </span>
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 mx-1">
                      {item.new_status}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

