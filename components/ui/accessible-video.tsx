"use client"

import { useRef, useState, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

interface AccessibleVideoProps {
  src: string
  poster?: string
  title: string
  description?: string
  className?: string
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
  controls?: boolean
  width?: number
  height?: number
  transcriptUrl?: string
}

export function AccessibleVideo({
  src,
  poster,
  title,
  description,
  className,
  autoPlay = false,
  loop = false,
  muted = false,
  controls = true,
  width,
  height,
  transcriptUrl,
}: AccessibleVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(muted)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showTranscript, setShowTranscript] = useState(false)
  const [transcript, setTranscript] = useState("")

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => setCurrentTime(video.currentTime)
    const updateDuration = () => setDuration(video.duration)
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement)

    video.addEventListener("timeupdate", updateTime)
    video.addEventListener("durationchange", updateDuration)
    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)
    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      video.removeEventListener("timeupdate", updateTime)
      video.removeEventListener("durationchange", updateDuration)
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  useEffect(() => {
    if (transcriptUrl && showTranscript) {
      fetch(transcriptUrl)
        .then((response) => response.text())
        .then((text) => setTranscript(text))
        .catch((error) => console.error("Failed to load transcript:", error))
    }
  }, [transcriptUrl, showTranscript])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const toggleFullscreen = () => {
    const video = videoRef.current
    if (!video) return

    if (!document.fullscreenElement) {
      video.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      document.exitFullscreen()
    }
  }

  const handleSeek = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = value[0]
    setCurrentTime(value[0])
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          width={width}
          height={height}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          className="w-full rounded-lg"
          aria-label={title}
          aria-describedby={description ? "video-description" : undefined}
          tabIndex={0}
        >
          Your browser does not support the video tag.
        </video>

        {controls && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 rounded-b-lg">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>

              <div className="flex-1 mx-2">
                <Slider
                  value={[currentTime]}
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  onValueChange={handleSeek}
                  aria-label="Seek video"
                  aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
                />
                <div className="flex justify-between text-xs text-white mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <Button variant="ghost" size="icon" onClick={toggleMute} aria-label={isMuted ? "Unmute" : "Mute"}>
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}
      </div>

      {description && (
        <p id="video-description" className="sr-only">
          {description}
        </p>
      )}

      {transcriptUrl && (
        <div className="mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTranscript(!showTranscript)}
            aria-expanded={showTranscript}
          >
            {showTranscript ? "Hide Transcript" : "Show Transcript"}
          </Button>

          {showTranscript && (
            <div className="mt-2 p-4 bg-muted rounded-lg max-h-40 overflow-y-auto">
              {transcript ? (
                <p className="text-sm">{transcript}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Loading transcript...</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

