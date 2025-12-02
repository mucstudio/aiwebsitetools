"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff } from "lucide-react"

interface PaymentSettings {
  stripe_publishable_key: string
  stripe_secret_key: string
  stripe_webhook_secret: string
  payment_currency: string
  payment_enabled: boolean
  test_mode: boolean
}

export default function PaymentSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showSecretKey, setShowSecretKey] = useState(false)
  const [showWebhookSecret, setShowWebhookSecret] = useState(false)
  const [settings, setSettings] = useState<PaymentSettings>({
    stripe_publishable_key: "",
    stripe_secret_key: "",
    stripe_webhook_secret: "",
    payment_currency: "USD",
    payment_enabled: true,
    test_mode: false,
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
          stripe_publishable_key: data.settings.stripe_publishable_key || "",
          stripe_secret_key: data.settings.stripe_secret_key || "",
          stripe_webhook_secret: data.settings.stripe_webhook_secret || "",
          payment_currency: data.settings.payment_currency || "USD",
          payment_enabled: data.settings.payment_enabled !== false,
          test_mode: data.settings.test_mode === true,
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
        alert("支付配置保存成功！")
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

  const handleChange = (key: keyof PaymentSettings, value: string | boolean) => {
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
      {/* Stripe 配置 */}
      <Card>
        <CardHeader>
          <CardTitle>Stripe 配置</CardTitle>
          <CardDescription>配置 Stripe 支付集成</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Publishable Key <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={settings.stripe_publishable_key}
              onChange={(e) => handleChange("stripe_publishable_key", e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
              placeholder="pk_test_..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              Stripe 可发布密钥（公开密钥）
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Secret Key <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showSecretKey ? "text" : "password"}
                value={settings.stripe_secret_key}
                onChange={(e) => handleChange("stripe_secret_key", e.target.value)}
                className="w-full px-4 py-2 pr-12 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                placeholder="sk_test_..."
              />
              <button
                type="button"
                onClick={() => setShowSecretKey(!showSecretKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Stripe 密钥（保密）
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Webhook Secret <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showWebhookSecret ? "text" : "password"}
                value={settings.stripe_webhook_secret}
                onChange={(e) => handleChange("stripe_webhook_secret", e.target.value)}
                className="w-full px-4 py-2 pr-12 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                placeholder="whsec_..."
              />
              <button
                type="button"
                onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showWebhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Stripe Webhook 签名密钥
            </p>
          </div>

          <div className="pt-4 border-t">
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                配置 Webhook
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                在 Stripe Dashboard 中配置 Webhook 端点：
              </p>
              <code className="block bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 px-3 py-2 rounded text-xs font-mono">
                {typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/api/webhooks/stripe
              </code>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                需要监听的事件：checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 支付设置 */}
      <Card>
        <CardHeader>
          <CardTitle>支付设置</CardTitle>
          <CardDescription>配置支付相关选项</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              货币
            </label>
            <select
              value={settings.payment_currency}
              onChange={(e) => handleChange("payment_currency", e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="USD">USD - 美元</option>
              <option value="EUR">EUR - 欧元</option>
              <option value="GBP">GBP - 英镑</option>
              <option value="CNY">CNY - 人民币</option>
              <option value="JPY">JPY - 日元</option>
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              默认支付货币
            </p>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <label className="text-sm font-medium">
                启用支付功能
              </label>
              <p className="text-xs text-muted-foreground">
                关闭后用户将无法进行支付
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.payment_enabled}
                onChange={(e) => handleChange("payment_enabled", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <label className="text-sm font-medium">
                测试模式
              </label>
              <p className="text-xs text-muted-foreground">
                使用 Stripe 测试密钥进行测试
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.test_mode}
                onChange={(e) => handleChange("test_mode", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* 测试连接 */}
      <Card>
        <CardHeader>
          <CardTitle>测试连接</CardTitle>
          <CardDescription>验证 Stripe 配置是否正确</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={async () => {
              try {
                const response = await fetch("/api/admin/settings/test-stripe", {
                  method: "POST",
                })
                const data = await response.json()
                if (response.ok) {
                  alert("Stripe 连接测试成功！")
                } else {
                  alert("连接失败：" + (data.error || "未知错误"))
                }
              } catch (error) {
                alert("连接测试失败，请检查配置")
              }
            }}
          >
            测试 Stripe 连接
          </Button>
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
