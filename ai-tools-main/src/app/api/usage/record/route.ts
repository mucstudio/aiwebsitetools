import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/userAuth'

// POST /api/usage/record - Record tool usage
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { toolId, fingerprint } = body
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
      // Logged-in user - increment usage count
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

      // Check if user has reached limit
      const limit = user.subscription?.usageLimit || getDefaultUsageLimit(user.membershipTier)
      if (limit !== -1 && user.usageCount >= limit) {
        return NextResponse.json(
          {
            error: 'Usage limit reached',
            message: 'You have reached your monthly usage limit. Please upgrade your plan.'
          },
          { status: 403 }
        )
      }

      // Increment usage count
      await prisma.user.update({
        where: { id: userId },
        data: {
          usageCount: {
            increment: 1
          }
        }
      })

      // Log usage
      await prisma.usageLog.create({
        data: {
          userId,
          toolId: parseInt(toolId)
        }
      })

      // Increment tool views
      await prisma.tool.update({
        where: { id: parseInt(toolId) },
        data: {
          views: {
            increment: 1
          }
        }
      })

      return NextResponse.json({
        success: true,
        usageCount: user.usageCount + 1,
        remaining: limit === -1 ? -1 : Math.max(0, limit - user.usageCount - 1),
        userType: 'logged-in'
      })
    } else {
      // Guest user - increment guest usage
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

      // 1. 检查该 IP 下所有指纹的总使用次数（防止更换浏览器绕过）
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

      // 2. 检查是否已达到 IP 级别的限制
      if (totalIpUsage >= guestLimit) {
        return NextResponse.json(
          {
            error: 'Usage limit reached',
            message: 'This IP address has reached the usage limit. Please register for more uses.'
          },
          { status: 403 }
        )
      }

      // 3. Find or create guest usage record for this fingerprint+IP
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
        if (now > guestUsage.resetDate) {
          guestUsage = await prisma.guestUsage.update({
            where: { id: guestUsage.id },
            data: {
              usageCount: 1,
              toolId: parseInt(toolId),
              lastUsedAt: now,
              resetDate: new Date(now.getTime() + resetDays * 24 * 60 * 60 * 1000)
            }
          })
        } else {
          // Increment usage
          guestUsage = await prisma.guestUsage.update({
            where: { id: guestUsage.id },
            data: {
              usageCount: {
                increment: 1
              },
              toolId: parseInt(toolId),
              lastUsedAt: now
            }
          })
        }
      } else {
        // Create new guest usage record
        guestUsage = await prisma.guestUsage.create({
          data: {
            fingerprint,
            ip,
            toolId: parseInt(toolId),
            usageCount: 1,
            lastUsedAt: now,
            resetDate: new Date(now.getTime() + resetDays * 24 * 60 * 60 * 1000)
          }
        })
      }

      // Increment tool views
      await prisma.tool.update({
        where: { id: parseInt(toolId) },
        data: {
          views: {
            increment: 1
          }
        }
      })

      return NextResponse.json({
        success: true,
        usageCount: guestUsage.usageCount,
        remaining: Math.max(0, guestLimit - guestUsage.usageCount),
        userType: 'guest',
        message: guestUsage.usageCount >= guestLimit * 0.8
          ? `You have ${Math.max(0, guestLimit - guestUsage.usageCount)} uses remaining. Register for more!`
          : undefined
      })
    }
  } catch (error) {
    console.error('Error recording usage:', error)
    return NextResponse.json(
      { error: 'Failed to record usage' },
      { status: 500 }
    )
  }
}

function getDefaultUsageLimit(tier: string): number {
  switch (tier) {
    case 'FREE':
      return 50
    case 'PREMIUM':
      return 500
    case 'ENTERPRISE':
      return -1
    default:
      return 50
  }
}
