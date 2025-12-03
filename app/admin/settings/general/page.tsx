"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface GeneralSettings {
  site_name: string
  site_description: string
  site_url: string
  contact_email: string
  support_email: string
  company_name: string
  usage_limits: {
    guest: {
      dailyLimit: number
    }
    user: {
      dailyLimit: number
    }
  }
}

export default function GeneralSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<GeneralSettings>({
    site_name: "",
    site_description: "",
    site_url: "",
    contact_email: "",
    support_email: "",
    company_name: "",
    usage_limits: {
      guest: { dailyLimit: 10 },
      user: { dailyLimit: 50 }
    }
  })

  // 加载设置
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/settings")
      const data = await response.json()

      if (data.settings) {
        setSettings({
          site_name: data.settings.site_name || "AI Website Tools",
          site_description: data.settings.site_description || "Powerful online tools for everyone",
          site_url: data.settings.site_url || "https://aiwebsitetools.com",
          contact_email: data.settings.contact_email || "hello@aiwebsitetools.com",
          support_email: data.settings.support_email || "support@aiwebsitetools.com",
          company_name: data.settings.company_name || "AI Website Tools Inc.",
          usage_limits: data.settings.usage_limits || {
            guest: { dailyLimit: 10 },
            user: { dailyLimit: 50 }
          }
        })
      }
    } catch (error) {
      console.error("Failed to load settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ settings }),
      })

      const data = await response.json()

      if (response.ok) {
        alert("设置保存成功！")
      } else {
        alert("保存失败：" + (data.error || "未知错误"))
      }
    } catch (error) {
      console.error("Failed to save settings:", error)
      alert("保存失败，请稍后重试")
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key: keyof GeneralSettings, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="text-center text-muted-foreground">
            加载中...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">基本设置</h1>
        <p className="text-muted-foreground mt-2">
          配置网站的基本信息和使用限制
        </p>
      </div>

      {/* 基本信息 */}
      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
          <CardDescription>配置网站的基本信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              网站名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={settings.site_name}
              onChange={(e) => handleChange("site_name", e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="AI Website Tools"
            />
            <p className="text-xs text-muted-foreground mt-1">
              显示在网站标题和页脚的名称
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              网站描述
            </label>
            <textarea
              value={settings.site_description}
              onChange={(e) => handleChange("site_description", e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Powerful online tools for everyone"
            />
            <p className="text-xs text-muted-foreground mt-1">
              简短描述网站的主要功能和特点
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">
                网站 URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={settings.site_url}
                onChange={(e) => handleChange("site_url", e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://aiwebsitetools.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                公司名称
              </label>
              <input
                type="text"
                value={settings.company_name}
                onChange={(e) => handleChange("company_name", e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="AI Website Tools Inc."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 联系信息 */}
      <Card>
        <CardHeader>
          <CardTitle>联系信息</CardTitle>
          <CardDescription>配置网站的联系方式</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">
                联系邮箱 <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={settings.contact_email}
                onChange={(e) => handleChange("contact_email", e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="hello@aiwebsitetools.com"
              />
              <p className="text-xs text-muted-foreground mt-1">
                显示在联系页面的邮箱地址
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                技术支持邮箱
              </label>
              <input
                type="email"
                value={settings.support_email}
                onChange={(e) => handleChange("support_email", e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="support@aiwebsitetools.com"
              />
              <p className="text-xs text-muted-foreground mt-1">
                用户支持和技术问题的邮箱
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 使用限制配置 */}
      <Card>
        <CardHeader>
          <CardTitle>使用限制配置</CardTitle>
          <CardDescription>配置游客和注册用户的每日使用次数限制</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">
                游客每日限制 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="-1"
                value={settings.usage_limits.guest.dailyLimit}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  usage_limits: {
                    ...prev.usage_limits,
                    guest: { dailyLimit: parseInt(e.target.value) || 0 }
                  }
                }))}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="10"
              />
              <p className="text-xs text-muted-foreground mt-1">
                游客每日可使用工具的次数，-1 表示无限制
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                注册用户每日限制 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="-1"
                value={settings.usage_limits.user.dailyLimit}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  usage_limits: {
                    ...prev.usage_limits,
                    user: { dailyLimit: parseInt(e.target.value) || 0 }
                  }
                }))}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="50"
              />
              <p className="text-xs text-muted-foreground mt-1">
                注册用户每日可使用工具的次数，-1 表示无限制
              </p>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="font-semibold text-sm mb-2">💡 说明</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• <strong>游客限制</strong>：基于设备指纹（硬件识别）+ IP 地址，防止更换浏览器绕过</li>
              <li>• <strong>注册用户限制</strong>：基于用户账号，不受设备和 IP 影响</li>
              <li>• <strong>订阅用户限制</strong>：在"订阅计划"中单独配置，通常为无限制或更高限额</li>
              <li>• 设置为 <code className="px-1 bg-gray-200 rounded">-1</code> 表示无限制使用</li>
              <li>• 使用次数每天 UTC 0:00 自动重置</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* 保存按钮 */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={loadSettings}
          disabled={saving}
        >
          重置
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "保存中..." : "保存设置"}
        </Button>
      </div>
    </div>
  )
}
