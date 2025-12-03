import { NextRequest, NextResponse } from 'next/server'
import { getDefaultAIService } from '@/lib/ai/service'
import { AIMessage } from '@/lib/ai/providers/base'
import { requireAuth } from '@/lib/auth'

/**
 * POST /api/ai/generate-description
 * 为工具生成吸引人的描述
 *
 * Body:
 * {
 *   toolName: string,
 *   toolCode: string,
 *   toolType: 'iframe' | 'react'
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    await requireAuth()

    const body = await request.json()
    const { toolName, toolCode, toolType } = body

    // 验证必需参数
    if (!toolName || !toolCode) {
      return NextResponse.json(
        { error: 'Tool name and code are required' },
        { status: 400 }
      )
    }

    // 构建提示词
    const systemPrompt = `You are a professional marketing copywriter specializing in creating engaging, attractive tool descriptions for online utilities. Your descriptions should entice users to click and try the tool while clearly explaining its purpose and benefits.

CRITICAL RULES:
- Write EXACTLY 3-6 complete sentences as a cohesive paragraph
- Make it engaging and attractive to encourage clicks
- Clearly describe the tool's purpose and key features
- Highlight the benefits and use cases
- Use persuasive but honest language
- Keep it concise and easy to read
- Focus on what users can accomplish with this tool
- MUST end with a complete sentence - NO incomplete sentences
- Return ONLY the description paragraph, nothing else`

    const userPrompt = `Tool Name: ${toolName}
Tool Type: ${toolType}

Code:
\`\`\`
${toolCode}
\`\`\`

Based on the tool name and code above, write an attractive, engaging description paragraph with 3-5 COMPLETE sentences that will make users want to click and use this tool. Describe what it does, its key features, and why it's useful.

Examples of GOOD descriptions:
- "Transform your JSON data into CSV format instantly with our easy-to-use converter. Perfect for importing data into Excel, Google Sheets, or any spreadsheet application. Simply paste your JSON, click convert, and download your formatted CSV file in seconds. No technical knowledge required."

- "Create strong, secure passwords in seconds with our advanced password generator. Customize length, include special characters, numbers, and mixed case letters to meet any security requirement. Protect your accounts with randomly generated passwords that are virtually impossible to crack."

- "Beautify and format your JSON code with proper indentation and syntax highlighting. Our JSON formatter helps you quickly validate, organize, and understand complex JSON structures. Ideal for developers, API testing, and debugging."

IMPORTANT: Write ONLY the description paragraph. Make sure all sentences are complete. Do not include any other text, explanations, or notes.`

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]

    // 获取默认AI服务
    const aiService = await getDefaultAIService()

    // 调用AI生成描述
    const response = await aiService.chat(messages, {
      temperature: 0.7,
      maxTokens: 1000  // 增加token限制以确保完整的段落
    })

    // 提取生成的描述
    let description = response.content.trim()

    // 移除可能的引号包裹
    if ((description.startsWith('"') && description.endsWith('"')) ||
        (description.startsWith("'") && description.endsWith("'"))) {
      description = description.slice(1, -1).trim()
    }

    // 检查描述是否以完整句子结尾（以句号、问号或感叹号结尾）
    const endsWithPunctuation = /[.!?]$/.test(description)
    if (!endsWithPunctuation) {
      // 如果没有以标点符号结尾，尝试在最后一个完整句子处截断
      const lastPunctuationIndex = Math.max(
        description.lastIndexOf('.'),
        description.lastIndexOf('!'),
        description.lastIndexOf('?')
      )
      if (lastPunctuationIndex > 0) {
        description = description.substring(0, lastPunctuationIndex + 1).trim()
      }
    }

    return NextResponse.json({
      success: true,
      description
    })

  } catch (error: any) {
    console.error('AI generate description error:', error)

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: error.message || 'Failed to generate description' },
      { status: 500 }
    )
  }
}
