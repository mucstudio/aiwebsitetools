import { NextRequest, NextResponse } from "next/server"
import { getCurrentSession } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"

/**
 * 切换 AI 供应商的启用/禁用状态
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession()

    // Check if user is admin
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      )
    }

    // Get current provider
    const provider = await prisma.aIProvider.findUnique({
      where: { id: params.id },
    })

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      )
    }

    // Toggle active status
    const updatedProvider = await prisma.aIProvider.update({
      where: { id: params.id },
      data: {
        isActive: !provider.isActive,
      },
    })

    return NextResponse.json({
      message: `Provider ${updatedProvider.isActive ? "enabled" : "disabled"} successfully`,
      provider: {
        ...updatedProvider,
        apiKey: "***hidden***",
      },
    })
  } catch (error) {
    console.error("Toggle provider error:", error)

    return NextResponse.json(
      { error: "Failed to toggle provider status" },
      { status: 500 }
    )
  }
}
