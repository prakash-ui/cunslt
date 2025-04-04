"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { purchasePackage } from "@/app/actions/packages"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ConsultationPackage {
  id: string
  expert_id: string
  name: string
  description: string
  hours_included: number
  price_per_hour: number
  total_price: number
  discount_percentage: number
  validity_days: number
  is_active: boolean
}

interface ExpertPackagesProps {
  packages: ConsultationPackage[]
  expertName: string
}

export function ExpertPackages({ packages, expertName }: ExpertPackagesProps) {
  const [selectedPackage, setSelectedPackage] = useState<ConsultationPackage | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)

  const handlePurchase = async (pkg: ConsultationPackage) => {
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("packageId", pkg.id)

      await purchasePackage(formData)
      toast({
        title: "Success",
        description: "Package purchased successfully!",
      })
      setDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to purchase package",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{pkg.name}</CardTitle>
              <CardDescription>{pkg.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>{pkg.hours_included} hours</span>
                </div>
                <div className="text-sm text-muted-foreground">Valid for {pkg.validity_days} days</div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Price per hour:</span>
                  <span>{formatCurrency(pkg.price_per_hour)}</span>
                </div>
                {pkg.discount_percentage > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>{pkg.discount_percentage}%</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total price:</span>
                  <span>{formatCurrency(pkg.total_price)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Dialog
                open={dialogOpen && selectedPackage?.id === pkg.id}
                onOpenChange={(open) => {
                  setDialogOpen(open)
                  if (!open) setSelectedPackage(null)
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setSelectedPackage(pkg)
                      setDialogOpen(true)
                    }}
                  >
                    Purchase Package
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Purchase {pkg.name} Package</DialogTitle>
                    <DialogDescription>
                      You will be charged {formatCurrency(pkg.total_price)} for {pkg.hours_included} hours of
                      consultation with {expertName}. This package will be valid for {pkg.validity_days} days after
                      purchase.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        if (selectedPackage) {
                          handlePurchase(selectedPackage)
                        }
                      }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Processing..." : "Confirm Purchase"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

