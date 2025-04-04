"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/i18n/language-provider"
import { useCurrency } from "@/context/currency-provider"
import { useTimezone } from "@/context/timezone-provider"
import { TimezoneSelector } from "@/components/timezone-selector"
import { createConsultation } from "@/app/actions/consultations"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface BookingFormProps {
  expertId: string
  expertName: string
  hourlyRate: number
  currency?: string
}

export function BookingForm({ expertId, expertName, hourlyRate, currency = "USD" }: BookingFormProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const { convert, format } = useCurrency()
  const { timezone, formatDate } = useTimezone()

  const [date, setDate] = useState<Date | undefined>(undefined)
  const [time, setTime] = useState<string>("")
  const [duration, setDuration] = useState<number>(60)
  const [topic, setTopic] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [selectedTimezone, setSelectedTimezone] = useState<string>(timezone)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // Calculate total price
  const [convertedRate, setConvertedRate] = useState<number>(hourlyRate)

  // Update converted rate when currency changes
  useState(() => {
    const updateRate = async () => {
      const converted = await convert(hourlyRate, currency)
      setConvertedRate(converted)
    }
    updateRate()
  })

  const totalPrice = (convertedRate / 60) * duration

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!date || !time) {
      toast({
        title: t("consultations.dateTimeRequired"),
        description: t("consultations.pleaseSelectDateTime"),
        variant: "destructive",
      })
      return
    }

    if (!topic) {
      toast({
        title: t("consultations.topicRequired"),
        description: t("consultations.pleaseEnterTopic"),
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Combine date and time
    const [hours, minutes] = time.split(":").map(Number)
    const startTime = new Date(date)
    startTime.setHours(hours, minutes, 0, 0)

    try {
      const result = await createConsultation({
        expert_id: expertId,
        start_time: startTime.toISOString(),
        duration,
        topic,
        description,
        timezone: selectedTimezone,
      })

      if (result.error) {
        toast({
          title: t("consultations.bookingFailed"),
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: t("consultations.bookingConfirmed"),
          description: t("consultations.bookingConfirmedDescription"),
        })

        router.push(`/dashboard/consultations/${result.consultation.id}`)
      }
    } catch (error) {
      toast({
        title: t("consultations.bookingFailed"),
        description: t("common.error"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Generate available time slots
  const timeSlots = []
  for (let hour = 8; hour < 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const formattedHour = hour.toString().padStart(2, "0")
      const formattedMinute = minute.toString().padStart(2, "0")
      timeSlots.push(`${formattedHour}:${formattedMinute}`)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("consultations.bookConsultation")}</CardTitle>
        <CardDescription>
          {t("consultations.bookConsultationWith")} {expertName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>{t("consultations.selectDateTime")}</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date()}
                    className="border rounded-md"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="time">{t("consultations.time")}</Label>
                    <Select value={time} onValueChange={setTime}>
                      <SelectTrigger id="time">
                        <SelectValue placeholder={t("consultations.selectTime")} />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="timezone">{t("consultations.timezone")}</Label>
                    <TimezoneSelector onSelect={setSelectedTimezone} className="w-full mt-1" />
                  </div>

                  <div>
                    <Label htmlFor="duration">{t("consultations.duration")}</Label>
                    <Select value={duration.toString()} onValueChange={(value) => setDuration(Number.parseInt(value))}>
                      <SelectTrigger id="duration">
                        <SelectValue placeholder={t("consultations.selectDuration")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 {t("consultations.minutes")}</SelectItem>
                        <SelectItem value="60">60 {t("consultations.minutes")}</SelectItem>
                        <SelectItem value="90">90 {t("consultations.minutes")}</SelectItem>
                        <SelectItem value="120">2 {t("consultations.hours")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="topic">{t("consultations.topic")}</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={t("consultations.topicPlaceholder")}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">{t("consultations.description")}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("consultations.descriptionPlaceholder")}
                className="mt-1 min-h-[100px]"
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{t("consultations.totalPrice")}</h3>
                <p className="text-sm text-gray-500">
                  {format(convertedRate)} × {duration / 60} {t("consultations.hours")}
                </p>
              </div>
              <div className="text-xl font-bold">{format(totalPrice)}</div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t("common.loading") : t("consultations.confirmBooking")}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

