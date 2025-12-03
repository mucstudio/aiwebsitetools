/**
 * 通用工具处理器工厂函数
 *
 * 用于快速创建新工具的 API 路由，自动处理：
 * - 使用限制检查
 * - 内容安全审核
 * - AI 调用
 * - 使用记录
 * - 错误处理
 */

import { NextRequest, NextResponse } from "next/server"
import { generateDeviceFingerprint } from "@/lib/usage-limits/fingerprint"

// 工具处理器的核心逻辑函数类型
export type ToolProcessor = (input: any, context: ToolContext) => Promise<ToolResult>

// 工具上下文（传递给 processor 的额外信息）
export interface ToolContext {
  userId?: string
  sessionId?: string
  ipAddress?: string
  deviceFingerprint?: string
  userAgent?: string
}

// 工具处理结果
export interface ToolResult {
  content: string | object  // 返回给用户的内容
  metadata?: {
    aiTokens?: number
    aiCost?: number
    [key: string]: any
  }
}

// 安全配置选项
export interface SafetyConfig {
  blacklist?: string[]              // 自定义黑名单（会与全局黑名单合并）
  whitelist?: string[]              // 白名单（如果设置，只允许包含这些词的内容）
  ignoreGlobalBlacklist?: boolean   // 是否忽略全局黑名单（默认 false）
  sensitivity?: 'low' | 'medium' | 'high' // 敏感度级别（默认 medium）
  minLength?: number                // 最小输入长度（默认 3）
  maxLength?: number                // 最大输入长度（默认 5000）
  allowedLanguages?: string[]       // 允许的语言（如 ['zh', 'en']）
  customValidator?: (input: string) => { allowed: boolean; reason?: string } // 自定义验证函数
}

// 工具配置选项
export interface ToolHandlerOptions {
  toolId: string                    // 工具唯一标识
  requireAuth?: boolean             // 是否需要登录（默认 false）
  skipUsageCheck?: boolean          // 是否跳过使用限制检查（默认 false）
  skipContentModeration?: boolean   // 是否跳过内容审核（默认 false）
  processor: ToolProcessor          // 核心业务逻辑
  validateInput?: (input: any) => { valid: boolean; error?: string } // 输入验证
  safetyConfig?: SafetyConfig       // 安全配置（可选）
}

/**
 * 创建工具处理器
 *
 * @example
 * ```typescript
 * export const POST = createToolHandler({
 *   toolId: 'aura-check',
 *   processor: async (input, context) => {
 *     const result = await callAI(input)
 *     return { content: result }
 *   }
 * })
 * ```
 */
export function createToolHandler(options: ToolHandlerOptions) {
  const {
    toolId,
    requireAuth = false,
    skipUsageCheck = false,
    skipContentModeration = false,
    processor,
    validateInput,
    safetyConfig
  } = options

  return async function POST(request: NextRequest) {
    try {
      // 1. 解析请求
      const body = await request.json()
      const { input, userInput } = body
      const actualInput = input || userInput

      // 获取请求上下文
      const deviceFingerprint = request.headers.get('x-device-fingerprint') || undefined
      const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1'
      const userAgent = request.headers.get('user-agent') || undefined

      // 2. 输入验证
      if (validateInput) {
        const validation = validateInput(actualInput)
        if (!validation.valid) {
          return NextResponse.json(
            { error: validation.error || 'Invalid input' },
            { status: 400 }
          )
        }
      }

      // 3. 认证检查（如果需要）
      if (requireAuth) {
        const { getCurrentSession } = await import('@/lib/auth-utils')
        const session = await getCurrentSession()
        if (!session) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          )
        }
      }

      // 4. 使用限制检查（如果需要）
      if (!skipUsageCheck) {
        const checkRes = await fetch(new URL('/api/usage/check', request.url), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Device-Fingerprint': deviceFingerprint || ''
          },
          body: JSON.stringify({})
        })

        const checkData = await checkRes.json()

        if (!checkData.allowed) {
          return NextResponse.json(
            {
              error: checkData.reason || 'Usage limit exceeded',
              remaining: checkData.remaining,
              requiresLogin: checkData.requiresLogin,
              requiresUpgrade: checkData.requiresUpgrade
            },
            { status: 429 }
          )
        }
      }

      // 5. 内容审核（如果需要）
      if (!skipContentModeration && typeof actualInput === 'string') {
        const moderationResult = moderateContent(actualInput, safetyConfig)
        if (!moderationResult.allowed) {
          return NextResponse.json(
            { error: moderationResult.reason },
            { status: 400 }
          )
        }
      }

      // 6. 执行核心业务逻辑
      const context: ToolContext = {
        deviceFingerprint,
        ipAddress,
        userAgent
      }

      const result = await processor(actualInput, context)

      // 7. 记录使用（如果需要）
      if (!skipUsageCheck) {
        await fetch(new URL('/api/usage/record', request.url), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Device-Fingerprint': deviceFingerprint || ''
          },
          body: JSON.stringify({
            toolId,
            usedAI: !!result.metadata?.aiTokens,
            aiTokens: result.metadata?.aiTokens,
            aiCost: result.metadata?.aiCost
          })
        })
      }

      // 8. 返回结果
      return NextResponse.json({
        success: true,
        result: result.content,
        metadata: result.metadata
      })

    } catch (error: any) {
      console.error(`Tool ${toolId} error:`, error)

      return NextResponse.json(
        {
          error: error.message || 'Internal server error',
          toolId
        },
        { status: 500 }
      )
    }
  }
}

/**
 * 内容审核函数 - 支持自定义安全配置
 *
 * 功能：
 * - 全局黑名单检查
 * - 自定义黑名单检查
 * - 白名单检查（如果设置）
 * - 敏感度级别控制
 * - 长度限制
 * - 语言检测
 * - 自定义验证器
 */
function moderateContent(
  input: string,
  config?: SafetyConfig
): { allowed: boolean; reason?: string } {
  // 全局黑名单（严重违规内容）
  const globalBlacklist = [
    'rape', 'murder', 'kill', 'suicide', 'bomb', 'terrorist',
    'abuse', 'pedophile', 'nazi', 'genocide', 'violence', 'weapon'
  ]

  // 根据敏感度级别添加额外的黑名单
  const sensitivityBlacklist: Record<string, string[]> = {
    low: [],
    medium: ['fuck', 'shit', 'damn'],
    high: ['fuck', 'shit', 'damn', 'hell', 'ass', 'bitch', 'crap']
  }

  const sensitivity = config?.sensitivity || 'medium'
  const minLength = config?.minLength ?? 3
  const maxLength = config?.maxLength ?? 5000

  const lower = input.toLowerCase()

  // 1. 长度检查
  if (input.length < minLength) {
    return {
      allowed: false,
      reason: `Input too short (minimum ${minLength} characters)`
    }
  }

  if (input.length > maxLength) {
    return {
      allowed: false,
      reason: `Input too long (maximum ${maxLength} characters)`
    }
  }

  // 2. 白名单检查（如果设置了白名单，只允许包含白名单词的内容）
  if (config?.whitelist && config.whitelist.length > 0) {
    const hasWhitelistedWord = config.whitelist.some(word =>
      lower.includes(word.toLowerCase())
    )

    if (!hasWhitelistedWord) {
      return {
        allowed: false,
        reason: "Content does not contain required keywords"
      }
    }
  }

  // 3. 黑名单检查
  const finalBlacklist = [
    // 全局黑名单（除非明确忽略）
    ...(config?.ignoreGlobalBlacklist ? [] : globalBlacklist),
    // 敏感度级别黑名单
    ...sensitivityBlacklist[sensitivity],
    // 自定义黑名单
    ...(config?.blacklist || [])
  ]

  for (const word of finalBlacklist) {
    if (lower.includes(word.toLowerCase())) {
      return {
        allowed: false,
        reason: "Content contains prohibited words"
      }
    }
  }

  // 4. 语言检测（简单实现）
  if (config?.allowedLanguages && config.allowedLanguages.length > 0) {
    const detectedLanguage = detectLanguage(input)

    if (!config.allowedLanguages.includes(detectedLanguage)) {
      return {
        allowed: false,
        reason: `Only ${config.allowedLanguages.join(', ')} languages are allowed`
      }
    }
  }

  // 5. 自定义验证器
  if (config?.customValidator) {
    const customResult = config.customValidator(input)
    if (!customResult.allowed) {
      return customResult
    }
  }

  return { allowed: true }
}

/**
 * 简单的语言检测函数
 * 检测输入文本的主要语言
 */
function detectLanguage(text: string): string {
  // 中文字符范围
  const chineseRegex = /[\u4e00-\u9fa5]/g
  const chineseMatches = text.match(chineseRegex)
  const chineseRatio = chineseMatches ? chineseMatches.length / text.length : 0

  // 日文字符范围
  const japaneseRegex = /[\u3040-\u309f\u30a0-\u30ff]/g
  const japaneseMatches = text.match(japaneseRegex)
  const japaneseRatio = japaneseMatches ? japaneseMatches.length / text.length : 0

  // 韩文字符范围
  const koreanRegex = /[\uac00-\ud7af]/g
  const koreanMatches = text.match(koreanRegex)
  const koreanRatio = koreanMatches ? koreanMatches.length / text.length : 0

  // 判断主要语言
  if (chineseRatio > 0.3) return 'zh'
  if (japaneseRatio > 0.3) return 'ja'
  if (koreanRatio > 0.3) return 'ko'

  // 默认为英文
  return 'en'
}

/**
 * 辅助函数：调用 AI
 * 封装了对 /api/ai/call 的调用
 */
export async function callAI(
  prompt: string,
  toolId: string,
  baseUrl?: string
): Promise<{ content: string; tokens: number; cost: number }> {
  const url = baseUrl ? new URL('/api/ai/call', baseUrl) : '/api/ai/call'

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt,
      toolId
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'AI call failed')
  }

  const data = await response.json()

  return {
    content: data.response,
    tokens: (data.usage?.inputTokens || 0) + (data.usage?.outputTokens || 0),
    cost: data.usage?.cost || 0
  }
}
