import { NextRequest, NextResponse } from "next/server"
import { getCurrentSession } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"

/**
 * 切换 AI 模型的启用/禁用状态
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

    // Get current model
    const model = await prisma.aIModel.findUnique({
      where: { id: params.id },
    })

    if (!model) {
      return NextResponse.json(
        { error: "Model not found" },
        { status: 404 }
      )
    }

    // Toggle active status
    const updatedModel = await prisma.aIModel.update({
      where: { id: params.id },
      data: {
        isActive: !model.isActive,
      },
      include: {
        provider: true,
      },
    })

    return NextResponse.json({
      message: `Model ${updatedModel.isActive ? "enabled" : "disabled"} successfully`,
      model: updatedModel,
    })
  } catch (error) {
    console.error("Toggle model error:", error)

    return NextResponse.json(
      { error: "Failed to toggle model status" },
      { status: 500 }
    )
  }
}
