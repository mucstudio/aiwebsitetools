import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { getStripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get("stripe-signature")

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    )
  }

  const stripe = await getStripe()

  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 }
    )
  }

  let event: Stripe.Event

  try {
    // Get webhook secret from settings
    const settings = await prisma.setting.findFirst()
    const webhookSecret = settings?.stripe_webhook_secret

    if (!webhookSecret) {
      console.error("Stripe webhook secret not configured")
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      )
    }

    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  // Handle the event
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook handler error:", error)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
}

/**
 * Handle checkout.session.completed
 * Create or update subscription when checkout is completed
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  const planId = session.metadata?.planId

  if (!userId || !planId) {
    console.error("Missing userId or planId in session metadata")
    return
  }

  const customerId = session.customer as string
  const subscriptionId = session.subscription as string

  // Get subscription details from Stripe
  const stripe = await getStripe()
  if (!stripe) return

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  // Create or update subscription in database
  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      planId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: subscription.items.data[0].price.id,
      status: "ACTIVE",
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: false
    },
    update: {
      planId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: subscription.items.data[0].price.id,
      status: "ACTIVE",
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: false
    }
  })

  // Create payment record
  await prisma.payment.create({
    data: {
      userId,
      amount: (session.amount_total || 0) / 100, // Convert from cents
      currency: session.currency || "usd",
      status: "succeeded",
      stripePaymentIntentId: session.payment_intent as string,
      metadata: {
        planId,
        subscriptionId,
        sessionId: session.id
      }
    }
  })

  console.log(`Subscription created for user ${userId}`)
}

/**
 * Handle customer.subscription.updated
 * Update subscription status when it changes
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  // Find subscription by Stripe customer ID
  const dbSubscription = await prisma.subscription.findUnique({
    where: { stripeCustomerId: customerId }
  })

  if (!dbSubscription) {
    console.error(`Subscription not found for customer ${customerId}`)
    return
  }

  // Map Stripe status to our status
  let status: "ACTIVE" | "CANCELED" | "PAST_DUE" | "TRIALING" | "INCOMPLETE" = "ACTIVE"

  switch (subscription.status) {
    case "active":
      status = "ACTIVE"
      break
    case "canceled":
      status = "CANCELED"
      break
    case "past_due":
      status = "PAST_DUE"
      break
    case "trialing":
      status = "TRIALING"
      break
    case "incomplete":
    case "incomplete_expired":
      status = "INCOMPLETE"
      break
  }

  // Update subscription
  await prisma.subscription.update({
    where: { id: dbSubscription.id },
    data: {
      status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    }
  })

  console.log(`Subscription updated for customer ${customerId}`)
}

/**
 * Handle customer.subscription.deleted
 * Mark subscription as canceled
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  // Find subscription by Stripe customer ID
  const dbSubscription = await prisma.subscription.findUnique({
    where: { stripeCustomerId: customerId }
  })

  if (!dbSubscription) {
    console.error(`Subscription not found for customer ${customerId}`)
    return
  }

  // Update subscription status
  await prisma.subscription.update({
    where: { id: dbSubscription.id },
    data: {
      status: "CANCELED",
      cancelAtPeriodEnd: false
    }
  })

  console.log(`Subscription canceled for customer ${customerId}`)
}

/**
 * Handle invoice.payment_succeeded
 * Record successful payment
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  const subscriptionId = invoice.subscription as string

  // Find subscription
  const subscription = await prisma.subscription.findUnique({
    where: { stripeCustomerId: customerId }
  })

  if (!subscription) {
    console.error(`Subscription not found for customer ${customerId}`)
    return
  }

  // Create payment record
  await prisma.payment.create({
    data: {
      userId: subscription.userId,
      amount: (invoice.amount_paid || 0) / 100,
      currency: invoice.currency || "usd",
      status: "succeeded",
      stripePaymentIntentId: invoice.payment_intent as string,
      metadata: {
        invoiceId: invoice.id,
        subscriptionId
      }
    }
  })

  console.log(`Payment recorded for user ${subscription.userId}`)
}

/**
 * Handle invoice.payment_failed
 * Record failed payment
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  // Find subscription
  const subscription = await prisma.subscription.findUnique({
    where: { stripeCustomerId: customerId }
  })

  if (!subscription) {
    console.error(`Subscription not found for customer ${customerId}`)
    return
  }

  // Create payment record
  await prisma.payment.create({
    data: {
      userId: subscription.userId,
      amount: (invoice.amount_due || 0) / 100,
      currency: invoice.currency || "usd",
      status: "failed",
      stripePaymentIntentId: invoice.payment_intent as string,
      metadata: {
        invoiceId: invoice.id,
        subscriptionId: invoice.subscription as string,
        failureReason: invoice.last_finalization_error?.message
      }
    }
  })

  // Update subscription status to PAST_DUE
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: "PAST_DUE" }
  })

  console.log(`Payment failed for user ${subscription.userId}`)
}
