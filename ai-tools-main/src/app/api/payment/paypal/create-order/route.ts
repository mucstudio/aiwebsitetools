import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUserAuth } from '@/lib/userAuth'
import { decrypt } from '@/lib/encryption'

// POST /api/payment/paypal/create-order - Create PayPal Order
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

    // Get PayPal configuration
    const paypalConfig = await prisma.paymentConfig.findUnique({
      where: { provider: 'paypal' }
    })

    if (!paypalConfig || !paypalConfig.isEnabled) {
      return NextResponse.json(
        { error: 'PayPal is not available' },
        { status: 400 }
      )
    }

    // Decrypt secret key
    const clientId = paypalConfig.publicKey
    const clientSecret = paypalConfig.secretKey ? decrypt(paypalConfig.secretKey) : null

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'PayPal configuration is incomplete' },
        { status: 500 }
      )
    }

    // Get PayPal access token
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    const baseUrl = paypalConfig.testMode
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com'

    const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to get PayPal access token')
    }

    const { access_token } = await tokenResponse.json()

    // Create PayPal order
    const createOrderResponse = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: orderId.toString(),
            description: `${order.subscription.name} - ${order.subscription.tier}`,
            amount: {
              currency_code: order.currency,
              value: order.amount.toFixed(2),
            },
          },
        ],
        application_context: {
          brand_name: 'Online Tools Platform',
          return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/success?orderId=${orderId}`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/cancel`,
        },
      }),
    })

    if (!createOrderResponse.ok) {
      const errorData = await createOrderResponse.json()
      throw new Error(errorData.message || 'Failed to create PayPal order')
    }

    const paypalOrder = await createOrderResponse.json()

    // Update order with PayPal order ID
    await prisma.paymentOrder.update({
      where: { id: orderId },
      data: {
        paymentIntentId: paypalOrder.id
      }
    })

    // Get approval URL
    const approvalUrl = paypalOrder.links.find((link: any) => link.rel === 'approve')?.href

    return NextResponse.json({
      success: true,
      orderId: paypalOrder.id,
      approvalUrl
    })
  } catch (error: any) {
    console.error('Error creating PayPal order:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create PayPal order' },
      { status: 500 }
    )
  }
}
