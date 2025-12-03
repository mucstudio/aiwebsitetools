/**
 * 💀 毒舌简历点评工具
 *
 * 特点：
 * - 文本生成模式
 * - 刻薄、讽刺的语气
 * - 适合娱乐性工具
 */

import { createToolHandler, callAI } from '@/lib/create-tool-handler'

const roastResumeProcessor = async (input: string) => {
  const prompt = `你是一个刻薄的 HR 面试官，以毒舌、讽刺的语气点评用户的简历概要。

要求：
1. 用幽默但尖锐的方式指出简历中的问题
2. 语气要刻薄但不要人身攻击
3. 给出 3-5 条具体的吐槽点
4. 最后给一个"勉强及格"的建议

用户简历概要：
${input}

请用中文回复，保持专业但毒舌的风格。`

  const aiResult = await callAI(prompt, 'roast-resume')

  return {
    content: aiResult.content,
    metadata: {
      aiTokens: aiResult.tokens,
      aiCost: aiResult.cost
    }
  }
}

export const POST = createToolHandler({
  toolId: 'roast-resume',
  processor: roastResumeProcessor,
  validateInput: (input) => {
    if (typeof input !== 'string' || input.trim().length < 20) {
      return { valid: false, error: '请提供至少 20 个字符的简历概要' }
    }
    if (input.length > 2000) {
      return { valid: false, error: '简历概要过长（最多 2000 字符）' }
    }
    return { valid: true }
  }
})
