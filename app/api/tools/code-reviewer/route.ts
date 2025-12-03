/**
 * 👨‍💻 代码审查工具
 *
 * 特点：
 * - 技术性工具
 * - 返回结构化的代码审查报告
 * - 包含安全性、性能、可读性等多个维度
 */

import { createToolHandler, callAI } from '@/lib/create-tool-handler'

const codeReviewerProcessor = async (input: string) => {
  const prompt = `你是一位资深的代码审查专家，请审查以下代码并给出专业建议。

代码：
\`\`\`
${input}
\`\`\`

请以 JSON 格式返回审查结果，包含以下字段：
{
  "language": "检测到的编程语言",
  "overallScore": 85,
  "issues": [
    {
      "severity": "high|medium|low",
      "category": "security|performance|readability|best-practice",
      "line": 10,
      "description": "问题描述",
      "suggestion": "改进建议"
    }
  ],
  "strengths": ["代码的优点1", "代码的优点2"],
  "summary": "总体评价（50-100字）",
  "refactoredCode": "改进后的代码示例（可选）"
}

注意：只返回 JSON，不要有其他文字。`

  const aiResult = await callAI(prompt, 'code-reviewer')

  // 解析 JSON 响应
  let reviewData
  try {
    let cleanContent = aiResult.content.trim()
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    }
    reviewData = JSON.parse(cleanContent)
  } catch (error) {
    reviewData = {
      language: "unknown",
      overallScore: 0,
      issues: [],
      strengths: [],
      summary: "无法解析代码，请确保提供有效的代码片段。",
      refactoredCode: null
    }
  }

  return {
    content: reviewData,
    metadata: {
      aiTokens: aiResult.tokens,
      aiCost: aiResult.cost
    }
  }
}

export const POST = createToolHandler({
  toolId: 'code-reviewer',
  processor: codeReviewerProcessor,
  validateInput: (input) => {
    if (typeof input !== 'string') {
      return { valid: false, error: 'Input must be a string' }
    }
    if (input.trim().length < 10) {
      return { valid: false, error: '请提供至少 10 个字符的代码' }
    }
    if (input.length > 5000) {
      return { valid: false, error: '代码过长（最多 5000 字符）' }
    }
    return { valid: true }
  }
})
