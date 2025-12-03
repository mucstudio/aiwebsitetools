import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUserAuth } from '@/lib/userAuth'
import { decrypt } from '@/lib/encryption'

// POST /api/payment/stripe/create-session - Create Stripe Checkout Session
export async function POST(request: Request) {
  try {
    const userId = await requireUserAuth()

    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Get payment order
    const order = await prisma.paymentOrder.findUnique({
      where: { id: orderId },
      include: {
        subscription: true,
        user: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Payment order not found' },
        { status: 404 }
      )
    }

    // Verify order belongs to user
    if (order.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Get Stripe configuration
    const stripeConfig = await prisma.paymentConfig.findUnique({
      where: { provider: 'stripe' }
    })

    if (!stripeConfig || !stripeConfig.isEnabled) {
      return NextResponse.json(
        { error: 'Stripe is not available' },
        { status: 400 }
      )
    }

    // Decrypt secret key
    const secretKey = stripeConfig.secretKey ? decrypt(stripeConfig.secretKey) : null

    if (!secretKey) {
      return NextResponse.json(
        { error: 'Stripe configuration is incomplete' },
        { status: 500 }
      )
    }

    // Import Stripe dynamically
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(secretKey, {
      apiVersion: '2025-11-17.clover'
    })

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: order.currency.toLowerCase(),
            product_data: {
              name: order.subscription.name,
              description: `${order.subscription.tier} subscription - ${order.subscription.billingCycle}`,
            },
            unit_amount: Math.round(order.amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/success?orderId=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/cancel`,
      client_reference_id: orderId.toString(),
      customer_email: order.user.email,
      metadata: {
        orderId: orderId.toString(),
        userId: userId.toString(),
        subscriptionId: order.subscriptionId.toString(),
      },
    })

    // Update order with payment intent ID
    await prisma.paymentOrder.update({
      where: { id: orderId },
      data: {
        paymentIntentId: session.id
      }
    })

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url
    })
  } catch (error: any) {
    console.error('Error creating Stripe session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment session' },
      { status: 500 }
    )
  }
}
