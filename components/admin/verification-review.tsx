"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DocumentViewer } from "@/components/admin/document-viewer"
import { approveVerificationRequest, rejectVerificationRequest } from "@/app/actions/verification"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface VerificationReviewProps {
  verificationRequest: any
  documents: any[]
}

export function VerificationReview({ verificationRequest, documents }: VerificationReviewProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [rejectionReason, setRejectionReason] = useState("")
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [showRejectionForm, setShowRejectionForm] = useState(false)

  const handleApprove = async () => {
    try {
      setIsApproving(true)
      await approveVerificationRequest(verificationRequest.id)
      toast({
        title: "Verification approved",
        description: "The expert has been successfully verified.",
        variant: "default",
      })
      router.push("/admin/verifications")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve verification",
        variant: "destructive",
      })
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection reason required",
        description: "Please provide a reason for rejecting this verification request.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsRejecting(true)
      await rejectVerificationRequest(verificationRequest.id, rejectionReason)
      toast({
        title: "Verification rejected",
        description: "The verification request has been rejected.",
        variant: "default",
      })
      router.push("/admin/verifications")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reject verification",
        variant: "destructive",
      })
    } finally {
      setIsRejecting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Expert Information</CardTitle>
          <CardDescription>Review the expert's profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Title</h3>
              <p>{verificationRequest.experts.title}</p>
            </div>
            <div>
              <h3 className="font-medium">Bio</h3>
              <p>{verificationRequest.experts.bio}</p>
            </div>
            <div>
              <h3 className="font-medium">Hourly Rate</h3>
              <p>${verificationRequest.experts.hourly_rate}/hour</p>
            </div>
            <div>
              <h3 className="font-medium">Experience</h3>
              <p>{verificationRequest.experts.experience}</p>
            </div>
            <div>
              <h3 className="font-medium">Education</h3>
              <p>{verificationRequest.experts.education}</p>
            </div>
            <div>
              <h3 className="font-medium">Location</h3>
              <p>{verificationRequest.experts.location}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documents.map((document) => (
          <DocumentViewer
            key={document.id}
            documentPath={document.document_path}
            documentName={document.document_name}
            documentType={document.document_type}
          />
        ))}
      </div>

      {documents.length === 0 && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>No documents have been uploaded for this verification request.</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Verification Decision</CardTitle>
          <CardDescription>Approve or reject this verification request</CardDescription>
        </CardHeader>
        <CardContent>
          {showRejectionForm ? (
            <div className="space-y-4">
              <Textarea
                placeholder="Please provide a reason for rejecting this verification request..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
              <div className="flex space-x-2">
                <Button variant="destructive" onClick={handleReject} disabled={isRejecting || !rejectionReason.trim()}>
                  {isRejecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Confirm Rejection
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowRejectionForm(false)} disabled={isRejecting}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex space-x-4">
              <Button variant="default" className="flex-1" onClick={handleApprove} disabled={isApproving}>
                {isApproving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve Verification
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowRejectionForm(true)}
                disabled={isApproving}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject Verification
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

