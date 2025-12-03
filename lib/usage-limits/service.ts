/**
 * 使用限制检查服务
 *
 * 限制规则：
 * 1. 游客：使用全局配置（SiteSettings），基于 IP + 设备指纹 双重验证
 * 2. 注册用户：使用全局配置（SiteSettings），基于 userId 验证
 * 3. 订阅用户：使用订阅计划配置（Plan.limits），基于 userId 验证
 */

import { prisma } from '@/lib/prisma'
import { UserType, UsageCheckResult, GlobalUsageLimits, PlanLimits, UsageStats } from './types'

/**
 * 获取全局使用限制配置
 */
async function getGlobalLimits(): Promise<GlobalUsageLimits> {
  const settings = await prisma.siteSettings.findUnique({
    where: { key: 'usage_limits' }
  })

  if (!settings) {
    // 默认配置
    return {
      guest: { dailyLimit: 10 },
      user: { dailyLimit: 50 }
    }
  }

  return settings.value as GlobalUsageLimits
}

/**
 * 检查使用限制
 *
 * @param params.userId - 用户ID（注册用户/订阅用户）
 * @param params.sessionId - 会话ID（游客）
 * @param params.ipAddress - IP地址（游客）
 * @param params.deviceFingerprint - 设备指纹（游客，可选但强烈推荐）
 */
export async function checkUsageLimit(params: {
  userId?: string
  sessionId?: string
  ipAddress?: string
  deviceFingerprint?: string
}): Promise<UsageCheckResult> {
  const { userId, sessionId, ipAddress, deviceFingerprint } = params

  // 1. 确定用户类型和限制配置
  let userType: UserType
  let dailyLimit: number

  if (!userId) {
    // 游客
    userType = UserType.GUEST
    const globalLimits = await getGlobalLimits()
    dailyLimit = globalLimits.guest.dailyLimit
  } else {
    // 检查是否有活跃订阅
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true }
    })

    if (subscription && subscription.status === 'ACTIVE') {
      // 订阅用户
      userType = UserType.SUBSCRIBER
      const planLimits = subscription.plan.limits as PlanLimits
      dailyLimit = planLimits.dailyUsage
    } else {
      // 注册用户（无订阅）
      userType = UserType.USER
      const globalLimits = await getGlobalLimits()
      dailyLimit = globalLimits.user.dailyLimit
    }
  }

  // 2. 如果是无限制，直接返回
  if (dailyLimit === -1) {
    return {
      allowed: true,
      remaining: -1,
      limit: -1,
      userType
    }
  }

  // 3. 查询今日使用次数
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  let usageCount: number

  if (userType === UserType.GUEST) {
    // 游客：基于 IP + 设备指纹 双重验证（防止更换浏览器/清除 Cookie 绕过）
    if (deviceFingerprint && ipAddress) {
      // 步骤 1: 查询当前指纹的使用次数
      const fingerprintUsageCount = await prisma.usageRecord.count({
        where: {
          sessionId: deviceFingerprint, // 复用 sessionId 字段存储设备指纹
          userId: null,
          createdAt: { gte: todayStart }
        }
      })

      // 步骤 2: 查询该 IP 下所有指纹的总使用次数（防止更换浏览器绕过）
      const ipUsageCount = await prisma.usageRecord.count({
        where: {
          ipAddress: ipAddress,
          userId: null,
          createdAt: { gte: todayStart }
        }
      })

      // 步骤 3: 取两者的较大值（关键防绕过机制）
      // 如果用户更换浏览器，新指纹使用次数为 0，但 IP 总使用次数不变
      usageCount = Math.max(fingerprintUsageCount, ipUsageCount)
    } else if (deviceFingerprint) {
      // 只有指纹，没有 IP（降级方案）
      usageCount = await prisma.usageRecord.count({
        where: {
          sessionId: deviceFingerprint,
          userId: null,
          createdAt: { gte: todayStart }
        }
      })
    } else if (ipAddress) {
      // 只有 IP，没有指纹（降级方案）
      usageCount = await prisma.usageRecord.count({
        where: {
          ipAddress: ipAddress,
          userId: null,
          createdAt: { gte: todayStart }
        }
      })
    } else {
      // 既没有指纹也没有 IP，拒绝访问
      return {
        allowed: false,
        remaining: 0,
        limit: dailyLimit,
        userType,
        reason: '无法识别设备，请启用 JavaScript 和 Cookie',
        requiresLogin: true
      }
    }
  } else {
    // 注册用户/订阅用户：基于 userId
    usageCount = await prisma.usageRecord.count({
      where: {
        userId,
        createdAt: { gte: todayStart }
      }
    })
  }

  // 4. 计算剩余次数和是否允许
  const remaining = Math.max(0, dailyLimit - usageCount)
  const allowed = usageCount < dailyLimit

  return {
    allowed,
    remaining,
    limit: dailyLimit,
    userType,
    reason: allowed ? undefined : '今日使用次数已达上限',
    requiresLogin: !allowed && userType === UserType.GUEST,
    requiresUpgrade: !allowed && userType === UserType.USER
  }
}

/**
 * 记录工具使用
 *
 * @param toolId - 工具ID
 * @param params.userId - 用户ID
 * @param params.sessionId - 会话ID（游客）或设备指纹
 * @param params.ipAddress - IP地址（游客）
 * @param params.userAgent - 用户代理
 * @param params.deviceFingerprint - 设备指纹（游客，可选但强烈推荐）
 * @param params.usedAI - 是否使用了AI
 * @param params.aiTokens - AI token消耗
 * @param params.aiCost - AI成本
 */
export async function recordUsage(
  toolId: string,
  params: {
    userId?: string
    sessionId?: string
    ipAddress?: string
    userAgent?: string
    deviceFingerprint?: string
    usedAI?: boolean
    aiTokens?: number
    aiCost?: number
  }
): Promise<void> {
  await prisma.usageRecord.create({
    data: {
      toolId,
      userId: params.userId,
      // 优先使用设备指纹，否则使用 sessionId
      sessionId: params.deviceFingerprint || params.sessionId,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      usedAI: params.usedAI || false,
      aiTokens: params.aiTokens,
      aiCost: params.aiCost
    }
  })

  // 更新工具的总使用次数
  await prisma.tool.update({
    where: { id: toolId },
    data: {
      usageCount: { increment: 1 }
    }
  })
}

/**
 * 获取用户的使用统计
 */
export async function getUserUsageStats(params: {
  userId?: string
  sessionId?: string
  ipAddress?: string
}): Promise<UsageStats> {
  const { userId, sessionId, ipAddress } = params

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  let whereClause: any

  if (userId) {
    whereClause = { userId }
  } else {
    whereClause = {
      OR: [
        { sessionId: sessionId || '' },
        { ipAddress: ipAddress || '' }
      ]
    }
  }

  const [today, thisMonth, total] = await Promise.all([
    prisma.usageRecord.count({
      where: { ...whereClause, createdAt: { gte: todayStart } }
    }),
    prisma.usageRecord.count({
      where: { ...whereClause, createdAt: { gte: monthStart } }
    }),
    prisma.usageRecord.count({
      where: whereClause
    })
  ])

  return { today, thisMonth, total }
}

/**
 * 获取工具的使用统计
 */
export async function getToolUsageStats(toolId: string): Promise<UsageStats> {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const [today, thisMonth, total] = await Promise.all([
    prisma.usageRecord.count({
      where: { toolId, createdAt: { gte: todayStart } }
    }),
    prisma.usageRecord.count({
      where: { toolId, createdAt: { gte: monthStart } }
    }),
    prisma.usageRecord.count({
      where: { toolId }
    })
  ])

  return { today, thisMonth, total }
}
