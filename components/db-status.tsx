"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle } from "lucide-react"

export function DbStatus() {
  const [status, setStatus] = useState<"loading" | "connected" | "error">("loading")
  const [message, setMessage] = useState<string>("Checking database connection...")

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const res = await fetch("/api/db-check")
        const data = await res.json()

        if (data.success) {
          setStatus("connected")
          setMessage("Database connected successfully!")
        } else {
          setStatus("error")
          setMessage(data.error || "Failed to connect to database")
        }
      } catch (error) {
        setStatus("error")
        setMessage("Failed to check database connection")
      }
    }

    checkConnection()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {status === "loading" && "Checking Database Connection..."}
          {status === "connected" && (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              Database Connected
            </>
          )}
          {status === "error" && (
            <>
              <AlertCircle className="h-5 w-5 text-red-500" />
              Database Connection Error
            </>
          )}
        </CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent>
        {status === "error" && (
          <div className="text-sm text-muted-foreground">
            <p>Please check your database configuration:</p>
            <ul className="list-disc pl-5 mt-2">
              <li>Verify your DATABASE_URL environment variable</li>
              <li>Ensure your database server is running</li>
              <li>Check network connectivity to your database</li>
              <li>Verify that the schema has been pushed with `npx prisma db push`</li>
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => {
            setStatus("loading")
            setMessage("Checking database connection...")
            window.location.reload()
          }}
          variant={status === "error" ? "destructive" : "outline"}
        >
          Retry Connection
        </Button>
      </CardFooter>
    </Card>
  )
}

