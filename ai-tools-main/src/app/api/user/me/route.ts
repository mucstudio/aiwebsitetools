import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/userAuth'

// GET /api/user/me - Get current user info
export async function GET() {
  try {
    const userId = await getUserSession()

    if (!userId) {
      return NextResponse.json({ authenticated: false })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        favorites: {
          include: {
            tool: {
              select: {
                id: true,
                name: true,
                slug: true,
                icon: true,
                description: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ authenticated: false })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        city: user.city,
        country: user.country,
        tiktok: user.tiktok,
        instagram: user.instagram,
        facebook: user.facebook,
        twitter: user.twitter,
        youtube: user.youtube,
        linkedin: user.linkedin,
        website: user.website,
        bio: user.bio,
        membershipTier: user.membershipTier,
        usageCount: user.usageCount,
        usageLimit: user.subscription?.usageLimit || 50,
        usageResetDate: user.usageResetDate,
        subscription: user.subscription ? {
          id: user.subscription.id,
          name: user.subscription.name,
          tier: user.subscription.tier,
          price: user.subscription.price,
          billingCycle: user.subscription.billingCycle,
          features: JSON.parse(user.subscription.features)
        } : null,
        favorites: user.favorites.map(f => f.tool)
      }
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ authenticated: false })
  }
}
