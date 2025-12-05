"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Menu } from "lucide-react"
import { ImageUpload } from "@/components/ui/image-upload"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface GeneralSettings {
  site_name: string
  site_description: string
  site_url: string
  site_logo: string
  site_favicon: string
  show_logo: boolean
  logo_type: "image" | "css"
  contact_email: string
  support_email: string
  company_name: string
  privacy_policy: string
  terms_of_service: string
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
    site_logo: "",
    site_favicon: "",
    show_logo: true,
    logo_type: "image",
    contact_email: "",
    support_email: "",
    company_name: "",
    privacy_policy: "",
    terms_of_service: "",
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
          site_logo: data.settings.site_logo || "",
          site_favicon: data.settings.site_favicon || "",
          show_logo: data.settings.show_logo === "true" || data.settings.show_logo === true,
          logo_type: (data.settings.logo_type as "image" | "css") || "image",
          contact_email: data.settings.contact_email || "hello@aiwebsitetools.com",
          support_email: data.settings.support_email || "support@aiwebsitetools.com",
          company_name: data.settings.company_name || "AI Website Tools Inc.",
          privacy_policy: data.settings.privacy_policy || `# Privacy Policy

Last updated: ${new Date().toLocaleDateString()}

## 1. Introduction
Welcome to AI Website Tools. We respect your privacy and are committed to protecting your personal data.

## 2. Data We Collect
We collect data to provide better services to all our users.
- **Personal Information**: Name, email address.
- **Usage Data**: How you use our tools.

## 3. How We Use Your Data
- To provide and maintain our Service.
- To notify you about changes to our Service.
- To provide customer support.

## 4. Contact Us
If you have any questions about this Privacy Policy, please contact us at hello@aiwebsitetools.com.`,
          terms_of_service: data.settings.terms_of_service || `# Terms of Service

Last updated: ${new Date().toLocaleDateString()}

## 1. Acceptance of Terms
By accessing or using our Service, you agree to be bound by these Terms.

## 2. Use of Service
You agree to use the Service only for lawful purposes and in accordance with these Terms.

## 3. Accounts
When you create an account with us, you must provide us information that is accurate, complete, and current at all times.

## 4. Intellectual Property
The Service and its original content, features, and functionality are and will remain the exclusive property of AI Website Tools.

## 5. Contact Us
If you have any questions about these Terms, please contact us at hello@aiwebsitetools.com.`,
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

  const handleChange = (key: keyof GeneralSettings, value: any) => {
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

      {/* 品牌设置 (Logo & Favicon) */}
      <Card>
        <CardHeader>
          <CardTitle>品牌设置</CardTitle>
          <CardDescription>配置网站 Logo 和图标</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">显示 Logo</Label>
              <p className="text-sm text-muted-foreground">
                在导航栏和页脚显示网站 Logo
              </p>
            </div>
            <Switch
              checked={settings.show_logo}
              onCheckedChange={(checked) => handleChange("show_logo", checked)}
            />
          </div>

          {settings.show_logo && (
            <div className="space-y-4">
              <Label className="text-base">Logo 类型</Label>
              <RadioGroup
                value={settings.logo_type}
                onValueChange={(value) => handleChange("logo_type", value)}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="image" id="logo-type-image" />
                  <Label htmlFor="logo-type-image">图片 Logo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="css" id="logo-type-css" />
                  <Label htmlFor="logo-type-css">CSS 动画 Logo (inspoaibox)</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <div className="grid gap-8 md:grid-cols-2">
            {settings.show_logo && settings.logo_type === "image" && (
              <div>
                <Label className="block text-sm font-medium mb-4">网站 Logo</Label>
                <ImageUpload
                  value={settings.site_logo}
                  onChange={(url) => handleChange("site_logo", url)}
                  onRemove={() => handleChange("site_logo", "")}
                  label="上传 Logo"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  建议尺寸: 200x50px 或正方形图标。支持 PNG, SVG, JPG。
                </p>
              </div>
            )}

            <div>
              <Label className="block text-sm font-medium mb-4">网站 Favicon</Label>
              <ImageUpload
                value={settings.site_favicon}
                onChange={(url) => handleChange("site_favicon", url)}
                onRemove={() => handleChange("site_favicon", "")}
                label="上传 Favicon"
              />
              <p className="text-xs text-muted-foreground mt-2">
                浏览器标签页图标。建议尺寸: 32x32px 或 64x64px。支持 ICO, PNG。
              </p>
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

      {/* 法律条款 */}
      <Card>
        <CardHeader>
          <CardTitle>法律条款</CardTitle>
          <CardDescription>编辑隐私政策和服务条款内容 (支持 Markdown)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              隐私政策 (Privacy Policy)
            </label>
            <textarea
              value={settings.privacy_policy}
              onChange={(e) => handleChange("privacy_policy", e.target.value)}
              rows={10}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
              placeholder="# Privacy Policy..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              显示在 <Link href="/privacy" className="underline hover:text-primary" target="_blank">/privacy</Link> 页面
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              服务条款 (Terms of Service)
            </label>
            <textarea
              value={settings.terms_of_service}
              onChange={(e) => handleChange("terms_of_service", e.target.value)}
              rows={10}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
              placeholder="# Terms of Service..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              显示在 <Link href="/terms" className="underline hover:text-primary" target="_blank">/terms</Link> 页面
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 其他设置链接 */}
      <Card>
        <CardHeader>
          <CardTitle>其他设置</CardTitle>
          <CardDescription>管理网站的其他配置选项</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div>
              <h4 className="font-medium">菜单管理</h4>
              <p className="text-sm text-muted-foreground">
                自定义网站顶部导航菜单，支持新建、编辑、删除和排序
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/admin/settings/menus">
                管理菜单 →
              </Link>
            </Button>
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
