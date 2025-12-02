"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface FeatureSettings {
  enable_user_dashboard: boolean
  enable_favorites: boolean
  enable_usage_tracking: boolean
  enable_api_access: boolean
  enable_tool_ratings: boolean
  enable_tool_comments: boolean
  enable_tool_sharing: boolean
  enable_dark_mode: boolean
  enable_notifications: boolean
  enable_newsletter: boolean
  enable_blog: boolean
  enable_documentation: boolean
  enable_support_chat: boolean
  enable_analytics: boolean
  maintenance_mode: boolean
  maintenance_message: string
}

export default function FeaturesSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<FeatureSettings>({
    enable_user_dashboard: true,
    enable_favorites: true,
    enable_usage_tracking: true,
    enable_api_access: false,
    enable_tool_ratings: true,
    enable_tool_comments: true,
    enable_tool_sharing: true,
    enable_dark_mode: true,
    enable_notifications: true,
    enable_newsletter: true,
    enable_blog: true,
    enable_documentation: true,
    enable_support_chat: false,
    enable_analytics: true,
    maintenance_mode: false,
    maintenance_message: "",
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
          enable_user_dashboard: data.settings.enable_user_dashboard !== false,
          enable_favorites: data.settings.enable_favorites !== false,
          enable_usage_tracking: data.settings.enable_usage_tracking !== false,
          enable_api_access: data.settings.enable_api_access === true,
          enable_tool_ratings: data.settings.enable_tool_ratings !== false,
          enable_tool_comments: data.settings.enable_tool_comments !== false,
          enable_tool_sharing: data.settings.enable_tool_sharing !== false,
          enable_dark_mode: data.settings.enable_dark_mode !== false,
          enable_notifications: data.settings.enable_notifications !== false,
          enable_newsletter: data.settings.enable_newsletter !== false,
          enable_blog: data.settings.enable_blog !== false,
          enable_documentation: data.settings.enable_documentation !== false,
          enable_support_chat: data.settings.enable_support_chat === true,
          enable_analytics: data.settings.enable_analytics !== false,
          maintenance_mode: data.settings.maintenance_mode === true,
          maintenance_message: data.settings.maintenance_message || "",
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
        alert("功能设置保存成功！")
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

  const handleChange = (key: keyof FeatureSettings, value: string | boolean) => {
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
      {/* 核心功能 */}
      <Card>
        <CardHeader>
          <CardTitle>核心功能</CardTitle>
          <CardDescription>控制网站的核心功能模块</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <label className="text-sm font-medium">
                用户仪表板
              </label>
              <p className="text-xs text-muted-foreground">
                用户个人中心和数据统计
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enable_user_dashboard}
                onChange={(e) => handleChange("enable_user_dashboard", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <label className="text-sm font-medium">
                收藏功能
              </label>
              <p className="text-xs text-muted-foreground">
                允许用户收藏工具
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enable_favorites}
                onChange={(e) => handleChange("enable_favorites", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <label className="text-sm font-medium">
                使用量跟踪
              </label>
              <p className="text-xs text-muted-foreground">
                记录用户的工具使用情况
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enable_usage_tracking}
                onChange={(e) => handleChange("enable_usage_tracking", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <label className="text-sm font-medium">
                API 访问
              </label>
              <p className="text-xs text-muted-foreground">
                允许通过 API 访问工具
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enable_api_access}
                onChange={(e) => handleChange("enable_api_access", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* 社交功能 */}
      <Card>
        <CardHeader>
          <CardTitle>社交功能</CardTitle>
          <CardDescription>用户互动和社交相关功能</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <label className="text-sm font-medium">
                工具评分
              </label>
              <p className="text-xs text-muted-foreground">
                允许用户对工具进行评分
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enable_tool_ratings}
                onChange={(e) => handleChange("enable_tool_ratings", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <label className="text-sm font-medium">
                工具评论
              </label>
              <p className="text-xs text-muted-foreground">
                允许用户发表评论
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enable_tool_comments}
                onChange={(e) => handleChange("enable_tool_comments", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <label className="text-sm font-medium">
                工具分享
              </label>
              <p className="text-xs text-muted-foreground">
                允许分享工具到社交媒体
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enable_tool_sharing}
                onChange={(e) => handleChange("enable_tool_sharing", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* 界面功能 */}
      <Card>
        <CardHeader>
          <CardTitle>界面功能</CardTitle>
          <CardDescription>用户界面相关功能</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <label className="text-sm font-medium">
                深色模式
              </label>
              <p className="text-xs text-muted-foreground">
                允许用户切换深色主题
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enable_dark_mode}
                onChange={(e) => handleChange("enable_dark_mode", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <label className="text-sm font-medium">
                通知功能
              </label>
              <p className="text-xs text-muted-foreground">
                系统通知和消息提醒
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enable_notifications}
                onChange={(e) => handleChange("enable_notifications", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* 内容功能 */}
      <Card>
        <CardHeader>
          <CardTitle>内容功能</CardTitle>
          <CardDescription>网站内容相关功能</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <label className="text-sm font-medium">
                博客
              </label>
              <p className="text-xs text-muted-foreground">
                显示博客文章和新闻
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enable_blog}
                onChange={(e) => handleChange("enable_blog", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <label className="text-sm font-medium">
                文档中心
              </label>
              <p className="text-xs text-muted-foreground">
                使用文档和帮助中心
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enable_documentation}
                onChange={(e) => handleChange("enable_documentation", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <label className="text-sm font-medium">
                邮件订阅
              </label>
              <p className="text-xs text-muted-foreground">
                允许用户订阅新闻邮件
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enable_newsletter}
                onChange={(e) => handleChange("enable_newsletter", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* 支持和分析 */}
      <Card>
        <CardHeader>
          <CardTitle>支持和分析</CardTitle>
          <CardDescription>客户支持和数据分析功能</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <label className="text-sm font-medium">
                在线客服
              </label>
              <p className="text-xs text-muted-foreground">
                实时聊天支持功能
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enable_support_chat}
                onChange={(e) => handleChange("enable_support_chat", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <label className="text-sm font-medium">
                数据分析
              </label>
              <p className="text-xs text-muted-foreground">
                Google Analytics 等分析工具
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enable_analytics}
                onChange={(e) => handleChange("enable_analytics", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* 维护模式 */}
      <Card>
        <CardHeader>
          <CardTitle>维护模式</CardTitle>
          <CardDescription>临时关闭网站进行维护</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <label className="text-sm font-medium">
                启用维护模式
              </label>
              <p className="text-xs text-muted-foreground">
                网站将显示维护页面（管理员仍可访问）
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenance_mode}
                onChange={(e) => handleChange("maintenance_mode", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {settings.maintenance_mode && (
            <div>
              <label className="block text-sm font-medium mb-2">
                维护提示信息
              </label>
              <textarea
                value={settings.maintenance_message}
                onChange={(e) => handleChange("maintenance_message", e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="网站正在维护中，预计将在 1 小时后恢复正常。感谢您的耐心等待！"
              />
              <p className="text-xs text-muted-foreground mt-1">
                显示给用户的维护提示信息
              </p>
            </div>
          )}

          {settings.maintenance_mode && (
            <div className="pt-4 border-t">
              <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                  警告
                </h4>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  维护模式已启用！普通用户将无法访问网站。请在维护完成后及时关闭维护模式。
                </p>
              </div>
            </div>
          )}
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
