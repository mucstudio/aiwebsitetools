import { NextRequest, NextResponse } from "next/server"
import { getCurrentSession } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"

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

    // Get current plan
    const plan = await prisma.plan.findUnique({
      where: { id: params.id },
    })

    if (!plan) {
      return NextResponse.json(
        { error: "Plan not found" },
        { status: 404 }
      )
    }

    // Toggle isActive status
    const updatedPlan = await prisma.plan.update({
      where: { id: params.id },
      data: { isActive: !plan.isActive },
    })

    return NextResponse.json({
      message: `Plan ${updatedPlan.isActive ? "enabled" : "disabled"} successfully`,
      plan: updatedPlan,
    })
  } catch (error) {
    console.error("Plan toggle error:", error)

    return NextResponse.json(
      { error: "Failed to toggle plan status" },
      { status: 500 }
    )
  }
}
