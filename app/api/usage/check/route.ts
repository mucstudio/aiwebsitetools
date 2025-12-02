import { NextRequest, NextResponse } from "next/server"
import { getCurrentSession } from "@/lib/auth-utils"
import { checkUsageLimit } from "@/lib/usage-limits/service"
import { getOrCreateGuestSession, getClientIP } from "@/lib/usage-limits/session"

/**
 * 检查工具使用限制
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const deviceFingerprint = request.headers.get('x-device-fingerprint')

    const session = await getCurrentSession()
    const sessionId = await getOrCreateGuestSession()
    const ipAddress = getClientIP(request)

    // 检查使用限制
    const result = await checkUsageLimit({
      userId: session?.user?.id,
      sessionId,
      ipAddress,
      deviceFingerprint: deviceFingerprint || undefined
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Check usage limit error:", error)

    return NextResponse.json(
      { error: "Failed to check usage limit" },
      { status: 500 }
    )
  }
}
