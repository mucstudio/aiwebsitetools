import { NextRequest, NextResponse } from "next/server"
import { getCurrentSession } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const modelSchema = z.object({
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

    const model = await prisma.aIModel.findUnique({
      where: { id: params.id },
      include: {
        provider: true,
      },
    })

    if (!model) {
      return NextResponse.json(
        { error: "Model not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ model })
  } catch (error) {
    console.error("Get AI model error:", error)

    return NextResponse.json(
      { error: "Failed to get AI model" },
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
    const validatedData = modelSchema.parse(body)

    // Check if model exists
    const existingModel = await prisma.aIModel.findUnique({
      where: { id: params.id },
    })

    if (!existingModel) {
      return NextResponse.json(
        { error: "Model not found" },
        { status: 404 }
      )
    }

    // Check if modelId is taken by another model in the same provider
    if (validatedData.modelId !== existingModel.modelId) {
      const modelIdTaken = await prisma.aIModel.findUnique({
        where: {
          providerId_modelId: {
            providerId: existingModel.providerId,
            modelId: validatedData.modelId,
          },
        },
      })

      if (modelIdTaken) {
        return NextResponse.json(
          { error: "A model with this ID already exists for this provider" },
          { status: 400 }
        )
      }
    }

    // Update model
    const model = await prisma.aIModel.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        provider: true,
      },
    })

    return NextResponse.json({
      message: "AI model updated successfully",
      model,
    })
  } catch (error) {
    console.error("AI model update error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to update AI model" },
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

    // Check if model is being used in AI config
    const config = await prisma.aIConfig.findFirst({
      where: {
        OR: [
          { primaryModelId: params.id },
          { fallback1ModelId: params.id },
          { fallback2ModelId: params.id },
        ],
      },
    })

    if (config) {
      return NextResponse.json(
        { error: "Cannot delete model that is configured as primary or fallback model" },
        { status: 400 }
      )
    }

    // Delete model
    await prisma.aIModel.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: "AI model deleted successfully",
    })
  } catch (error) {
    console.error("AI model deletion error:", error)

    return NextResponse.json(
      { error: "Failed to delete AI model" },
      { status: 500 }
    )
  }
}
