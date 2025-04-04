"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

type BookingsChartProps = {
  data: Array<{
    date: string
    completed: number
    canceled: number
  }>
}

export function ExpertBookingsChart({ data }: BookingsChartProps) {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Booking Activity</CardTitle>
        <CardDescription>Track your completed and canceled bookings</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="completed" name="Completed" fill="#4ade80" />
            <Bar dataKey="canceled" name="Canceled" fill="#f87171" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

