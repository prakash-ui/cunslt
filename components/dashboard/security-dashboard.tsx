"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Shield, LogOut, Key, Smartphone, Mail } from "lucide-react"
import {
  getSecuritySettings,
  enableTwoFactor,
  disableTwoFactor,
  getLoginHistory,
  getActiveSessions,
  revokeSession,
  revokeAllSessions,
} from "@/app/actions/security"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

export function SecurityDashboard() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [twoFactorMethod, setTwoFactorMethod] = useState<"app" | "email" | "sms">("app")
  const [loginHistory, setLoginHistory] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        const securitySettings = await getSecuritySettings()
        setSettings(securitySettings)

        const history = await getLoginHistory()
        setLoginHistory(history)

        const activeSessions = await getActiveSessions()
        setSessions(activeSessions)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load security settings",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  const handleEnableTwoFactor = async () => {
    try {
      setLoading(true)
      const result = await enableTwoFactor(twoFactorMethod)

      if (result.success) {
        setSettings({
          ...settings,
          twoFactorEnabled: true,
          twoFactorMethod,
        })

        toast({
          title: "Two-factor authentication enabled",
          description: "Your account is now more secure",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to enable two-factor authentication",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDisableTwoFactor = async () => {
    try {
      setLoading(true)
      const result = await disableTwoFactor()

      if (result.success) {
        setSettings({
          ...settings,
          twoFactorEnabled: false,
        })

        toast({
          title: "Two-factor authentication disabled",
          description: "Two-factor authentication has been disabled",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disable two-factor authentication",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const result = await revokeSession(sessionId)

      if (result.success) {
        setSessions(sessions.filter((s) => s.id !== sessionId))

        toast({
          title: "Session revoked",
          description: "The session has been successfully revoked",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke session",
        variant: "destructive",
      })
    }
  }

  const handleRevokeAllSessions = async () => {
    try {
      const result = await revokeAllSessions()

      if (result.success) {
        // Refresh sessions list
        const activeSessions = await getActiveSessions()
        setSessions(activeSessions)

        toast({
          title: "All sessions revoked",
          description: "All other sessions have been successfully revoked",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke all sessions",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading security settings...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Security Settings</h1>

      <Tabs defaultValue="two-factor">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="two-factor">Two-Factor Authentication</TabsTrigger>
          <TabsTrigger value="login-history">Login History</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="two-factor" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account by requiring a verification code in addition to your
                password.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings?.twoFactorEnabled ? (
                <>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Two-factor authentication is enabled</AlertTitle>
                    <AlertDescription>
                      Your account is protected with{" "}
                      {settings.twoFactorMethod === "app"
                        ? "an authenticator app"
                        : settings.twoFactorMethod === "email"
                          ? "email verification"
                          : "SMS verification"}
                      .
                    </AlertDescription>
                  </Alert>

                  <Button onClick={handleDisableTwoFactor} variant="destructive">
                    Disable Two-Factor Authentication
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="two-factor"
                      checked={settings?.twoFactorEnabled || false}
                      onCheckedChange={handleEnableTwoFactor}
                    />
                    <Label htmlFor="two-factor">Enable Two-Factor Authentication</Label>
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label>Authentication Method</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={twoFactorMethod === "app" ? "default" : "outline"}
                        onClick={() => setTwoFactorMethod("app")}
                        className="flex items-center justify-center"
                      >
                        <Smartphone className="mr-2 h-4 w-4" />
                        App
                      </Button>
                      <Button
                        variant={twoFactorMethod === "email" ? "default" : "outline"}
                        onClick={() => setTwoFactorMethod("email")}
                        className="flex items-center justify-center"
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Email
                      </Button>
                      <Button
                        variant={twoFactorMethod === "sms" ? "default" : "outline"}
                        onClick={() => setTwoFactorMethod("sms")}
                        className="flex items-center justify-center"
                        disabled
                      >
                        <Smartphone className="mr-2 h-4 w-4" />
                        SMS
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="login-history" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="mr-2 h-5 w-5" />
                Login History
              </CardTitle>
              <CardDescription>Review recent login activity for your account.</CardDescription>
            </CardHeader>
            <CardContent>
              {loginHistory.length === 0 ? (
                <p>No login history available.</p>
              ) : (
                <div className="space-y-4">
                  {loginHistory.map((login, index) => (
                    <div key={index} className="flex items-start justify-between border-b pb-3">
                      <div>
                        <p className="font-medium">{login.success ? "Successful login" : "Failed login attempt"}</p>
                        <p className="text-sm text-muted-foreground">{login.ipAddress || "Unknown IP"}</p>
                        <p className="text-sm text-muted-foreground">
                          {login.userAgent
                            ? login.userAgent.length > 50
                              ? `${login.userAgent.substring(0, 50)}...`
                              : login.userAgent
                            : "Unknown device"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{format(new Date(login.createdAt), "PPP")}</p>
                        <p className="text-sm">{format(new Date(login.createdAt), "p")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <LogOut className="mr-2 h-5 w-5" />
                Active Sessions
              </CardTitle>
              <CardDescription>Manage your active sessions across different devices.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sessions.length === 0 ? (
                <p>No active sessions found.</p>
              ) : (
                <>
                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <div key={session.id} className="flex items-start justify-between border-b pb-3">
                        <div>
                          <p className="font-medium">
                            {session.userAgent
                              ? session.userAgent.includes("Mobile")
                                ? "Mobile Device"
                                : "Desktop Device"
                              : "Unknown Device"}
                          </p>
                          <p className="text-sm text-muted-foreground">{session.ipAddress || "Unknown IP"}</p>
                          <p className="text-sm text-muted-foreground">
                            Last active: {format(new Date(session.updatedAt), "PPP p")}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleRevokeSession(session.id)}>
                          Revoke
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Button variant="destructive" onClick={handleRevokeAllSessions}>
                    Revoke All Other Sessions
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

