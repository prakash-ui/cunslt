"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Video, VideoOff, Mic, MicOff, PhoneOff, ScreenShare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// We'll use the Daily.co React library
// This would need to be installed: npm install @daily-co/daily-js @daily-co/daily-react
import {
  DailyProvider,
  useDaily,
  useVideoTrack,
  useAudioTrack,
  useScreenShare,
  useDailyEvent,
} from "@daily-co/daily-react"
import { DailyCall } from "@daily-co/daily-js"

interface VideoRoomProps {
  token: string
  roomUrl: string
  bookingId: string
  onConsultationEnd?: () => void
}

function VideoControls() {
  const daily = useDaily()
  // const { camState, updateCam } = useVideoTrack()
  // const { micState, updateMic } = useAudioTrack()
  const { startScreenShare, stopScreenShare, isSharingScreen } = useScreenShare()
  const router = useRouter()

  // const toggleVideo = () => {
  //   updateCam(camState === "on" ? "off" : "on")
  // }

  // const toggleAudio = () => {
  //   updateMic(micState === "on" ? "off" : "on")
  // }

  const toggleScreenShare = () => {
    if (isSharingScreen) {
      stopScreenShare()
    } else {
      startScreenShare()
    }
  }

  const leaveCall = () => {
    if (daily) {
      daily.leave()
      router.push("/bookings")
    }
  }

  return (
    <div className="flex items-center justify-center space-x-4 p-4">
      {/* <Button variant={camState === "on" ? "default" : "destructive"} size="icon" onClick={toggleVideo}>
        {camState === "on" ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
      </Button>

      <Button variant={micState === "on" ? "default" : "destructive"} size="icon" onClick={toggleAudio}>
        {micState === "on" ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
      </Button> */}

      <Button variant={isSharingScreen ? "destructive" : "default"} size="icon" onClick={toggleScreenShare}>
        <ScreenShare className="h-5 w-5" />
      </Button>

      <Button variant="destructive" size="icon" onClick={leaveCall}>
        <PhoneOff className="h-5 w-5" />
      </Button>
    </div>
  )
}

function CallComponent({ token, roomUrl, bookingId, onConsultationEnd }: VideoRoomProps) {
  const [callObject, setCallObject] = useState<DailyCall | null>(null)
  const [isJoining, setIsJoining] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Create the Daily call object
    // const daily = DailyCall.createCallObject()
    // setCallObject(daily)

    // Clean up on unmount
    // return () => {
    //   daily.destroy()
    // }
  }, [])

  useEffect(() => {
    if (!callObject || !token) return

    async function joinCall() {
      try {
        setIsJoining(true)
        // await callObject.join({ url: roomUrl, token })
        // setIsJoining(false)

        // Update booking status to in_progress
        const response = await fetch("/api/bookings/start", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ bookingId }),
        })

        if (!response.ok) {
          console.error("Failed to update booking status")
        }
      } catch (error) {
        console.error("Error joining call:", error)
        toast({
          title: "Failed to join consultation",
          description: "Please try again or contact support.",
          variant: "destructive",
        })
        setIsJoining(false)
      }
    }

    joinCall()
  }, [callObject, token, roomUrl, bookingId, toast])

  // Handle call ended event
  // useDailyEvent("call-ended", () => {
  //   if (onConsultationEnd) {
  //     onConsultationEnd()
  //   }
  // })

  if (isJoining) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Joining consultation...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 min-h-[400px]">
        {/* This is where the video tiles will be rendered automatically */}
      </div>
      <VideoControls />
    </div>
  )
}

export default function VideoRoom({ token, roomUrl, bookingId, onConsultationEnd }: VideoRoomProps) {
  if (!token || !roomUrl) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Video Consultation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64">
            <p>Unable to join consultation. Invalid session.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Video Consultation</CardTitle>
      </CardHeader>
      <CardContent>
        <DailyProvider>
          <CallComponent token={token} roomUrl={roomUrl} bookingId={bookingId} onConsultationEnd={onConsultationEnd} />
        </DailyProvider>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        <p>Tip: You can share your screen during the consultation.</p>
      </CardFooter>
    </Card>
  )
}

