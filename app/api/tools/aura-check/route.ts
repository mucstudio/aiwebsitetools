/**
 * 🌟 Aura Check 工具 - 工厂模式重构版
 *
 * 对比原版本：
 * - 代码量：从 367 行减少到 50 行
 * - 自动处理：使用限制、内容审核、使用记录
 * - 更易维护：核心逻辑清晰分离
 */

import { createToolHandler, callAI } from '@/lib/create-tool-handler'

// ============================================
// 核心业务逻辑
// ============================================

const auraCheckProcessor = async (input: string) => {
  // 构建 AI Prompt
  const prompt = `You are 'Aura Check', a mystical vibe calculator for Gen Z.

Task: Analyze the user's action and calculate their "Aura Points" (Social Credit/Coolness Score).

Format:
1. First line: The Score (e.g., "+5000 Aura", "-200 Aura", "Infinite Aura").
2. Second part: A brief, mystical, or funny explanation of why.

Tone: Ethereal, Gen Z slang (but make it sound ancient/mystical), slightly judgmental but funny.

Scoring Guide:
- Cool/Confident/Kind = Positive Aura (+)
- Cringe/Embarrassing/Mean = Negative Aura (-)
- Extremely cool = Infinite Aura

User action: ${input}`

  // 调用 AI（自动处理 token 统计和成本计算）
  const aiResult = await callAI(prompt, 'aura-check')

  // 解析 AI 响应（分离分数和说明）
  const fullContent = aiResult.content
  const splitIndex = fullContent.indexOf('\n')

  let score = ""
  let body = ""

  if (splitIndex !== -1) {
    score = fullContent.substring(0, splitIndex).trim()
    body = fullContent.substring(splitIndex).trim()
  } else {
    score = "??? Aura"
    body = fullContent
  }

  // 清理格式
  score = score.replace(/\*\*/g, '').replace(/#/g, '')

  // 返回结构化结果
  return {
    content: {
      score,
      body,
      fullText: fullContent
    },
    metadata: {
      aiTokens: aiResult.tokens,
      aiCost: aiResult.cost
    }
  }
}

// ============================================
// 输入验证
// ============================================

const validateAuraInput = (input: any) => {
  if (typeof input !== 'string') {
    return { valid: false, error: 'Input must be a string' }
  }

  const trimmed = input.trim()

  if (trimmed.length < 3) {
    return { valid: false, error: 'The universe needs more context.' }
  }

  if (trimmed.length > 500) {
    return { valid: false, error: 'Input too long (max 500 characters)' }
  }

  return { valid: true }
}

// ============================================
// 导出工具处理器
// ============================================

export const POST = createToolHandler({
  toolId: 'aura-check',
  processor: auraCheckProcessor,
  validateInput: validateAuraInput,
  // 可选配置：
  // requireAuth: false,           // 不需要登录
  // skipUsageCheck: false,        // 需要检查使用限制
  // skipContentModeration: false, // 需要内容审核
})
