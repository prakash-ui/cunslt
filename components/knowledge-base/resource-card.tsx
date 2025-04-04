"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, FileText, FileIcon as FilePdf, FileImage, FileArchive } from "lucide-react"
import { type ExpertResource, incrementResourceDownloadCount } from "@/app/actions/knowledge-base"
import { formatDistanceToNow } from "date-fns"

interface ResourceCardProps {
  resource: ExpertResource
  showExpert?: boolean
}

export function ResourceCard({ resource, showExpert = true }: ResourceCardProps) {
  const fileTypeIcon = () => {
    switch (resource.file_type?.toLowerCase()) {
      case "pdf":
        return <FilePdf className="h-5 w-5" />
      case "image":
      case "jpg":
      case "png":
        return <FileImage className="h-5 w-5" />
      case "zip":
      case "archive":
        return <FileArchive className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const handleDownload = async () => {
    await incrementResourceDownloadCount(resource.id)
    window.open(resource.file_url, "_blank")
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {fileTypeIcon()}
            {resource.title}
          </CardTitle>
          <Badge variant="outline">
            {resource.download_count} {resource.download_count === 1 ? "download" : "downloads"}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">{resource.description || "No description provided"}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <Button variant="outline" size="sm" className="w-full" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        {showExpert && <>By {resource.expert_name} • </>}
        {formatDistanceToNow(new Date(resource.created_at), { addSuffix: true })}
      </CardFooter>
    </Card>
  )
}

