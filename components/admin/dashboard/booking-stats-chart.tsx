"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend } from "recharts"

interface BookingStatsData {
  month: string
  completed: number
  cancelled: number
  rescheduled: number
}

interface BookingStatsChartProps {
  data: BookingStatsData[]
}

export function BookingStatsChart({ data }: BookingStatsChartProps) {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Booking Statistics</CardTitle>
        <CardDescription>Monthly booking trends</CardDescription>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ChartContainer
          config={{
            completed: {
              label: "Completed",
              color: "hsl(var(--chart-1))",
            },
            cancelled: {
              label: "Cancelled",
              color: "hsl(var(--chart-2))",
            },
            rescheduled: {
              label: "Rescheduled",
              color: "hsl(var(--chart-3))",
            },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="completed"
                stackId="1"
                stroke="var(--color-completed)"
                fill="var(--color-completed)"
                name="Completed"
              />
              <Area
                type="monotone"
                dataKey="cancelled"
                stackId="1"
                stroke="var(--color-cancelled)"
                fill="var(--color-cancelled)"
                name="Cancelled"
              />
              <Area
                type="monotone"
                dataKey="rescheduled"
                stackId="1"
                stroke="var(--color-rescheduled)"
                fill="var(--color-rescheduled)"
                name="Rescheduled"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

