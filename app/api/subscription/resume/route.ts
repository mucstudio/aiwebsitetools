import { NextRequest, NextResponse } from "next/server"
import { getCurrentSession } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { getStripe } from "@/lib/stripe"

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get user's subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
      include: { plan: true }
    })

    if (!subscription) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 404 }
      )
    }

    if (!subscription.cancelAtPeriodEnd) {
      return NextResponse.json(
        { error: "Subscription is not scheduled for cancellation" },
        { status: 400 }
      )
    }

    if (!subscription.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "Stripe subscription ID not found" },
        { status: 400 }
      )
    }

    // Resume subscription in Stripe
    const stripe = await getStripe()

    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 500 }
      )
    }

    // Remove cancel_at_period_end flag
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false
    })

    // Update subscription in database
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { cancelAtPeriodEnd: false }
    })

    return NextResponse.json({
      success: true,
      message: "Subscription resumed successfully"
    })
  } catch (error: any) {
    console.error("Resume subscription error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to resume subscription" },
      { status: 500 }
    )
  }
}
