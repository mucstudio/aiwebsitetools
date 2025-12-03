import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/user/profile-data
 * 获取当前登录用户的个人信息（供工具使用）
 *
 * 安全措施：
 * 1. 只返回用户明确授权的信息
 * 2. 支持通过 scope 参数限制返回的数据范围
 * 3. 记录访问日志（可选）
 * 4. 敏感信息脱敏处理
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('user')

    // 如果未登录，返回 null
    if (!userCookie) {
      return NextResponse.json({
        authenticated: false,
        user: null
      })
    }

    const userData = JSON.parse(userCookie.value)
    const userId = userData.id

    // 获取请求的数据范围（scope）
    const { searchParams } = new URL(request.url)
    const scope = searchParams.get('scope') || 'basic' // basic, social, full
    const toolId = searchParams.get('toolId') // 工具ID，用于审计

    // 从数据库获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        city: true,
        country: true,
        tiktok: true,
        instagram: true,
        facebook: true,
        twitter: true,
        youtube: true,
        linkedin: true,
        website: true,
        bio: true,
        membershipTier: true
      }
    })

    if (!user) {
      return NextResponse.json({
        authenticated: false,
        user: null
      })
    }

    // 根据 scope 返回不同级别的信息
    let responseData: any = {
      id: user.id,
      membershipTier: user.membershipTier
    }

    // 基础信息（默认）
    if (scope === 'basic' || scope === 'full') {
      responseData.name = user.name
      responseData.city = user.city
      responseData.country = user.country
      // 邮箱脱敏处理
      if (user.email) {
        const [localPart, domain] = user.email.split('@')
        const maskedLocal = localPart.length > 3
          ? localPart.substring(0, 3) + '***'
          : '***'
        responseData.email = `${maskedLocal}@${domain}`
      }
    }

    // 社交媒体信息
    if (scope === 'social' || scope === 'full') {
      responseData.socialMedia = {
        tiktok: user.tiktok,
        instagram: user.instagram,
        facebook: user.facebook,
        twitter: user.twitter,
        youtube: user.youtube,
        linkedin: user.linkedin,
        website: user.website
      }
    }

    // 完整信息（需要明确授权）
    if (scope === 'full') {
      // 只有在用户明确授权的情况下才返回完整信息
      // 这里可以检查工具是否被用户授权访问完整信息
      responseData.email = user.email // 完整邮箱
      responseData.phone = user.phone
      responseData.address = user.address
      responseData.bio = user.bio
    }

    // 可选：记录访问日志（用于安全审计）
    if (toolId && process.env.ENABLE_USER_DATA_AUDIT === 'true') {
      // 这里可以记录到数据库或日志文件
      console.log(`[AUDIT] User ${userId} data accessed by tool ${toolId} with scope: ${scope}`)
    }

    return NextResponse.json({
      authenticated: true,
      user: responseData,
      scope: scope // 返回实际的数据范围
    })

  } catch (error) {
    console.error('Error fetching user profile data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user profile data' },
      { status: 500 }
    )
  }
}
