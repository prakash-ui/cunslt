"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export function DatabaseTest() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [details, setDetails] = useState<any>(null)

  const testConnection = async () => {
    try {
      setStatus("loading")
      setMessage("Testing database connection...")

      const response = await fetch("/api/test-db")
      const data = await response.json()

      if (data.success) {
        setStatus("success")
        setMessage("Database connection successful!")
      } else {
        setStatus("error")
        setMessage("Database connection failed")
      }

      setDetails(data)
    } catch (error) {
      setStatus("error")
      setMessage("Error testing connection")
      setDetails({ error: error instanceof Error ? error.message : String(error) })
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Database Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testConnection} disabled={status === "loading"} className="w-full">
          {status === "loading" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            "Test Database Connection"
          )}
        </Button>

        {status !== "idle" && (
          <Alert variant={status === "success" ? "default" : "destructive"}>
            {status === "success" ? (
              <CheckCircle className="h-4 w-4" />
            ) : status === "error" ? (
              <XCircle className="h-4 w-4" />
            ) : null}
            <AlertTitle>
              {status === "loading" ? "Testing..." : status === "success" ? "Success!" : "Error!"}
            </AlertTitle>
            <AlertDescription>
              {message}
              {details && (
                <pre className="mt-2 text-xs bg-slate-100 p-2 rounded overflow-auto">
                  {JSON.stringify(details, null, 2)}
                </pre>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

