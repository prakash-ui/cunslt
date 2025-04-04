"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { format, isBefore, startOfDay } from "date-fns"
import { toast } from "@/components/ui/use-toast"
import { createBooking } from "@/app/actions/booking"

interface BookingFormProps {
  expert: any
  userId: string
  availableSlots: any[]
  services: any[]
  packages: any[]
  subscriptions: any[]
}

export function BookingForm({ expert, userId, availableSlots, services, packages, subscriptions }: BookingFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const serviceId = searchParams.get("service")

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<string | null>(serviceId)
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [selectedSubscription, setSelectedSubscription] = useState<string | null>(null)
  const [paymentOption, setPaymentOption] = useState("single")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter available slots for the selected date
  const availableSlotsForDate = selectedDate
    ? availableSlots.filter((slot) => {
        const slotDate = new Date(slot.start_time)
        return slotDate.toDateString() === selectedDate.toDateString()
      })
    : []

  // Format slots for display
  const formattedSlots = availableSlotsForDate.map((slot) => ({
    id: slot.id,
    time: `${format(new Date(slot.start_time), "h:mm a")} - ${format(new Date(slot.end_time), "h:mm a")}`,
    start_time: slot.start_time,
    end_time: slot.end_time,
  }))

  // Calculate price based on selection
  const calculatePrice = () => {
    if (selectedService) {
      const service = services.find((s) => s.id === selectedService)
      return service ? service.price : expert.hourly_rate
    } else if (selectedPackage) {
      const pkg = packages.find((p) => p.id === selectedPackage)
      return pkg ? pkg.price : 0
    } else if (selectedSubscription) {
      const sub = subscriptions.find((s) => s.id === selectedSubscription)
      return sub ? sub.price : 0
    }
    return expert.hourly_rate
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedDate || !selectedTimeSlot) {
      toast({
        title: "Missing Information",
        description: "Please select a date and time slot.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const selectedSlot = availableSlotsForDate.find((slot) => slot.id === selectedTimeSlot)

      if (!selectedSlot) {
        throw new Error("Selected time slot not found")
      }

      const bookingData = {
        expert_id: expert.id,
        client_id: userId,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        service_id: selectedService,
        package_id: selectedPackage,
        subscription_id: selectedSubscription,
        payment_type: paymentOption,
        notes,
        status: "pending",
      }

      const { bookingId, error } = await createBooking(bookingData)

      if (error) {
        throw new Error(error)
      }

      toast({
        title: "Booking Successful",
        description: "Your booking has been created successfully.",
      })

      router.push(`/dashboard/client/bookings/${bookingId}`)
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "An error occurred while creating your booking.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Book a Session</CardTitle>
        <CardDescription>Select a date, time, and service to book with {expert.profiles.full_name}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="datetime" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="datetime">Date & Time</TabsTrigger>
            <TabsTrigger value="service">Service</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
          </TabsList>

          <TabsContent value="datetime" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Select Date</h3>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) =>
                    isBefore(date, startOfDay(new Date())) ||
                    !availableSlots.some((slot) => {
                      const slotDate = new Date(slot.start_time)
                      return slotDate.toDateString() === date.toDateString()
                    })
                  }
                  className="rounded-md border"
                />
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Select Time Slot</h3>
                {selectedDate ? (
                  formattedSlots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {formattedSlots.map((slot) => (
                        <Button
                          key={slot.id}
                          variant={selectedTimeSlot === slot.id ? "default" : "outline"}
                          className="w-full justify-start"
                          onClick={() => setSelectedTimeSlot(slot.id)}
                        >
                          {slot.time}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-40 border rounded-md">
                      <p className="text-muted-foreground">No available slots for this date</p>
                    </div>
                  )
                ) : (
                  <div className="flex items-center justify-center h-40 border rounded-md">
                    <p className="text-muted-foreground">Please select a date first</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="service" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Select Service Type</h3>
                <RadioGroup
                  defaultValue={selectedService ? "service" : "hourly"}
                  onValueChange={(value) => {
                    if (value === "hourly") {
                      setSelectedService(null)
                      setSelectedPackage(null)
                      setSelectedSubscription(null)
                    }
                  }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hourly" id="hourly" />
                    <Label htmlFor="hourly">Hourly Rate (${expert.hourly_rate}/hr)</Label>
                  </div>

                  {services.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="service" id="service" />
                      <Label htmlFor="service">Specific Service</Label>
                    </div>
                  )}

                  {packages.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="package" id="package" />
                      <Label htmlFor="package">Consultation Package</Label>
                    </div>
                  )}

                  {subscriptions.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="subscription" id="subscription" />
                      <Label htmlFor="subscription">Subscription Plan</Label>
                    </div>
                  )}
                </RadioGroup>
              </div>

              {services.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Select Service</h3>
                  <Select
                    value={selectedService || ""}
                    onValueChange={(value) => {
                      setSelectedService(value || null)
                      setSelectedPackage(null)
                      setSelectedSubscription(null)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.title} - ${service.price} ({service.duration} min)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {packages.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Select Package</h3>
                  <Select
                    value={selectedPackage || ""}
                    onValueChange={(value) => {
                      setSelectedPackage(value || null)
                      setSelectedService(null)
                      setSelectedSubscription(null)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a package" />
                    </SelectTrigger>
                    <SelectContent>
                      {packages.map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.id}>
                          {pkg.name} - ${pkg.price} ({pkg.sessions} sessions)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {subscriptions.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Select Subscription</h3>
                  <Select
                    value={selectedSubscription || ""}
                    onValueChange={(value) => {
                      setSelectedSubscription(value || null)
                      setSelectedService(null)
                      setSelectedPackage(null)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subscription" />
                    </SelectTrigger>
                    <SelectContent>
                      {subscriptions.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name} - ${sub.price}/month
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Additional Notes</h3>
                <Textarea
                  placeholder="Add any specific requirements or questions for the expert"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="payment" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Payment Options</h3>
                <RadioGroup value={paymentOption} onValueChange={setPaymentOption} className="grid grid-cols-1 gap-2">
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="single" id="single" className="mt-1" />
                    <div>
                      <Label htmlFor="single" className="font-medium">
                        Single Payment
                      </Label>
                      <p className="text-sm text-muted-foreground">Pay the full amount now</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="installment" id="installment" className="mt-1" />
                    <div>
                      <Label htmlFor="installment" className="font-medium">
                        Installment Plan
                      </Label>
                      <p className="text-sm text-muted-foreground">Pay 50% now and 50% before the session</p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Service:</span>
                      <span>
                        {selectedService
                          ? services.find((s) => s.id === selectedService)?.title
                          : selectedPackage
                            ? packages.find((p) => p.id === selectedPackage)?.name
                            : selectedSubscription
                              ? subscriptions.find((s) => s.id === selectedSubscription)?.name
                              : "Hourly Consultation"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Price:</span>
                      <span>${calculatePrice()}</span>
                    </div>
                    {paymentOption === "installment" && (
                      <div className="flex justify-between text-primary font-medium">
                        <span>Initial Payment (50%):</span>
                        <span>${(calculatePrice() * 0.5).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                      <span>Total Due Now:</span>
                      <span>
                        ${paymentOption === "installment" ? (calculatePrice() * 0.5).toFixed(2) : calculatePrice()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
        <Button variant="outline" className="w-full sm:w-auto" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button
          className="w-full sm:w-auto"
          onClick={handleSubmit}
          disabled={isSubmitting || !selectedDate || !selectedTimeSlot}
        >
          {isSubmitting ? "Processing..." : "Confirm Booking"}
        </Button>
      </CardFooter>
    </Card>
  )
}

