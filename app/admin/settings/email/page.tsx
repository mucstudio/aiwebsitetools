"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff } from "lucide-react"

interface EmailSettings {
  email_provider: string
  smtp_host: string
  smtp_port: string
  smtp_user: string
  smtp_password: string
  smtp_from_email: string
  smtp_from_name: string
  smtp_secure: boolean
  resend_api_key: string
  sendgrid_api_key: string
  email_enabled: boolean
}

export default function EmailSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showResendKey, setShowResendKey] = useState(false)
  const [showSendGridKey, setShowSendGridKey] = useState(false)
  const [settings, setSettings] = useState<EmailSettings>({
    email_provider: "smtp",
    smtp_host: "",
    smtp_port: "587",
    smtp_user: "",
    smtp_password: "",
    smtp_from_email: "",
    smtp_from_name: "",
    smtp_secure: true,
    resend_api_key: "",
    sendgrid_api_key: "",
    email_enabled: true,
  })

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
          email_provider: data.settings.email_provider || "smtp",
          smtp_host: data.settings.smtp_host || "",
          smtp_port: data.settings.smtp_port || "587",
          smtp_user: data.settings.smtp_user || "",
          smtp_password: data.settings.smtp_password || "",
          smtp_from_email: data.settings.smtp_from_email || "",
          smtp_from_name: data.settings.smtp_from_name || "",
          smtp_secure: data.settings.smtp_secure !== false,
          resend_api_key: data.settings.resend_api_key || "",
          sendgrid_api_key: data.settings.sendgrid_api_key || "",
          email_enabled: data.settings.email_enabled !== false,
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
        alert("邮件配置保存成功！")
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

  const handleChange = (key: keyof EmailSettings, value: string | boolean) => {
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
      {/* 邮件服务商 */}
      <Card>
        <CardHeader>
          <CardTitle>邮件服务商</CardTitle>
          <CardDescription>选择邮件发送服务</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              服务商 <span className="text-red-500">*</span>
            </label>
            <select
              value={settings.email_provider}
              onChange={(e) => handleChange("email_provider", e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="smtp">SMTP</option>
              <option value="resend">Resend</option>
              <option value="sendgrid">SendGrid</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <label className="text-sm font-medium">
                启用邮件功能
              </label>
              <p className="text-xs text-muted-foreground">
                关闭后系统将不发送任何邮件
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.email_enabled}
                onChange={(e) => handleChange("email_enabled", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* SMTP 配置 */}
      {settings.email_provider === "smtp" && (
        <Card>
          <CardHeader>
            <CardTitle>SMTP 配置</CardTitle>
            <CardDescription>配置 SMTP 服务器信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2">
                  SMTP 主机 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={settings.smtp_host}
                  onChange={(e) => handleChange("smtp_host", e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  SMTP 端口 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={settings.smtp_port}
                  onChange={(e) => handleChange("smtp_port", e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="587"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                SMTP 用户名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={settings.smtp_user}
                onChange={(e) => handleChange("smtp_user", e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="your-email@gmail.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                SMTP 密码 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={settings.smtp_password}
                  onChange={(e) => handleChange("smtp_password", e.target.value)}
                  className="w-full px-4 py-2 pr-12 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <label className="text-sm font-medium">
                  使用 TLS/SSL
                </label>
                <p className="text-xs text-muted-foreground">
                  启用安全连接（推荐）
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.smtp_secure}
                  onChange={(e) => handleChange("smtp_secure", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resend 配置 */}
      {settings.email_provider === "resend" && (
        <Card>
          <CardHeader>
            <CardTitle>Resend 配置</CardTitle>
            <CardDescription>配置 Resend API</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Resend API Key <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showResendKey ? "text" : "password"}
                  value={settings.resend_api_key}
                  onChange={(e) => handleChange("resend_api_key", e.target.value)}
                  className="w-full px-4 py-2 pr-12 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                  placeholder="re_..."
                />
                <button
                  type="button"
                  onClick={() => setShowResendKey(!showResendKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showResendKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                从 Resend Dashboard 获取 API Key
              </p>
            </div>

            <div className="pt-4 border-t">
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                  关于 Resend
                </h4>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Resend 是一个现代化的邮件发送服务，提供简单的 API 和优秀的开发体验。
                  访问 <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="underline">resend.com</a> 注册账号并获取 API Key。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SendGrid 配置 */}
      {settings.email_provider === "sendgrid" && (
        <Card>
          <CardHeader>
            <CardTitle>SendGrid 配置</CardTitle>
            <CardDescription>配置 SendGrid API</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                SendGrid API Key <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showSendGridKey ? "text" : "password"}
                  value={settings.sendgrid_api_key}
                  onChange={(e) => handleChange("sendgrid_api_key", e.target.value)}
                  className="w-full px-4 py-2 pr-12 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                  placeholder="SG...."
                />
                <button
                  type="button"
                  onClick={() => setShowSendGridKey(!showSendGridKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showSendGridKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                从 SendGrid Dashboard 获取 API Key
              </p>
            </div>

            <div className="pt-4 border-t">
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                  关于 SendGrid
                </h4>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  SendGrid 是 Twilio 旗下的企业级邮件发送服务。
                  访问 <a href="https://sendgrid.com" target="_blank" rel="noopener noreferrer" className="underline">sendgrid.com</a> 注册账号并获取 API Key。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 发件人信息 */}
      <Card>
        <CardHeader>
          <CardTitle>发件人信息</CardTitle>
          <CardDescription>配置邮件发件人信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">
                发件人邮箱 <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={settings.smtp_from_email}
                onChange={(e) => handleChange("smtp_from_email", e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="noreply@aiwebsitetools.com"
              />
              <p className="text-xs text-muted-foreground mt-1">
                显示为邮件发件人的邮箱地址
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                发件人名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={settings.smtp_from_name}
                onChange={(e) => handleChange("smtp_from_name", e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="留空则自动使用网站名称"
              />
              <p className="text-xs text-muted-foreground mt-1">
                显示为邮件发件人的名称，留空则自动使用网站名称
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 测试邮件 */}
      <Card>
        <CardHeader>
          <CardTitle>测试邮件</CardTitle>
          <CardDescription>发送测试邮件验证配置</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              测试邮箱地址
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                id="test-email"
                className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="test@example.com"
              />
              <Button
                variant="outline"
                onClick={async () => {
                  const emailInput = document.getElementById("test-email") as HTMLInputElement
                  const email = emailInput?.value
                  if (!email) {
                    alert("请输入测试邮箱地址")
                    return
                  }
                  try {
                    const response = await fetch("/api/admin/settings/test-email", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ email }),
                    })
                    const data = await response.json()
                    if (response.ok) {
                      alert("测试邮件已发送，请检查收件箱！")
                    } else {
                      alert("发送失败：" + (data.error || "未知错误"))
                    }
                  } catch (error) {
                    alert("发送失败，请检查配置")
                  }
                }}
              >
                发送测试邮件
              </Button>
            </div>
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
