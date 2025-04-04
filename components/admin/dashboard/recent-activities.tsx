"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CalendarCheck, UserPlus, DollarSign, AlertCircle, RefreshCw } from "lucide-react"

interface Activity {
  id: string
  type: "new_user" | "new_expert" | "booking" | "payment" | "cancellation" | "rescheduling" | "report"
  user: {
    id: string
    name: string
    avatar?: string
  }
  description: string
  timestamp: string
}

interface RecentActivitiesProps {
  activities: Activity[]
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "new_user":
        return <UserPlus className="h-4 w-4" />
      case "new_expert":
        return <UserPlus className="h-4 w-4" />
      case "booking":
        return <CalendarCheck className="h-4 w-4" />
      case "payment":
        return <DollarSign className="h-4 w-4" />
      case "cancellation":
        return <AlertCircle className="h-4 w-4" />
      case "rescheduling":
        return <RefreshCw className="h-4 w-4" />
      case "report":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <UserPlus className="h-4 w-4" />
    }
  }

  const getActivityBadge = (type: Activity["type"]) => {
    switch (type) {
      case "new_user":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
            New User
          </Badge>
        )
      case "new_expert":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-50">
            New Expert
          </Badge>
        )
      case "booking":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
            Booking
          </Badge>
        )
      case "payment":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
            Payment
          </Badge>
        )
      case "cancellation":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
            Cancellation
          </Badge>
        )
      case "rescheduling":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
            Rescheduling
          </Badge>
        )
      case "report":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
            Report
          </Badge>
        )
      default:
        return <Badge variant="outline">Activity</Badge>
    }
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
        <CardDescription>Latest platform activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4">
              <Avatar className="h-9 w-9">
                <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium leading-none">{activity.user.name}</p>
                  <div className="flex items-center space-x-2">
                    {getActivityBadge(activity.type)}
                    <span className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

