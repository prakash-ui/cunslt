import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/app/actions/auth"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createExpertPackage } from "@/app/actions/packages"

export const metadata: Metadata = {
  title: "Manage Packages | Cunslt",
  description: "Create and manage your consultation packages",
}

export default async function ExpertPackagesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login?callbackUrl=/expert/packages")
  }

  const supabase = createClient()

  // Check if user is an expert
  const { data: expert } = await supabase.from("experts").select("id").eq("user_id", user.id).single()

  if (!expert) {
    redirect("/become-expert")
  }

  // Get expert's packages
  const { data: packages } = await supabase
    .from("consultation_packages")
    .select("*")
    .eq("expert_id", expert.id)
    .order("created_at", { ascending: false })

  return (
    <div className="container py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Manage Packages</h1>
          <p className="text-muted-foreground">Create and manage consultation packages to offer your clients</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Package</CardTitle>
              <CardDescription>Create a new consultation package to offer discounts for multiple hours</CardDescription>
            </CardHeader>
            <form action={createExpertPackage}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Package Name</Label>
                  <Input id="name" name="name" placeholder="e.g. Basic Consultation Package" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe what's included in this package"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hoursIncluded">Hours Included</Label>
                    <Input
                      id="hoursIncluded"
                      name="hoursIncluded"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="5"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pricePerHour">Price Per Hour ($)</Label>
                    <Input
                      id="pricePerHour"
                      name="pricePerHour"
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="Your hourly rate"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="discountPercentage">Discount (%)</Label>
                    <Input
                      id="discountPercentage"
                      name="discountPercentage"
                      type="number"
                      min="0"
                      max="50"
                      step="1"
                      placeholder="10"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Recommended: 5-20% discount to incentivize package purchases
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="validityDays">Validity (Days)</Label>
                    <Input
                      id="validityDays"
                      name="validityDays"
                      type="number"
                      min="30"
                      step="1"
                      placeholder="90"
                      defaultValue="90"
                      required
                    />
                    <p className="text-xs text-muted-foreground">How long the client has to use the package hours</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full">
                  Create Package
                </Button>
              </CardFooter>
            </form>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Your Packages</h3>

            {packages && packages.length > 0 ? (
              <div className="space-y-4">
                {packages.map((pkg) => (
                  <Card key={pkg.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{pkg.name}</CardTitle>
                        <div className={`text-sm ${pkg.is_active ? "text-green-600" : "text-red-600"}`}>
                          {pkg.is_active ? "Active" : "Inactive"}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-muted-foreground">{pkg.description}</p>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div>Hours: {pkg.hours_included}</div>
                        <div>Discount: {pkg.discount_percentage}%</div>
                        <div>Price: ${pkg.total_price}</div>
                        <div>Validity: {pkg.validity_days} days</div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <form>
                        <input type="hidden" name="packageId" value={pkg.id} />
                        <input type="hidden" name="action" value={pkg.is_active ? "deactivate" : "activate"} />
                        <Button variant="outline" size="sm" type="submit">
                          {pkg.is_active ? "Deactivate" : "Activate"}
                        </Button>
                      </form>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border rounded-lg">
                <p className="text-muted-foreground">You haven't created any packages yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

