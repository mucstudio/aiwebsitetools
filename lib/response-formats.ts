/**
 * 🎨 多格式响应处理系统
 *
 * 支持的格式：
 * - text: 纯文本
 * - markdown: Markdown 格式
 * - json: JSON 对象
 * - html: HTML 代码
 * - code: 代码片段（支持多种语言）
 * - structured: 结构化数据（包含多个字段）
 */

// ============================================
// 类型定义
// ============================================

/**
 * 支持的响应格式类型
 */
export type ResponseFormat =
  | 'text'       // 纯文本
  | 'markdown'   // Markdown
  | 'json'       // JSON 对象
  | 'html'       // HTML 代码
  | 'code'       // 代码片段
  | 'structured' // 结构化数据

/**
 * 代码语言类型
 */
export type CodeLanguage =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'java'
  | 'go'
  | 'rust'
  | 'html'
  | 'css'
  | 'sql'
  | 'bash'
  | 'json'

/**
 * 响应元数据
 */
export interface ResponseMetadata {
  format: ResponseFormat
  language?: CodeLanguage  // 仅当 format='code' 时使用
  aiTokens?: number
  aiCost?: number
  [key: string]: any       // 允许自定义元数据
}

/**
 * 格式化的响应结果
 */
export interface FormattedResponse<T = any> {
  content: T
  metadata: ResponseMetadata
}

/**
 * 结构化响应（包含多个字段）
 */
export interface StructuredContent {
  [key: string]: any
}

// ============================================
// 响应格式化工具
// ============================================

/**
 * 创建文本响应
 */
export function createTextResponse(
  content: string,
  metadata?: Partial<ResponseMetadata>
): FormattedResponse<string> {
  return {
    content,
    metadata: {
      format: 'text',
      ...metadata
    }
  }
}

/**
 * 创建 Markdown 响应
 */
export function createMarkdownResponse(
  content: string,
  metadata?: Partial<ResponseMetadata>
): FormattedResponse<string> {
  return {
    content,
    metadata: {
      format: 'markdown',
      ...metadata
    }
  }
}

/**
 * 创建 JSON 响应
 */
export function createJsonResponse<T = any>(
  content: T,
  metadata?: Partial<ResponseMetadata>
): FormattedResponse<T> {
  return {
    content,
    metadata: {
      format: 'json',
      ...metadata
    }
  }
}

/**
 * 创建 HTML 响应
 */
export function createHtmlResponse(
  content: string,
  metadata?: Partial<ResponseMetadata>
): FormattedResponse<string> {
  return {
    content,
    metadata: {
      format: 'html',
      ...metadata
    }
  }
}

/**
 * 创建代码响应
 */
export function createCodeResponse(
  content: string,
  language: CodeLanguage,
  metadata?: Partial<ResponseMetadata>
): FormattedResponse<string> {
  return {
    content,
    metadata: {
      format: 'code',
      language,
      ...metadata
    }
  }
}

/**
 * 创建结构化响应
 */
export function createStructuredResponse(
  content: StructuredContent,
  metadata?: Partial<ResponseMetadata>
): FormattedResponse<StructuredContent> {
  return {
    content,
    metadata: {
      format: 'structured',
      ...metadata
    }
  }
}

// ============================================
// AI 响应解析器
// ============================================

/**
 * 从 AI 响应中提取 JSON
 * 支持多种格式：
 * - 纯 JSON
 * - Markdown 代码块中的 JSON
 * - 带有额外文本的 JSON
 */
export function extractJsonFromAI(aiResponse: string): any {
  // 尝试直接解析
  try {
    return JSON.parse(aiResponse.trim())
  } catch (e) {
    // 尝试从 Markdown 代码块中提取
    const jsonBlockMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/)
    if (jsonBlockMatch) {
      try {
        return JSON.parse(jsonBlockMatch[1].trim())
      } catch (e2) {
        // 继续尝试其他方法
      }
    }

    // 尝试从普通代码块中提取
    const codeBlockMatch = aiResponse.match(/```\s*([\s\S]*?)\s*```/)
    if (codeBlockMatch) {
      try {
        return JSON.parse(codeBlockMatch[1].trim())
      } catch (e3) {
        // 继续尝试其他方法
      }
    }

    // 尝试查找 JSON 对象或数组
    const jsonMatch = aiResponse.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1])
      } catch (e4) {
        throw new Error('Failed to parse JSON from AI response')
      }
    }

    throw new Error('No valid JSON found in AI response')
  }
}

/**
 * 从 AI 响应中提取代码
 * 支持多种格式：
 * - Markdown 代码块
 * - 纯代码
 */
export function extractCodeFromAI(
  aiResponse: string,
  language?: CodeLanguage
): { code: string; language: CodeLanguage } {
  // 尝试从 Markdown 代码块中提取（带语言标识）
  const langPattern = language ? language : '(\\w+)'
  const codeBlockMatch = aiResponse.match(
    new RegExp(`\`\`\`${langPattern}\\s*([\\s\\S]*?)\\s*\`\`\``)
  )

  if (codeBlockMatch) {
    return {
      code: codeBlockMatch[2] || codeBlockMatch[1],
      language: (codeBlockMatch[1] || language || 'javascript') as CodeLanguage
    }
  }

  // 尝试从普通代码块中提取
  const simpleBlockMatch = aiResponse.match(/```\s*([\s\S]*?)\s*```/)
  if (simpleBlockMatch) {
    return {
      code: simpleBlockMatch[1].trim(),
      language: language || 'javascript'
    }
  }

  // 如果没有代码块，返回整个响应
  return {
    code: aiResponse.trim(),
    language: language || 'javascript'
  }
}

/**
 * 智能解析 AI 响应
 * 根据内容自动检测格式
 */
export function parseAIResponse(aiResponse: string): {
  content: any
  detectedFormat: ResponseFormat
} {
  const trimmed = aiResponse.trim()

  // 检测 JSON
  if (trimmed.startsWith('{') || trimmed.startsWith('[') || trimmed.includes('```json')) {
    try {
      const json = extractJsonFromAI(trimmed)
      return { content: json, detectedFormat: 'json' }
    } catch (e) {
      // 不是有效的 JSON，继续检测其他格式
    }
  }

  // 检测代码块
  if (trimmed.includes('```')) {
    const { code, language } = extractCodeFromAI(trimmed)
    return {
      content: { code, language },
      detectedFormat: 'code'
    }
  }

  // 检测 HTML
  if (trimmed.includes('<html') || trimmed.includes('<!DOCTYPE')) {
    return { content: trimmed, detectedFormat: 'html' }
  }

  // 检测 Markdown（包含标题、列表等）
  if (
    trimmed.includes('# ') ||
    trimmed.includes('## ') ||
    trimmed.includes('- ') ||
    trimmed.includes('* ') ||
    trimmed.includes('**')
  ) {
    return { content: trimmed, detectedFormat: 'markdown' }
  }

  // 默认为纯文本
  return { content: trimmed, detectedFormat: 'text' }
}

// ============================================
// 示例用法
// ============================================

/**
 * 示例：处理不同格式的 AI 响应
 */
export const examples = {
  // 文本响应
  text: () => createTextResponse('这是一个简单的文本响应'),

  // Markdown 响应
  markdown: () => createMarkdownResponse(`
# 标题
这是一个 **Markdown** 响应

- 列表项 1
- 列表项 2
  `),

  // JSON 响应
  json: () => createJsonResponse({
    name: 'John Doe',
    age: 30,
    skills: ['JavaScript', 'TypeScript', 'React']
  }),

  // HTML 响应
  html: () => createHtmlResponse(`
<div class="result">
  <h1>Hello World</h1>
  <p>This is HTML content</p>
</div>
  `),

  // 代码响应
  code: () => createCodeResponse(
    `function hello() {\n  console.log('Hello World')\n}`,
    'javascript'
  ),

  // 结构化响应
  structured: () => createStructuredResponse({
    title: 'Analysis Result',
    score: 95,
    details: {
      strengths: ['Good structure', 'Clear logic'],
      weaknesses: ['Needs more comments']
    },
    recommendations: [
      'Add documentation',
      'Improve error handling'
    ]
  })
}
