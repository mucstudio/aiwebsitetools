import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUserAuth } from '@/lib/userAuth'

// POST /api/payment/confirm - Confirm payment and update user subscription
export async function POST(request: Request) {
  try {
    const userId = await requireUserAuth()

    const body = await request.json()
    const { orderId, paymentIntentId, paymentMethod } = body

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

    // Check if order is already completed
    if (order.status === 'completed') {
      return NextResponse.json(
        { error: 'Payment already completed' },
        { status: 400 }
      )
    }

    // Update payment order
    await prisma.paymentOrder.update({
      where: { id: orderId },
      data: {
        status: 'completed',
        paymentIntentId,
        paymentMethod
      }
    })

    // Update user subscription
    await prisma.user.update({
      where: { id: userId },
      data: {
        membershipTier: order.subscription.tier,
        subscriptionId: order.subscriptionId,
        usageCount: 0, // Reset usage count
        usageResetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Payment confirmed successfully',
      subscription: {
        name: order.subscription.name,
        tier: order.subscription.tier,
        usageLimit: order.subscription.usageLimit
      }
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Please login to continue' }, { status: 401 })
    }
    console.error('Error confirming payment:', error)
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    )
  }
}
