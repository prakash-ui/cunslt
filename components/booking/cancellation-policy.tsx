"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertTriangle, Clock, Info, ShieldCheck } from "lucide-react"
import { format, isAfter } from "date-fns"

interface CancellationPolicyProps {
  policy: string
  deadline: string
  fee: number
  amount: number
}

export function CancellationPolicy({ policy, deadline, fee, amount }: CancellationPolicyProps) {
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const pastDeadline = isAfter(now, deadlineDate)

  const getPolicyBadge = (policy: string) => {
    switch (policy) {
      case "flexible":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Flexible
          </Badge>
        )
      case "standard":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Standard
          </Badge>
        )
      case "strict":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Strict
          </Badge>
        )
      default:
        return <Badge variant="outline">{policy}</Badge>
    }
  }

  const getPolicyDescription = (policy: string) => {
    switch (policy) {
      case "flexible":
        return "Free cancellation up to 4 hours before the consultation. After that, 50% of the consultation fee is charged."
      case "standard":
        return "Free cancellation up to 24 hours before the consultation. After that, 70% of the consultation fee is charged."
      case "strict":
        return "Free cancellation up to 48 hours before the consultation. After that, 100% of the consultation fee is charged."
      default:
        return "Please check the cancellation terms for this booking."
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Cancellation Policy</CardTitle>
          {getPolicyBadge(policy)}
        </div>
        <CardDescription>{getPolicyDescription(policy)}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
              <span>Free Cancellation Deadline:</span>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center">
                    <span className={pastDeadline ? "text-red-600 font-medium" : "font-medium"}>
                      {format(deadlineDate, "MMM d, yyyy h:mm a")}
                    </span>
                    {pastDeadline && <AlertTriangle className="h-4 w-4 ml-1 text-red-600" />}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">
                    {pastDeadline
                      ? "The free cancellation period has ended. Cancellation now will incur a fee."
                      : "You can cancel for free before this time."}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <ShieldCheck className="h-4 w-4 mr-1 text-muted-foreground" />
              <span>Cancellation Fee:</span>
            </div>
            <span className="font-medium">
              {pastDeadline ? `$${fee.toFixed(2)} (${Math.round((fee / amount) * 100)}%)` : "$0.00"}
            </span>
          </div>

          {pastDeadline && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start">
              <Info className="h-4 w-4 text-amber-500 mr-2 mt-0.5" />
              <p className="text-xs text-amber-800">
                The free cancellation period has ended. If you cancel now, a fee of ${fee.toFixed(2)} will apply.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

