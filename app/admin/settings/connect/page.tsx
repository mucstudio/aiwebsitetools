"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader2, Twitter, Github, Mail, Facebook, Youtube, Instagram, Linkedin } from "lucide-react"

interface ConnectSettings {
  showConnect: boolean
  twitter: string
  github: string
  email: string
  facebook: string
  youtube: string
  instagram: string
  linkedin: string
  tiktok: string
}

export default function ConnectSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<ConnectSettings>({
    showConnect: true,
    twitter: "",
    github: "",
    email: "",
    facebook: "",
    youtube: "",
    instagram: "",
    linkedin: "",
    tiktok: "",
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings/connect")
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch("/api/admin/settings/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        alert("设置已保存")
      } else {
        alert("保存失败")
      }
    } catch (error) {
      console.error("Save error:", error)
      alert("保存失败，请重试")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">社交连接设置</h1>
        <p className="text-muted-foreground">配置侧边栏底部的社交媒体链接</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>基本配置</CardTitle>
            <CardDescription>
              控制是否显示社交连接区域以及各个平台的链接地址
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="showConnect">显示社交连接区域</Label>
                <p className="text-sm text-muted-foreground">
                  关闭后侧边栏底部将不显示任何社交图标
                </p>
              </div>
              <Switch
                id="showConnect"
                checked={settings.showConnect}
                onCheckedChange={(checked) => setSettings({ ...settings, showConnect: checked })}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email
                </Label>
                <Input
                  id="email"
                  placeholder="hello@example.com"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter" className="flex items-center gap-2">
                  <Twitter className="h-4 w-4" /> Twitter / X
                </Label>
                <Input
                  id="twitter"
                  placeholder="https://twitter.com/username"
                  value={settings.twitter}
                  onChange={(e) => setSettings({ ...settings, twitter: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="github" className="flex items-center gap-2">
                  <Github className="h-4 w-4" /> GitHub
                </Label>
                <Input
                  id="github"
                  placeholder="https://github.com/username"
                  value={settings.github}
                  onChange={(e) => setSettings({ ...settings, github: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="facebook" className="flex items-center gap-2">
                  <Facebook className="h-4 w-4" /> Facebook
                </Label>
                <Input
                  id="facebook"
                  placeholder="https://facebook.com/username"
                  value={settings.facebook}
                  onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtube" className="flex items-center gap-2">
                  <Youtube className="h-4 w-4" /> YouTube
                </Label>
                <Input
                  id="youtube"
                  placeholder="https://youtube.com/@channel"
                  value={settings.youtube}
                  onChange={(e) => setSettings({ ...settings, youtube: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram" className="flex items-center gap-2">
                  <Instagram className="h-4 w-4" /> Instagram
                </Label>
                <Input
                  id="instagram"
                  placeholder="https://instagram.com/username"
                  value={settings.instagram}
                  onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin" className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4" /> LinkedIn
                </Label>
                <Input
                  id="linkedin"
                  placeholder="https://linkedin.com/in/username"
                  value={settings.linkedin}
                  onChange={(e) => setSettings({ ...settings, linkedin: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tiktok" className="flex items-center gap-2">
                  {/* Lucide doesn't have a TikTok icon yet, using a generic one or text */}
                  <span className="font-bold">TikTok</span>
                </Label>
                <Input
                  id="tiktok"
                  placeholder="https://tiktok.com/@username"
                  value={settings.tiktok}
                  onChange={(e) => setSettings({ ...settings, tiktok: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                保存设置
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}