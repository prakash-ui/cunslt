"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
// import { updateReportStatus } from "@/app/actions/reviews"
import { Button } from "@/components/ui/button"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StarRating } from "@/components/reviews/star-rating"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ReviewReportListProps {
  reports: any[]
  status: "pending" | "resolved" | "rejected"
}

export function ReviewReportList({ reports, status }: ReviewReportListProps) {
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [localReports, setLocalReports] = useState(reports)

  const handleUpdateStatus = async (reportId: string, newStatus: "resolved" | "rejected") => {
    setProcessingId(reportId)

    // try {
    //   const result = await updateReportStatus(reportId, newStatus)

    //   if (result.error) {
    //     toast({
    //       title: "Error",
    //       description: result.error,
    //       variant: "destructive",
    //     })
    //   } else {
    //     toast({
    //       title: "Report updated",
    //       description: `Report has been marked as ${newStatus}`,
    //     })

    
    //     setLocalReports(localReports.filter((report) => report.id !== reportId))
    //   }
    // } catch (error) {
    //   toast({
    //     title: "Error",
    //     description: "An unexpected error occurred",
    //     variant: "destructive",
    //   })
    // } finally {
    //   setProcessingId(null)
    // }
  }

  if (localReports.length === 0) {
    return <div className="text-center py-8">No {status} reports</div>
  }

  return (
    <div className="space-y-6">
      {localReports.map((report) => (
        <div key={report.id} className="border rounded-lg p-6 space-y-4">
          <div className="flex justify-between">
            <div>
              <h3 className="font-medium">Report from</h3>
              <div className="flex items-center mt-1">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarImage src={report.users?.avatar_url || ""} />
                  <AvatarFallback>{report.users?.full_name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <span>{report.users?.full_name || "Unknown User"}</span>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {report.created_at
                ? formatDistanceToNow(new Date(report.created_at), { addSuffix: true })
                : "Unknown date"}
            </div>
          </div>

          <div>
            <h3 className="font-medium">Reason for report</h3>
            <p className="mt-1">{report.reason || "No reason provided"}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium">Reported Review</h3>
            <div className="mt-2">
              <div className="flex items-center">
                <StarRating rating={report.reviews?.rating || 0} size="sm" />
                <span className="ml-2 text-sm">
                  {report.reviews?.created_at
                    ? formatDistanceToNow(new Date(report.reviews.created_at), { addSuffix: true })
                    : "Unknown date"}
                </span>
              </div>
              <p className="mt-2">{report.reviews?.comment || "No comment"}</p>
            </div>
          </div>

          {status === "pending" && (
            <div className="flex justify-end space-x-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">Reject Report</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reject Report</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to reject this report? The review will remain visible.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleUpdateStatus(report.id, "rejected")}
                      disabled={processingId === report.id}
                    >
                      {processingId === report.id ? "Processing..." : "Reject Report"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Remove Review</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove Review</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to remove this review? It will no longer be visible to users.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleUpdateStatus(report.id, "resolved")}
                      disabled={processingId === report.id}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      {processingId === report.id ? "Processing..." : "Remove Review"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

