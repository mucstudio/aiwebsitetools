'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import LoadingSpinner from '@/components/LoadingSpinner'
import ImageUpload from '@/components/ImageUpload'
import { Settings, Save, Globe, Mail, Image, FileText, CheckCircle, AlertCircle, Users } from 'lucide-react'

interface SiteConfig {
  id: number
  siteName: string
  siteUrl: string
  description?: string
  logo?: string
  favicon?: string
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
  ogImage?: string
  smtpHost?: string
  smtpPort?: number
  smtpUser?: string
  smtpPassword?: string
  smtpFrom?: string
  smtpFromName?: string
  emailVerification: boolean
  guestUsageLimit: number
  guestResetDays: number
}

export default function AdminSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [config, setConfig] = useState<SiteConfig>({
    id: 0,
    siteName: 'Online Tools Platform',
    siteUrl: 'http://localhost:3000',
    emailVerification: true,
    guestUsageLimit: 10,
    guestResetDays: 30
  })

  useEffect(() => {
    checkAuth()
    fetchConfig()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check')
      const data = await response.json()
      if (!data.authenticated) {
        router.push('/admin/login')
      }
    } catch (error) {
      router.push('/admin/login')
    }
  }

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      const data = await response.json()

      if (data.success && data.config) {
        setConfig(data.config)
      }
    } catch (error) {
      console.error('Error fetching config:', error)
      showMessage('error', 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })

      const data = await response.json()

      if (response.ok) {
        showMessage('success', 'Settings saved successfully!')
      } else {
        showMessage('error', data.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving config:', error)
      showMessage('error', 'An error occurred while saving settings')
    } finally {
      setSaving(false)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleChange = (field: keyof SiteConfig, value: any) => {
    setConfig({ ...config, [field]: value })
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-8 h-8 text-primary-600" />
            Global Settings
          </h1>
          <p className="text-gray-600 mt-2">Configure your site settings, SEO, and email</p>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* General Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Globe className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">General Settings</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Name *
                </label>
                <input
                  type="text"
                  value={config.siteName}
                  onChange={(e) => handleChange('siteName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Online Tools Platform"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site URL *
                </label>
                <input
                  type="url"
                  value={config.siteUrl}
                  onChange={(e) => handleChange('siteUrl', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Description
                </label>
                <textarea
                  value={config.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="A brief description of your site"
                />
              </div>
            </div>
          </div>

          {/* Branding */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Image className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">Branding</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo
                </label>
                <ImageUpload
                  value={config.logo || ''}
                  onChange={(url) => handleChange('logo', url)}
                  label="Upload Logo"
                  maxSize={5}
                  preview={true}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Favicon
                </label>
                <ImageUpload
                  value={config.favicon || ''}
                  onChange={(url) => handleChange('favicon', url)}
                  label="Upload Favicon"
                  maxSize={2}
                  preview={true}
                />
                <p className="text-xs text-gray-500 mt-1">Recommended: 32x32px or 64x64px ICO/PNG file</p>
              </div>
            </div>
          </div>

          {/* SEO Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">SEO Settings</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Title
                </label>
                <input
                  type="text"
                  value={config.seoTitle || ''}
                  onChange={(e) => handleChange('seoTitle', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Best Online Tools Platform"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Description
                </label>
                <textarea
                  value={config.seoDescription || ''}
                  onChange={(e) => handleChange('seoDescription', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="A comprehensive collection of online tools for developers and creators"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Keywords
                </label>
                <textarea
                  value={config.seoKeywords || ''}
                  onChange={(e) => handleChange('seoKeywords', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="online tools, developer tools, text tools, image tools"
                />
                <p className="text-xs text-gray-500 mt-1">Comma-separated keywords</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Open Graph Image
                </label>
                <ImageUpload
                  value={config.ogImage || ''}
                  onChange={(url) => handleChange('ogImage', url)}
                  label="Upload OG Image"
                  maxSize={5}
                  preview={true}
                />
                <p className="text-xs text-gray-500 mt-1">Image shown when sharing on social media (1200x630px recommended)</p>
              </div>
            </div>
          </div>

          {/* Usage Limits */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">Usage Limits</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900 mb-2">
                  Configure usage limits for guest users (non-registered visitors). These limits help manage server resources and encourage user registration.
                </p>
                <p className="text-xs text-blue-700">
                  Registered users have different limits based on their membership tier (FREE: 50/month, PREMIUM: 500/month, ENTERPRISE: unlimited).
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guest Usage Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={config.guestUsageLimit}
                    onChange={(e) => handleChange('guestUsageLimit', parseInt(e.target.value) || 10)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="10"
                  />
                  <p className="text-xs text-gray-500 mt-1">Number of free uses for guest users (per device/IP)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reset Period (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={config.guestResetDays}
                    onChange={(e) => handleChange('guestResetDays', parseInt(e.target.value) || 30)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="30"
                  />
                  <p className="text-xs text-gray-500 mt-1">Days before guest usage count resets</p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Current Configuration:</h4>
                <p className="text-sm text-gray-700">
                  Guest users can use tools <span className="font-semibold text-primary-600">{config.guestUsageLimit} times</span> before needing to register.
                  Their usage count will reset every <span className="font-semibold text-primary-600">{config.guestResetDays} days</span>.
                </p>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-900">
                  <strong>Note:</strong> To integrate usage tracking in your tools, visit the <a href="/admin/api-docs" className="text-primary-600 hover:text-primary-700 underline">API Documentation</a> page for implementation guide and code examples.
                </p>
              </div>
            </div>
          </div>

          {/* Email Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Mail className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">Email Settings</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <input
                  type="checkbox"
                  id="emailVerification"
                  checked={config.emailVerification}
                  onChange={(e) => handleChange('emailVerification', e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="emailVerification" className="text-sm font-medium text-gray-900">
                  Enable Email Verification for New Users
                </label>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    value={config.smtpHost || ''}
                    onChange={(e) => handleChange('smtpHost', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="smtp.gmail.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Port
                  </label>
                  <input
                    type="number"
                    value={config.smtpPort || ''}
                    onChange={(e) => handleChange('smtpPort', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="587"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Username
                </label>
                <input
                  type="text"
                  value={config.smtpUser || ''}
                  onChange={(e) => handleChange('smtpUser', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="your-email@gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Password
                </label>
                <input
                  type="password"
                  value={config.smtpPassword || ''}
                  onChange={(e) => handleChange('smtpPassword', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <p className="text-xs text-gray-500 mt-1">Password will be encrypted when saved</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Email
                  </label>
                  <input
                    type="email"
                    value={config.smtpFrom || ''}
                    onChange={(e) => handleChange('smtpFrom', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="noreply@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Name
                  </label>
                  <input
                    type="text"
                    value={config.smtpFromName || ''}
                    onChange={(e) => handleChange('smtpFromName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Online Tools Platform"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
