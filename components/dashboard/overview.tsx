"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Calendar, Clock, DollarSign, Users } from "lucide-react"

interface OverviewProps {
  stats: {
    totalBookings: number
    upcomingBookings: number
    totalEarnings?: number
    totalSpent?: number
    completionRate?: number
    totalClients?: number
    totalExperts?: number
    averageRating?: number
  }
  chartData: {
    daily: { date: string; value: number }[]
    weekly: { date: string; value: number }[]
    monthly: { date: string; value: number }[]
  }
  userType: "client" | "expert"
}

export function Overview({ stats, chartData, userType }: OverviewProps) {
  const [chartPeriod, setChartPeriod] = useState("weekly")

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {userType === "expert" ? "Total Bookings" : "Total Sessions"}
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalBookings}</div>
          <p className="text-xs text-muted-foreground">{stats.upcomingBookings} upcoming</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {userType === "expert" ? "Total Earnings" : "Total Spent"}
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${userType === "expert" ? stats.totalEarnings : stats.totalSpent}</div>
          <p className="text-xs text-muted-foreground">
            {userType === "expert" ? "Lifetime earnings" : "Lifetime spent"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {userType === "expert" ? "Completion Rate" : "Average Rating"}
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {userType === "expert" ? `${stats.completionRate}%` : `${stats.averageRating}/5.0`}
          </div>
          <p className="text-xs text-muted-foreground">
            {userType === "expert" ? "Sessions completed" : "From all sessions"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {userType === "expert" ? "Total Clients" : "Experts Consulted"}
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{userType === "expert" ? stats.totalClients : stats.totalExperts}</div>
          <p className="text-xs text-muted-foreground">{userType === "expert" ? "Unique clients" : "Unique experts"}</p>
        </CardContent>
      </Card>

      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>{userType === "expert" ? "Earnings Overview" : "Spending Overview"}</CardTitle>
          <CardDescription>
            {userType === "expert" ? "Your earnings over time" : "Your spending on consultations over time"}
          </CardDescription>
          <Tabs defaultValue="weekly" value={chartPeriod} onValueChange={setChartPeriod} className="mt-2">
            <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="pl-2">
          <ChartContainer
            config={{
              value: {
                label: userType === "expert" ? "Earnings" : "Spending",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData[chartPeriod as keyof typeof chartData]}>
                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="value" stroke="var(--color-value)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

