"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Download, FileText, ImageIcon } from "lucide-react"

interface DocumentViewerProps {
  documentPath: string
  documentName: string
  documentType: string
}

export function DocumentViewer({ documentPath, documentName, documentType }: DocumentViewerProps) {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(true)
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const getDocumentUrl = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.storage.from("documents").createSignedUrl(documentPath, 60 * 5) // 5 minutes expiry

      if (error) {
        throw new Error(error.message)
      }

      setUrl(data.signedUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load document")
    } finally {
      setIsLoading(false)
    }
  }

  // Load document URL when component mounts
  useState(() => {
    getDocumentUrl()
  })

  const handleDownload = async () => {
    if (!url) return

    const response = await fetch(url)
    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = downloadUrl
    link.download = documentName
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  const isImage = documentName.match(/\.(jpeg|jpg|gif|png)$/i)
  const isPdf = documentName.match(/\.(pdf)$/i)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-base">
          {isImage ? <ImageIcon className="h-5 w-5 mr-2" /> : <FileText className="h-5 w-5 mr-2" />}
          {documentType.charAt(0).toUpperCase() + documentType.slice(1)}: {documentName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center text-destructive p-4">
            <p>{error}</p>
            <Button variant="outline" onClick={getDocumentUrl} className="mt-2">
              Retry
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {isImage && url ? (
              <div className="border rounded-md overflow-hidden">
                <img
                  src={url || "/placeholder.svg"}
                  alt={documentName}
                  className="max-w-full h-auto"
                  onLoad={() => setIsLoading(false)}
                />
              </div>
            ) : isPdf && url ? (
              <div className="border rounded-md overflow-hidden h-96">
                <iframe src={`${url}#toolbar=0`} className="w-full h-full" title={documentName} />
              </div>
            ) : (
              <div className="text-center p-4 border rounded-md">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="mt-2">Document preview not available</p>
              </div>
            )}

            <Button onClick={handleDownload} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download Document
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

