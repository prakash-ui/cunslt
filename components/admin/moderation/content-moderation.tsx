"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Search, CheckCircle, XCircle, Eye, Flag } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ReportedContent {
  id: string
  type: "review" | "profile" | "message" | "comment"
  content: string
  reason: string
  reportedBy: {
    id: string
    name: string
    avatar?: string
  }
  reportedUser: {
    id: string
    name: string
    avatar?: string
  }
  status: "pending" | "approved" | "removed"
  reportedAt: string
}

interface ContentModerationProps {
  reports: ReportedContent[]
  onApprove: (reportId: string, message?: string) => Promise<void>
  onRemove: (reportId: string, reason: string) => Promise<void>
  onWarnUser: (userId: string, message: string) => Promise<void>
}

export function ContentModeration({
  reports: initialReports,
  onApprove,
  onRemove,
  onWarnUser,
}: ContentModerationProps) {
  const [reports, setReports] = useState<ReportedContent[]>(initialReports)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [selectedReport, setSelectedReport] = useState<ReportedContent | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false)
  const [isWarnDialogOpen, setIsWarnDialogOpen] = useState(false)
  const [removeReason, setRemoveReason] = useState("")
  const [warningMessage, setWarningMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reportedBy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reportedUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reason.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = filterType === "all" || report.type === filterType
    const matchesStatus = filterStatus === "all" || report.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  const handleApprove = async (reportId: string) => {
    setIsSubmitting(true)
    try {
      await onApprove(reportId)
      setReports(reports.map((report) => (report.id === reportId ? { ...report, status: "approved" } : report)))
    } catch (error) {
      console.error("Failed to approve content:", error)
    } finally {
      setIsSubmitting(false)
      setIsViewDialogOpen(false)
    }
  }

  const handleRemove = async () => {
    if (!selectedReport || !removeReason) return

    setIsSubmitting(true)
    try {
      await onRemove(selectedReport.id, removeReason)
      setReports(reports.map((report) => (report.id === selectedReport.id ? { ...report, status: "removed" } : report)))
      setIsRemoveDialogOpen(false)
      setRemoveReason("")
    } catch (error) {
      console.error("Failed to remove content:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleWarnUser = async () => {
    if (!selectedReport || !warningMessage) return

    setIsSubmitting(true)
    try {
      await onWarnUser(selectedReport.reportedUser.id, warningMessage)
      setIsWarnDialogOpen(false)
      setWarningMessage("")
    } catch (error) {
      console.error("Failed to warn user:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: ReportedContent["status"]) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      case "approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>
      case "removed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Removed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getTypeBadge = (type: ReportedContent["type"]) => {
    switch (type) {
      case "review":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Review</Badge>
      case "profile":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Profile</Badge>
      case "message":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Message</Badge>
      case "comment":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Comment</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search reports..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="review">Reviews</SelectItem>
              <SelectItem value="profile">Profiles</SelectItem>
              <SelectItem value="message">Messages</SelectItem>
              <SelectItem value="comment">Comments</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="removed">Removed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reported Content</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Reported By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reported At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No reports found.
                </TableCell>
              </TableRow>
            ) : (
              filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={report.reportedUser.avatar} alt={report.reportedUser.name} />
                        <AvatarFallback>{report.reportedUser.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium truncate max-w-[200px]">{report.reportedUser.name}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {report.content.length > 50 ? `${report.content.substring(0, 50)}...` : report.content}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(report.type)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={report.reportedBy.avatar} alt={report.reportedBy.name} />
                        <AvatarFallback>{report.reportedBy.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{report.reportedBy.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell>{new Date(report.reportedAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedReport(report)
                            setIsViewDialogOpen(true)
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {report.status === "pending" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleApprove(report.id)} disabled={isSubmitting}>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                              Approve Content
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedReport(report)
                                setIsRemoveDialogOpen(true)
                              }}
                              disabled={isSubmitting}
                            >
                              <XCircle className="mr-2 h-4 w-4 text-red-600" />
                              Remove Content
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedReport(report)
                                setIsWarnDialogOpen(true)
                              }}
                              disabled={isSubmitting}
                            >
                              <Flag className="mr-2 h-4 w-4 text-amber-600" />
                              Warn User
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Report Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
            <DialogDescription>Review the reported content and take appropriate action</DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Report Type</Label>
                  <p>{getTypeBadge(selectedReport.type)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <p>{getStatusBadge(selectedReport.status)}</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Reported Content</Label>
                <div className="mt-1 p-3 bg-muted rounded-md text-sm">{selectedReport.content}</div>
              </div>

              <div>
                <Label className="text-muted-foreground">Report Reason</Label>
                <div className="mt-1 p-3 bg-muted rounded-md text-sm">{selectedReport.reason}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Reported By</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={selectedReport.reportedBy.avatar} alt={selectedReport.reportedBy.name} />
                      <AvatarFallback>{selectedReport.reportedBy.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{selectedReport.reportedBy.name}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Reported User</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={selectedReport.reportedUser.avatar} alt={selectedReport.reportedUser.name} />
                      <AvatarFallback>{selectedReport.reportedUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{selectedReport.reportedUser.name}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedReport && selectedReport.status === "pending" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsViewDialogOpen(false)
                    setIsRemoveDialogOpen(true)
                  }}
                >
                  Remove Content
                </Button>
                <Button onClick={() => handleApprove(selectedReport.id)} disabled={isSubmitting}>
                  Approve Content
                </Button>
              </>
            )}
            {(selectedReport?.status === "approved" || selectedReport?.status === "removed") && (
              <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Content Dialog */}
      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Remove Content</DialogTitle>
            <DialogDescription>Please provide a reason for removing this content.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Removal Reason</Label>
              <Textarea
                id="reason"
                value={removeReason}
                onChange={(e) => setRemoveReason(e.target.value)}
                placeholder="Explain why this content is being removed"
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRemoveDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemove} disabled={isSubmitting || !removeReason}>
              {isSubmitting ? "Removing..." : "Remove Content"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Warn User Dialog */}
      <Dialog open={isWarnDialogOpen} onOpenChange={setIsWarnDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Warn User</DialogTitle>
            <DialogDescription>Send a warning message to the user about their content.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="warning">Warning Message</Label>
              <Textarea
                id="warning"
                value={warningMessage}
                onChange={(e) => setWarningMessage(e.target.value)}
                placeholder="Write a warning message to the user"
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWarnDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleWarnUser} disabled={isSubmitting || !warningMessage}>
              {isSubmitting ? "Sending..." : "Send Warning"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

