"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader2, Shield, Key, Bell } from "lucide-react"
import { PasswordInput } from "@/components/auth/PasswordInput"

export default function SecurityPage() {
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    emailNotifications: true,
    loginAlerts: true,
  })

  // 加载用户安全设置
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch("/api/user/security")
        if (response.ok) {
          const data = await response.json()
          setSecuritySettings({
            twoFactorEnabled: data.twoFactorEnabled,
            emailNotifications: data.emailNotifications,
            loginAlerts: data.loginAlerts,
          })
        }
      } catch (error) {
        console.error("Failed to load settings:", error)
      } finally {
        setSettingsLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordMessage(null)

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: "error", text: "New password and confirmation do not match" })
      setPasswordLoading(false)
      return
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordMessage({ type: "error", text: "Password must be at least 8 characters" })
      setPasswordLoading(false)
      return
    }

    try {
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update password")
      }

      setPasswordMessage({ type: "success", text: "Password updated successfully!" })
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      setPasswordMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update password, please try again",
      })
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleSecuritySettingsChange = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/user/security", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(securitySettings),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update settings")
      }

      setMessage({ type: "success", text: "Security settings updated successfully!" })
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update settings, please try again",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="container py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Security Center</h1>
        <p className="text-muted-foreground">Manage your account security settings</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Change Password */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              <CardTitle>Change Password</CardTitle>
            </div>
            <CardDescription>Update your password regularly to keep your account secure</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <PasswordInput
                  id="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Enter your current password"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <PasswordInput
                  id="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Enter new password (at least 8 characters)"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <PasswordInput
                  id="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Re-enter your new password"
                  required
                />
              </div>

              {passwordMessage && (
                <div
                  className={`p-4 rounded-lg ${
                    passwordMessage.type === "success"
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {passwordMessage.text}
                </div>
              )}

              <Button type="submit" disabled={passwordLoading}>
                {passwordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Security Settings</CardTitle>
            </div>
            <CardDescription>Configure your account security options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Switch
                id="twoFactor"
                checked={securitySettings.twoFactorEnabled}
                onCheckedChange={(checked) => {
                  setSecuritySettings({ ...securitySettings, twoFactorEnabled: checked })
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications about account activity
                </p>
              </div>
              <Switch
                id="emailNotifications"
                checked={securitySettings.emailNotifications}
                onCheckedChange={(checked) => {
                  setSecuritySettings({ ...securitySettings, emailNotifications: checked })
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="loginAlerts">Login Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when a new device logs into your account
                </p>
              </div>
              <Switch
                id="loginAlerts"
                checked={securitySettings.loginAlerts}
                onCheckedChange={(checked) => {
                  setSecuritySettings({ ...securitySettings, loginAlerts: checked })
                }}
              />
            </div>

            {message && (
              <div
                className={`p-4 rounded-lg ${
                  message.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {message.text}
              </div>
            )}

            <Button onClick={handleSecuritySettingsChange} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Settings
            </Button>
          </CardContent>
        </Card>

        {/* Recent Login Activity - This will be replaced with real data */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Recent Login Activity</CardTitle>
            </div>
            <CardDescription>View your recent login history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>Login activity tracking will be available soon</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
