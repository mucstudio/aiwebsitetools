import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const plan = await prisma.plan.findUnique({
      where: { slug: params.slug }
    })

    if (!plan) {
      return NextResponse.json(
        { error: "Plan not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ plan })
  } catch (error) {
    console.error("Get plan error:", error)
    return NextResponse.json(
      { error: "Failed to get plan" },
      { status: 500 }
    )
  }
}
