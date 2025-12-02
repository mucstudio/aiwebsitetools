import { NextRequest, NextResponse } from "next/server"
import { getCurrentSession } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const modelSchema = z.object({
  providerId: z.string().min(1, "Provider is required"),
  name: z.string().min(1, "Model name is required"),
  modelId: z.string().min(1, "Model ID is required"),
  description: z.string().optional(),
  inputPrice: z.number().min(0).default(0),
  outputPrice: z.number().min(0).default(0),
  maxTokens: z.number().int().min(1).default(4096),
  contextWindow: z.number().int().min(1).default(4096),
  supportVision: z.boolean().default(false),
  supportTools: z.boolean().default(false),
  supportStreaming: z.boolean().default(true),
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
    const validatedData = modelSchema.parse(body)

    // Check if model already exists
    const existingModel = await prisma.aIModel.findUnique({
      where: {
        providerId_modelId: {
          providerId: validatedData.providerId,
          modelId: validatedData.modelId,
        },
      },
    })

    if (existingModel) {
      return NextResponse.json(
        { error: "A model with this ID already exists for this provider" },
        { status: 400 }
      )
    }

    // Create model
    const model = await prisma.aIModel.create({
      data: {
        ...validatedData,
        isManual: true, // Mark as manually added
      },
      include: {
        provider: true,
      },
    })

    return NextResponse.json({
      message: "AI model created successfully",
      model,
    })
  } catch (error) {
    console.error("AI model creation error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create AI model" },
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

    const { searchParams } = new URL(request.url)
    const providerId = searchParams.get("providerId")

    const where = providerId ? { providerId } : {}

    const models = await prisma.aIModel.findMany({
      where,
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            type: true,
            isActive: true,
          },
        },
      },
      orderBy: [
        { provider: { order: "asc" } },
        { name: "asc" },
      ],
    })

    return NextResponse.json({ models })
  } catch (error) {
    console.error("Get AI models error:", error)

    return NextResponse.json(
      { error: "Failed to get AI models" },
      { status: 500 }
    )
  }
}
