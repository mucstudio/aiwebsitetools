import { NextRequest, NextResponse } from "next/server"
import { getCurrentSession } from "@/lib/auth-utils"
import { recordUsage, checkUsageLimit } from "@/lib/usage-limits/service"
import { getOrCreateGuestSession, getClientIP, getUserAgent } from "@/lib/usage-limits/session"

/**
 * 记录工具使用
 */
export async function POST(request: NextRequest) {
  try {
    const { toolId, usedAI, aiTokens, aiCost } = await request.json()

    if (!toolId) {
      return NextResponse.json(
        { error: "Tool ID is required" },
        { status: 400 }
      )
    }

    const session = await getCurrentSession()
    const sessionId = await getOrCreateGuestSession()
    const ipAddress = getClientIP(request)
    const userAgent = getUserAgent(request)
    const deviceFingerprint = request.headers.get('x-device-fingerprint')

    // 先检查是否允许使用
    const checkResult = await checkUsageLimit({
      userId: session?.user?.id,
      sessionId,
      ipAddress,
      deviceFingerprint: deviceFingerprint || undefined
    })

    if (!checkResult.allowed) {
      return NextResponse.json(
        {
          error: "Usage limit exceeded",
          ...checkResult,
        },
        { status: 429 }
      )
    }

    // 记录使用
    await recordUsage(toolId, {
      userId: session?.user?.id,
      sessionId,
      ipAddress,
      userAgent,
      deviceFingerprint: deviceFingerprint || undefined,
      usedAI,
      aiTokens,
      aiCost,
    })

    return NextResponse.json({
      success: true,
      message: "Usage recorded successfully",
    })
  } catch (error) {
    console.error("Record usage error:", error)

    return NextResponse.json(
      { error: "Failed to record usage" },
      { status: 500 }
    )
  }
}
