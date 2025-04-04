"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Timeframe } from "@/types"
import { formatCurrency } from "@/lib/utils"
import { BadgeCheck, AlertCircle } from "lucide-react"

type OverviewCardProps = {
  totalBookings: number
  completedBookings: number
  canceledBookings: number
  completionRate: number
  cancellationRate: number
  totalEarnings: number
  averageRating: number
  onTimeframeChange: (timeframe: Timeframe) => void
  timeframe: Timeframe
}

export function ExpertOverviewCard({
  totalBookings,
  completedBookings,
  canceledBookings,
  completionRate,
  cancellationRate,
  totalEarnings,
  averageRating,
  onTimeframeChange,
  timeframe,
}: OverviewCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Overview</CardTitle>
        <CardDescription>Track your key metrics at a glance</CardDescription>
        <Tabs value={timeframe} onValueChange={(value) => onTimeframeChange(value as Timeframe)} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="quarter">Quarter</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <MetricCard
            label="Completed Sessions"
            value={completedBookings}
            subtext={`${totalBookings} total bookings`}
            icon={BadgeCheck}
            iconColor="text-green-500"
          />
          <MetricCard
            label="Completion Rate"
            value={(completionRate * 100).toFixed(0) + "%"}
            subtext={`${canceledBookings} cancellations`}
            icon={completionRate > 0.8 ? BadgeCheck : AlertCircle}
            iconColor={completionRate > 0.8 ? "text-green-500" : "text-amber-500"}
          />
          <MetricCard
            label="Earnings"
            value={formatCurrency(totalEarnings)}
            subtext={`Average ${formatCurrency(totalBookings > 0 ? totalEarnings / totalBookings : 0)} per booking`}
            icon={BadgeCheck}
            iconColor="text-green-500"
          />
          <MetricCard
            label="Rating"
            value={averageRating.toFixed(1)}
            subtext={`Out of 5 stars`}
            icon={averageRating > 4 ? BadgeCheck : AlertCircle}
            iconColor={averageRating > 4 ? "text-green-500" : "text-amber-500"}
          />
        </div>
      </CardContent>
    </Card>
  )
}

type MetricCardProps = {
  label: string
  value: string | number
  subtext: string
  icon: any
  iconColor: string
}

function MetricCard({ label, value, subtext, icon: Icon, iconColor }: MetricCardProps) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div className="mt-1">
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <div className="mt-1 text-xs text-gray-500">{subtext}</div>
    </div>
  )
}

