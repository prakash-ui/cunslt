"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDateTime, formatCurrency } from "@/lib/utils"
import type { BookingStatus } from "@/types"
import { UserAvatar } from "@/components/user-avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

type ExpertBookingHistoryProps = {
  bookings: Array<{
    id: string
    status: BookingStatus
    price: number
    createdAt: string
    scheduledAt: string
    completedAt?: string
    canceledAt?: string
    clientName?: string
    clientImage?: string
  }>
  showClient?: boolean
}

export function BookingHistoryList({ bookings, showClient = false }: ExpertBookingHistoryProps) {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Booking History</CardTitle>
        <CardDescription>Your recent consultation bookings</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {showClient && <TableHead>Client</TableHead>}
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No bookings found.
                </TableCell>
              </TableRow>
            ) : (
              bookings.slice(0, 5).map((booking) => (
                <TableRow key={booking.id}>
                  {showClient && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          name={booking.clientName || "Client"}
                          image={booking.clientImage}
                          className="h-8 w-8"
                        />
                        <span className="font-medium">{booking.clientName || "Client"}</span>
                      </div>
                    </TableCell>
                  )}
                  <TableCell>{formatDateTime(new Date(booking.scheduledAt))}</TableCell>
                  <TableCell>
                    <BookingStatusBadge status={booking.status} />
                  </TableCell>
                  <TableCell>{formatCurrency(booking.price)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/bookings/${booking.id}`}>
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">View details</span>
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {bookings.length > 5 && (
          <div className="mt-4 flex justify-center">
            <Button variant="outline" asChild>
              <Link href="/bookings">View All Bookings</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

type StatusBadgeProps = {
  status: BookingStatus
}

function BookingStatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case "completed":
      return <Badge variant="success">Completed</Badge>
    case "scheduled":
      return <Badge variant="info">Scheduled</Badge>
    case "canceled":
      return <Badge variant="destructive">Canceled</Badge>
    case "pending":
      return <Badge variant="outline">Pending</Badge>
    default:
      return <Badge>{status}</Badge>
  }
}

