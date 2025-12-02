import { NextRequest, NextResponse } from "next/server"
import { getCurrentSession } from "@/lib/auth-utils"
import { getUserUsageStats } from "@/lib/usage-limits/service"
import { getOrCreateGuestSession, getClientIP } from "@/lib/usage-limits/session"

/**
 * 获取用户使用统计
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession()
    const sessionId = await getOrCreateGuestSession()
    const ipAddress = getClientIP(request)

    const stats = await getUserUsageStats(
      session?.user?.id,
      sessionId,
      ipAddress
    )

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Get usage stats error:", error)

    return NextResponse.json(
      { error: "Failed to get usage stats" },
      { status: 500 }
    )
  }
}
