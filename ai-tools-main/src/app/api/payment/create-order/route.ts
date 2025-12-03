import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUserAuth } from '@/lib/userAuth'
import { decrypt } from '@/lib/encryption'

// POST /api/payment/create-order - Create payment order
export async function POST(request: Request) {
  try {
    const userId = await requireUserAuth()

    const body = await request.json()
    const { subscriptionId, provider } = body

    if (!subscriptionId || !provider) {
      return NextResponse.json(
        { error: 'Subscription ID and provider are required' },
        { status: 400 }
      )
    }

    // Validate provider
    if (!['stripe', 'paypal'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid payment provider' },
        { status: 400 }
      )
    }

    // Get subscription details
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId }
    })

    if (!subscription || !subscription.isActive) {
      return NextResponse.json(
        { error: 'Invalid or inactive subscription plan' },
        { status: 400 }
      )
    }

    // Check if payment provider is enabled
    const paymentConfig = await prisma.paymentConfig.findUnique({
      where: { provider }
    })

    if (!paymentConfig || !paymentConfig.isEnabled) {
      return NextResponse.json(
        { error: 'Payment provider is not available' },
        { status: 400 }
      )
    }

    // Create payment order
    const order = await prisma.paymentOrder.create({
      data: {
        userId,
        subscriptionId,
        provider,
        amount: subscription.price,
        currency: subscription.currency,
        status: 'pending',
        metadata: JSON.stringify({
          subscriptionName: subscription.name,
          subscriptionTier: subscription.tier,
          billingCycle: subscription.billingCycle
        })
      }
    })

    // Return order details with payment provider info
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        provider: order.provider
      },
      subscription: {
        name: subscription.name,
        tier: subscription.tier
      },
      paymentConfig: {
        publicKey: paymentConfig.publicKey,
        testMode: paymentConfig.testMode
      }
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Please login to continue' }, { status: 401 })
    }
    console.error('Error creating payment order:', error)
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    )
  }
}
