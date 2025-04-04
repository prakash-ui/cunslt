import type { Metadata } from "next"
import { getExpertAvailabilitySettings, getAvailabilitySlots, getUnavailableDates } from "@/app/actions/availability"
import { SettingsForm } from "@/components/availability/settings-form"
import { AddTimeSlot } from "@/components/availability/add-time-slot"
import { TimeSlot } from "@/components/availability/time-slot"
import { AddUnavailableDate } from "@/components/availability/add-unavailable-date"
import { UnavailableDate } from "@/components/availability/unavailable-date"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Manage Availability | Cunslt",
  description: "Set your availability for consultations",
}

export default async function AvailabilityPage() {
  const settings = await getExpertAvailabilitySettings()
  const slots = await getAvailabilitySlots()
  const unavailableDates = await getUnavailableDates()

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Manage Availability</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <SettingsForm initialSettings={settings} />

          <Tabs defaultValue="time-slots">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="time-slots">Time Slots</TabsTrigger>
              <TabsTrigger value="blocked-dates">Blocked Dates</TabsTrigger>
            </TabsList>
            <TabsContent value="time-slots" className="space-y-4 mt-4">
              <AddTimeSlot />

              <Card>
                <CardHeader>
                  <CardTitle>Your Availability</CardTitle>
                  <CardDescription>These are the times when you're available for consultations</CardDescription>
                </CardHeader>
                <CardContent>
                  {slots.length === 0 ? (
                    <p className="text-muted-foreground">No availability slots set. Add some above.</p>
                  ) : (
                    <div className="space-y-2">
                      {slots.map((slot) => (
                        <TimeSlot
                          key={slot.id}
                          id={slot.id}
                          dayOfWeek={slot.day_of_week}
                          startTime={slot.start_time}
                          endTime={slot.end_time}
                          isRecurring={slot.is_recurring}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="blocked-dates" className="space-y-4 mt-4">
              <AddUnavailableDate />

              <Card>
                <CardHeader>
                  <CardTitle>Blocked Dates</CardTitle>
                  <CardDescription>Dates when you're unavailable for consultations</CardDescription>
                </CardHeader>
                <CardContent>
                  {unavailableDates.length === 0 ? (
                    <p className="text-muted-foreground">No dates blocked. Add some above.</p>
                  ) : (
                    <div className="space-y-2">
                      {unavailableDates.map((date) => (
                        <UnavailableDate key={date.id} id={date.id} date={date.date} reason={date.reason} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Availability Calendar</CardTitle>
              <CardDescription>Visual overview of your availability</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Your availability is set for the following times:</p>
              <ul className="mt-4 space-y-2">
                {slots.length === 0 ? (
                  <li className="text-muted-foreground">No availability set</li>
                ) : (
                  slots.map((slot) => {
                    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
                    return (
                      <li key={slot.id} className="flex items-center">
                        <span className="font-medium">{days[slot.day_of_week]}:</span>
                        <span className="ml-2">
                          {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                        </span>
                      </li>
                    )
                  })
                )}
              </ul>

              {unavailableDates.length > 0 && (
                <>
                  <p className="mt-6 text-muted-foreground">You're unavailable on these dates:</p>
                  <ul className="mt-2 space-y-1">
                    {unavailableDates.map((date) => (
                      <li key={date.id}>
                        {new Date(date.date).toLocaleDateString()}
                        {date.reason && <span className="text-sm text-muted-foreground ml-2">({date.reason})</span>}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

