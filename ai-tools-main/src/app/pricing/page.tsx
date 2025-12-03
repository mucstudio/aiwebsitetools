'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Check, Crown, Zap, Star, CreditCard, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface Subscription {
  id: number
  name: string
  tier: string
  price: number
  currency: string
  billingCycle: string
  usageLimit: number
  features: string[]
}

interface PaymentProvider {
  provider: string
  publicKey: string
  testMode: boolean
}

export default function PricingPage() {
  const router = useRouter()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [paymentProviders, setPaymentProviders] = useState<PaymentProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY')

  useEffect(() => {
    checkAuth()
    fetchSubscriptions()
    fetchPaymentProviders()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/user/me')
      const data = await response.json()
      setIsAuthenticated(data.authenticated)
    } catch (error) {
      setIsAuthenticated(false)
    }
  }

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/subscriptions')
      const data = await response.json()
      setSubscriptions(data.subscriptions || [])
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
      setSubscriptions([])
    } finally {
      setLoading(false)
    }
  }

  const fetchPaymentProviders = async () => {
    try {
      const response = await fetch('/api/payment/config')
      const data = await response.json()
      setPaymentProviders(data.providers || [])
    } catch (error) {
      console.error('Error fetching payment providers:', error)
    }
  }

  const handleUpgrade = async (subscriptionId: number, tier: string) => {
    // Free plan - redirect to register
    if (tier === 'FREE') {
      router.push('/register')
      return
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      router.push('/login?redirect=/pricing')
      return
    }

    // Check if payment providers are available
    if (paymentProviders.length === 0) {
      alert('Payment is not available at the moment. Please contact support.')
      return
    }

    setSelectedPlan(subscriptionId)
    setShowPaymentModal(true)
  }

  const handlePayment = async (provider: string) => {
    if (!selectedPlan) return

    setProcessingPayment(true)

    try {
      // Create payment order
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: selectedPlan,
          provider
        })
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Failed to create payment order')
        setProcessingPayment(false)
        return
      }

      const orderId = data.order.id

      if (provider === 'stripe') {
        // Stripe Checkout integration
        const { loadStripe } = await import('@stripe/stripe-js')

        // Create Stripe Checkout Session
        const sessionResponse = await fetch('/api/payment/stripe/create-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId })
        })

        const sessionData = await sessionResponse.json()

        if (!sessionResponse.ok) {
          alert(sessionData.error || 'Failed to create payment session')
          setProcessingPayment(false)
          return
        }

        // Redirect to Stripe Checkout
        if (sessionData.url) {
          window.location.href = sessionData.url
        } else {
          alert('Failed to get checkout URL')
          setProcessingPayment(false)
        }
      } else if (provider === 'paypal') {
        // PayPal integration
        const paypalResponse = await fetch('/api/payment/paypal/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId })
        })

        const paypalData = await paypalResponse.json()

        if (!paypalResponse.ok) {
          alert(paypalData.error || 'Failed to create PayPal order')
          setProcessingPayment(false)
          return
        }

        // Redirect to PayPal approval URL
        if (paypalData.approvalUrl) {
          window.location.href = paypalData.approvalUrl
        } else {
          alert('Failed to get PayPal approval URL')
          setProcessingPayment(false)
        }
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      alert('An error occurred while processing your payment')
      setProcessingPayment(false)
    }
  }

  const filteredPlans = (subscriptions || []).filter(
    (sub) => sub.billingCycle === billingCycle || sub.billingCycle === 'FREE'
  )

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'FREE':
        return <Star className="w-6 h-6" />
      case 'PREMIUM':
        return <Crown className="w-6 h-6" />
      case 'ENTERPRISE':
        return <Zap className="w-6 h-6" />
      default:
        return <Star className="w-6 h-6" />
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'FREE':
        return 'from-gray-500 to-gray-600'
      case 'PREMIUM':
        return 'from-purple-500 to-pink-500'
      case 'ENTERPRISE':
        return 'from-blue-500 to-cyan-500'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex-1">
          <LoadingSpinner />
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary-50 to-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Choose the plan that's right for you. All plans include access to our powerful tools.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <button
                onClick={() => setBillingCycle('MONTHLY')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'MONTHLY'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('YEARLY')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'YEARLY'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  Save 17%
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {filteredPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-white rounded-lg border-2 overflow-hidden transition-all hover:shadow-xl ${
                    plan.tier === 'PREMIUM'
                      ? 'border-purple-500 shadow-lg scale-105'
                      : 'border-gray-200'
                  }`}
                >
                  {/* Header */}
                  <div className={`bg-gradient-to-r ${getTierColor(plan.tier)} text-white p-6`}>
                    <div className="flex items-center justify-center mb-3">
                      {getTierIcon(plan.tier)}
                    </div>
                    <h3 className="text-2xl font-bold text-center mb-2">{plan.name}</h3>
                    <div className="text-center">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      {plan.billingCycle !== 'FREE' && (
                        <span className="text-sm opacity-90">
                          /{plan.billingCycle.toLowerCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="p-6">
                    <div className="mb-6">
                      <p className="text-center text-gray-600 mb-4">
                        {plan.usageLimit === -1 ? (
                          <span className="text-2xl font-bold text-gray-900">Unlimited</span>
                        ) : (
                          <>
                            <span className="text-2xl font-bold text-gray-900">{plan.usageLimit}</span>
                            <span className="text-sm"> uses/month</span>
                          </>
                        )}
                      </p>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleUpgrade(plan.id, plan.tier)}
                      className={`block w-full text-center px-4 py-3 rounded-lg font-semibold transition-colors ${
                        plan.tier === 'PREMIUM'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                          : plan.tier === 'ENTERPRISE'
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      {plan.tier === 'FREE' ? 'Get Started' : 'Upgrade Now'}
                    </button>
                  </div>

                  {plan.tier === 'PREMIUM' && (
                    <div className="bg-purple-50 border-t border-purple-200 px-6 py-3 text-center">
                      <p className="text-sm font-medium text-purple-900">Most Popular</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Frequently Asked Questions
            </h2>
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What happens when I reach my usage limit?
                </h3>
                <p className="text-gray-600">
                  When you reach your monthly usage limit, you'll need to wait until the next month or upgrade to a higher plan. Your usage resets on the 1st of each month.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can I upgrade or downgrade my plan?
                </h3>
                <p className="text-gray-600">
                  Yes! You can upgrade or downgrade your plan at any time from your dashboard. Changes take effect immediately.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Is there a free trial for premium plans?
                </h3>
                <p className="text-gray-600">
                  We offer a generous free plan so you can try our tools before upgrading. No credit card required for the free plan.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-gray-600">
                  We accept all major credit cards, PayPal, and other popular payment methods. All payments are processed securely.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* No Plans Message */}
        {!loading && subscriptions.length === 0 && (
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl mx-auto text-center bg-white rounded-lg border border-gray-200 p-12">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No Subscription Plans Available</h2>
                <p className="text-gray-600 mb-6">
                  The administrator hasn't set up any subscription plans yet. Please check back later.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        {subscriptions.length > 0 && (
          <section className="bg-gradient-to-r from-primary-600 to-primary-700 py-16">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
                Join thousands of users who are already using our tools to boost their productivity.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Start Free Today
              </Link>
            </div>
          </section>
        )}
      </main>
      <Footer />

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Choose Payment Method</h2>

            {paymentProviders.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">No payment methods are currently available.</p>
                <p className="text-sm text-gray-500">Please contact support to complete your purchase.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {paymentProviders.map((provider) => (
                  <button
                    key={provider.provider}
                    onClick={() => handlePayment(provider.provider)}
                    disabled={processingPayment}
                    className={`w-full flex items-center justify-between p-4 border-2 rounded-lg transition-all hover:border-primary-500 hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed ${
                      provider.provider === 'stripe'
                        ? 'border-purple-200 hover:border-purple-500 hover:bg-purple-50'
                        : 'border-blue-200 hover:border-blue-500 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        provider.provider === 'stripe' ? 'bg-purple-100' : 'bg-blue-100'
                      }`}>
                        <CreditCard className={`w-6 h-6 ${
                          provider.provider === 'stripe' ? 'text-purple-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 capitalize">
                          {provider.provider === 'stripe' ? 'Credit Card (Stripe)' : 'PayPal'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {provider.testMode && '(Test Mode)'}
                        </p>
                      </div>
                    </div>
                    <span className="text-gray-400">→</span>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={() => {
                  setShowPaymentModal(false)
                  setSelectedPlan(null)
                }}
                disabled={processingPayment}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>

            {processingPayment && (
              <div className="mt-4 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                <p className="text-sm text-gray-600 mt-2">Processing payment...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
