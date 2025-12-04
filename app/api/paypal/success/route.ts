import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getPayPalSubscription } from "@/lib/paypal"

/**
 * PayPal success callback
 * Called after user approves subscription on PayPal
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")
    const planId = searchParams.get("planId")
    const subscriptionId = searchParams.get("subscription_id")
    const token = searchParams.get("token")

    if (!userId || !planId || !subscriptionId) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/checkout?error=missing_params`
      )
    }

    // Get subscription details from PayPal
    const paypalSubscription = await getPayPalSubscription(subscriptionId)

    // Create subscription in database
    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        planId,
        paypalSubscriptionId: subscriptionId,
        status: "ACTIVE",
        currentPeriodStart: new Date(paypalSubscription.start_time),
        currentPeriodEnd: new Date(paypalSubscription.billing_info.next_billing_time),
        cancelAtPeriodEnd: false
      },
      update: {
        planId,
        paypalSubscriptionId: subscriptionId,
        status: "ACTIVE",
        currentPeriodStart: new Date(paypalSubscription.start_time),
        currentPeriodEnd: new Date(paypalSubscription.billing_info.next_billing_time),
        cancelAtPeriodEnd: false
      }
    })

    // Redirect to success page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?success=true`
    )
  } catch (error) {
    console.error("PayPal success callback error:", error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/checkout?error=subscription_failed`
    )
  }
}
