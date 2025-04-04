"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FileUpload } from "@/components/ui/file-upload"
import { submitVerificationRequest, uploadVerificationDocument } from "@/app/actions/verification"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle, AlertCircle, Upload } from "lucide-react"

interface VerificationRequestProps {
  expertId: string
  verificationStatus: {
    isVerified: boolean
    pendingRequest: { id: string; status: string } | null
    latestRequest: { id: string; status: string } | null
  }
}

export function VerificationRequest({ expertId, verificationStatus }: VerificationRequestProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentVerificationId, setCurrentVerificationId] = useState<string | null>(
    verificationStatus.pendingRequest?.id || null,
  )
  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null)

  const handleSubmitRequest = async () => {
    try {
      setIsSubmitting(true)
      const result = await submitVerificationRequest(expertId)

      if (result.status === "existing") {
        toast({
          title: "Verification request already exists",
          description: "You already have a pending verification request.",
          variant: "default",
        })
      } else {
        toast({
          title: "Verification request submitted",
          description: "Your verification request has been submitted. Please upload your documents.",
          variant: "default",
        })
        setCurrentVerificationId(result.id)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit verification request",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUploadDocument = async (formData: FormData) => {
    try {
      setUploadingDocType(formData.get("documentType") as string)
      await uploadVerificationDocument(formData)
      toast({
        title: "Document uploaded",
        description: "Your document has been uploaded successfully.",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload document",
        variant: "destructive",
      })
    } finally {
      setUploadingDocType(null)
    }
  }

  if (verificationStatus.isVerified) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            Verification Status <CheckCircle className="ml-2 h-5 w-5 text-green-500" />
          </CardTitle>
          <CardDescription>Your expert profile is verified</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-green-50">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Verified Expert</AlertTitle>
            <AlertDescription>
              Your profile has been verified. Clients will see a verification badge on your profile.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (verificationStatus.pendingRequest) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            Verification Status <Badge className="ml-2">Pending</Badge>
          </CardTitle>
          <CardDescription>Your verification request is being reviewed</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-yellow-50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Verification in Progress</AlertTitle>
            <AlertDescription>
              Your verification request is currently being reviewed by our team. This process typically takes 1-3
              business days.
            </AlertDescription>
          </Alert>

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Upload Verification Documents</h3>
            <div className="space-y-4">
              <FileUpload
                endpoint="/api/upload"
                onClientUploadComplete={(res) => {
                  toast({
                    title: "Upload complete",
                    description: "Your document has been uploaded successfully.",
                  })
                }}
                onUploadError={(error) => {
                  toast({
                    title: "Upload error",
                    description: error.message,
                    variant: "destructive",
                  })
                }}
                formAction={handleUploadDocument}
                additionalFormData={{
                  verificationId: verificationStatus.pendingRequest.id,
                  documentType: "identity",
                }}
                buttonText={uploadingDocType === "identity" ? "Uploading..." : "Upload ID Document"}
                buttonDisabled={!!uploadingDocType}
                acceptedFileTypes={{
                  "application/pdf": [".pdf"],
                  "image/jpeg": [".jpg", ".jpeg"],
                  "image/png": [".png"],
                }}
                maxSize={5 * 1024 * 1024} // 5MB
              />

              <FileUpload
                endpoint="/api/upload"
                onClientUploadComplete={(res) => {
                  toast({
                    title: "Upload complete",
                    description: "Your document has been uploaded successfully.",
                  })
                }}
                onUploadError={(error) => {
                  toast({
                    title: "Upload error",
                    description: error.message,
                    variant: "destructive",
                  })
                }}
                formAction={handleUploadDocument}
                additionalFormData={{
                  verificationId: verificationStatus.pendingRequest.id,
                  documentType: "certification",
                }}
                buttonText={uploadingDocType === "certification" ? "Uploading..." : "Upload Certification"}
                buttonDisabled={!!uploadingDocType}
                acceptedFileTypes={{
                  "application/pdf": [".pdf"],
                  "image/jpeg": [".jpg", ".jpeg"],
                  "image/png": [".png"],
                }}
                maxSize={5 * 1024 * 1024} // 5MB
              />

              <FileUpload
                endpoint="/api/upload"
                onClientUploadComplete={(res) => {
                  toast({
                    title: "Upload complete",
                    description: "Your document has been uploaded successfully.",
                  })
                }}
                onUploadError={(error) => {
                  toast({
                    title: "Upload error",
                    description: error.message,
                    variant: "destructive",
                  })
                }}
                formAction={handleUploadDocument}
                additionalFormData={{
                  verificationId: verificationStatus.pendingRequest.id,
                  documentType: "resume",
                }}
                buttonText={uploadingDocType === "resume" ? "Uploading..." : "Upload Resume/CV"}
                buttonDisabled={!!uploadingDocType}
                acceptedFileTypes={{
                  "application/pdf": [".pdf"],
                  "application/msword": [".doc"],
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
                }}
                maxSize={5 * 1024 * 1024} // 5MB
              />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (verificationStatus.latestRequest?.status === "rejected") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            Verification Status{" "}
            <Badge variant="destructive" className="ml-2">
              Rejected
            </Badge>
          </CardTitle>
          <CardDescription>Your previous verification request was rejected</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Verification Rejected</AlertTitle>
            <AlertDescription>
              Your verification request was rejected. You can submit a new request with updated documents.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmitRequest} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit New Request"
            )}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Get Verified</CardTitle>
        <CardDescription>Verification increases your credibility and visibility to potential clients</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p>As a verified expert, you'll receive:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>A verification badge on your profile</li>
            <li>Higher visibility in search results</li>
            <li>Increased trust from potential clients</li>
            <li>Access to premium clients</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-4">
            The verification process typically takes 1-3 business days after you submit all required documents.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmitRequest} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Start Verification Process
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

