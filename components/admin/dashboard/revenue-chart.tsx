"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts"

interface RevenueData {
  month: string
  revenue: number
  platformFees: number
  expertPayouts: number
}

interface RevenueChartProps {
  data: RevenueData[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>Monthly revenue breakdown</CardDescription>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ChartContainer
          config={{
            revenue: {
              label: "Total Revenue",
              color: "hsl(var(--chart-1))",
            },
            platformFees: {
              label: "Platform Fees",
              color: "hsl(var(--chart-2))",
            },
            expertPayouts: {
              label: "Expert Payouts",
              color: "hsl(var(--chart-3))",
            },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="revenue" fill="var(--color-revenue)" name="Total Revenue" />
              <Bar dataKey="platformFees" fill="var(--color-platformFees)" name="Platform Fees" />
              <Bar dataKey="expertPayouts" fill="var(--color-expertPayouts)" name="Expert Payouts" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

