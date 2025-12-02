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

export async function POST(request: NextRequest) {
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

    // Check if slug already exists
    const existingPlan = await prisma.plan.findUnique({
      where: { slug: validatedData.slug },
    })

    if (existingPlan) {
      return NextResponse.json(
        { error: "A plan with this slug already exists" },
        { status: 400 }
      )
    }

    // Create plan
    const plan = await prisma.plan.create({
      data: validatedData,
    })

    return NextResponse.json({
      message: "Plan created successfully",
      plan,
    })
  } catch (error) {
    console.error("Plan creation error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create plan" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession()

    // Check if user is admin
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      )
    }

    const plans = await prisma.plan.findMany({
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
      orderBy: { order: "asc" },
    })

    return NextResponse.json({ plans })
  } catch (error) {
    console.error("Get plans error:", error)

    return NextResponse.json(
      { error: "Failed to get plans" },
      { status: 500 }
    )
  }
}
