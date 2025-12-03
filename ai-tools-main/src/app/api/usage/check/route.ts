import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/userAuth'

// GET /api/usage/check - Check if user can use a tool
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const toolId = searchParams.get('toolId')
    const fingerprint = searchParams.get('fingerprint')
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

    if (!toolId) {
      return NextResponse.json(
        { error: 'toolId is required' },
        { status: 400 }
      )
    }

    // Check if user is logged in
    const userId = await getUserSession()

    if (userId) {
      // Logged-in user - check subscription limits
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true }
      })

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      // Check if usage needs to be reset (monthly)
      const now = new Date()
      if (now > user.usageResetDate) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            usageCount: 0,
            usageResetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1)
          }
        })
        user.usageCount = 0
      }

      // Get usage limit from subscription or default
      const limit = user.subscription?.usageLimit || getDefaultUsageLimit(user.membershipTier)
      const remaining = limit === -1 ? -1 : Math.max(0, limit - user.usageCount)
      const allowed = limit === -1 || user.usageCount < limit

      return NextResponse.json({
        allowed,
        remaining,
        limit,
        usageCount: user.usageCount,
        resetDate: user.usageResetDate,
        userType: 'logged-in',
        membershipTier: user.membershipTier
      })
    } else {
      // Guest user - check fingerprint/IP limits
      if (!fingerprint) {
        return NextResponse.json(
          { error: 'fingerprint is required for guest users' },
          { status: 400 }
        )
      }

      // Get site config for guest limits
      const siteConfig = await prisma.siteConfig.findFirst()
      const guestLimit = siteConfig?.guestUsageLimit || 10
      const resetDays = siteConfig?.guestResetDays || 30

      // 1. 检查当前指纹+IP的使用情况
      let guestUsage = await prisma.guestUsage.findUnique({
        where: {
          fingerprint_ip: {
            fingerprint,
            ip
          }
        }
      })

      if (guestUsage) {
        // Check if usage needs to be reset
        const now = new Date()
        if (now > guestUsage.resetDate) {
          guestUsage = await prisma.guestUsage.update({
            where: { id: guestUsage.id },
            data: {
              usageCount: 0,
              resetDate: new Date(now.getTime() + resetDays * 24 * 60 * 60 * 1000)
            }
          })
        }
      }

      // 2. 检查该 IP 下所有指纹的总使用次数（防止更换浏览器绕过）
      const now = new Date()
      const ipUsages = await prisma.guestUsage.findMany({
        where: {
          ip,
          resetDate: {
            gte: now  // 只统计未过期的记录
          }
        }
      })

      // 计算该 IP 的总使用次数
      const totalIpUsage = ipUsages.reduce((sum, usage) => sum + usage.usageCount, 0)

      // 3. 综合判断：取指纹使用次数和 IP 总使用次数的较大值
      const fingerprintUsageCount = guestUsage?.usageCount || 0
      const effectiveUsageCount = Math.max(fingerprintUsageCount, totalIpUsage)
      const remaining = Math.max(0, guestLimit - effectiveUsageCount)
      const allowed = effectiveUsageCount < guestLimit

      return NextResponse.json({
        allowed,
        remaining,
        limit: guestLimit,
        usageCount: effectiveUsageCount,
        resetDate: guestUsage?.resetDate || new Date(now.getTime() + resetDays * 24 * 60 * 60 * 1000),
        userType: 'guest',
        message: allowed ? undefined : 'Usage limit reached. Please register for more uses.',
        // 调试信息（生产环境可删除）
        debug: {
          fingerprintUsage: fingerprintUsageCount,
          ipTotalUsage: totalIpUsage,
          ipRecordsCount: ipUsages.length
        }
      })
    }
  } catch (error) {
    console.error('Error checking usage:', error)
    return NextResponse.json(
      { error: 'Failed to check usage limit' },
      { status: 500 }
    )
  }
}

function getDefaultUsageLimit(tier: string): number {
  switch (tier) {
    case 'FREE':
      return 50 // 50 uses per month
    case 'PREMIUM':
      return 500 // 500 uses per month
    case 'ENTERPRISE':
      return -1 // Unlimited
    default:
      return 50
  }
}
