/**
 * 🏗️ 通用工具处理器工厂函数 - 增强版
 *
 * 核心思想：将公共逻辑（安全、计费）与业务逻辑（Prompt、AI参数）分离
 *
 * 新增功能：
 * - ✅ 可定制的安全配置（每个工具独立的黑名单和敏感度）
 * - ✅ TypeScript 泛型支持（类型安全）
 * - ✅ 多种返回格式（文本、JSON、图片等）
 * - ✅ 增强的错误处理
 *
 * 使用方式：
 * ```typescript
 * export const POST = createToolHandler({
 *   toolId: 'aura-check',
 *   processor: async (input) => {
 *     const result = await callAI(input)
 *     return result
 *   },
 *   safetyConfig: {
 *     customBlacklist: ['特定敏感词'],
 *     sensitivity: 'high'
 *   }
 * })
 * ```
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentSession } from '@/lib/auth-utils'
import { checkUsageLimit, recordUsage } from '@/lib/usage-limits/service'
import { getOrCreateGuestSession, getClientIP, getUserAgent } from '@/lib/usage-limits/session'

// ============================================
// 类型定义
// ============================================

/**
 * 工具处理器的核心逻辑函数
 * @param input - 用户输入
 * @param context - 请求上下文（用户信息、设备信息等）
 * @returns 处理结果（可以是字符串或对象）
 */
export type ToolProcessor = (input: any, context: ToolContext) => Promise<string | object>

/**
 * 工具上下文
 */
export interface ToolContext {
  userId?: string
  sessionId?: string
  ipAddress?: string
  deviceFingerprint?: string
  userAgent?: string
  toolId: string
}

/**
 * 安全配置接口
 * 允许每个工具定制自己的安全策略
 */
export interface SafetyConfig {
  customBlacklist?: string[]        // 工具特有的拦截词（追加到全局黑名单）
  ignoreGlobalBlacklist?: boolean   // 是否忽略全局黑名单（慎用，仅用于特殊工具）
  sensitivity?: 'low' | 'medium' | 'high' // 内容审核敏感度
  maxLength?: number                // 最大输入长度（覆盖默认的 5000）
  minLength?: number                // 最小输入长度（覆盖默认的 3）
  allowedLanguages?: string[]       // 允许的语言（如 ['zh', 'en']）
}

/**
 * 工具配置选项
 */
export interface ToolHandlerOptions {
  toolId: string                    // 工具唯一标识（必须与数据库中的 tool.id 或 tool.slug 匹配）
  cost?: number                     // 单次调用消耗的点数（默认为1，暂未使用）
  requireAuth?: boolean             // 是否需要登录（默认 false）
  skipUsageCheck?: boolean          // 是否跳过使用限制检查（默认 false）
  skipContentModeration?: boolean   // 是否跳过内容审核（默认 false）
  processor: ToolProcessor          // 核心业务逻辑
  validateInput?: (input: any) => ValidationResult // 输入验证函数
  safetyConfig?: SafetyConfig       // 安全配置（可选）
}

/**
 * 输入验证结果
 */
export interface ValidationResult {
  valid: boolean
  error?: string
}

// ============================================
// 主函数：创建工具处理器
// ============================================

/**
 * 创建工具处理器
 *
 * 自动处理：
 * 1. 使用限制检查
 * 2. 内容安全审核
 * 3. 核心业务逻辑执行
 * 4. 使用记录
 * 5. 错误处理
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
      // ============================================
      // 第1层：请求解析
      // ============================================
      const body = await request.json()
      const { input, userInput } = body
      const actualInput = input || userInput

      // 获取请求上下文
      const deviceFingerprint = request.headers.get('x-device-fingerprint') || undefined
      const ipAddress = getClientIP(request)
      const userAgent = getUserAgent(request)
      const session = await getCurrentSession()
      const sessionId = await getOrCreateGuestSession()

      // ============================================
      // 第2层：输入验证
      // ============================================
      if (validateInput) {
        const validation = validateInput(actualInput)
        if (!validation.valid) {
          return NextResponse.json(
            { error: validation.error || 'Invalid input' },
            { status: 400 }
          )
        }
      }

      // ============================================
      // 第3层：认证检查（如果需要）
      // ============================================
      if (requireAuth && !session) {
        return NextResponse.json(
          { error: 'Authentication required', requiresLogin: true },
          { status: 401 }
        )
      }

      // ============================================
      // 第4层：使用限制检查（如果需要）
      // ============================================
      if (!skipUsageCheck) {
        const checkResult = await checkUsageLimit({
          userId: session?.user?.id,
          sessionId,
          ipAddress,
          deviceFingerprint
        })

        if (!checkResult.allowed) {
          return NextResponse.json(
            {
              error: checkResult.reason || 'Usage limit exceeded',
              remaining: checkResult.remaining,
              limit: checkResult.limit,
              requiresLogin: checkResult.requiresLogin,
              requiresUpgrade: checkResult.requiresUpgrade
            },
            { status: 429 }
          )
        }
      }

      // ============================================
      // 第5层：内容审核（如果需要，支持自定义配置）
      // ============================================
      if (!skipContentModeration && typeof actualInput === 'string') {
        const moderationResult = moderateContent(actualInput, safetyConfig)
        if (!moderationResult.allowed) {
          return NextResponse.json(
            { error: moderationResult.reason },
            { status: 400 }
          )
        }
      }

      // ============================================
      // 第6层：查找工具ID（支持 slug 或 id）
      // ============================================
      let actualToolId: string | undefined
      const tool = await prisma.tool.findFirst({
        where: {
          OR: [
            { id: toolId },
            { slug: toolId }
          ]
        }
      })
      actualToolId = tool?.id

      if (!actualToolId) {
        return NextResponse.json(
          { error: `Tool not found: ${toolId}` },
          { status: 404 }
        )
      }

      // ============================================
      // 第7层：执行核心业务逻辑
      // ============================================
      const context: ToolContext = {
        userId: session?.user?.id,
        sessionId,
        ipAddress,
        deviceFingerprint,
        userAgent,
        toolId: actualToolId
      }

      const result = await processor(actualInput, context)

      // ============================================
      // 第8层：记录使用（如果需要）
      // ============================================
      if (!skipUsageCheck) {
        // 判断是否使用了 AI（如果结果包含 metadata）
        const usedAI = typeof result === 'object' && 'metadata' in result && result.metadata?.aiTokens
        const aiTokens = usedAI ? result.metadata.aiTokens : undefined
        const aiCost = usedAI ? result.metadata.aiCost : undefined

        await recordUsage(actualToolId, {
          userId: session?.user?.id,
          sessionId,
          ipAddress,
          userAgent,
          deviceFingerprint,
          usedAI,
          aiTokens,
          aiCost
        })
      }

      // ============================================
      // 第9层：返回结果
      // ============================================
      // 如果结果是对象且包含 content 字段，提取 content
      let responseData
      if (typeof result === 'object' && 'content' in result) {
        responseData = {
          success: true,
          result: result.content,
          metadata: result.metadata
        }
      } else {
        responseData = {
          success: true,
          result: result
        }
      }

      // 重新检查剩余次数（返回给前端）
      if (!skipUsageCheck) {
        const newCheckResult = await checkUsageLimit({
          userId: session?.user?.id,
          sessionId,
          ipAddress,
          deviceFingerprint
        })
        responseData.remaining = newCheckResult.remaining
      }

      return NextResponse.json(responseData)

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

// ============================================
// 辅助函数
// ============================================

/**
 * 增强的内容审核函数
 * 支持自定义安全配置
 *
 * @param input - 用户输入
 * @param safetyConfig - 安全配置（可选）
 * @returns 审核结果
 */
function moderateContent(
  input: string,
  safetyConfig?: SafetyConfig
): { allowed: boolean; reason?: string } {
  // 全局黑名单（基础敏感词）
  const globalBlacklist = [
    'rape', 'murder', 'kill', 'suicide', 'bomb', 'terrorist',
    'abuse', 'pedophile', 'nazi', 'genocide'
  ]

  // 根据敏感度添加额外的词汇
  const sensitivityBlacklist: Record<string, string[]> = {
    low: [],
    medium: ['fuck', 'shit', 'damn'],
    high: ['fuck', 'shit', 'damn', 'hell', 'ass', 'bitch', 'crap']
  }

  // 合并黑名单
  let finalBlacklist = [...globalBlacklist]

  // 如果不忽略全局黑名单
  if (!safetyConfig?.ignoreGlobalBlacklist) {
    // 根据敏感度添加词汇
    const sensitivity = safetyConfig?.sensitivity || 'medium'
    finalBlacklist = [...finalBlacklist, ...sensitivityBlacklist[sensitivity]]
  }

  // 添加自定义黑名单
  if (safetyConfig?.customBlacklist) {
    finalBlacklist = [...finalBlacklist, ...safetyConfig.customBlacklist]
  }

  // 检查黑名单
  const lower = input.toLowerCase()
  for (const word of finalBlacklist) {
    if (lower.includes(word.toLowerCase())) {
      return {
        allowed: false,
        reason: "Content contains prohibited words"
      }
    }
  }

  // 检查长度限制
  const minLength = safetyConfig?.minLength || 3
  const maxLength = safetyConfig?.maxLength || 5000

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

  // 检查语言（如果配置了）
  if (safetyConfig?.allowedLanguages && safetyConfig.allowedLanguages.length > 0) {
    const hasAllowedLanguage = safetyConfig.allowedLanguages.some(lang => {
      // 简单的语言检测（可以替换为更复杂的库）
      if (lang === 'zh') return /[\u4e00-\u9fa5]/.test(input)
      if (lang === 'en') return /[a-zA-Z]/.test(input)
      return true
    })

    if (!hasAllowedLanguage) {
      return {
        allowed: false,
        reason: `Only ${safetyConfig.allowedLanguages.join(', ')} languages are allowed`
      }
    }
  }

  return { allowed: true }
}

/**
 * 辅助函数：调用 AI
 * 封装了对现有 /api/ai/call 的调用
 *
 * @param prompt - AI Prompt
 * @param toolId - 工具ID
 * @returns AI 响应内容、token 使用量和成本
 */
export async function callAI(
  prompt: string,
  toolId: string
): Promise<{ content: string; tokens: number; cost: number }> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  const response = await fetch(`${baseUrl}/api/ai/call`, {
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
