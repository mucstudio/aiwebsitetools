import { prisma } from "@/lib/prisma"
import { getSecuritySettings } from "@/lib/settings"

/**
 * 记录登录尝试
 */
export async function recordLoginAttempt(
  email: string,
  ipAddress: string,
  success: boolean
): Promise<void> {
  await prisma.loginAttempt.create({
    data: {
      email,
      ipAddress,
      success,
    },
  })
}

/**
 * 检查账号是否被锁定
 */
export async function isAccountLocked(email: string): Promise<{ locked: boolean; lockedUntil?: Date }> {
  const latestAttempt = await prisma.loginAttempt.findFirst({
    where: {
      email,
      lockedUntil: {
        not: null,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  if (!latestAttempt || !latestAttempt.lockedUntil) {
    return { locked: false }
  }

  // 检查锁定是否已过期
  if (latestAttempt.lockedUntil < new Date()) {
    return { locked: false }
  }

  return { locked: true, lockedUntil: latestAttempt.lockedUntil }
}

/**
 * 获取最近的失败尝试次数
 */
export async function getRecentFailedAttempts(email: string, minutes: number = 15): Promise<number> {
  const since = new Date()
  since.setMinutes(since.getMinutes() - minutes)

  const count = await prisma.loginAttempt.count({
    where: {
      email,
      success: false,
      createdAt: {
        gte: since,
      },
    },
  })

  return count
}

/**
 * 锁定账号
 */
export async function lockAccount(email: string, durationMinutes: number): Promise<void> {
  const lockedUntil = new Date()
  lockedUntil.setMinutes(lockedUntil.getMinutes() + durationMinutes)

  await prisma.loginAttempt.create({
    data: {
      email,
      ipAddress: "system",
      success: false,
      lockedUntil,
    },
  })
}

/**
 * 解锁账号
 */
export async function unlockAccount(email: string): Promise<void> {
  await prisma.loginAttempt.updateMany({
    where: {
      email,
      lockedUntil: {
        not: null,
      },
    },
    data: {
      lockedUntil: null,
    },
  })
}

/**
 * 检查并处理登录尝试
 */
export async function checkLoginAttempt(
  email: string,
  ipAddress: string
): Promise<{ allowed: boolean; error?: string; remainingAttempts?: number }> {
  const settings = await getSecuritySettings()

  // 检查账号是否被锁定
  const lockStatus = await isAccountLocked(email)
  if (lockStatus.locked) {
    const minutesLeft = Math.ceil(
      (lockStatus.lockedUntil!.getTime() - Date.now()) / 1000 / 60
    )
    return {
      allowed: false,
      error: `账号已被锁定，请在 ${minutesLeft} 分钟后重试`,
    }
  }

  // 获取最近的失败尝试次数
  const failedAttempts = await getRecentFailedAttempts(email)

  // 检查是否超过最大尝试次数
  if (failedAttempts >= settings.maxLoginAttempts) {
    // 锁定账号
    await lockAccount(email, settings.lockoutDuration)
    return {
      allowed: false,
      error: `登录失败次数过多，账号已被锁定 ${settings.lockoutDuration} 分钟`,
    }
  }

  const remainingAttempts = settings.maxLoginAttempts - failedAttempts

  return {
    allowed: true,
    remainingAttempts,
  }
}

/**
 * 清理旧的登录记录
 */
export async function cleanupOldLoginAttempts(daysToKeep: number = 30): Promise<number> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

  const result = await prisma.loginAttempt.deleteMany({
    where: {
      createdAt: {
        lt: cutoffDate,
      },
    },
  })

  return result.count
}

/**
 * 获取登录统计
 */
export async function getLoginStats(email: string) {
  const [totalAttempts, failedAttempts, successfulAttempts, recentFailed] = await Promise.all([
    prisma.loginAttempt.count({
      where: { email },
    }),
    prisma.loginAttempt.count({
      where: { email, success: false },
    }),
    prisma.loginAttempt.count({
      where: { email, success: true },
    }),
    getRecentFailedAttempts(email),
  ])

  const lockStatus = await isAccountLocked(email)

  return {
    totalAttempts,
    failedAttempts,
    successfulAttempts,
    recentFailed,
    isLocked: lockStatus.locked,
    lockedUntil: lockStatus.lockedUntil,
  }
}
