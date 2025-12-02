/**
 * Anthropic Provider
 * 支持 Claude 系列模型
 */

export interface AnthropicModel {
  id: string
  display_name: string
  created_at: string
  type: string
}

/**
 * 获取 Anthropic 可用模型列表
 * 注意：Anthropic API 目前没有公开的 list models 端点
 * 我们返回已知的模型列表
 */
export async function fetchAnthropicModels(
  apiKey: string,
  apiEndpoint: string = 'https://api.anthropic.com/v1'
): Promise<AnthropicModel[]> {
  // Anthropic 没有 list models API，返回已知模型
  const knownModels: AnthropicModel[] = [
    {
      id: 'claude-3-5-sonnet-20241022',
      display_name: 'Claude 3.5 Sonnet',
      created_at: new Date().toISOString(),
      type: 'chat',
    },
    {
      id: 'claude-3-5-haiku-20241022',
      display_name: 'Claude 3.5 Haiku',
      created_at: new Date().toISOString(),
      type: 'chat',
    },
    {
      id: 'claude-3-opus-20240229',
      display_name: 'Claude 3 Opus',
      created_at: new Date().toISOString(),
      type: 'chat',
    },
    {
      id: 'claude-3-sonnet-20240229',
      display_name: 'Claude 3 Sonnet',
      created_at: new Date().toISOString(),
      type: 'chat',
    },
    {
      id: 'claude-3-haiku-20240307',
      display_name: 'Claude 3 Haiku',
      created_at: new Date().toISOString(),
      type: 'chat',
    },
  ]

  // 验证 API Key 是否有效
  try {
    await testAnthropicApiKey(apiKey, apiEndpoint)
    return knownModels
  } catch (error) {
    throw new Error(`Invalid Anthropic API key: ${error}`)
  }
}

/**
 * 测试 Anthropic API Key 是否有效
 */
async function testAnthropicApiKey(apiKey: string, apiEndpoint: string): Promise<boolean> {
  const response = await fetch(`${apiEndpoint}/messages`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 10,
      messages: [
        {
          role: 'user',
          content: 'test',
        },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error)
  }

  return true
}

/**
 * 调用 Anthropic Messages API
 */
export async function callAnthropic(
  apiKey: string,
  modelId: string,
  prompt: string,
  apiEndpoint: string = 'https://api.anthropic.com/v1',
  options?: {
    temperature?: number
    maxTokens?: number
    stream?: boolean
  }
) {
  const response = await fetch(`${apiEndpoint}/messages`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      max_tokens: options?.maxTokens ?? 1000,
      temperature: options?.temperature ?? 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      stream: options?.stream ?? false,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Anthropic API error: ${error}`)
  }

  return response.json()
}

/**
 * 解析 Anthropic 模型信息
 */
export function parseAnthropicModel(model: AnthropicModel) {
  return {
    name: model.display_name,
    modelId: model.id,
    description: `Anthropic model: ${model.display_name}`,
    inputPrice: getAnthropicModelPrice(model.id).input,
    outputPrice: getAnthropicModelPrice(model.id).output,
    maxTokens: getAnthropicModelMaxTokens(model.id),
    contextWindow: getAnthropicModelMaxTokens(model.id),
    supportVision: model.id.includes('claude-3'),
    supportTools: true,
    supportStreaming: true,
  }
}

/**
 * 获取 Anthropic 模型定价（每百万 token）
 */
function getAnthropicModelPrice(modelId: string): { input: number; output: number } {
  const pricing: Record<string, { input: number; output: number }> = {
    'claude-3-5-sonnet': { input: 3, output: 15 },
    'claude-3-5-haiku': { input: 0.8, output: 4 },
    'claude-3-opus': { input: 15, output: 75 },
    'claude-3-sonnet': { input: 3, output: 15 },
    'claude-3-haiku': { input: 0.25, output: 1.25 },
  }

  for (const [key, value] of Object.entries(pricing)) {
    if (modelId.includes(key)) {
      return value
    }
  }

  return { input: 0, output: 0 }
}

/**
 * 获取 Anthropic 模型最大 token 数
 */
function getAnthropicModelMaxTokens(modelId: string): number {
  if (modelId.includes('claude-3')) return 200000
  return 100000
}
