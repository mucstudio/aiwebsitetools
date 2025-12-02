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
  apiKey: z.string().min(1, "API key is required"),
  description: z.string().optional(),
  config: z.any().optional(),
  order: z.number().default(0),
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
    const validatedData = providerSchema.parse(body)

    // Check if slug already exists
    const existingProvider = await prisma.aIProvider.findUnique({
      where: { slug: validatedData.slug },
    })

    if (existingProvider) {
      return NextResponse.json(
        { error: "A provider with this slug already exists" },
        { status: 400 }
      )
    }

    // Encrypt API key
    const encryptedApiKey = encryptApiKey(validatedData.apiKey)

    // Create provider
    const provider = await prisma.aIProvider.create({
      data: {
        ...validatedData,
        apiKey: encryptedApiKey,
      },
    })

    return NextResponse.json({
      message: "AI provider created successfully",
      provider: {
        ...provider,
        apiKey: "***hidden***", // Don't return the actual API key
      },
    })
  } catch (error) {
    console.error("AI provider creation error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create AI provider" },
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

    const providers = await prisma.aIProvider.findMany({
      include: {
        _count: {
          select: { models: true },
        },
      },
      orderBy: { order: "asc" },
    })

    // Hide API keys in response
    const providersWithHiddenKeys = providers.map((provider) => ({
      ...provider,
      apiKey: "***hidden***",
    }))

    return NextResponse.json({ providers: providersWithHiddenKeys })
  } catch (error) {
    console.error("Get AI providers error:", error)

    return NextResponse.json(
      { error: "Failed to get AI providers" },
      { status: 500 }
    )
  }
}
