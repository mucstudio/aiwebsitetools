import { NextRequest, NextResponse } from "next/server"
import { getCurrentSession } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const planSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be 0 or greater"),
  interval: z.enum(["month", "year"]),
  stripePriceId: z.string().nullable().optional(),
  features: z.array(z.string()),
  limits: z.object({
    dailyUsage: z.number(),
    toolAccess: z.string(),
  }),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
})

export async function GET(
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

    const plan = await prisma.plan.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
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

export async function PUT(
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

    const body = await request.json()
    const validatedData = planSchema.parse(body)

    // Check if plan exists
    const existingPlan = await prisma.plan.findUnique({
      where: { id: params.id },
    })

    if (!existingPlan) {
      return NextResponse.json(
        { error: "Plan not found" },
        { status: 404 }
      )
    }

    // Check if slug is taken by another plan
    if (validatedData.slug !== existingPlan.slug) {
      const slugTaken = await prisma.plan.findUnique({
        where: { slug: validatedData.slug },
      })

      if (slugTaken) {
        return NextResponse.json(
          { error: "A plan with this slug already exists" },
          { status: 400 }
        )
      }
    }

    // Update plan
    const plan = await prisma.plan.update({
      where: { id: params.id },
      data: validatedData,
    })

    return NextResponse.json({
      message: "Plan updated successfully",
      plan,
    })
  } catch (error) {
    console.error("Plan update error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to update plan" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Check if plan has active subscriptions
    const subscriptionCount = await prisma.subscription.count({
      where: { planId: params.id },
    })

    if (subscriptionCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete plan with active subscriptions" },
        { status: 400 }
      )
    }

    // Delete plan
    await prisma.plan.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: "Plan deleted successfully",
    })
  } catch (error) {
    console.error("Plan deletion error:", error)

    return NextResponse.json(
      { error: "Failed to delete plan" },
      { status: 500 }
    )
  }
}
