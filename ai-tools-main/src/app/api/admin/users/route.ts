import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// GET /api/admin/users - Get all users (admin only)
export async function GET(request: Request) {
  try {
    await requireAuth()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const tier = searchParams.get('tier') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { email: { contains: search } },
        { name: { contains: search } }
      ]
    }

    if (tier) {
      where.membershipTier = tier
    }

    // Get users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          subscription: true,
          _count: {
            select: {
              favorites: true,
              usageLogs: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ])

    return NextResponse.json({
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        membershipTier: user.membershipTier,
        usageCount: user.usageCount,
        usageLimit: user.subscription?.usageLimit || 50,
        usageResetDate: user.usageResetDate,
        emailVerified: user.emailVerified,
        subscription: user.subscription ? {
          id: user.subscription.id,
          name: user.subscription.name,
          tier: user.subscription.tier
        } : null,
        favoritesCount: user._count.favorites,
        usageLogsCount: user._count.usageLogs,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/users - Update user (admin only)
export async function PUT(request: Request) {
  try {
    await requireAuth()

    const body = await request.json()
    const { id, membershipTier, subscriptionId, emailVerified, usageCount } = body

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const updateData: any = {}

    if (membershipTier !== undefined) {
      updateData.membershipTier = membershipTier
    }
    if (subscriptionId !== undefined) {
      updateData.subscriptionId = subscriptionId
    }
    if (emailVerified !== undefined) {
      updateData.emailVerified = emailVerified
    }
    if (usageCount !== undefined) {
      updateData.usageCount = usageCount
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: { subscription: true }
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        membershipTier: user.membershipTier,
        emailVerified: user.emailVerified,
        usageCount: user.usageCount
      }
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users?id={id} - Delete user (admin only)
export async function DELETE(request: Request) {
  try {
    await requireAuth()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
