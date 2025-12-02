/**
 * Google AI Provider
 * 支持 Gemini 系列模型
 */

export interface GoogleModel {
  name: string
  displayName: string
  description: string
  supportedGenerationMethods: string[]
}

export interface GoogleModelsResponse {
  models: GoogleModel[]
}

/**
 * 获取 Google AI 可用模型列表
 */
export async function fetchGoogleModels(
  apiKey: string,
  apiEndpoint: string = 'https://generativelanguage.googleapis.com/v1'
): Promise<GoogleModel[]> {
  const response = await fetch(`${apiEndpoint}/models?key=${apiKey}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to fetch Google models: ${error}`)
  }

  const data: GoogleModelsResponse = await response.json()
  return data.models.filter(m => m.supportedGenerationMethods.includes('generateContent'))
}

/**
 * 调用 Google Gemini API
 */
export async function callGoogle(
  apiKey: string,
  modelId: string,
  prompt: string,
  apiEndpoint: string = 'https://generativelanguage.googleapis.com/v1',
  options?: {
    temperature?: number
    maxTokens?: number
  }
) {
  const response = await fetch(
    `${apiEndpoint}/${modelId}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: options?.temperature ?? 0.7,
          maxOutputTokens: options?.maxTokens ?? 1000,
        },
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Google API error: ${error}`)
  }

  return response.json()
}

/**
 * 解析 Google 模型信息
 */
export function parseGoogleModel(model: GoogleModel) {
  const modelId = model.name.split('/').pop() || model.name

  return {
    name: model.displayName,
    modelId: modelId,
    description: model.description,
    inputPrice: getGoogleModelPrice(modelId).input,
    outputPrice: getGoogleModelPrice(modelId).output,
    maxTokens: getGoogleModelMaxTokens(modelId),
    contextWindow: getGoogleModelMaxTokens(modelId),
    supportVision: modelId.includes('vision') || modelId.includes('gemini-pro'),
    supportTools: true,
    supportStreaming: true,
  }
}

/**
 * 获取 Google 模型定价（每百万 token）
 */
function getGoogleModelPrice(modelId: string): { input: number; output: number } {
  const pricing: Record<string, { input: number; output: number }> = {
    'gemini-1.5-pro': { input: 3.5, output: 10.5 },
    'gemini-1.5-flash': { input: 0.35, output: 1.05 },
    'gemini-pro': { input: 0.5, output: 1.5 },
  }

  for (const [key, value] of Object.entries(pricing)) {
    if (modelId.includes(key)) {
      return value
    }
  }

  return { input: 0, output: 0 }
}

/**
 * 获取 Google 模型最大 token 数
 */
function getGoogleModelMaxTokens(modelId: string): number {
  if (modelId.includes('1.5')) return 1000000
  if (modelId.includes('pro')) return 32768
  return 8192
}
