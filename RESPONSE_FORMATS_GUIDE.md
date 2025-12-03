# 🎨 多格式响应处理系统使用指南

## 📖 概述

本系统支持多种 AI 响应格式，让你的工具能够返回文本、Markdown、JSON、HTML、代码等多种类型的内容。

### 支持的格式

| 格式 | 说明 | 适用场景 |
|------|------|---------|
| **text** | 纯文本 | 简单的文本响应 |
| **markdown** | Markdown 格式 | 带格式的文档、文章 |
| **json** | JSON 对象 | 结构化数据、API 响应 |
| **html** | HTML 代码 | 富文本内容、网页片段 |
| **code** | 代码片段 | 代码生成工具 |
| **structured** | 结构化数据 | 复杂的多字段响应 |

---

## 🚀 快速开始

### 1. 后端：创建多格式响应

在你的工具 API 路由中使用响应格式化函数：

```typescript
// app/api/tools/your-tool/route.ts
import { createToolHandler, callAI } from '@/lib/create-tool-handler'
import {
  createTextResponse,
  createMarkdownResponse,
  createJsonResponse,
  createCodeResponse,
  createStructuredResponse
} from '@/lib/response-formats'

// 示例 1：返回 Markdown 格式
const markdownToolProcessor = async (input: string) => {
  const prompt = `Generate a markdown article about: ${input}`
  const aiResult = await callAI(prompt, 'markdown-tool')

  return createMarkdownResponse(aiResult.content, {
    aiTokens: aiResult.tokens,
    aiCost: aiResult.cost
  })
}

// 示例 2：返回 JSON 格式
const jsonToolProcessor = async (input: string) => {
  const prompt = `Analyze this text and return JSON: ${input}`
  const aiResult = await callAI(prompt, 'json-tool')

  // AI 返回的是 JSON 字符串，需要解析
  const jsonData = JSON.parse(aiResult.content)

  return createJsonResponse(jsonData, {
    aiTokens: aiResult.tokens,
    aiCost: aiResult.cost
  })
}

// 示例 3：返回代码格式
const codeToolProcessor = async (input: string) => {
  const prompt = `Generate JavaScript code for: ${input}`
  const aiResult = await callAI(prompt, 'code-tool')

  return createCodeResponse(aiResult.content, 'javascript', {
    aiTokens: aiResult.tokens,
    aiCost: aiResult.cost
  })
}

// 示例 4：返回结构化数据
const structuredToolProcessor = async (input: string) => {
  const prompt = `Analyze this resume: ${input}`
  const aiResult = await callAI(prompt, 'resume-tool')

  return createStructuredResponse({
    score: 85,
    strengths: ['Good experience', 'Clear structure'],
    weaknesses: ['Needs more details'],
    recommendations: ['Add projects', 'Improve summary']
  }, {
    aiTokens: aiResult.tokens,
    aiCost: aiResult.cost
  })
}

export const POST = createToolHandler({
  toolId: 'your-tool',
  processor: markdownToolProcessor,
  validateInput: (input) => ({ valid: true })
})
```

---

### 2. 前端：渲染多格式响应

使用 `ResponseRenderer` 组件自动渲染不同格式的内容：

```typescript
// components/tools/YourTool.tsx
'use client'

import { useState } from 'react'
import { useToolAction } from '@/hooks/useToolAction'
import { ResponseRenderer } from '@/components/tools/ResponseRenderer'

export default function YourTool() {
  const { execute, result, loading } = useToolAction('your-tool')

  return (
    <div>
      {/* 输入区域 */}
      <button onClick={() => execute('your input')}>
        Generate
      </button>

      {/* 自动渲染响应 */}
      {result && (
        <ResponseRenderer
          content={result.content}
          format={result.metadata?.format}
          language={result.metadata?.language}
          className="mt-4"
        />
      )}
    </div>
  )
}
```

---

## 📚 详细示例

### 示例 1：Markdown 博客生成器

```typescript
// app/api/tools/blog-generator/route.ts
import { createToolHandler, callAI } from '@/lib/create-tool-handler'
import { createMarkdownResponse } from '@/lib/response-formats'

const blogProcessor = async (input: string) => {
  const prompt = `Write a blog post about: ${input}

Format:
# Title
## Introduction
[content]

## Main Points
[content]

## Conclusion
[content]`

  const aiResult = await callAI(prompt, 'blog-generator')

  return createMarkdownResponse(aiResult.content, {
    aiTokens: aiResult.tokens,
    aiCost: aiResult.cost
  })
}

export const POST = createToolHandler({
  toolId: 'blog-generator',
  processor: blogProcessor,
  validateInput: (input) => {
    if (typeof input !== 'string' || input.length < 5) {
      return { valid: false, error: 'Topic too short' }
    }
    return { valid: true }
  }
})
```

---

### 示例 2：JSON API 数据生成器

```typescript
// app/api/tools/api-generator/route.ts
import { createToolHandler, callAI } from '@/lib/create-tool-handler'
import { createJsonResponse, extractJsonFromAI } from '@/lib/response-formats'

const apiProcessor = async (input: string) => {
  const prompt = `Generate mock API data for: ${input}

Return valid JSON only. Example:
{
  "users": [
    { "id": 1, "name": "John" }
  ]
}`

  const aiResult = await callAI(prompt, 'api-generator')

  // 从 AI 响应中提取 JSON
  const jsonData = extractJsonFromAI(aiResult.content)

  return createJsonResponse(jsonData, {
    aiTokens: aiResult.tokens,
    aiCost: aiResult.cost
  })
}

export const POST = createToolHandler({
  toolId: 'api-generator',
  processor: apiProcessor,
  validateInput: (input) => ({ valid: true })
})
```

---

### 示例 3：代码生成器

```typescript
// app/api/tools/code-generator/route.ts
import { createToolHandler, callAI } from '@/lib/create-tool-handler'
import { createCodeResponse, extractCodeFromAI } from '@/lib/response-formats'

interface CodeInput {
  description: string
  language: 'javascript' | 'python' | 'typescript'
}

const codeProcessor = async (input: CodeInput) => {
  const prompt = `Generate ${input.language} code for: ${input.description}

Return only the code, no explanations.`

  const aiResult = await callAI(prompt, 'code-generator')

  // 从 AI 响应中提取代码
  const { code } = extractCodeFromAI(aiResult.content, input.language)

  return createCodeResponse(code, input.language, {
    aiTokens: aiResult.tokens,
    aiCost: aiResult.cost
  })
}

export const POST = createToolHandler({
  toolId: 'code-generator',
  processor: codeProcessor,
  validateInput: (input: CodeInput) => {
    if (!input.description || !input.language) {
      return { valid: false, error: 'Missing required fields' }
    }
    return { valid: true }
  }
})
```

---

### 示例 4：结构化简历分析器

```typescript
// app/api/tools/resume-analyzer/route.ts
import { createToolHandler, callAI } from '@/lib/create-tool-handler'
import { createStructuredResponse, extractJsonFromAI } from '@/lib/response-formats'

const resumeProcessor = async (input: string) => {
  const prompt = `Analyze this resume and return JSON:

Resume: ${input}

Return format:
{
  "overallScore": 85,
  "strengths": ["point 1", "point 2"],
  "weaknesses": ["point 1", "point 2"],
  "recommendations": ["action 1", "action 2"],
  "keySkills": ["skill 1", "skill 2"]
}`

  const aiResult = await callAI(prompt, 'resume-analyzer')

  // 提取 JSON 数据
  const analysis = extractJsonFromAI(aiResult.content)

  return createStructuredResponse(analysis, {
    aiTokens: aiResult.tokens,
    aiCost: aiResult.cost
  })
}

export const POST = createToolHandler({
  toolId: 'resume-analyzer',
  processor: resumeProcessor,
  validateInput: (input) => {
    if (typeof input !== 'string' || input.length < 50) {
      return { valid: false, error: 'Resume too short' }
    }
    return { valid: true }
  }
})
```

---

## 🎨 前端自定义渲染

如果你需要自定义渲染样式，可以直接使用格式信息：

```typescript
'use client'

import { useState } from 'react'
import { useToolAction } from '@/hooks/useToolAction'
import { marked } from 'marked'

export default function CustomTool() {
  const { execute, result, loading } = useToolAction('your-tool')

  // 根据格式自定义渲染
  const renderResult = () => {
    if (!result) return null

    const { content, metadata } = result

    switch (metadata?.format) {
      case 'markdown':
        return (
          <div className="prose prose-lg">
            <div dangerouslySetInnerHTML={{ __html: marked.parse(content) }} />
          </div>
        )

      case 'json':
        return (
          <pre className="bg-gray-900 text-green-400 p-4 rounded">
            {JSON.stringify(content, null, 2)}
          </pre>
        )

      case 'code':
        return (
          <div className="relative">
            <div className="absolute top-2 right-2 text-xs bg-blue-500 text-white px-2 py-1 rounded">
              {metadata.language}
            </div>
            <pre className="bg-black text-white p-4 rounded">
              <code>{content}</code>
            </pre>
          </div>
        )

      default:
        return <div>{content}</div>
    }
  }

  return (
    <div>
      <button onClick={() => execute('input')}>Generate</button>
      {renderResult()}
    </div>
  )
}
```

---

## 🔧 高级功能

### 智能格式检测

系统可以自动检测 AI 响应的格式：

```typescript
import { parseAIResponse } from '@/lib/response-formats'

const aiResponse = `
# Hello World
This is **markdown** content
`

const { content, detectedFormat } = parseAIResponse(aiResponse)
console.log(detectedFormat) // 'markdown'
```

### 从 AI 响应中提取特定格式

```typescript
import { extractJsonFromAI, extractCodeFromAI } from '@/lib/response-formats'

// 提取 JSON（支持多种格式）
const json1 = extractJsonFromAI('{"name": "John"}')
const json2 = extractJsonFromAI('```json\n{"name": "John"}\n```')
const json3 = extractJsonFromAI('Here is the data: {"name": "John"}')

// 提取代码
const { code, language } = extractCodeFromAI(`
\`\`\`javascript
function hello() {
  console.log('Hello')
}
\`\`\`
`)
```

---

## 📊 完整工具示例

查看以下完整示例：

1. **Aura Check** - 结构化响应示例
   - 文件：`app/api/tools/aura-check/route.ts`
   - 返回：`{ score: string, body: string }`

2. **Corporate Clapback** - 文本响应示例
   - 文件：`app/api/tools/corporate-clapback/route.ts`
   - 返回：纯文本

---

## 🎯 最佳实践

1. **选择合适的格式**
   - 简单文本 → `text`
   - 带格式文档 → `markdown`
   - 结构化数据 → `json` 或 `structured`
   - 代码生成 → `code`

2. **AI Prompt 设计**
   - 明确告诉 AI 返回什么格式
   - 提供格式示例
   - 使用 `extractJsonFromAI` 等工具处理不规范的响应

3. **错误处理**
   - 使用 try-catch 处理 JSON 解析错误
   - 提供友好的错误提示
   - 考虑格式检测失败的情况

4. **性能优化**
   - 大型 JSON 数据考虑分页
   - 长代码片段提供下载功能
   - Markdown 渲染使用 memo 优化

---

## 🚀 下一步

1. 创建你的第一个多格式工具
2. 测试不同格式的响应
3. 自定义渲染样式
4. 查看更多示例：`lib/response-formats.ts`

需要帮助？查看示例工具或提问！
