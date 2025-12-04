"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CreditCard, Shield, Check } from "lucide-react"
import { loadStripe } from "@stripe/stripe-js"

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const planSlug = searchParams.get("plan")

  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<any>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!planSlug) {
      router.push("/pricing")
      return
    }

    // Load plan details
    fetch(`/api/plans/${planSlug}`)
      .then(res => res.json())
      .then(data => {
        if (data.plan) {
          setPlan(data.plan)
        } else {
          setError("Plan not found")
        }
      })
      .catch(() => setError("Failed to load plan"))
  }, [planSlug, router])

  const handleCheckout = async (paymentMethod: "stripe" | "paypal") => {
    if (!plan) return

    setLoading(true)
    setError("")

    try {
      // Create checkout session
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planSlug: plan.slug,
          paymentMethod
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session")
      }

      if (paymentMethod === "stripe") {
        // Redirect to Stripe Checkout
        const stripe = await loadStripe(data.publishableKey)
        if (stripe) {
          await stripe.redirectToCheckout({ sessionId: data.sessionId })
        }
      } else if (paymentMethod === "paypal") {
        // Redirect to PayPal
        window.location.href = data.approvalUrl
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong")
      setLoading(false)
    }
  }

  if (!plan && !error) {
    return (
      <div className="container py-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-20">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => router.push("/pricing")}>
                Back to Pricing
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const features = Array.isArray(plan.features) ? plan.features : []

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Complete Your Purchase</h1>
          <p className="text-muted-foreground">Choose your payment method</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Plan Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Review your selected plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Included features:</h4>
                <ul className="space-y-2">
                  {features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start text-sm">
                      <Check className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total</span>
                  <div className="text-right">
                    <p className="text-3xl font-bold">${plan.price}</p>
                    <p className="text-sm text-muted-foreground">per {plan.interval}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Select how you'd like to pay</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Stripe Payment */}
                <Button
                  onClick={() => handleCheckout("stripe")}
                  disabled={loading}
                  className="w-full h-auto py-4 flex items-center justify-between"
                  variant="outline"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-semibold">Credit / Debit Card</p>
                      <p className="text-xs text-muted-foreground">Powered by Stripe</p>
                    </div>
                  </div>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span className="text-xs">→</span>
                  )}
                </Button>

                {/* PayPal Payment */}
                <Button
                  onClick={() => handleCheckout("paypal")}
                  disabled={loading}
                  className="w-full h-auto py-4 flex items-center justify-between bg-[#0070ba] hover:bg-[#005ea6]"
                >
                  <div className="flex items-center gap-3">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 00-.794.68l-.04.22-.63 3.993-.028.15a.805.805 0 01-.794.68H7.72a.483.483 0 01-.477-.558L9.096 7.74a.805.805 0 01.794-.68h4.92c1.815 0 3.14.423 3.957 1.418z"/>
                    </svg>
                    <div className="text-left">
                      <p className="font-semibold">PayPal</p>
                      <p className="text-xs opacity-90">Fast & Secure</p>
                    </div>
                  </div>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span className="text-xs">→</span>
                  )}
                </Button>

                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold mb-1">Secure Payment</p>
                    <p className="text-muted-foreground text-xs">
                      Your payment information is encrypted and secure. We never store your card details.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
