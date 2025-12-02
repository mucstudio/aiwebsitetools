/**
 * OpenAI Provider
 * 支持 OpenAI 官方 API 和兼容的第三方 API
 */

export interface OpenAIModel {
  id: string
  object: string
  created: number
  owned_by: string
}

export interface OpenAIModelsResponse {
  object: string
  data: OpenAIModel[]
}

/**
 * 获取 OpenAI 可用模型列表
 */
export async function fetchOpenAIModels(
  apiKey: string,
  apiEndpoint: string = 'https://api.openai.com/v1'
): Promise<OpenAIModel[]> {
  const response = await fetch(`${apiEndpoint}/models`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to fetch OpenAI models: ${error}`)
  }

  const data: OpenAIModelsResponse = await response.json()
  return data.data
}

/**
 * 调用 OpenAI Chat Completion API
 */
export async function callOpenAI(
  apiKey: string,
  modelId: string,
  prompt: string,
  apiEndpoint: string = 'https://api.openai.com/v1',
  options?: {
    temperature?: number
    maxTokens?: number
    stream?: boolean
  }
) {
  const response = await fetch(`${apiEndpoint}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1000,
      stream: options?.stream ?? false,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${error}`)
  }

  return response.json()
}

/**
 * 解析 OpenAI 模型信息
 */
export function parseOpenAIModel(model: OpenAIModel) {
  return {
    name: model.id,
    modelId: model.id,
    description: `OpenAI model: ${model.id}`,
    // 根据模型 ID 推断定价（这里是示例，实际应该从配置或数据库获取）
    inputPrice: getOpenAIModelPrice(model.id).input,
    outputPrice: getOpenAIModelPrice(model.id).output,
    maxTokens: getOpenAIModelMaxTokens(model.id),
    contextWindow: getOpenAIModelMaxTokens(model.id),
    supportVision: model.id.includes('vision') || model.id.includes('gpt-4'),
    supportTools: true,
    supportStreaming: true,
  }
}

/**
 * 获取 OpenAI 模型定价（每百万 token）
 */
function getOpenAIModelPrice(modelId: string): { input: number; output: number } {
  // 这里是示例定价，实际应该从配置文件或数据库获取
  const pricing: Record<string, { input: number; output: number }> = {
    'gpt-4': { input: 30, output: 60 },
    'gpt-4-turbo': { input: 10, output: 30 },
    'gpt-4o': { input: 5, output: 15 },
    'gpt-4o-mini': { input: 0.15, output: 0.6 },
    'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
    'gpt-3.5-turbo-16k': { input: 3, output: 4 },
  }

  // 模糊匹配
  for (const [key, value] of Object.entries(pricing)) {
    if (modelId.includes(key)) {
      return value
    }
  }

  return { input: 0, output: 0 }
}

/**
 * 获取 OpenAI 模型最大 token 数
 */
function getOpenAIModelMaxTokens(modelId: string): number {
  if (modelId.includes('16k')) return 16384
  if (modelId.includes('32k')) return 32768
  if (modelId.includes('gpt-4')) return 8192
  if (modelId.includes('gpt-3.5')) return 4096
  return 4096
}
