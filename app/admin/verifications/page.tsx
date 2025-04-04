import { redirect } from "next/navigation"
import Link from "next/link"
import { getCurrentUser } from "@/app/actions/auth"
import { getUserProfile } from "@/app/actions/user"
import { getPendingVerificationRequests } from "@/app/actions/verification"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { ClipboardList, ArrowRight } from "lucide-react"

export default async function AdminVerificationsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login?callbackUrl=/admin/verifications")
  }

  const userProfile = await getUserProfile(user.id)

  if (!userProfile || userProfile.role !== "admin") {
    redirect("/dashboard")
  }

  const pendingRequests = await getPendingVerificationRequests()

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Verification Requests</h1>

      {pendingRequests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <ClipboardList className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl font-medium text-center">No pending verification requests</p>
            <p className="text-muted-foreground text-center mt-1">All verification requests have been processed.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {pendingRequests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <CardTitle>{request.experts.title}</CardTitle>
                <CardDescription>Submitted on {formatDate(request.submitted_at)}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Expert Bio:</p>
                    <p className="line-clamp-2">{request.experts.bio}</p>
                  </div>
                  <Link href={`/admin/verifications/${request.id}`}>
                    <Button>
                      Review Request
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

