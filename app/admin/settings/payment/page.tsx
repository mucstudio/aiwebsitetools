"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff } from "lucide-react"

interface PaymentSettings {
  stripe_publishable_key: string
  stripe_secret_key: string
  stripe_webhook_secret: string
  stripe_connection_status?: string
  stripe_connected_at?: string
  paypal_client_id: string
  paypal_client_secret: string
  paypal_webhook_id: string
  paypal_connection_status?: string
  paypal_connected_at?: string
  payment_currency: string
  payment_enabled: boolean
  test_mode: boolean
}

export default function PaymentSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showSecretKey, setShowSecretKey] = useState(false)
  const [showWebhookSecret, setShowWebhookSecret] = useState(false)
  const [showPayPalSecret, setShowPayPalSecret] = useState(false)
  const [connectingStripe, setConnectingStripe] = useState(false)
  const [connectingPayPal, setConnectingPayPal] = useState(false)
  const [settings, setSettings] = useState<PaymentSettings>({
    stripe_publishable_key: "",
    stripe_secret_key: "",
    stripe_webhook_secret: "",
    paypal_client_id: "",
    paypal_client_secret: "",
    paypal_webhook_id: "",
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
          stripe_connection_status: data.settings.stripe_connection_status || "disconnected",
          stripe_connected_at: data.settings.stripe_connected_at || "",
          paypal_client_id: data.settings.paypal_client_id || "",
          paypal_client_secret: data.settings.paypal_client_secret || "",
          paypal_webhook_id: data.settings.paypal_webhook_id || "",
          paypal_connection_status: data.settings.paypal_connection_status || "disconnected",
          paypal_connected_at: data.settings.paypal_connected_at || "",
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
          <CardDescription>使用 OAuth 安全连接或手动配置 Stripe</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* OAuth Connection Status */}
          {settings.stripe_connection_status === "connected" ? (
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
                    ✓ Stripe 已连接
                  </h4>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    连接时间: {settings.stripe_connected_at ? new Date(settings.stripe_connected_at).toLocaleString("zh-CN") : "未知"}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (!confirm("确定要断开 Stripe 连接吗？")) return
                    try {
                      const response = await fetch("/api/connect/stripe/disconnect", {
                        method: "POST"
                      })
                      if (response.ok) {
                        alert("Stripe 已断开连接")
                        loadSettings()
                      } else {
                        alert("断开连接失败")
                      }
                    } catch (error) {
                      alert("断开连接失败")
                    }
                  }}
                >
                  断开连接
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                推荐：使用 OAuth 安全连接
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                通过 OAuth 连接更安全，无需手动复制密钥，支持一键授权和撤销
              </p>
              <Button
                onClick={async () => {
                  setConnectingStripe(true)
                  try {
                    const response = await fetch("/api/connect/stripe")
                    const data = await response.json()
                    if (data.url) {
                      window.location.href = data.url
                    } else {
                      alert("获取连接URL失败")
                    }
                  } catch (error) {
                    alert("连接失败，请稍后重试")
                  } finally {
                    setConnectingStripe(false)
                  }
                }}
                disabled={connectingStripe}
                className="w-full"
              >
                {connectingStripe ? "连接中..." : "🔗 使用 OAuth 连接 Stripe"}
              </Button>
              <div className="mt-3 text-center">
                <p className="text-xs text-muted-foreground">或者手动配置密钥（不推荐）</p>
              </div>
            </div>
          )}

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

      {/* PayPal 配置 */}
      <Card>
        <CardHeader>
          <CardTitle>PayPal 配置</CardTitle>
          <CardDescription>使用 OAuth 安全连接或手动配置 PayPal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* OAuth Connection Status */}
          {settings.paypal_connection_status === "connected" ? (
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
                    ✓ PayPal 已连接
                  </h4>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    连接时间: {settings.paypal_connected_at ? new Date(settings.paypal_connected_at).toLocaleString("zh-CN") : "未知"}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (!confirm("确定要断开 PayPal 连接吗？")) return
                    try {
                      const response = await fetch("/api/connect/paypal/disconnect", {
                        method: "POST"
                      })
                      if (response.ok) {
                        alert("PayPal 已断开连接")
                        loadSettings()
                      } else {
                        alert("断开连接失败")
                      }
                    } catch (error) {
                      alert("断开连接失败")
                    }
                  }}
                >
                  断开连接
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                推荐：使用 OAuth 安全连接
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                通过 PayPal Commerce Platform 连接更安全，自动配置 webhook
              </p>
              <Button
                onClick={async () => {
                  setConnectingPayPal(true)
                  try {
                    const response = await fetch("/api/connect/paypal")
                    const data = await response.json()
                    if (data.url) {
                      window.location.href = data.url
                    } else {
                      alert("获取连接URL失败")
                    }
                  } catch (error) {
                    alert("连接失败，请稍后重试")
                  } finally {
                    setConnectingPayPal(false)
                  }
                }}
                disabled={connectingPayPal}
                className="w-full bg-[#0070ba] hover:bg-[#005ea6]"
              >
                {connectingPayPal ? "连接中..." : "🔗 使用 OAuth 连接 PayPal"}
              </Button>
              <div className="mt-3 text-center">
                <p className="text-xs text-muted-foreground">或者手动配置密钥（不推荐）</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              Client ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={settings.paypal_client_id}
              onChange={(e) => handleChange("paypal_client_id", e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
              placeholder="AXxxx..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              PayPal Client ID（公开密钥）
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Client Secret <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPayPalSecret ? "text" : "password"}
                value={settings.paypal_client_secret}
                onChange={(e) => handleChange("paypal_client_secret", e.target.value)}
                className="w-full px-4 py-2 pr-12 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                placeholder="EXxxx..."
              />
              <button
                type="button"
                onClick={() => setShowPayPalSecret(!showPayPalSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPayPalSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              PayPal Client Secret（保密）
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Webhook ID
            </label>
            <input
              type="text"
              value={settings.paypal_webhook_id}
              onChange={(e) => handleChange("paypal_webhook_id", e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
              placeholder="WH-xxx..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              PayPal Webhook ID（用于验证webhook签名）
            </p>
          </div>

          <div className="pt-4 border-t">
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                配置 Webhook
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                在 PayPal Developer Dashboard 中配置 Webhook 端点：
              </p>
              <code className="block bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 px-3 py-2 rounded text-xs font-mono">
                {typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/api/webhooks/paypal
              </code>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                需要监听的事件：BILLING.SUBSCRIPTION.CREATED, BILLING.SUBSCRIPTION.UPDATED, BILLING.SUBSCRIPTION.CANCELLED, PAYMENT.SALE.COMPLETED
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

      {/* OAuth 配置教程 */}
      <Card className="mt-8 border-2 border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📚 如何配置 OAuth 连接
          </CardTitle>
          <CardDescription>
            使用 OAuth 连接更安全，无需手动复制密钥。以下是配置步骤：
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stripe Connect 配置教程 */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
              配置 Stripe Connect OAuth
            </h3>
            <div className="ml-8 space-y-3 text-sm">
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="font-medium">步骤 1: 创建 Stripe Connect 应用</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
                  <li>访问 <a href="https://dashboard.stripe.com/settings/applications" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Stripe Dashboard → Settings → Connect</a></li>
                  <li>点击 "Create application" 或查看现有应用</li>
                  <li>复制 <code className="bg-background px-2 py-0.5 rounded">Client ID</code>（格式：ca_xxx）</li>
                </ol>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="font-medium">步骤 2: 配置环境变量</p>
                <p className="text-muted-foreground">在服务器的 <code className="bg-background px-2 py-0.5 rounded">.env</code> 文件中添加：</p>
                <pre className="bg-background p-3 rounded border text-xs overflow-x-auto">
{`STRIPE_CONNECT_CLIENT_ID=ca_xxx  # 你的 Client ID`}
                </pre>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="font-medium">步骤 3: 配置回调 URL</p>
                <p className="text-muted-foreground">在 Stripe Connect 应用设置中添加回调 URL：</p>
                <pre className="bg-background p-3 rounded border text-xs overflow-x-auto">
{`${typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/api/connect/stripe/callback`}
                </pre>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="font-medium">步骤 4: 重启应用并测试</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
                  <li>重启 Node.js 应用以加载新的环境变量</li>
                  <li>刷新此页面</li>
                  <li>点击 "🔗 使用 OAuth 连接 Stripe" 按钮</li>
                  <li>在 Stripe 页面登录并授权</li>
                </ol>
              </div>
            </div>
          </div>

          {/* PayPal Commerce Platform 配置教程 */}
          <div className="pt-6 border-t">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
              配置 PayPal Commerce Platform OAuth
            </h3>
            <div className="ml-8 space-y-3 text-sm">
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="font-medium">步骤 1: 注册成为 PayPal Partner</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
                  <li>访问 <a href="https://developer.paypal.com/home" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">PayPal Developer Portal</a></li>
                  <li>申请成为 PayPal Partner（需要审核，通常1-3个工作日）</li>
                  <li>获取 <code className="bg-background px-2 py-0.5 rounded">Partner ID</code></li>
                </ol>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="font-medium">步骤 2: 配置环境变量</p>
                <p className="text-muted-foreground">在服务器的 <code className="bg-background px-2 py-0.5 rounded">.env</code> 文件中添加：</p>
                <pre className="bg-background p-3 rounded border text-xs overflow-x-auto">
{`PAYPAL_PARTNER_ID=xxx        # 你的 Partner ID
PAYPAL_MODE=sandbox          # 测试环境用 sandbox，生产环境用 live
PAYPAL_CLIENT_ID=xxx         # 你的 PayPal App Client ID
PAYPAL_CLIENT_SECRET=xxx     # 你的 PayPal App Secret`}
                </pre>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="font-medium">步骤 3: 配置回调 URL</p>
                <p className="text-muted-foreground">在 PayPal Partner 设置中添加回调 URL：</p>
                <pre className="bg-background p-3 rounded border text-xs overflow-x-auto">
{`${typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/api/connect/paypal/callback`}
                </pre>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="font-medium">步骤 4: 重启应用并测试</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
                  <li>重启 Node.js 应用以加载新的环境变量</li>
                  <li>刷新此页面</li>
                  <li>点击 "🔗 使用 OAuth 连接 PayPal" 按钮</li>
                  <li>在 PayPal 页面登录并授权</li>
                </ol>
              </div>
            </div>
          </div>

          {/* 注意事项 */}
          <div className="pt-6 border-t">
            <h3 className="text-lg font-semibold mb-3">⚠️ 重要提示</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <p><strong>单商户场景：</strong>如果这是你自己的网站，用户支付给你，建议使用"手动配置密钥"方式，更简单直接。</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <p><strong>多商户平台：</strong>如果你要支持多个商户各自收款（类似 Shopify、WooCommerce），才需要使用 OAuth 方式。</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <p><strong>环境变量：</strong>修改 .env 文件后，必须重启 Node.js 应用才能生效。</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <p><strong>测试环境：</strong>建议先在 sandbox/test 模式下测试，确认无误后再切换到生产环境。</p>
              </div>
            </div>
          </div>

          {/* 快速链接 */}
          <div className="pt-6 border-t">
            <h3 className="text-lg font-semibold mb-3">🔗 相关文档链接</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <a
                href="https://stripe.com/docs/connect/oauth-reference"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <span>📘</span>
                <span>Stripe Connect OAuth 文档</span>
              </a>
              <a
                href="https://developer.paypal.com/api/rest/partner-referrals/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <span>📗</span>
                <span>PayPal Partner Referrals 文档</span>
              </a>
              <a
                href="https://dashboard.stripe.com/settings/applications"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <span>⚙️</span>
                <span>Stripe Connect 设置</span>
              </a>
              <a
                href="https://developer.paypal.com/home"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <span>⚙️</span>
                <span>PayPal Developer Portal</span>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
