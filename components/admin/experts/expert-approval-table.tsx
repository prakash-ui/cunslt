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
import { MoreHorizontal, Search, CheckCircle, XCircle, Eye } from "lucide-react"
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

interface Expert {
  id: string
  userId: string
  name: string
  email: string
  title: string
  expertise: string[]
  hourlyRate: number
  status: "pending" | "approved" | "rejected"
  submittedAt: string
  avatar?: string
  bio: string
  experience: string
  education: string
  certifications: string[]
}

interface ExpertApprovalTableProps {
  experts: Expert[]
  onApprove: (expertId: string, message?: string) => Promise<void>
  onReject: (expertId: string, reason: string) => Promise<void>
}

export function ExpertApprovalTable({ experts: initialExperts, onApprove, onReject }: ExpertApprovalTableProps) {
  const [experts, setExperts] = useState<Expert[]>(initialExperts)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredExperts = experts.filter(
    (expert) =>
      expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expert.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expert.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleApprove = async (expertId: string) => {
    setIsSubmitting(true)
    try {
      await onApprove(expertId)
      setExperts(experts.map((expert) => (expert.id === expertId ? { ...expert, status: "approved" } : expert)))
    } catch (error) {
      console.error("Failed to approve expert:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!selectedExpert || !rejectReason) return

    setIsSubmitting(true)
    try {
      await onReject(selectedExpert.id, rejectReason)
      setExperts(
        experts.map((expert) => (expert.id === selectedExpert.id ? { ...expert, status: "rejected" } : expert)),
      )
      setIsRejectDialogOpen(false)
      setRejectReason("")
    } catch (error) {
      console.error("Failed to reject expert:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: Expert["status"]) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      case "approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search experts..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Expert</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Hourly Rate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExperts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No experts found.
                </TableCell>
              </TableRow>
            ) : (
              filteredExperts.map((expert) => (
                <TableRow key={expert.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={expert.avatar} alt={expert.name} />
                        <AvatarFallback>{expert.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{expert.name}</div>
                        <div className="text-xs text-muted-foreground">{expert.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{expert.title}</TableCell>
                  <TableCell>${expert.hourlyRate}/hr</TableCell>
                  <TableCell>{getStatusBadge(expert.status)}</TableCell>
                  <TableCell>{new Date(expert.submittedAt).toLocaleDateString()}</TableCell>
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
                            setSelectedExpert(expert)
                            setIsViewDialogOpen(true)
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {expert.status === "pending" && (
                          <>
                            <DropdownMenuItem onClick={() => handleApprove(expert.id)} disabled={isSubmitting}>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedExpert(expert)
                                setIsRejectDialogOpen(true)
                              }}
                              disabled={isSubmitting}
                            >
                              <XCircle className="mr-2 h-4 w-4 text-red-600" />
                              Reject
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

      {/* View Expert Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Expert Details</DialogTitle>
            <DialogDescription>Review the expert's profile information</DialogDescription>
          </DialogHeader>
          {selectedExpert && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedExpert.avatar} alt={selectedExpert.name} />
                  <AvatarFallback>{selectedExpert.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium">{selectedExpert.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedExpert.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Title</Label>
                  <p>{selectedExpert.title}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Hourly Rate</Label>
                  <p>${selectedExpert.hourlyRate}/hr</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Expertise</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedExpert.expertise.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Bio</Label>
                <p className="mt-1 text-sm">{selectedExpert.bio}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Experience</Label>
                <p className="mt-1 text-sm">{selectedExpert.experience}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Education</Label>
                <p className="mt-1 text-sm">{selectedExpert.education}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Certifications</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedExpert.certifications.map((cert, index) => (
                    <Badge key={index} variant="outline">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedExpert && selectedExpert.status === "pending" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsViewDialogOpen(false)
                    setIsRejectDialogOpen(true)
                  }}
                >
                  Reject
                </Button>
                <Button
                  onClick={() => {
                    handleApprove(selectedExpert.id)
                    setIsViewDialogOpen(false)
                  }}
                  disabled={isSubmitting}
                >
                  Approve
                </Button>
              </>
            )}
            {(selectedExpert?.status === "approved" || selectedExpert?.status === "rejected") && (
              <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Expert Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Reject Expert Application</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this expert application.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain why this application is being rejected"
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isSubmitting || !rejectReason}>
              {isSubmitting ? "Rejecting..." : "Reject Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

