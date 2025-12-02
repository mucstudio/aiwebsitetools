"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

interface OAuthProvider {
  id: string
  name: string
  enabled: boolean
  clientId: string
  clientSecret: string
  icon: string
  color: string
  setupUrl: string
}

export default function OAuthSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [providers, setProviders] = useState<OAuthProvider[]>([
    {
      id: "google",
      name: "Google",
      enabled: false,
      clientId: "",
      clientSecret: "",
      icon: "🔍",
      color: "#4285F4",
      setupUrl: "https://console.cloud.google.com/",
    },
    {
      id: "github",
      name: "GitHub",
      enabled: false,
      clientId: "",
      clientSecret: "",
      icon: "🐙",
      color: "#24292e",
      setupUrl: "https://github.com/settings/developers",
    },
    {
      id: "facebook",
      name: "Facebook",
      enabled: false,
      clientId: "",
      clientSecret: "",
      icon: "📘",
      color: "#1877F2",
      setupUrl: "https://developers.facebook.com/",
    },
    {
      id: "discord",
      name: "Discord",
      enabled: false,
      clientId: "",
      clientSecret: "",
      icon: "💬",
      color: "#5865F2",
      setupUrl: "https://discord.com/developers/applications",
    },
    {
      id: "twitter",
      name: "Twitter",
      enabled: false,
      clientId: "",
      clientSecret: "",
      icon: "🐦",
      color: "#1DA1F2",
      setupUrl: "https://developer.twitter.com/",
    },
  ])

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings")
      if (response.ok) {
        const data = await response.json()
        const settings = data.settings || {}

        setProviders((prev) =>
          prev.map((provider) => ({
            ...provider,
            enabled: settings[`oauth_${provider.id}_enabled`] === "true",
            clientId: settings[`oauth_${provider.id}_client_id`] || "",
            clientSecret: settings[`oauth_${provider.id}_client_secret`] || "",
          }))
        )
      }
    } catch (error) {
      console.error("Failed to load settings:", error)
      setMessage({ type: "error", text: "Failed to load settings" })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const settings: Record<string, string> = {}

      providers.forEach((provider) => {
        settings[`oauth_${provider.id}_enabled`] = provider.enabled.toString()
        settings[`oauth_${provider.id}_client_id`] = provider.clientId
        settings[`oauth_${provider.id}_client_secret`] = provider.clientSecret
      })

      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      })

      if (response.ok) {
        setMessage({ type: "success", text: "OAuth settings saved successfully!" })
      } else {
        throw new Error("Failed to save settings")
      }
    } catch (error) {
      console.error("Save error:", error)
      setMessage({ type: "error", text: "Failed to save settings" })
    } finally {
      setSaving(false)
    }
  }

  const updateProvider = (id: string, field: keyof OAuthProvider, value: any) => {
    setProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">OAuth Login Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure third-party login providers for your application
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-md ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid gap-6">
        {providers.map((provider) => (
          <Card key={provider.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{provider.icon}</span>
                  <div>
                    <CardTitle>{provider.name} OAuth</CardTitle>
                    <CardDescription>
                      Configure {provider.name} login integration
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`${provider.id}-enabled`}>Enable</Label>
                  <Switch
                    id={`${provider.id}-enabled`}
                    checked={provider.enabled}
                    onCheckedChange={(checked) =>
                      updateProvider(provider.id, "enabled", checked)
                    }
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`${provider.id}-client-id`}>Client ID</Label>
                <Input
                  id={`${provider.id}-client-id`}
                  type="text"
                  placeholder={`Enter ${provider.name} Client ID`}
                  value={provider.clientId}
                  onChange={(e) =>
                    updateProvider(provider.id, "clientId", e.target.value)
                  }
                  disabled={!provider.enabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${provider.id}-client-secret`}>
                  Client Secret
                </Label>
                <Input
                  id={`${provider.id}-client-secret`}
                  type="password"
                  placeholder={`Enter ${provider.name} Client Secret`}
                  value={provider.clientSecret}
                  onChange={(e) =>
                    updateProvider(provider.id, "clientSecret", e.target.value)
                  }
                  disabled={!provider.enabled}
                />
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Callback URL for {provider.name}:
                  </span>
                  <code className="px-2 py-1 bg-muted rounded text-xs">
                    {process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}
                    /api/auth/callback/{provider.id}
                  </code>
                </div>
                <div className="mt-2">
                  <a
                    href={provider.setupUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    → Setup guide: {provider.setupUrl}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={loadSettings} disabled={saving}>
          Reset
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">📝 Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>
            <strong>1. Create OAuth Application:</strong> Visit the provider's
            developer console and create a new OAuth application.
          </p>
          <p>
            <strong>2. Configure Callback URL:</strong> Add the callback URL shown
            above to your OAuth application settings.
          </p>
          <p>
            <strong>3. Get Credentials:</strong> Copy the Client ID and Client
            Secret from the provider.
          </p>
          <p>
            <strong>4. Enable & Save:</strong> Enable the provider, paste the
            credentials, and click Save.
          </p>
          <p className="pt-2 border-t border-blue-300">
            <strong>Note:</strong> For production, make sure to update the callback
            URL to use your production domain (HTTPS).
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
