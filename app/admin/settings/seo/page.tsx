"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SEOSettings {
  seo_title: string
  seo_description: string
  seo_keywords: string
  og_title: string
  og_description: string
  og_image: string
  twitter_card: string
  twitter_site: string
  twitter_creator: string
  google_analytics_id: string
  google_site_verification: string
  robots_txt: string
}

export default function SEOSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<SEOSettings>({
    seo_title: "",
    seo_description: "",
    seo_keywords: "",
    og_title: "",
    og_description: "",
    og_image: "",
    twitter_card: "summary_large_image",
    twitter_site: "",
    twitter_creator: "",
    google_analytics_id: "",
    google_site_verification: "",
    robots_txt: "",
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
          seo_title: data.settings.seo_title || "",
          seo_description: data.settings.seo_description || "",
          seo_keywords: data.settings.seo_keywords || "",
          og_title: data.settings.og_title || "",
          og_description: data.settings.og_description || "",
          og_image: data.settings.og_image || "",
          twitter_card: data.settings.twitter_card || "summary_large_image",
          twitter_site: data.settings.twitter_site || "",
          twitter_creator: data.settings.twitter_creator || "",
          google_analytics_id: data.settings.google_analytics_id || "",
          google_site_verification: data.settings.google_site_verification || "",
          robots_txt: data.settings.robots_txt || "",
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
        alert("SEO 设置保存成功！")
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

  const handleChange = (key: keyof SEOSettings, value: string) => {
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
      {/* 基础 SEO */}
      <Card>
        <CardHeader>
          <CardTitle>基础 SEO</CardTitle>
          <CardDescription>配置网站的基本搜索引擎优化信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              SEO 标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={settings.seo_title}
              onChange={(e) => handleChange("seo_title", e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="AI Website Tools - Powerful Online Tools"
            />
            <p className="text-xs text-muted-foreground mt-1">
              显示在搜索结果中的标题（建议 50-60 字符）
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              SEO 描述 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={settings.seo_description}
              onChange={(e) => handleChange("seo_description", e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Discover powerful AI-powered tools for your daily tasks..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              显示在搜索结果中的描述（建议 150-160 字符）
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              关键词
            </label>
            <input
              type="text"
              value={settings.seo_keywords}
              onChange={(e) => handleChange("seo_keywords", e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="AI tools, online tools, productivity"
            />
            <p className="text-xs text-muted-foreground mt-1">
              用逗号分隔的关键词列表
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Open Graph */}
      <Card>
        <CardHeader>
          <CardTitle>Open Graph (社交媒体)</CardTitle>
          <CardDescription>配置在社交媒体分享时显示的信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              OG 标题
            </label>
            <input
              type="text"
              value={settings.og_title}
              onChange={(e) => handleChange("og_title", e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="留空则使用 SEO 标题"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              OG 描述
            </label>
            <textarea
              value={settings.og_description}
              onChange={(e) => handleChange("og_description", e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="留空则使用 SEO 描述"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              OG 图片 URL
            </label>
            <input
              type="url"
              value={settings.og_image}
              onChange={(e) => handleChange("og_image", e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://example.com/og-image.jpg"
            />
            <p className="text-xs text-muted-foreground mt-1">
              建议尺寸：1200x630 像素
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Twitter Card */}
      <Card>
        <CardHeader>
          <CardTitle>Twitter Card</CardTitle>
          <CardDescription>配置 Twitter 分享卡片</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Card 类型
            </label>
            <select
              value={settings.twitter_card}
              onChange={(e) => handleChange("twitter_card", e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="summary">Summary</option>
              <option value="summary_large_image">Summary Large Image</option>
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">
                Twitter Site
              </label>
              <input
                type="text"
                value={settings.twitter_site}
                onChange={(e) => handleChange("twitter_site", e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="@yoursite"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Twitter Creator
              </label>
              <input
                type="text"
                value={settings.twitter_creator}
                onChange={(e) => handleChange("twitter_creator", e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="@creator"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 分析和验证 */}
      <Card>
        <CardHeader>
          <CardTitle>分析和验证</CardTitle>
          <CardDescription>配置第三方服务集成</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Google Analytics ID
            </label>
            <input
              type="text"
              value={settings.google_analytics_id}
              onChange={(e) => handleChange("google_analytics_id", e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="G-XXXXXXXXXX"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Google Analytics 4 测量 ID
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Google Site Verification
            </label>
            <input
              type="text"
              value={settings.google_site_verification}
              onChange={(e) => handleChange("google_site_verification", e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="验证码"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Google Search Console 验证码
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Robots.txt */}
      <Card>
        <CardHeader>
          <CardTitle>Robots.txt</CardTitle>
          <CardDescription>配置搜索引擎爬虫规则</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Robots.txt 内容
            </label>
            <textarea
              value={settings.robots_txt}
              onChange={(e) => handleChange("robots_txt", e.target.value)}
              rows={8}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
              placeholder={`User-agent: *\nAllow: /\n\nSitemap: https://example.com/sitemap.xml`}
            />
            <p className="text-xs text-muted-foreground mt-1">
              自定义 robots.txt 文件内容
            </p>
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
