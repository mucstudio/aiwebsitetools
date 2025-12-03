# 🏭 工具工厂模式开发指南

## 📖 概述

本项目采用**工厂模式**架构，将公共逻辑（安全、计费）与业务逻辑（Prompt、AI参数）分离，实现"写一次，到处运行"的开发体验。

### 核心优势

- ✅ **开发效率**：新工具只需 10-50 行代码
- ✅ **一致性**：所有工具自动应用统一的安全策略
- ✅ **可维护性**：修改一处，所有工具同步更新
- ✅ **灵活性**：支持文本、图片、JSON 等多种输出格式

---

## 🏗️ 架构概览

```
工具工厂架构
├── lib/create-tool-handler.ts          # 通用工具处理器工厂
├── hooks/useToolAction.ts              # 前端通用 Hook
├── app/api/tools/[toolId]/route.ts     # 工具 API 路由
└── app/tools/[toolId]/page.tsx         # 工具前端页面
```

### 数据流

```
用户输入
  ↓
前端 (useToolAction Hook)
  ↓
API (/api/tools/[toolId])
  ↓
工厂函数 (createToolHandler)
  ├─ 1. 输入验证
  ├─ 2. 认证检查
  ├─ 3. 使用限制检查
  ├─ 4. 内容审核
  ├─ 5. 执行核心逻辑 (processor)
  ├─ 6. 记录使用
  └─ 7. 返回结果
  ↓
前端展示结果
```

---

## 🚀 快速开始：创建新工具

### 第一步：创建 API 路由

创建文件：`app/api/tools/your-tool/route.ts`

```typescript
import { createToolHandler, callAI } from '@/lib/create-tool-handler'

// 定义核心业务逻辑
const yourToolProcessor = async (input: string) => {
  const prompt = `你的 AI Prompt...

  用户输入：${input}`

  const aiResult = await callAI(prompt, 'your-tool')

  return {
    content: aiResult.content,
    metadata: {
      aiTokens: aiResult.tokens,
      aiCost: aiResult.cost
    }
  }
}

// 导出工具处理器
export const POST = createToolHandler({
  toolId: 'your-tool',
  processor: yourToolProcessor,
  validateInput: (input) => {
    if (typeof input !== 'string' || input.trim().length < 5) {
      return { valid: false, error: '输入太短' }
    }
    return { valid: true }
  }
})
```

### 第二步：创建前端页面

创建文件：`app/tools/your-tool/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useToolAction } from '@/hooks/useToolAction'

export default function YourToolPage() {
  const [input, setInput] = useState('')
  const { execute, result, loading, error, remaining } = useToolAction('your-tool')

  const handleSubmit = async () => {
    await execute(input)
  }

  return (
    <div className="container py-12">
      <h1>Your Tool</h1>

      {/* 输入区域 */}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="输入内容..."
      />

      {/* 提交按钮 */}
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? '处理中...' : '提交'}
      </button>

      {/* 错误提示 */}
      {error && <div className="error">{error}</div>}

      {/* 结果展示 */}
      {result && <div className="result">{result}</div>}

      {/* 剩余次数 */}
      <div>剩余次数：{remaining}</div>
    </div>
  )
}
```

### 第三步：在数据库中注册工具

#### 一键添加工具（推荐）

**第一步：获取分类ID**

访问 `/admin/categories`，点击分类旁边的ID按钮复制

或运行命令：
```bash
node scripts/list-categories.mjs
```

**第二步：编辑 `scripts/add-tool.mjs`**

```javascript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

await prisma.tool.create({
  data: {
    // 这些值必须和你创建的文件夹/文件名一致！
    slug: 'your-tool',              // ← 必须和 URL 路径一致
    componentType: 'your-tool',     // ← 必须和 slug 一致

    // 这些是显示信息，可以自定义
    name: 'Your Tool Name',         // 显示在页面上的名称
    description: 'Tool description', // 工具描述
    categoryId: 'clxxx123',         // 从第一步获取的分类ID
    isPublished: true               // true=立即上线
  }
})

console.log('✅ 工具添加成功')
await prisma.$disconnect()
```

**第三步：运行**
```bash
node scripts/add-tool.mjs
```

#### 字段关联说明

```
关键关联（必须匹配）：
├─ slug: 'your-tool'
│  └─ 对应 URL: /tools/your-tool
│  └─ 对应 API: /api/tools/your-tool/route.ts
│  └─ 对应页面: /app/tools/your-tool/page.tsx
│
├─ componentType: 'your-tool'
│  └─ 必须和 slug 一致
│  └─ 用于前端路由匹配
│
└─ categoryId: 'clxxx123'
   └─ 从 /admin/categories 复制

显示信息（可自定义）：
├─ name: 工具显示名称
├─ description: 工具描述
└─ isPublished: 是否上线
```

**示例：创建 Aura Check 工具**

```
文件结构：
app/api/tools/aura-check/route.ts  ← API路由
app/tools/aura-check/page.tsx      ← 前端页面

数据库注册：
slug: 'aura-check'          ← 和文件夹名一致
componentType: 'aura-check' ← 和 slug 一致
name: 'Aura Check'          ← 显示名称（可不同）
```

---

## 📚 工具类型示例

### 1. 文本生成工具（最常见）

**示例**：Aura Check、毒舌简历点评

```typescript
const textProcessor = async (input: string) => {
  const prompt = `生成文本的 Prompt...`
  const aiResult = await callAI(prompt, 'tool-id')

  return {
    content: aiResult.content,  // 直接返回文本
    metadata: {
      aiTokens: aiResult.tokens,
      aiCost: aiResult.cost
    }
  }
}
```

**前端展示**：
```typescript
{result && <div className="prose">{result}</div>}
```

---

### 2. JSON 结构化工具

**示例**：MBTI 测试、梦境解析、代码审查

```typescript
const jsonProcessor = async (input: string) => {
  const prompt = `请以 JSON 格式返回...
  {
    "field1": "value1",
    "field2": "value2"
  }`

  const aiResult = await callAI(prompt, 'tool-id')

  // 解析 JSON
  let data
  try {
    let cleanContent = aiResult.content.trim()
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    }
    data = JSON.parse(cleanContent)
  } catch (error) {
    data = { error: 'Failed to parse JSON' }
  }

  return {
    content: data,
    metadata: {
      aiTokens: aiResult.tokens,
      aiCost: aiResult.cost
    }
  }
}
```

**前端展示**：
```typescript
{result && (
  <div>
    <h2>{result.field1}</h2>
    <p>{result.field2}</p>
  </div>
)}
```

---

### 3. 图片生成工具

**示例**：梦境绘图、Logo 生成

```typescript
const imageProcessor = async (input: string) => {
  // 注意：需要配置支持图片生成的 AI 提供商
  // 例如：OpenAI DALL-E, Stability AI

  const prompt = `图片生成 Prompt: ${input}`

  // 这里需要调用图片生成 API
  // const imageUrl = await generateImage(prompt)

  return {
    content: {
      imageUrl: 'https://example.com/image.png',
      prompt: prompt
    },
    metadata: {
      aiTokens: 0,
      aiCost: 0.04  // DALL-E 3 的成本
    }
  }
}
```

**前端展示**：
```typescript
{result && (
  <div>
    <img src={result.imageUrl} alt="Generated" />
    <p>Prompt: {result.prompt}</p>
  </div>
)}
```

---

## ⚙️ 配置选项

### createToolHandler 参数

```typescript
export const POST = createToolHandler({
  toolId: 'your-tool',              // 必填：工具ID
  processor: yourProcessor,          // 必填：核心逻辑

  // 可选配置
  requireAuth: false,                // 是否需要登录
  skipUsageCheck: false,             // 是否跳过使用限制检查
  skipContentModeration: false,      // 是否跳过内容审核
  validateInput: (input) => ({       // 输入验证函数
    valid: true,
    error: undefined
  })
})
```

### processor 函数签名

```typescript
type ToolProcessor = (
  input: any,           // 用户输入
  context: {            // 请求上下文
    userId?: string
    sessionId?: string
    ipAddress?: string
    deviceFingerprint?: string
    userAgent?: string
    toolId: string
  }
) => Promise<string | object>
```

---

## 🎨 前端开发指南

### useToolAction Hook

```typescript
const {
  execute,      // 执行函数
  result,       // 结果
  loading,      // 加载状态
  error,        // 错误信息
  remaining,    // 剩余次数
  reset         // 重置函数
} = useToolAction<ResultType>('tool-id')
```

### 完全自定义 UI

工厂模式的优势在于：**逻辑复用，UI 完全自定义**

```typescript
// 赛博朋克风格
<div className="bg-black text-green-500 font-mono">
  <h1 className="glitch-effect">TOOL NAME</h1>
  {/* 自定义 UI */}
</div>

// 治愈系风格
<div className="bg-gradient-to-b from-purple-100 to-pink-100 font-serif">
  <h1 className="text-4xl text-purple-800">Tool Name</h1>
  {/* 自定义 UI */}
</div>
```

---

## 🔧 高级功能

### 1. 自定义内容审核

修改 `lib/create-tool-handler.ts` 中的 `moderateContent` 函数：

```typescript
function moderateContent(input: string) {
  // 添加自定义审核逻辑
  // 或调用第三方 API
  return { allowed: true }
}
```

### 2. 添加速率限制

在工厂函数中添加速率限制逻辑：

```typescript
// 在 createToolHandler 中添加
import { Ratelimit } from "@upstash/ratelimit"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
})

const { success } = await ratelimit.limit(ipAddress)
if (!success) {
  return NextResponse.json({ error: "Too many requests" }, { status: 429 })
}
```

### 3. 自定义 AI 参数

```typescript
const customProcessor = async (input: string) => {
  // 直接调用 AI API，完全自定义参数
  const response = await fetch('/api/ai/call', {
    method: 'POST',
    body: JSON.stringify({
      prompt: input,
      toolId: 'your-tool',
      // 可以添加自定义参数
      temperature: 0.9,
      maxTokens: 2000
    })
  })

  const data = await response.json()
  return { content: data.response }
}
```

---

## 📊 性能优化建议

### 1. 缓存设备指纹

```typescript
// 在 useToolAction 中已实现
// 设备指纹会在组件挂载时生成一次，后续复用
```

### 2. 减少 API 调用

```typescript
// 工厂模式已优化：
// - 使用限制检查：1 次
// - AI 调用：1 次
// - 使用记录：1 次（自动）
// 总计：3 次 API 调用（相比原来的 4 次减少 25%）
```

### 3. 使用 React.memo 优化渲染

```typescript
const ResultDisplay = React.memo(({ result }) => {
  return <div>{result}</div>
})
```

---

## 🐛 常见问题

### Q: 如何调试工具？

A: 查看浏览器控制台和服务器日志：

```typescript
// 前端
console.log('Tool result:', result)

// 后端（工厂函数会自动记录）
console.error(`Tool ${toolId} error:`, error)
```

### Q: 如何处理长时间运行的任务？

A: 添加超时控制：

```typescript
const processor = async (input: string) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000)

  try {
    const result = await callAI(prompt, toolId)
    return { content: result.content }
  } finally {
    clearTimeout(timeoutId)
  }
}
```

### Q: 如何支持流式响应？

A: 当前工厂模式不支持流式响应，如需流式响应，需要单独实现 API 路由。

---

## 📝 最佳实践

1. **工具命名**：使用 kebab-case（如 `aura-check`）
2. **输入验证**：始终验证用户输入
3. **错误处理**：提供友好的错误提示
4. **性能优化**：避免在 processor 中执行耗时操作
5. **安全性**：不要在前端暴露敏感信息

---

## 🎯 下一步

1. 创建你的第一个工具
2. 测试工具功能
3. 在数据库中注册工具
4. 部署到生产环境

需要帮助？查看示例工具：
- `app/api/tools/aura-check/route.ts`
- `app/api/tools/roast-resume/route.ts`
- `app/api/tools/dream-interpreter/route.ts`
