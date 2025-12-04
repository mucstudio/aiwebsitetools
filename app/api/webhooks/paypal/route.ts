import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { verifyPayPalWebhook } from "@/lib/paypal"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const headersList = headers()

  // Get webhook headers
  const webhookHeaders = {
    "paypal-auth-algo": headersList.get("paypal-auth-algo") || "",
    "paypal-cert-url": headersList.get("paypal-cert-url") || "",
    "paypal-transmission-id": headersList.get("paypal-transmission-id") || "",
    "paypal-transmission-sig": headersList.get("paypal-transmission-sig") || "",
    "paypal-transmission-time": headersList.get("paypal-transmission-time") || "",
  }

  try {
    // Get webhook ID from settings
    const settings = await prisma.setting.findFirst()
    const webhookId = settings?.paypal_webhook_id

    if (!webhookId) {
      console.error("PayPal webhook ID not configured")
      return NextResponse.json(
        { error: "Webhook ID not configured" },
        { status: 500 }
      )
    }

    // Verify webhook signature
    const isValid = await verifyPayPalWebhook(webhookId, webhookHeaders, body)

    if (!isValid) {
      console.error("PayPal webhook signature verification failed")
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 }
      )
    }

    // Handle the event
    const eventType = body.event_type

    switch (eventType) {
      case "BILLING.SUBSCRIPTION.CREATED":
        await handleSubscriptionCreated(body)
        break

      case "BILLING.SUBSCRIPTION.ACTIVATED":
        await handleSubscriptionActivated(body)
        break

      case "BILLING.SUBSCRIPTION.UPDATED":
        await handleSubscriptionUpdated(body)
        break

      case "BILLING.SUBSCRIPTION.CANCELLED":
        await handleSubscriptionCancelled(body)
        break

      case "BILLING.SUBSCRIPTION.SUSPENDED":
        await handleSubscriptionSuspended(body)
        break

      case "PAYMENT.SALE.COMPLETED":
        await handlePaymentCompleted(body)
        break

      default:
        console.log(`Unhandled PayPal event type: ${eventType}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("PayPal webhook handler error:", error)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
}

/**
 * Handle BILLING.SUBSCRIPTION.CREATED
 */
async function handleSubscriptionCreated(event: any) {
  const subscriptionId = event.resource.id
  console.log(`PayPal subscription created: ${subscriptionId}`)
  // Subscription will be created in success callback
}

/**
 * Handle BILLING.SUBSCRIPTION.ACTIVATED
 */
async function handleSubscriptionActivated(event: any) {
  const subscriptionId = event.resource.id

  const subscription = await prisma.subscription.findUnique({
    where: { paypalSubscriptionId: subscriptionId }
  })

  if (subscription) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "ACTIVE" }
    })
  }

  console.log(`PayPal subscription activated: ${subscriptionId}`)
}

/**
 * Handle BILLING.SUBSCRIPTION.UPDATED
 */
async function handleSubscriptionUpdated(event: any) {
  const subscriptionId = event.resource.id
  const resource = event.resource

  const subscription = await prisma.subscription.findUnique({
    where: { paypalSubscriptionId: subscriptionId }
  })

  if (!subscription) {
    console.error(`Subscription not found: ${subscriptionId}`)
    return
  }

  // Update subscription
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      currentPeriodStart: new Date(resource.billing_info.last_payment.time),
      currentPeriodEnd: new Date(resource.billing_info.next_billing_time),
    }
  })

  console.log(`PayPal subscription updated: ${subscriptionId}`)
}

/**
 * Handle BILLING.SUBSCRIPTION.CANCELLED
 */
async function handleSubscriptionCancelled(event: any) {
  const subscriptionId = event.resource.id

  const subscription = await prisma.subscription.findUnique({
    where: { paypalSubscriptionId: subscriptionId }
  })

  if (!subscription) {
    console.error(`Subscription not found: ${subscriptionId}`)
    return
  }

  // Update subscription status
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: "CANCELED",
      cancelAtPeriodEnd: false
    }
  })

  console.log(`PayPal subscription cancelled: ${subscriptionId}`)
}

/**
 * Handle BILLING.SUBSCRIPTION.SUSPENDED
 */
async function handleSubscriptionSuspended(event: any) {
  const subscriptionId = event.resource.id

  const subscription = await prisma.subscription.findUnique({
    where: { paypalSubscriptionId: subscriptionId }
  })

  if (!subscription) {
    console.error(`Subscription not found: ${subscriptionId}`)
    return
  }

  // Update subscription status
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: "PAST_DUE" }
  })

  console.log(`PayPal subscription suspended: ${subscriptionId}`)
}

/**
 * Handle PAYMENT.SALE.COMPLETED
 */
async function handlePaymentCompleted(event: any) {
  const saleId = event.resource.id
  const amount = parseFloat(event.resource.amount.total)
  const currency = event.resource.amount.currency

  // Find subscription by billing agreement ID
  const billingAgreementId = event.resource.billing_agreement_id

  const subscription = await prisma.subscription.findUnique({
    where: { paypalSubscriptionId: billingAgreementId }
  })

  if (!subscription) {
    console.error(`Subscription not found for billing agreement: ${billingAgreementId}`)
    return
  }

  // Create payment record
  await prisma.payment.create({
    data: {
      userId: subscription.userId,
      amount,
      currency: currency.toLowerCase(),
      status: "succeeded",
      metadata: {
        paypalSaleId: saleId,
        subscriptionId: billingAgreementId,
        paymentMethod: "paypal"
      }
    }
  })

  console.log(`PayPal payment completed: ${saleId}`)
}
