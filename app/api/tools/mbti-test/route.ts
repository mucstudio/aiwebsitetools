/**
 * MBTI 性格分析工具 - 演示 JSON 结构化输出
 *
 * 特点：
 * - 返回结构化 JSON 数据
 * - 适合需要前端进一步处理的场景
 * - 可以返回多个字段
 */

import { createToolHandler, callAI } from "@/lib/tools/create-tool-handler"

const mbtiProcessor = async (input: string) => {
  const prompt = `你是一位专业的 MBTI 性格分析师。

根据用户的自我描述，分析其 MBTI 性格类型。

用户描述：${input}

请以 JSON 格式返回分析结果，包含以下字段：
{
  "mbti": "四个字母的 MBTI 类型，如 INTJ",
  "name": "性格类型名称，如'建筑师'",
  "traits": ["特质1", "特质2", "特质3"],
  "strengths": ["优势1", "优势2"],
  "weaknesses": ["劣势1", "劣势2"],
  "description": "简短的性格描述（50字以内）",
  "confidence": 0.85
}

注意：只返回 JSON，不要有其他文字。`

  const aiResult = await callAI(prompt, 'mbti-test')

  // 解析 JSON 响应
  let analysisData
  try {
    // 清理可能的 markdown 代码块标记
    let cleanContent = aiResult.content.trim()
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    }

    analysisData = JSON.parse(cleanContent)
  } catch (error) {
    // 如果解析失败，返回默认结构
    analysisData = {
      mbti: "XXXX",
      name: "未知类型",
      traits: ["需要更多信息"],
      strengths: ["待分析"],
      weaknesses: ["待分析"],
      description: "无法准确分析，请提供更详细的自我描述",
      confidence: 0.0
    }
  }

  return {
    content: analysisData,
    metadata: {
      aiTokens: aiResult.tokens,
      aiCost: aiResult.cost
    }
  }
}

export const POST = createToolHandler({
  toolId: 'mbti-test',
  processor: mbtiProcessor,
  validateInput: (input) => {
    if (typeof input !== 'string') {
      return { valid: false, error: 'Input must be a string' }
    }

    if (input.trim().length < 20) {
      return { valid: false, error: '请提供更详细的自我描述（至少20个字符）' }
    }

    if (input.length > 1000) {
      return { valid: false, error: '描述过长（最多1000个字符）' }
    }

    return { valid: true }
  }
})
