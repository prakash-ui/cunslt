"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDown, ArrowUp, DollarSign, TrendingUp, Users, Calendar, Clock } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface AnalyticsCardProps {
  title: string
  value: string | number
  description: string
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
}

function AnalyticsCard({ title, value, description, icon, trend }: AnalyticsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className="mt-2 flex items-center text-xs">
            {trend.isPositive ? (
              <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
            ) : (
              <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
            )}
            <span className={trend.isPositive ? "text-green-500" : "text-red-500"}>{trend.value}% from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface AnalyticsCardsProps {
  data: {
    totalUsers: number
    newUsers: number
    newUsersTrend: number
    totalExperts: number
    newExperts: number
    newExpertsTrend: number
    totalBookings: number
    newBookings: number
    newBookingsTrend: number
    totalRevenue: number
    newRevenue: number
    newRevenueTrend: number
    avgSessionDuration: number
    avgSessionTrend: number
    expertApprovalRate: number
    expertApprovalTrend: number
  }
}

export function AnalyticsCards({ data }: AnalyticsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <AnalyticsCard
        title="Total Users"
        value={data.totalUsers.toLocaleString()}
        description={`${data.newUsers} new users this month`}
        icon={<Users />}
        trend={{
          value: data.newUsersTrend,
          isPositive: data.newUsersTrend > 0,
        }}
      />
      <AnalyticsCard
        title="Total Experts"
        value={data.totalExperts.toLocaleString()}
        description={`${data.newExperts} new experts this month`}
        icon={<Users />}
        trend={{
          value: data.newExpertsTrend,
          isPositive: data.newExpertsTrend > 0,
        }}
      />
      <AnalyticsCard
        title="Total Bookings"
        value={data.totalBookings.toLocaleString()}
        description={`${data.newBookings} new bookings this month`}
        icon={<Calendar />}
        trend={{
          value: data.newBookingsTrend,
          isPositive: data.newBookingsTrend > 0,
        }}
      />
      <AnalyticsCard
        title="Total Revenue"
        value={formatCurrency(data.totalRevenue)}
        description={`${formatCurrency(data.newRevenue)} new revenue this month`}
        icon={<DollarSign />}
        trend={{
          value: data.newRevenueTrend,
          isPositive: data.newRevenueTrend > 0,
        }}
      />
      <AnalyticsCard
        title="Avg. Session Duration"
        value={`${data.avgSessionDuration} min`}
        description="Average consultation duration"
        icon={<Clock />}
        trend={{
          value: data.avgSessionTrend,
          isPositive: data.avgSessionTrend > 0,
        }}
      />
      <AnalyticsCard
        title="Expert Approval Rate"
        value={`${data.expertApprovalRate}%`}
        description="Percentage of approved expert applications"
        icon={<TrendingUp />}
        trend={{
          value: data.expertApprovalTrend,
          isPositive: data.expertApprovalTrend > 0,
        }}
      />
    </div>
  )
}

