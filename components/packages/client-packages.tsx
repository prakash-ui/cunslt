"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, User } from "lucide-react"
import Link from "next/link"

interface ClientPackage {
  id: string
  client_id: string
  package_id: string
  hours_remaining: number
  status: "active" | "completed" | "expired"
  expires_at: string
  created_at: string
  updated_at: string
  consultation_packages: {
    id: string
    expert_id: string
    name: string
    description: string
    hours_included: number
    price_per_hour: number
    total_price: number
    experts: {
      id: string
      title: string
      hourly_rate: number
    }
  }
}

interface ClientPackagesProps {
  packages: ClientPackage[]
}

export function ClientPackages({ packages }: ClientPackagesProps) {
  const getStatusBadge = (status: string, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date()

    if (isExpired && status === "active") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Expired
        </span>
      )
    }

    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Active
          </span>
        )
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Completed
          </span>
        )
      case "expired":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Expired
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      {packages.length === 0 ? (
        <div className="text-center py-10">
          <Package className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No packages found</h3>
          <p className="mt-2 text-muted-foreground">You haven't purchased any consultation packages yet.</p>
          <Button asChild className="mt-4">
            <Link href="/experts">Browse Experts</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {packages.map((pkg) => {
            const isExpired = new Date(pkg.expires_at) < new Date()
            const daysLeft = Math.max(
              0,
              Math.ceil((new Date(pkg.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
            )

            return (
              <Card key={pkg.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{pkg.consultation_packages.name}</CardTitle>
                      <CardDescription>{pkg.consultation_packages.description}</CardDescription>
                    </div>
                    <div>{getStatusBadge(pkg.status, pkg.expires_at)}</div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <User className="h-5 w-5 mr-2 text-muted-foreground" />
                      <span>Expert: {pkg.consultation_packages.experts.title}</span>
                    </div>
                    <Link href={`/experts/${pkg.consultation_packages.experts.id}`} className="text-sm text-primary">
                      View Profile
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted rounded-md">
                      <div className="text-sm text-muted-foreground">Hours Remaining</div>
                      <div className="text-xl font-bold">{pkg.hours_remaining} hrs</div>
                    </div>
                    <div className="p-3 bg-muted rounded-md">
                      <div className="text-sm text-muted-foreground">Expires In</div>
                      <div className="text-xl font-bold">{isExpired ? "Expired" : `${daysLeft} days`}</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button asChild className="w-full" disabled={isExpired || pkg.hours_remaining <= 0}>
                      <Link href={`/book?expert=${pkg.consultation_packages.experts.id}&package=${pkg.id}`}>
                        Book Consultation
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

