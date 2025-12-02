"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SecuritySettings {
  require_email_verification: boolean
  allow_registration: boolean
  allow_social_login: boolean
  session_timeout: string
  max_login_attempts: string
  lockout_duration: string
  password_min_length: string
  password_require_uppercase: boolean
  password_require_lowercase: boolean
  password_require_numbers: boolean
  password_require_special: boolean
  enable_2fa: boolean
  enable_captcha: boolean
  captcha_site_key: string
  captcha_secret_key: string
}

export default function SecuritySettingsPage() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<SecuritySettings>({
    require_email_verification: true,
    allow_registration: true,
    allow_social_login: true,
    session_timeout: "7",
    max_login_attempts: "5",
    lockout_duration: "15",
    password_min_length: "8",
    password_require_uppercase: true,
    password_require_lowercase: true,
    password_require_numbers: true,
    password_require_special: false,
    enable_2fa: false,
    enable_captcha: false,
    captcha_site_key: "",
    captcha_secret_key: "",
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
          require_email_verification: data.settings.require_email_verification !== false,
          allow_registration: data.settings.allow_registration !== false,
          allow_social_login: data.settings.allow_social_login !== false,
          session_timeout: data.settings.session_timeout || "7",
          max_login_attempts: data.settings.max_login_attempts || "5",
          lockout_duration: data.settings.lockout_duration || "15",
          password_min_length: data.settings.password_min_length || "8",
          password_require_uppercase: data.settings.password_require_uppercase !== false,
          password_require_lowercase: data.settings.password_require_lowercase !== false,
          password_require_numbers: data.settings.password_require_numbers !== false,
          password_require_special: data.settings.password_require_special === true,
          enable_2fa: data.settings.enable_2fa === true,
          enable_captcha: data.settings.enable_captcha === true,
          captcha_site_key: data.settings.captcha_site_key || "",
          captcha_secret_key: data.settings.captcha_secret_key || "",
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
        alert("安全设置保存成功！")
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

  const handleChange = (key: keyof SecuritySettings, value: string | boolean) => {
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
      {/* 用户认证 */}
      <Card>
        <CardHeader>
          <CardTitle>用户认证</CardTitle>
          <CardDescription>配置用户注册和登录选项</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <label className="text-sm font-medium">
                允许用户注册
              </label>
              <p className="text-xs text-muted-foreground">
                关闭后新用户无法注册账号
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allow_registration}
                onChange={(e) => handleChange("allow_registration", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <label className="text-sm font-medium">
                要求邮箱验证
              </label>
              <p className="text-xs text-muted-foreground">
                新用户需要验证邮箱才能使用
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.require_email_verification}
                onChange={(e) => handleChange("require_email_verification", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <label className="text-sm font-medium">
                允许社交登录
              </label>
              <p className="text-xs text-muted-foreground">
                允许使用 Google、GitHub 等第三方登录
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allow_social_login}
                onChange={(e) => handleChange("allow_social_login", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              会话超时时间（天）
            </label>
            <input
              type="number"
              value={settings.session_timeout}
              onChange={(e) => handleChange("session_timeout", e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              min="1"
              max="365"
            />
            <p className="text-xs text-muted-foreground mt-1">
              用户登录后会话保持的天数
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 登录保护 */}
      <Card>
        <CardHeader>
          <CardTitle>登录保护</CardTitle>
          <CardDescription>防止暴力破解和恶意登录</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">
                最大登录尝试次数
              </label>
              <input
                type="number"
                value={settings.max_login_attempts}
                onChange={(e) => handleChange("max_login_attempts", e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                min="3"
                max="10"
              />
              <p className="text-xs text-muted-foreground mt-1">
                超过此次数将锁定账号
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                锁定时长（分钟）
              </label>
              <input
                type="number"
                value={settings.lockout_duration}
                onChange={(e) => handleChange("lockout_duration", e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                min="5"
                max="1440"
              />
              <p className="text-xs text-muted-foreground mt-1">
                账号锁定的时长
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 密码策略 */}
      <Card>
        <CardHeader>
          <CardTitle>密码策略</CardTitle>
          <CardDescription>配置密码强度要求</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              最小密码长度
            </label>
            <input
              type="number"
              value={settings.password_min_length}
              onChange={(e) => handleChange("password_min_length", e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              min="6"
              max="32"
            />
            <p className="text-xs text-muted-foreground mt-1">
              密码最少字符数（建议 8 位以上）
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <p className="text-sm font-medium">密码必须包含：</p>

            <div className="flex items-center justify-between py-2">
              <div>
                <label className="text-sm">大写字母 (A-Z)</label>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.password_require_uppercase}
                  onChange={(e) => handleChange("password_require_uppercase", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <label className="text-sm">小写字母 (a-z)</label>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.password_require_lowercase}
                  onChange={(e) => handleChange("password_require_lowercase", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <label className="text-sm">数字 (0-9)</label>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.password_require_numbers}
                  onChange={(e) => handleChange("password_require_numbers", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <label className="text-sm">特殊字符 (!@#$%^&*)</label>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.password_require_special}
                  onChange={(e) => handleChange("password_require_special", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 双因素认证 */}
      <Card>
        <CardHeader>
          <CardTitle>双因素认证 (2FA)</CardTitle>
          <CardDescription>增强账号安全性</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <label className="text-sm font-medium">
                启用双因素认证
              </label>
              <p className="text-xs text-muted-foreground">
                允许用户启用 2FA 保护账号
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enable_2fa}
                onChange={(e) => handleChange("enable_2fa", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {settings.enable_2fa && (
            <div className="pt-4 border-t">
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                  关于双因素认证
                </h4>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  启用后，用户可以在账号设置中配置 2FA。支持 TOTP 应用（如 Google Authenticator、Authy）。
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CAPTCHA */}
      <Card>
        <CardHeader>
          <CardTitle>CAPTCHA 验证</CardTitle>
          <CardDescription>防止机器人和自动化攻击</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <label className="text-sm font-medium">
                启用 CAPTCHA
              </label>
              <p className="text-xs text-muted-foreground">
                在登录和注册页面显示验证码
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enable_captcha}
                onChange={(e) => handleChange("enable_captcha", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {settings.enable_captcha && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">
                  reCAPTCHA Site Key
                </label>
                <input
                  type="text"
                  value={settings.captcha_site_key}
                  onChange={(e) => handleChange("captcha_site_key", e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                  placeholder="6Lc..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  reCAPTCHA Secret Key
                </label>
                <input
                  type="password"
                  value={settings.captcha_secret_key}
                  onChange={(e) => handleChange("captcha_secret_key", e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                  placeholder="6Lc..."
                />
              </div>

              <div className="pt-4 border-t">
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                    获取 reCAPTCHA 密钥
                  </h4>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    访问 <a href="https://www.google.com/recaptcha/admin" target="_blank" rel="noopener noreferrer" className="underline">Google reCAPTCHA</a> 注册网站并获取密钥。推荐使用 reCAPTCHA v2 或 v3。
                  </p>
                </div>
              </div>
            </>
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
