import { NextRequest, NextResponse } from "next/server"
import { getCurrentSession } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const configSchema = z.object({
  primaryModelId: z.string().optional(),
  fallback1ModelId: z.string().optional(),
  fallback2ModelId: z.string().optional(),
  retryAttempts: z.number().int().min(1).max(10).default(3),
  timeoutSeconds: z.number().int().min(5).max(300).default(30),
  enableFallback: z.boolean().default(true),
  config: z.any().optional(),
})

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

    // Get or create config
    let config = await prisma.aIConfig.findFirst()

    if (!config) {
      config = await prisma.aIConfig.create({
        data: {
          retryAttempts: 3,
          timeoutSeconds: 30,
          enableFallback: true,
        },
      })
    }

    // Get model details if configured
    const modelIds = [
      config.primaryModelId,
      config.fallback1ModelId,
      config.fallback2ModelId,
    ].filter(Boolean) as string[]

    const models = await prisma.aIModel.findMany({
      where: {
        id: { in: modelIds },
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    })

    return NextResponse.json({
      config,
      models,
    })
  } catch (error) {
    console.error("Get AI config error:", error)

    return NextResponse.json(
      { error: "Failed to get AI config" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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
    const validatedData = configSchema.parse(body)

    // Validate that model IDs exist and are active
    const modelIds = [
      validatedData.primaryModelId,
      validatedData.fallback1ModelId,
      validatedData.fallback2ModelId,
    ].filter(Boolean) as string[]

    if (modelIds.length > 0) {
      const models = await prisma.aIModel.findMany({
        where: {
          id: { in: modelIds },
          isActive: true,
        },
      })

      if (models.length !== modelIds.length) {
        return NextResponse.json(
          { error: "One or more selected models are not found or inactive" },
          { status: 400 }
        )
      }
    }

    // Get or create config
    let config = await prisma.aIConfig.findFirst()

    if (config) {
      // Update existing config
      config = await prisma.aIConfig.update({
        where: { id: config.id },
        data: validatedData,
      })
    } else {
      // Create new config
      config = await prisma.aIConfig.create({
        data: validatedData,
      })
    }

    return NextResponse.json({
      message: "AI config updated successfully",
      config,
    })
  } catch (error) {
    console.error("AI config update error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to update AI config" },
      { status: 500 }
    )
  }
}
