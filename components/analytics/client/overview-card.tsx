"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Timeframe } from "@/types"
import { formatCurrency } from "@/lib/utils"
import { BadgeCheck, Users, CreditCard } from "lucide-react"

type OverviewCardProps = {
  totalBookings: number
  completedBookings: number
  canceledBookings: number
  totalSpent: number
  uniqueExperts: number
  activeSubscriptions: number
  activePackages: number
  onTimeframeChange: (timeframe: Timeframe) => void
  timeframe: Timeframe
}

export function ClientOverviewCard({
  totalBookings,
  completedBookings,
  canceledBookings,
  totalSpent,
  uniqueExperts,
  activeSubscriptions,
  activePackages,
  onTimeframeChange,
  timeframe,
}: OverviewCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Overview</CardTitle>
        <CardDescription>Track your platform activity at a glance</CardDescription>
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
            label="Total Spent"
            value={formatCurrency(totalSpent)}
            subtext={`Average ${formatCurrency(completedBookings > 0 ? totalSpent / completedBookings : 0)} per session`}
            icon={CreditCard}
            iconColor="text-blue-500"
          />
          <MetricCard
            label="Experts Consulted"
            value={uniqueExperts}
            subtext={`Unique experts hired`}
            icon={Users}
            iconColor="text-purple-500"
          />
          <MetricCard
            label="Active Plans"
            value={activeSubscriptions + activePackages}
            subtext={`${activeSubscriptions} subscriptions, ${activePackages} packages`}
            icon={BadgeCheck}
            iconColor="text-green-500"
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

