/**
 * 🌙 Dream Stream - Subconscious Decoder
 *
 * 使用工厂模式处理梦境解析
 */

import { createToolHandler, callAI } from '@/lib/create-tool-handler'

// ============================================
// 核心业务逻辑
// ============================================

const dreamInterpreterProcessor = async (input: { dream: string; mode: string }) => {
  const { dream, mode } = input

  // 根据模式设置不同的风格
  let promptStyle = ""
  if (mode === 'mystical') {
    promptStyle = "Mystical, spiritual, astrology-vibe. Focus on omens, future predictions, and cosmic energy."
  } else if (mode === 'psych') {
    promptStyle = "Psychological, Freudian, Jungian. Focus on subconscious desires, repressed fears, and childhood trauma (but keep it light)."
  } else {
    promptStyle = "Unhinged, Gen Z meme style. Treat the dream as a chaotic brainrot episode. Use slang like 'fever dream', 'core core'."
  }

  const prompt = `You are 'Dream Stream', a dream interpreter.

Task: Interpret the user's dream based on the selected style: ${mode}.
Style Guide: ${promptStyle}

Output Format:
1. **The Meaning**: A paragraph interpreting the dream.
2. **The Vibe**: A 1-sentence summary of the dream's energy.

Keep it entertaining, roughly 100-150 words. Do NOT be overly medical or serious.

User's dream: ${dream}`

  // 调用 AI（自动处理 token 统计和成本计算）
  const aiResult = await callAI(prompt, 'dream-interpreter', {
    temperature: 0.9,
    maxTokens: 2000
  })

  // 返回结构化结果
  return {
    content: aiResult.content,
    metadata: {
      aiTokens: aiResult.tokens,
      aiCost: aiResult.cost
    }
  }
}

// ============================================
// 输入验证
// ============================================

const validateDreamInput = (input: any) => {
  if (!input || typeof input !== 'object') {
    return { valid: false, error: 'Invalid input format' }
  }

  const { dream, mode } = input

  if (!dream || typeof dream !== 'string') {
    return { valid: false, error: 'Dream description is required' }
  }

  const trimmed = dream.trim()

  if (trimmed.length < 5) {
    return { valid: false, error: 'The dream is too foggy. Describe more details.' }
  }

  if (trimmed.length > 1000) {
    return { valid: false, error: 'Dream too long (max 1000 characters)' }
  }

  if (mode && !['mystical', 'psych', 'unhinged'].includes(mode)) {
    return { valid: false, error: 'Invalid interpretation mode' }
  }

  return { valid: true }
}

// ============================================
// 导出工具处理器
// ============================================

export const POST = createToolHandler({
  toolId: 'dream-interpreter',
  processor: dreamInterpreterProcessor,
  validateInput: validateDreamInput,
})
