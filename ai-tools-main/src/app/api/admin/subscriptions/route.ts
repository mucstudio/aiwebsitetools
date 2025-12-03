import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// GET /api/admin/subscriptions - Get all subscriptions (admin only)
export async function GET() {
  try {
    await requireAuth()

    const subscriptions = await prisma.subscription.findMany({
      include: {
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: { price: 'asc' }
    })

    return NextResponse.json({
      subscriptions: subscriptions.map(sub => ({
        id: sub.id,
        name: sub.name,
        tier: sub.tier,
        price: sub.price,
        currency: sub.currency,
        billingCycle: sub.billingCycle,
        usageLimit: sub.usageLimit,
        features: JSON.parse(sub.features),
        isActive: sub.isActive,
        usersCount: sub._count.users,
        createdAt: sub.createdAt,
        updatedAt: sub.updatedAt
      }))
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    )
  }
}

// POST /api/admin/subscriptions - Create subscription (admin only)
export async function POST(request: Request) {
  try {
    await requireAuth()

    const body = await request.json()
    const { name, tier, price, currency, billingCycle, usageLimit, features, isActive } = body

    if (!name || !tier || price === undefined || !billingCycle || usageLimit === undefined) {
      return NextResponse.json(
        { error: 'Name, tier, price, billingCycle, and usageLimit are required' },
        { status: 400 }
      )
    }

    // Validate tier
    if (!['FREE', 'PREMIUM', 'ENTERPRISE'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be FREE, PREMIUM, or ENTERPRISE' },
        { status: 400 }
      )
    }

    // Validate billing cycle
    if (!['FREE', 'MONTHLY', 'YEARLY', 'LIFETIME'].includes(billingCycle)) {
      return NextResponse.json(
        { error: 'Invalid billing cycle' },
        { status: 400 }
      )
    }

    const subscription = await prisma.subscription.create({
      data: {
        name,
        tier,
        price: parseFloat(price),
        currency: currency || 'USD',
        billingCycle,
        usageLimit: parseInt(usageLimit),
        features: JSON.stringify(features || []),
        isActive: isActive !== undefined ? isActive : true
      }
    })

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        name: subscription.name,
        tier: subscription.tier,
        price: subscription.price,
        billingCycle: subscription.billingCycle,
        usageLimit: subscription.usageLimit,
        features: JSON.parse(subscription.features),
        isActive: subscription.isActive
      }
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/subscriptions - Update subscription (admin only)
export async function PUT(request: Request) {
  try {
    await requireAuth()

    const body = await request.json()
    const { id, name, tier, price, currency, billingCycle, usageLimit, features, isActive } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      )
    }

    const updateData: any = {}

    if (name !== undefined) updateData.name = name
    if (tier !== undefined) {
      if (!['FREE', 'PREMIUM', 'ENTERPRISE'].includes(tier)) {
        return NextResponse.json(
          { error: 'Invalid tier' },
          { status: 400 }
        )
      }
      updateData.tier = tier
    }
    if (price !== undefined) updateData.price = parseFloat(price)
    if (currency !== undefined) updateData.currency = currency
    if (billingCycle !== undefined) {
      if (!['FREE', 'MONTHLY', 'YEARLY', 'LIFETIME'].includes(billingCycle)) {
        return NextResponse.json(
          { error: 'Invalid billing cycle' },
          { status: 400 }
        )
      }
      updateData.billingCycle = billingCycle
    }
    if (usageLimit !== undefined) updateData.usageLimit = parseInt(usageLimit)
    if (features !== undefined) updateData.features = JSON.stringify(features)
    if (isActive !== undefined) updateData.isActive = isActive

    const subscription = await prisma.subscription.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        name: subscription.name,
        tier: subscription.tier,
        price: subscription.price,
        billingCycle: subscription.billingCycle,
        usageLimit: subscription.usageLimit,
        features: JSON.parse(subscription.features),
        isActive: subscription.isActive
      }
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error updating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/subscriptions?id={id} - Delete subscription (admin only)
export async function DELETE(request: Request) {
  try {
    await requireAuth()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      )
    }

    // Check if any users are using this subscription
    const usersCount = await prisma.user.count({
      where: { subscriptionId: parseInt(id) }
    })

    if (usersCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete subscription. ${usersCount} users are currently using this plan.` },
        { status: 400 }
      )
    }

    await prisma.subscription.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error deleting subscription:', error)
    return NextResponse.json(
      { error: 'Failed to delete subscription' },
      { status: 500 }
    )
  }
}
