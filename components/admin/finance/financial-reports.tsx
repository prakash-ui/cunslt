"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Download, FileSpreadsheet, Filter } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface RevenueData {
  month: string
  revenue: number
  platformFees: number
  expertPayouts: number
}

interface CategoryData {
  name: string
  value: number
}

interface FinancialReportsProps {
  revenueData: RevenueData[]
  categoryData: CategoryData[]
  onExport: (format: "csv" | "excel", period: string) => Promise<void>
}

export function FinancialReports({ revenueData, categoryData, onExport }: FinancialReportsProps) {
  const [period, setPeriod] = useState("last6months")
  const [isExporting, setIsExporting] = useState(false)

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FF6B6B", "#6B66FF"]

  const handleExport = async (format: "csv" | "excel") => {
    setIsExporting(true)
    try {
      await onExport(format, period)
    } catch (error) {
      console.error("Failed to export report:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const getPeriodLabel = () => {
    switch (period) {
      case "last30days":
        return "Last 30 Days"
      case "last3months":
        return "Last 3 Months"
      case "last6months":
        return "Last 6 Months"
      case "lastyear":
        return "Last Year"
      case "alltime":
        return "All Time"
      default:
        return "Last 6 Months"
    }
  }

  const filteredRevenueData = revenueData.slice(-getMonthsCount())

  function getMonthsCount() {
    switch (period) {
      case "last30days":
        return 1
      case "last3months":
        return 3
      case "last6months":
        return 6
      case "lastyear":
        return 12
      case "alltime":
        return revenueData.length
      default:
        return 6
    }
  }

  const totalRevenue = filteredRevenueData.reduce((sum, item) => sum + item.revenue, 0)
  const totalPlatformFees = filteredRevenueData.reduce((sum, item) => sum + item.platformFees, 0)
  const totalExpertPayouts = filteredRevenueData.reduce((sum, item) => sum + item.expertPayouts, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Financial Reports</h2>
          <p className="text-muted-foreground">View and export financial data for {getPeriodLabel()}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last30days">Last 30 Days</SelectItem>
              <SelectItem value="last3months">Last 3 Months</SelectItem>
              <SelectItem value="last6months">Last 6 Months</SelectItem>
              <SelectItem value="lastyear">Last Year</SelectItem>
              <SelectItem value="alltime">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => handleExport("csv")} disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport("excel")} disabled={isExporting}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPlatformFees)}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((totalPlatformFees / totalRevenue) * 100)}% of total revenue
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expert Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpertPayouts)}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((totalExpertPayouts / totalRevenue) * 100)}% of total revenue
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Breakdown</TabsTrigger>
          <TabsTrigger value="categories">Category Distribution</TabsTrigger>
        </TabsList>
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
              <CardDescription>Monthly revenue, platform fees, and expert payouts</CardDescription>
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
                  <BarChart data={filteredRevenueData}>
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
        </TabsContent>
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
              <CardDescription>Revenue distribution by expertise category</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

