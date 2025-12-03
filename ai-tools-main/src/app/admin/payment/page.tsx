'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import LoadingSpinner from '@/components/LoadingSpinner'
import { CreditCard, Save, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

interface PaymentConfig {
  id: number
  provider: string
  isEnabled: boolean
  publicKey: string | null
  secretKey: string | null
  webhookSecret: string | null
  testMode: boolean
}

export default function AdminPaymentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [stripeConfig, setStripeConfig] = useState({
    isEnabled: false,
    publicKey: '',
    secretKey: '',
    webhookSecret: '',
    testMode: true
  })

  const [paypalConfig, setPaypalConfig] = useState({
    isEnabled: false,
    publicKey: '',
    secretKey: '',
    webhookSecret: '',
    testMode: true
  })

  const [showStripeSecret, setShowStripeSecret] = useState(false)
  const [showPaypalSecret, setShowPaypalSecret] = useState(false)

  useEffect(() => {
    checkAuth()
    fetchConfigs()
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

  const fetchConfigs = async () => {
    try {
      const response = await fetch('/api/admin/payment-config')
      const data = await response.json()

      if (data.configs) {
        data.configs.forEach((config: PaymentConfig) => {
          if (config.provider === 'stripe') {
            setStripeConfig({
              isEnabled: config.isEnabled,
              publicKey: config.publicKey || '',
              secretKey: '', // Don't populate for security
              webhookSecret: '',
              testMode: config.testMode
            })
          } else if (config.provider === 'paypal') {
            setPaypalConfig({
              isEnabled: config.isEnabled,
              publicKey: config.publicKey || '',
              secretKey: '',
              webhookSecret: '',
              testMode: config.testMode
            })
          }
        })
      }
    } catch (error) {
      console.error('Error fetching configs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveStripe = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/payment-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'stripe',
          ...stripeConfig
        })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Stripe configuration saved successfully!' })
        // Clear secret fields after save
        setStripeConfig(prev => ({ ...prev, secretKey: '', webhookSecret: '' }))
      } else {
        const data = await response.json()
        setMessage({ type: 'error', text: data.error || 'Failed to save Stripe configuration' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while saving' })
    } finally {
      setSaving(false)
    }
  }

  const handleSavePaypal = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/payment-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'paypal',
          ...paypalConfig
        })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'PayPal configuration saved successfully!' })
        // Clear secret fields after save
        setPaypalConfig(prev => ({ ...prev, secretKey: '', webhookSecret: '' }))
      } else {
        const data = await response.json()
        setMessage({ type: 'error', text: data.error || 'Failed to save PayPal configuration' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while saving' })
    } finally {
      setSaving(false)
    }
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
            <CreditCard className="w-8 h-8 text-primary-600" />
            Payment Configuration
          </h1>
          <p className="text-gray-600 mt-2">Configure Stripe and PayPal payment gateways</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Stripe Configuration */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Stripe</h2>
                <p className="text-sm text-gray-600">Credit card payments</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Enable Stripe */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Enable Stripe</p>
                  <p className="text-sm text-gray-600">Accept credit card payments</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stripeConfig.isEnabled}
                    onChange={(e) => setStripeConfig({ ...stripeConfig, isEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {/* Test Mode */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Test Mode</p>
                  <p className="text-sm text-gray-600">Use test API keys</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stripeConfig.testMode}
                    onChange={(e) => setStripeConfig({ ...stripeConfig, testMode: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {/* Publishable Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Publishable Key *
                </label>
                <input
                  type="text"
                  value={stripeConfig.publicKey}
                  onChange={(e) => setStripeConfig({ ...stripeConfig, publicKey: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="pk_test_..."
                />
                <p className="text-xs text-gray-500 mt-1">Get from Stripe Dashboard → Developers → API keys</p>
              </div>

              {/* Secret Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secret Key *
                </label>
                <div className="relative">
                  <input
                    type={showStripeSecret ? 'text' : 'password'}
                    value={stripeConfig.secretKey}
                    onChange={(e) => setStripeConfig({ ...stripeConfig, secretKey: e.target.value })}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="sk_test_..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowStripeSecret(!showStripeSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showStripeSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Encrypted and stored securely</p>
              </div>

              {/* Webhook Secret */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook Secret (Optional)
                </label>
                <input
                  type="password"
                  value={stripeConfig.webhookSecret}
                  onChange={(e) => setStripeConfig({ ...stripeConfig, webhookSecret: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="whsec_..."
                />
                <p className="text-xs text-gray-500 mt-1">For webhook verification</p>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveStripe}
                disabled={saving || !stripeConfig.publicKey}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Stripe Configuration'}
              </button>
            </div>
          </div>

          {/* PayPal Configuration */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">PayPal</h2>
                <p className="text-sm text-gray-600">PayPal payments</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Enable PayPal */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Enable PayPal</p>
                  <p className="text-sm text-gray-600">Accept PayPal payments</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paypalConfig.isEnabled}
                    onChange={(e) => setPaypalConfig({ ...paypalConfig, isEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Test Mode */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Test Mode (Sandbox)</p>
                  <p className="text-sm text-gray-600">Use sandbox credentials</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paypalConfig.testMode}
                    onChange={(e) => setPaypalConfig({ ...paypalConfig, testMode: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Client ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client ID *
                </label>
                <input
                  type="text"
                  value={paypalConfig.publicKey}
                  onChange={(e) => setPaypalConfig({ ...paypalConfig, publicKey: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="AYSq3RDGsmBLJE-otTkBtM-jBRd1TCQwFf9RGfwddNXWz0uFU9ztymylOhRS"
                />
                <p className="text-xs text-gray-500 mt-1">Get from PayPal Developer Dashboard</p>
              </div>

              {/* Secret */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secret *
                </label>
                <div className="relative">
                  <input
                    type={showPaypalSecret ? 'text' : 'password'}
                    value={paypalConfig.secretKey}
                    onChange={(e) => setPaypalConfig({ ...paypalConfig, secretKey: e.target.value })}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="EGnHDxD_qRPdaLdZz8iCr8N7_MzF-YHOGtukA9dNLEzsHTTBngtRsgjlkjaE"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPaypalSecret(!showPaypalSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPaypalSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Encrypted and stored securely</p>
              </div>

              {/* Webhook ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook ID (Optional)
                </label>
                <input
                  type="text"
                  value={paypalConfig.webhookSecret}
                  onChange={(e) => setPaypalConfig({ ...paypalConfig, webhookSecret: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Webhook ID"
                />
                <p className="text-xs text-gray-500 mt-1">For webhook verification</p>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSavePaypal}
                disabled={saving || !paypalConfig.publicKey}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save PayPal Configuration'}
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Setup Instructions</h3>
          <div className="space-y-4 text-sm text-blue-800">
            <div>
              <p className="font-semibold mb-2">Stripe Setup:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Go to <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer" className="underline">Stripe Dashboard</a></li>
                <li>Navigate to Developers → API keys</li>
                <li>Copy your Publishable key and Secret key</li>
                <li>For webhooks: Create endpoint at /api/payment/webhook/stripe</li>
              </ol>
            </div>
            <div>
              <p className="font-semibold mb-2">PayPal Setup:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Go to <a href="https://developer.paypal.com" target="_blank" rel="noopener noreferrer" className="underline">PayPal Developer</a></li>
                <li>Create or select your app</li>
                <li>Copy your Client ID and Secret</li>
                <li>For webhooks: Create endpoint at /api/payment/webhook/paypal</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
