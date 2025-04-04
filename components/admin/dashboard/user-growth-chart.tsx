"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts"

interface UserGrowthData {
  month: string
  clients: number
  experts: number
}

interface UserGrowthChartProps {
  data: UserGrowthData[]
}

export function UserGrowthChart({ data }: UserGrowthChartProps) {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>User Growth</CardTitle>
        <CardDescription>Monthly user acquisition</CardDescription>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ChartContainer
          config={{
            clients: {
              label: "Clients",
              color: "hsl(var(--chart-1))",
            },
            experts: {
              label: "Experts",
              color: "hsl(var(--chart-2))",
            },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="clients"
                stroke="var(--color-clients)"
                activeDot={{ r: 8 }}
                name="Clients"
              />
              <Line type="monotone" dataKey="experts" stroke="var(--color-experts)" name="Experts" />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

