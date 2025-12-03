'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LoadingSpinner from '@/components/LoadingSpinner'
import { CheckCircle, ArrowRight, Crown } from 'lucide-react'

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    confirmPayment()
  }, [])

  const confirmPayment = async () => {
    const orderId = searchParams.get('orderId')
    const paymentIntentId = searchParams.get('payment_intent') || searchParams.get('token')

    if (!orderId) {
      setError('Invalid payment session')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/payment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: parseInt(orderId),
          paymentIntentId,
          paymentMethod: searchParams.get('payment_method') || 'card'
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSubscription(data.subscription)
      } else {
        setError(data.error || 'Failed to confirm payment')
      }
    } catch (error) {
      console.error('Error confirming payment:', error)
      setError('An error occurred while confirming your payment')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex-1">
          <LoadingSpinner />
          <div className="text-center mt-4">
            <p className="text-gray-600">Confirming your payment...</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="flex-1 bg-gray-50">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">❌</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Try Again
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            {/* Success Card */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
              <p className="text-lg text-gray-600 mb-8">
                Thank you for your purchase. Your subscription has been activated.
              </p>

              {/* Subscription Details */}
              {subscription && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 mb-8">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Crown className="w-6 h-6 text-purple-600" />
                    <h2 className="text-xl font-bold text-purple-900">{subscription.name}</h2>
                  </div>
                  <p className="text-purple-700 mb-4">
                    You now have access to {subscription.usageLimit === -1 ? 'unlimited' : subscription.usageLimit} tool uses per month
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-purple-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Subscription activated successfully</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/tools"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Browse Tools
                </Link>
              </div>
            </div>

            {/* What's Next */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Access All Tools</p>
                    <p className="text-sm text-gray-600">Start using all premium tools immediately</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Track Your Usage</p>
                    <p className="text-sm text-gray-600">Monitor your usage in the dashboard</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Get Support</p>
                    <p className="text-sm text-gray-600">Priority support is now available to you</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <>
        <Header />
        <main className="flex-1">
          <LoadingSpinner />
          <div className="text-center mt-4">
            <p className="text-gray-600">Loading...</p>
          </div>
        </main>
        <Footer />
      </>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
