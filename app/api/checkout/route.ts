import { NextRequest, NextResponse } from "next/server"
import { getCurrentSession } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { getStripe, getStripePublishableKey } from "@/lib/stripe"

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { planSlug, paymentMethod } = body

    if (!planSlug || !paymentMethod) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get plan details
    const plan = await prisma.plan.findUnique({
      where: { slug: planSlug }
    })

    if (!plan || !plan.isActive) {
      return NextResponse.json(
        { error: "Plan not found or inactive" },
        { status: 404 }
      )
    }

    // Check if user already has a subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id }
    })

    if (existingSubscription && existingSubscription.status === "ACTIVE") {
      return NextResponse.json(
        { error: "You already have an active subscription" },
        { status: 400 }
      )
    }

    if (paymentMethod === "stripe") {
      return await handleStripeCheckout(session.user, plan)
    } else if (paymentMethod === "paypal") {
      return await handlePayPalCheckout(session.user, plan)
    } else {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}

async function handleStripeCheckout(user: any, plan: any) {
  const stripe = await getStripe()

  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 500 }
    )
  }

  try {
    // Get or create Stripe customer
    let customerId = null
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId: user.id }
    })

    if (existingSubscription?.stripeCustomerId) {
      customerId = existingSubscription.stripeCustomerId
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id
        }
      })
      customerId = customer.id
    }

    // Create Stripe Price if not exists
    let stripePriceId = plan.stripePriceId

    if (!stripePriceId) {
      const product = await stripe.products.create({
        name: plan.name,
        description: plan.description || undefined,
        metadata: {
          planId: plan.id
        }
      })

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(plan.price * 100), // Convert to cents
        currency: "usd",
        recurring: {
          interval: plan.interval === "year" ? "year" : "month"
        }
      })

      stripePriceId = price.id

      // Update plan with Stripe price ID
      await prisma.plan.update({
        where: { id: plan.id },
        data: { stripePriceId }
      })
    }

    // Create Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1
        }
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?plan=${plan.slug}&canceled=true`,
      metadata: {
        userId: user.id,
        planId: plan.id
      }
    })

    const publishableKey = await getStripePublishableKey()

    return NextResponse.json({
      sessionId: checkoutSession.id,
      publishableKey
    })
  } catch (error: any) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create Stripe checkout session" },
      { status: 500 }
    )
  }
}

async function handlePayPalCheckout(user: any, plan: any) {
  const { createPayPalPlan, createPayPalSubscription, isPayPalEnabled } = await import("@/lib/paypal")

  const enabled = await isPayPalEnabled()
  if (!enabled) {
    return NextResponse.json(
      { error: "PayPal is not configured" },
      { status: 500 }
    )
  }

  try {
    // Get or create PayPal plan ID
    let paypalPlanId = plan.paypalPlanId

    if (!paypalPlanId) {
      // Create PayPal plan
      paypalPlanId = await createPayPalPlan({
        name: plan.name,
        description: plan.description || "",
        price: plan.price,
        interval: plan.interval as "month" | "year"
      })

      // Update plan with PayPal plan ID
      await prisma.plan.update({
        where: { id: plan.id },
        data: { paypalPlanId }
      })
    }

    // Create PayPal subscription
    const { subscriptionId, approvalUrl } = await createPayPalSubscription(
      paypalPlanId,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/paypal/success?userId=${user.id}&planId=${plan.id}`,
      `${process.env.NEXT_PUBLIC_APP_URL}/checkout?plan=${plan.slug}&canceled=true`
    )

    return NextResponse.json({
      subscriptionId,
      approvalUrl
    })
  } catch (error: any) {
    console.error("PayPal checkout error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create PayPal subscription" },
      { status: 500 }
    )
  }
}
