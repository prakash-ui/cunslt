"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { toast } from "@/components/ui/use-toast"
import { formatFileSize } from "@/lib/utils"

interface FileUploadProps {
  endpoint: string
  children?: React.ReactNode
  maxFiles?: number
  maxSize?: number // in bytes
  allowedTypes?: string[]
  onUploadComplete?: (files: any[]) => void
}

export function FileUpload({
  endpoint,
  children,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  allowedTypes = ["image/*", "application/pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx"],
  onUploadComplete,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach((file) => {
          const errors = file.errors.map((e: any) => e.message).join(", ")
          toast({
            title: "File error",
            description: `${file.file.name}: ${errors}`,
            variant: "destructive",
          })
        })
        return
      }

      if (acceptedFiles.length > maxFiles) {
        toast({
          title: "Too many files",
          description: `You can only upload up to ${maxFiles} files at once.`,
          variant: "destructive",
        })
        return
      }

      setSelectedFiles(acceptedFiles)
    },
    [maxFiles],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept: allowedTypes.reduce(
      (acc, type) => {
        acc[type] = []
        return acc
      },
      {} as Record<string, string[]>,
    ),
  })

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      selectedFiles.forEach((file) => {
        formData.append("files", file)
      })

      const xhr = new XMLHttpRequest()
      xhr.open("POST", endpoint)

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(progress)
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText)
          toast({
            title: "Upload complete",
            description: `Successfully uploaded ${selectedFiles.length} file(s)`,
          })
          setSelectedFiles([])
          if (onUploadComplete) {
            onUploadComplete(response.files)
          }
        } else {
          throw new Error("Upload failed")
        }
      }

      xhr.onerror = () => {
        throw new Error("Network error")
      }

      xhr.send(formData)
    } catch (error) {
      console.error("Error uploading files:", error)
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      {children || (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
            isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-2">
            <Icons.upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {isDragActive ? "Drop the files here..." : "Drag & drop files here, or click to select files"}
            </p>
            <p className="text-xs text-muted-foreground">
              Max {maxFiles} files, up to {formatFileSize(maxSize)} each
            </p>
          </div>
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="divide-y rounded-md border">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3">
                <div className="flex items-center space-x-3">
                  <Icons.file className="h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeFile(index)}>
                  <Icons.x className="h-4 w-4" />
                  <span className="sr-only">Remove</span>
                </Button>
              </div>
            ))}
          </div>

          {isUploading ? (
            <div className="space-y-2">
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-center text-muted-foreground">Uploading... {uploadProgress}%</p>
            </div>
          ) : (
            <div className="flex justify-end">
              <Button onClick={handleUpload}>
                <Icons.upload className="mr-2 h-4 w-4" />
                Upload {selectedFiles.length} file{selectedFiles.length !== 1 ? "s" : ""}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

