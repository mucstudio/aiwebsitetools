import { NextRequest, NextResponse } from "next/server"
import { getCurrentSession } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { encryptApiKey } from "@/lib/ai/encryption"

const providerSchema = z.object({
  name: z.string().min(1, "Provider name is required"),
  slug: z.string().min(1, "Slug is required"),
  type: z.enum(["openai", "anthropic", "google", "custom"]),
  apiEndpoint: z.string().url("Invalid API endpoint URL"),
  apiKey: z.string().optional(), // Optional for updates
  description: z.string().optional(),
  config: z.any().optional(),
  order: z.number().default(0),
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

    const provider = await prisma.aIProvider.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { models: true },
        },
      },
    })

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      provider: {
        ...provider,
        apiKey: "***hidden***", // Don't return the actual API key
      },
    })
  } catch (error) {
    console.error("Get AI provider error:", error)

    return NextResponse.json(
      { error: "Failed to get AI provider" },
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
    const validatedData = providerSchema.parse(body)

    // Check if provider exists
    const existingProvider = await prisma.aIProvider.findUnique({
      where: { id: params.id },
    })

    if (!existingProvider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      )
    }

    // Check if slug is taken by another provider
    if (validatedData.slug !== existingProvider.slug) {
      const slugTaken = await prisma.aIProvider.findUnique({
        where: { slug: validatedData.slug },
      })

      if (slugTaken) {
        return NextResponse.json(
          { error: "A provider with this slug already exists" },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {
      name: validatedData.name,
      slug: validatedData.slug,
      type: validatedData.type,
      apiEndpoint: validatedData.apiEndpoint,
      description: validatedData.description,
      config: validatedData.config,
      order: validatedData.order,
    }

    // Only update API key if provided
    if (validatedData.apiKey && validatedData.apiKey !== "***hidden***") {
      updateData.apiKey = encryptApiKey(validatedData.apiKey)
    }

    // Update provider
    const provider = await prisma.aIProvider.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json({
      message: "AI provider updated successfully",
      provider: {
        ...provider,
        apiKey: "***hidden***",
      },
    })
  } catch (error) {
    console.error("AI provider update error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to update AI provider" },
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

    // Check if provider has models
    const modelCount = await prisma.aIModel.count({
      where: { providerId: params.id },
    })

    if (modelCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete provider with models. Delete models first." },
        { status: 400 }
      )
    }

    // Delete provider
    await prisma.aIProvider.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: "AI provider deleted successfully",
    })
  } catch (error) {
    console.error("AI provider deletion error:", error)

    return NextResponse.json(
      { error: "Failed to delete AI provider" },
      { status: 500 }
    )
  }
}
