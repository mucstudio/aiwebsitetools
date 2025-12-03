import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

const SESSION_COOKIE_NAME = 'admin_session'
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Create a new session for an admin user
 * Stores the session in the database with expiration time
 */
export async function createSession(adminId: number): Promise<string> {
  const sessionToken = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + SESSION_DURATION)
  const cookieStore = await cookies()

  // Store session in database
  await prisma.session.create({
    data: {
      token: sessionToken,
      adminId,
      expiresAt
    }
  })

  // Set cookie
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000,
    path: '/'
  })

  return sessionToken
}

/**
 * Get the current session and return the admin ID
 * Validates the session token against the database
 */
export async function getSession(): Promise<number | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

  if (!sessionCookie) {
    return null
  }

  const sessionToken = sessionCookie.value

  try {
    // Find session in database
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: { admin: true }
    })

    // Check if session exists and is not expired
    if (!session) {
      return null
    }

    if (session.expiresAt < new Date()) {
      // Session expired, delete it
      await prisma.session.delete({
        where: { id: session.id }
      })
      return null
    }

    // Valid session, return admin ID
    return session.adminId
  } catch (error) {
    console.error('Error validating session:', error)
    return null
  }
}

/**
 * Clear the current session
 * Removes session from database and clears cookie
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

  if (sessionCookie) {
    const sessionToken = sessionCookie.value

    try {
      // Delete session from database
      await prisma.session.deleteMany({
        where: { token: sessionToken }
      })
    } catch (error) {
      console.error('Error deleting session:', error)
    }
  }

  // Clear cookie
  cookieStore.delete(SESSION_COOKIE_NAME)
}

/**
 * Require authentication for a route
 * Throws an error if not authenticated
 */
export async function requireAuth(): Promise<number> {
  const adminId = await getSession()
  if (!adminId) {
    throw new Error('Unauthorized')
  }
  return adminId
}

/**
 * Clean up expired sessions from the database
 * Should be called periodically (e.g., via cron job)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const result = await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    })
    return result.count
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error)
    return 0
  }
}
