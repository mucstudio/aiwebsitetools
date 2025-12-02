/**
 * 游客会话管理
 */

import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'

const SESSION_COOKIE_NAME = 'guest_session_id'
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 小时

/**
 * 获取或创建游客会话 ID
 */
export async function getOrCreateGuestSession(): Promise<string> {
  const cookieStore = await cookies()
  let sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionId) {
    sessionId = uuidv4()
    cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION / 1000,
      path: '/',
    })
  }

  return sessionId
}

/**
 * 获取客户端 IP 地址
 */
export function getClientIP(request: Request): string {
  // 尝试从各种 header 中获取真实 IP
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // 如果都没有，返回一个默认值
  return 'unknown'
}

/**
 * 获取用户代理
 */
export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown'
}
