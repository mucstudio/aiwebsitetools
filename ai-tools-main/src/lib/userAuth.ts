import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

const USER_SESSION_COOKIE = 'user_session'
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createUserSession(userId: number): Promise<string> {
  // Create a session token that includes the user ID
  const sessionToken = `${userId}-${crypto.randomUUID()}`
  const cookieStore = await cookies()

  cookieStore.set(USER_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000,
    path: '/'
  })

  return sessionToken
}

export async function getUserSession(): Promise<number | null> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(USER_SESSION_COOKIE)

  if (!sessionToken) {
    return null
  }

  try {
    // Extract user ID from the session token (format: "userId-uuid")
    const userId = parseInt(sessionToken.value.split('-')[0])

    if (isNaN(userId)) {
      return null
    }

    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    return user?.id || null
  } catch {
    return null
  }
}

export async function clearUserSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(USER_SESSION_COOKIE)
}

export async function requireUserAuth(): Promise<number> {
  const userId = await getUserSession()
  if (!userId) {
    throw new Error('Unauthorized')
  }
  return userId
}

export async function checkUsageLimit(userId: number): Promise<{
  allowed: boolean
  remaining: number
  limit: number
  resetDate: Date
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true }
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Check if usage needs to be reset (monthly)
  const now = new Date()
  if (now > user.usageResetDate) {
    // Reset usage count
    await prisma.user.update({
      where: { id: userId },
      data: {
        usageCount: 0,
        usageResetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1)
      }
    })
    user.usageCount = 0
  }

  const limit = user.subscription?.usageLimit || getDefaultUsageLimit(user.membershipTier)
  const remaining = limit === -1 ? -1 : Math.max(0, limit - user.usageCount)
  const allowed = limit === -1 || user.usageCount < limit

  return {
    allowed,
    remaining,
    limit,
    resetDate: user.usageResetDate
  }
}

export async function incrementUsage(userId: number, toolId: number): Promise<void> {
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
      toolId
    }
  })
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

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
