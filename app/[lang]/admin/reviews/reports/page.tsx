import { Suspense } from "react"
import { getReviewReports } from "@/app/actions/reviews"
import { getCurrentUser } from "@/app/actions/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReviewReportList } from "@/components/admin/review-report-list"

export const metadata = {
  title: "Review Reports | Admin",
  description: "Manage reported reviews",
}

async function fetchReviewReports() {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    redirect("/login");
  }

  const pendingResult = await getReviewReports(1, 10, "pending");
  const resolvedResult = await getReviewReports(1, 10, "resolved");
  const rejectedResult = await getReviewReports(1, 10, "rejected");

  return {
    pendingReports: "reports" in pendingResult ? pendingResult.reports : [],
    resolvedReports: "reports" in resolvedResult ? resolvedResult.reports : [],
    rejectedReports: "reports" in rejectedResult ? rejectedResult.reports : [],
  };
}

function ReviewReportsContent({ reports }: { reports: any }) {
  const { pendingReports, resolvedReports, rejectedReports } = reports;

  return (
    <Tabs defaultValue="pending" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="pending">Pending</TabsTrigger>
        <TabsTrigger value="resolved">Resolved</TabsTrigger>
        <TabsTrigger value="rejected">Rejected</TabsTrigger>
      </TabsList>

      <TabsContent value="pending" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Pending Reports</CardTitle>
            <CardDescription>Review and take action on reported reviews</CardDescription>
          </CardHeader>
          <CardContent>
            <ReviewReportList reports={pendingReports} status="pending" />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="resolved" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Resolved Reports</CardTitle>
            <CardDescription>Reports that have been resolved and reviews removed</CardDescription>
          </CardHeader>
          <CardContent>
            <ReviewReportList reports={resolvedReports} status="resolved" />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="rejected" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Rejected Reports</CardTitle>
            <CardDescription>Reports that have been reviewed and rejected</CardDescription>
          </CardHeader>
          <CardContent>
            <ReviewReportList reports={rejectedReports} status="rejected" />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

export default async function ReviewReportsPage() {
  const reports = await fetchReviewReports();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Review Reports</h1>
      <Suspense fallback={<div>Loading reports...</div>}>
        <ReviewReportsContent reports={reports} />
      </Suspense>
    </div>
  );
}

