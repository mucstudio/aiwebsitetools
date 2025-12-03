/**
 * 🌙 梦境解析工具
 *
 * 特点：
 * - 治愈系风格
 * - 返回结构化 JSON
 * - 包含多个维度的分析
 */

import { createToolHandler, callAI } from '@/lib/create-tool-handler'

const dreamInterpreterProcessor = async (input: string) => {
  const prompt = `你是一位温柔的梦境解析师，擅长用心理学和象征主义解读梦境。

用户的梦境描述：
${input}

请以 JSON 格式返回分析结果，包含以下字段：
{
  "theme": "梦境的核心主题（如：焦虑、期待、回忆）",
  "symbols": [
    {"symbol": "梦中出现的象征物", "meaning": "象征意义"}
  ],
  "emotion": "梦境的主要情绪基调",
  "interpretation": "详细的梦境解析（100-200字）",
  "advice": "给梦者的温柔建议",
  "luckyColor": "今日幸运色",
  "mood": "情绪指数（0-100）"
}

注意：只返回 JSON，不要有其他文字。语气要温柔、治愈。`

  const aiResult = await callAI(prompt, 'dream-interpreter')

  // 解析 JSON 响应
  let dreamData
  try {
    let cleanContent = aiResult.content.trim()
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    }
    dreamData = JSON.parse(cleanContent)
  } catch (error) {
    dreamData = {
      theme: "神秘梦境",
      symbols: [],
      emotion: "未知",
      interpretation: "这个梦境太过神秘，需要更多细节才能解读。",
      advice: "记录下更多梦境细节，有助于更好地理解自己。",
      luckyColor: "#E6E6FA",
      mood: 50
    }
  }

  return {
    content: dreamData,
    metadata: {
      aiTokens: aiResult.tokens,
      aiCost: aiResult.cost
    }
  }
}

export const POST = createToolHandler({
  toolId: 'dream-interpreter',
  processor: dreamInterpreterProcessor,
  validateInput: (input) => {
    if (typeof input !== 'string') {
      return { valid: false, error: 'Input must be a string' }
    }
    if (input.trim().length < 10) {
      return { valid: false, error: '请描述更多梦境细节（至少 10 个字符）' }
    }
    if (input.length > 1500) {
      return { valid: false, error: '梦境描述过长（最多 1500 字符）' }
    }
    return { valid: true }
  }
})
