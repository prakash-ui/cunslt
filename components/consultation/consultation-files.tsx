"use client"

import { useState } from "react"
import type { File } from "@prisma/client"
import { useRouter } from "next/navigation"
import { formatFileSize, getFileExtension } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { FileUpload } from "@/components/ui/file-upload"
import { toast } from "@/components/ui/use-toast"

interface ConsultationFilesProps {
  consultationId: string
  files: File[]
  canUpload?: boolean
  onUpload?: () => void
}

export default function ConsultationFiles({
  consultationId,
  files,
  canUpload = false,
  onUpload,
}: ConsultationFilesProps) {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = async (uploadedFiles: File[]) => {
    try {
      setIsUploading(true)

      // Implementation would depend on your file upload mechanism
      // This is a placeholder for the actual implementation
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Files uploaded",
        description: `Successfully uploaded ${uploadedFiles.length} file(s)`,
      })

      if (onUpload) {
        onUpload()
      }

      router.refresh()
    } catch (error) {
      console.error("Error uploading files:", error)
      toast({
        title: "Error",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const getFileIcon = (filename: string) => {
    const extension = getFileExtension(filename).toLowerCase()

    switch (extension) {
      case "pdf":
        return <Icons.fileCheck className="h-5 w-5 text-red-500" />
      case "doc":
      case "docx":
        return <Icons.fileCheck className="h-5 w-5 text-blue-500" />
      case "xls":
      case "xlsx":
        return <Icons.fileCheck className="h-5 w-5 text-green-500" />
      case "ppt":
      case "pptx":
        return <Icons.fileCheck className="h-5 w-5 text-orange-500" />
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <Icons.image className="h-5 w-5 text-purple-500" />
      default:
        return <Icons.file className="h-5 w-5" />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Files</h3>
        {canUpload && (
          <FileUpload endpoint={`/api/consultations/${consultationId}/files`} onUploadComplete={handleUpload}>
            <Button size="sm" disabled={isUploading}>
              {isUploading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Icons.upload className="mr-2 h-4 w-4" />
                  Upload Files
                </>
              )}
            </Button>
          </FileUpload>
        )}
      </div>

      {files.length === 0 ? (
        <div className="rounded-md border border-dashed p-6 text-center">
          <Icons.file className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">No files have been uploaded yet.</p>
        </div>
      ) : (
        <div className="divide-y rounded-md border">
          {files.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-3">
              <div className="flex items-center space-x-3">
                {getFileIcon(file.name)}
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" onClick={() => window.open(file.url, "_blank")}>
                  <Icons.eye className="h-4 w-4" />
                  <span className="sr-only">View</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const link = document.createElement("a")
                    link.href = file.url
                    link.download = file.name
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  }}
                >
                  <Icons.download className="h-4 w-4" />
                  <span className="sr-only">Download</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

