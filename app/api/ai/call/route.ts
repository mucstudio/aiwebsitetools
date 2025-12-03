import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { decryptApiKey } from "@/lib/ai/encryption"

// 注意：这里 AI 模型不做使用限制检查，由前端在调用 AI 前先调用 /api/usage/check
// AI 调用成功后，前端需要调用 /api/usage/record 记录使用
// 这样可以避免 AI 调用失败但仍然扣除次数的问题

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, toolId: toolIdOrSlug } = body

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      )
    }

    // 如果提供了 toolId，尝试通过 slug 或 id 查找工具
    let actualToolId: string | undefined
    if (toolIdOrSlug) {
      const tool = await prisma.tool.findFirst({
        where: {
          OR: [
            { id: toolIdOrSlug },
            { slug: toolIdOrSlug }
          ]
        }
      })
      actualToolId = tool?.id
    }

    // 获取 AI 配置
    const aiConfig = await prisma.aIConfig.findFirst()

    if (!aiConfig || !aiConfig.primaryModelId) {
      return NextResponse.json(
        { error: "AI configuration not found. Please configure AI models in admin settings." },
        { status: 500 }
      )
    }

    // 获取主模型信息
    const primaryModel = await prisma.aIModel.findUnique({
      where: { id: aiConfig.primaryModelId },
      include: { provider: true }
    })

    if (!primaryModel || !primaryModel.isActive) {
      return NextResponse.json(
        { error: "Primary AI model not found or inactive" },
        { status: 500 }
      )
    }

    // 调用 AI API
    let response: string
    let inputTokens = 0
    let outputTokens = 0
    let cost = 0

    try {
      const aiResponse = await callAIProvider(
        primaryModel.provider,
        primaryModel.modelId,
        prompt
      )

      response = aiResponse.content
      inputTokens = aiResponse.inputTokens || 0
      outputTokens = aiResponse.outputTokens || 0

      // 计算成本（每百万 token）
      cost = (inputTokens * primaryModel.inputPrice / 1000000) +
             (outputTokens * primaryModel.outputPrice / 1000000)

    } catch (error: any) {
      console.error("AI API call failed:", error)

      // 尝试备用模型
      if (aiConfig.enableFallback && aiConfig.fallback1ModelId) {
        const fallbackModel = await prisma.aIModel.findUnique({
          where: { id: aiConfig.fallback1ModelId },
          include: { provider: true }
        })

        if (fallbackModel && fallbackModel.isActive) {
          try {
            const aiResponse = await callAIProvider(
              fallbackModel.provider,
              fallbackModel.modelId,
              prompt
            )

            response = aiResponse.content
            inputTokens = aiResponse.inputTokens || 0
            outputTokens = aiResponse.outputTokens || 0
            cost = (inputTokens * fallbackModel.inputPrice / 1000000) +
                   (outputTokens * fallbackModel.outputPrice / 1000000)
          } catch (fallbackError) {
            throw error // 抛出原始错误
          }
        } else {
          throw error
        }
      } else {
        throw error
      }
    }

    // 注意：不在这里记录使用，由前端在 AI 调用成功后调用 /api/usage/record
    // 这样可以确保只有成功的调用才会被记录

    return NextResponse.json({
      response,
      toolId: actualToolId, // 返回 toolId 供前端记录使用
      usage: {
        inputTokens,
        outputTokens,
        cost
      }
    })

  } catch (error: any) {
    console.error("AI call error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to process AI request" },
      { status: 500 }
    )
  }
}

// AI Provider 调用函数
async function callAIProvider(
  provider: any,
  modelId: string,
  prompt: string
): Promise<{ content: string; inputTokens?: number; outputTokens?: number }> {

  // 解密 API Key
  const apiKey = decryptApiKey(provider.apiKey)
  const apiEndpoint = provider.apiEndpoint

  if (provider.type === "openai") {
    // OpenAI API 调用
    const response = await fetch(`${apiEndpoint}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.9,
        max_tokens: 1500
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || "OpenAI API call failed")
    }

    const data = await response.json()
    return {
      content: data.choices[0].message.content,
      inputTokens: data.usage?.prompt_tokens,
      outputTokens: data.usage?.completion_tokens
    }
  }
  else if (provider.type === "anthropic") {
    // Anthropic API 调用
    const response = await fetch(`${apiEndpoint}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: "user", content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.9
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || "Anthropic API call failed")
    }

    const data = await response.json()
    return {
      content: data.content[0].text,
      inputTokens: data.usage?.input_tokens,
      outputTokens: data.usage?.output_tokens
    }
  }
  else if (provider.type === "google") {
    // Google Gemini API 调用
    const response = await fetch(`${apiEndpoint}/${modelId}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 1500
        }
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || "Google API call failed")
    }

    const data = await response.json()
    return {
      content: data.candidates[0].content.parts[0].text,
      inputTokens: data.usageMetadata?.promptTokenCount,
      outputTokens: data.usageMetadata?.candidatesTokenCount
    }
  }
  else if (provider.type === "custom") {
    // 自定义 API 调用（兼容 OpenAI 格式）
    const response = await fetch(`${apiEndpoint}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.9,
        max_tokens: 1500
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = "Custom API call failed"
      try {
        const error = JSON.parse(errorText)
        errorMessage = error.error?.message || error.message || errorMessage
      } catch {
        errorMessage = errorText || errorMessage
      }
      throw new Error(errorMessage)
    }

    const data = await response.json()
    return {
      content: data.choices[0].message.content,
      inputTokens: data.usage?.prompt_tokens,
      outputTokens: data.usage?.completion_tokens
    }
  }
  else {
    throw new Error(`Unsupported provider type: ${provider.type}`)
  }
}
