/**
 * AI Service - 统一的 AI 调用接口
 * 支持主模型和备用模型的故障转移
 */

import { prisma } from '@/lib/prisma'
import { decryptApiKey } from './encryption'
import { callOpenAI } from './providers/openai'
import { callAnthropic } from './providers/anthropic'
import { callGoogle } from './providers/google'

export interface AICallOptions {
  temperature?: number
  maxTokens?: number
  stream?: boolean
  toolId?: string
  userId?: string
}

export interface AICallResult {
  success: boolean
  response?: string
  error?: string
  modelUsed: string
  providerId: string
  usedFallback: boolean
  fallbackLevel: number
  inputTokens: number
  outputTokens: number
  totalTokens: number
  cost: number
  latencyMs: number
}

/**
 * 调用 AI 模型（带故障转移）
 */
export async function callAI(
  prompt: string,
  options?: AICallOptions
): Promise<AICallResult> {
  const startTime = Date.now()

  // 获取全局配置
  const config = await prisma.aIConfig.findFirst()

  if (!config || !config.primaryModelId) {
    throw new Error('AI configuration not found. Please configure AI models first.')
  }

  // 尝试主模型
  try {
    const result = await callAIModel(config.primaryModelId, prompt, options)
    result.latencyMs = Date.now() - startTime
    result.usedFallback = false
    result.fallbackLevel = 0

    // 记录使用日志
    await logAIUsage(result, prompt, options)

    return result
  } catch (error) {
    console.error('Primary model failed:', error)

    // 如果启用了故障转移，尝试备用模型
    if (config.enableFallback && config.fallback1ModelId) {
      try {
        const result = await callAIModel(config.fallback1ModelId, prompt, options)
        result.latencyMs = Date.now() - startTime
        result.usedFallback = true
        result.fallbackLevel = 1

        await logAIUsage(result, prompt, options)

        return result
      } catch (error2) {
        console.error('Fallback model 1 failed:', error2)

        // 尝试第二个备用模型
        if (config.fallback2ModelId) {
          try {
            const result = await callAIModel(config.fallback2ModelId, prompt, options)
            result.latencyMs = Date.now() - startTime
            result.usedFallback = true
            result.fallbackLevel = 2

            await logAIUsage(result, prompt, options)

            return result
          } catch (error3) {
            console.error('Fallback model 2 failed:', error3)
          }
        }
      }
    }

    // 所有模型都失败了
    const failedResult: AICallResult = {
      success: false,
      error: 'All AI models failed',
      modelUsed: config.primaryModelId,
      providerId: '',
      usedFallback: false,
      fallbackLevel: 0,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      cost: 0,
      latencyMs: Date.now() - startTime,
    }

    await logAIUsage(failedResult, prompt, options)

    throw new Error('All AI models failed')
  }
}

/**
 * 调用指定的 AI 模型
 */
async function callAIModel(
  modelId: string,
  prompt: string,
  options?: AICallOptions
): Promise<AICallResult> {
  // 获取模型信息
  const model = await prisma.aIModel.findUnique({
    where: { id: modelId },
    include: { provider: true },
  })

  if (!model || !model.isActive) {
    throw new Error(`Model ${modelId} not found or inactive`)
  }

  if (!model.provider.isActive) {
    throw new Error(`Provider ${model.provider.name} is inactive`)
  }

  // 解密 API Key
  const apiKey = decryptApiKey(model.provider.apiKey)

  // 根据供应商类型调用对应的 API
  let response: any
  let inputTokens = 0
  let outputTokens = 0

  switch (model.provider.type) {
    case 'openai':
      response = await callOpenAI(
        apiKey,
        model.modelId,
        prompt,
        model.provider.apiEndpoint,
        options
      )
      inputTokens = response.usage?.prompt_tokens || 0
      outputTokens = response.usage?.completion_tokens || 0
      break

    case 'anthropic':
      response = await callAnthropic(
        apiKey,
        model.modelId,
        prompt,
        model.provider.apiEndpoint,
        options
      )
      inputTokens = response.usage?.input_tokens || 0
      outputTokens = response.usage?.output_tokens || 0
      break

    case 'google':
      response = await callGoogle(
        apiKey,
        model.modelId,
        prompt,
        model.provider.apiEndpoint,
        options
      )
      // Google 的 token 计数需要从 metadata 中获取
      inputTokens = response.usageMetadata?.promptTokenCount || 0
      outputTokens = response.usageMetadata?.candidatesTokenCount || 0
      break

    case 'custom':
      // 自定义供应商，假设使用 OpenAI 兼容格式
      response = await callOpenAI(
        apiKey,
        model.modelId,
        prompt,
        model.provider.apiEndpoint,
        options
      )
      inputTokens = response.usage?.prompt_tokens || 0
      outputTokens = response.usage?.completion_tokens || 0
      break

    default:
      throw new Error(`Unsupported provider type: ${model.provider.type}`)
  }

  // 计算成本
  const totalTokens = inputTokens + outputTokens
  const cost =
    (inputTokens / 1000000) * model.inputPrice +
    (outputTokens / 1000000) * model.outputPrice

  // 更新模型统计
  await prisma.aIModel.update({
    where: { id: model.id },
    data: {
      totalCalls: { increment: 1 },
      successCalls: { increment: 1 },
    },
  })

  // 提取响应文本
  let responseText = ''
  if (model.provider.type === 'openai' || model.provider.type === 'custom') {
    responseText = response.choices?.[0]?.message?.content || ''
  } else if (model.provider.type === 'anthropic') {
    responseText = response.content?.[0]?.text || ''
  } else if (model.provider.type === 'google') {
    responseText = response.candidates?.[0]?.content?.parts?.[0]?.text || ''
  }

  return {
    success: true,
    response: responseText,
    modelUsed: model.id,
    providerId: model.provider.id,
    usedFallback: false,
    fallbackLevel: 0,
    inputTokens,
    outputTokens,
    totalTokens,
    cost,
    latencyMs: 0, // 将在外部设置
  }
}

/**
 * 记录 AI 使用日志
 */
async function logAIUsage(
  result: AICallResult,
  prompt: string,
  options?: AICallOptions
) {
  try {
    await prisma.aIUsageLog.create({
      data: {
        providerId: result.providerId,
        modelId: result.modelUsed,
        userId: options?.userId,
        toolId: options?.toolId,
        prompt,
        response: result.response,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        totalTokens: result.totalTokens,
        cost: result.cost,
        latencyMs: result.latencyMs,
        status: result.success ? 'success' : 'failed',
        errorMessage: result.error,
        usedFallback: result.usedFallback,
        fallbackLevel: result.fallbackLevel,
      },
    })
  } catch (error) {
    console.error('Failed to log AI usage:', error)
  }
}

/**
 * 测试 AI 模型连接
 */
export async function testAIModel(modelId: string): Promise<boolean> {
  try {
    const result = await callAIModel(modelId, 'Hello, this is a test message.', {
      maxTokens: 10,
    })
    return result.success
  } catch (error) {
    return false
  }
}
