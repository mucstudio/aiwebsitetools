import { NextRequest, NextResponse } from "next/server"
import { getCurrentSession } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { decryptApiKey } from "@/lib/ai/encryption"
import { fetchOpenAIModels, parseOpenAIModel } from "@/lib/ai/providers/openai"
import { fetchAnthropicModels, parseAnthropicModel } from "@/lib/ai/providers/anthropic"
import { fetchGoogleModels, parseGoogleModel } from "@/lib/ai/providers/google"

/**
 * 自动获取供应商的模型列表并保存到数据库
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

    // Get provider
    const provider = await prisma.aIProvider.findUnique({
      where: { id: params.id },
    })

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      )
    }

    // Decrypt API key
    const apiKey = decryptApiKey(provider.apiKey)

    // Fetch models based on provider type
    let models: any[] = []
    let parsedModels: any[] = []

    switch (provider.type) {
      case "openai":
        models = await fetchOpenAIModels(apiKey, provider.apiEndpoint)
        parsedModels = models.map(parseOpenAIModel)
        break

      case "anthropic":
        models = await fetchAnthropicModels(apiKey, provider.apiEndpoint)
        parsedModels = models.map(parseAnthropicModel)
        break

      case "google":
        models = await fetchGoogleModels(apiKey, provider.apiEndpoint)
        parsedModels = models.map(parseGoogleModel)
        break

      case "custom":
        // For custom providers, try OpenAI-compatible API
        try {
          models = await fetchOpenAIModels(apiKey, provider.apiEndpoint)
          parsedModels = models.map(parseOpenAIModel)
        } catch (error) {
          return NextResponse.json(
            { error: "Custom provider must be OpenAI-compatible" },
            { status: 400 }
          )
        }
        break

      default:
        return NextResponse.json(
          { error: "Unsupported provider type" },
          { status: 400 }
        )
    }

    // Save models to database
    const createdModels = []
    const updatedModels = []
    const skippedModels = []

    for (const model of parsedModels) {
      try {
        // Check if model already exists
        const existingModel = await prisma.aIModel.findUnique({
          where: {
            providerId_modelId: {
              providerId: provider.id,
              modelId: model.modelId,
            },
          },
        })

        if (existingModel) {
          // Update existing model
          const updated = await prisma.aIModel.update({
            where: { id: existingModel.id },
            data: {
              name: model.name,
              description: model.description,
              inputPrice: model.inputPrice,
              outputPrice: model.outputPrice,
              maxTokens: model.maxTokens,
              contextWindow: model.contextWindow,
              supportVision: model.supportVision,
              supportTools: model.supportTools,
              supportStreaming: model.supportStreaming,
            },
          })
          updatedModels.push(updated)
        } else {
          // Create new model
          const created = await prisma.aIModel.create({
            data: {
              providerId: provider.id,
              name: model.name,
              modelId: model.modelId,
              description: model.description,
              inputPrice: model.inputPrice,
              outputPrice: model.outputPrice,
              maxTokens: model.maxTokens,
              contextWindow: model.contextWindow,
              supportVision: model.supportVision,
              supportTools: model.supportTools,
              supportStreaming: model.supportStreaming,
              isManual: false,
            },
          })
          createdModels.push(created)
        }
      } catch (error) {
        console.error(`Failed to save model ${model.modelId}:`, error)
        skippedModels.push(model.modelId)
      }
    }

    return NextResponse.json({
      message: "Models fetched successfully",
      summary: {
        total: parsedModels.length,
        created: createdModels.length,
        updated: updatedModels.length,
        skipped: skippedModels.length,
      },
      createdModels,
      updatedModels,
      skippedModels,
    })
  } catch (error) {
    console.error("Fetch models error:", error)

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch models" },
      { status: 500 }
    )
  }
}
