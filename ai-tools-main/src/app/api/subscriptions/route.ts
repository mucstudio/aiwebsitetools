import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/subscriptions - Get all active subscription plans
export async function GET() {
  try {
    const subscriptions = await prisma.subscription.findMany({
      where: { isActive: true },
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
        features: JSON.parse(sub.features)
      }))
    })
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    )
  }
}
