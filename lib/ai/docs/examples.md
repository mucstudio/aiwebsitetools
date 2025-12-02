# AI API 调用示例

本文档提供各种场景下的 AI API 调用示例代码。

## 目录

1. [基础调用](#基础调用)
2. [在 API 路由中使用](#在-api-路由中使用)
3. [在服务端组件中使用](#在服务端组件中使用)
4. [错误处理](#错误处理)
5. [高级用法](#高级用法)

---

## 基础调用

### 最简单的调用

```typescript
import { callAI } from '@/lib/ai/service'

async function example1() {
  const result = await callAI('Hello, how are you?')

  console.log(result.response)
  // Output: "I'm doing well, thank you for asking! How can I help you today?"
}
```

### 带参数的调用

```typescript
import { callAI } from '@/lib/ai/service'

async function example2() {
  const result = await callAI('Write a haiku about programming', {
    temperature: 0.9,      // 提高创造性
    maxTokens: 100,        // 限制输出长度
  })

  console.log(result.response)
  console.log('Cost:', result.cost)
  console.log('Tokens used:', result.totalTokens)
}
```

---

## 在 API 路由中使用

### 示例 1: 文本生成工具

```typescript
// app/api/tools/text-generator/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { callAI } from '@/lib/ai/service'
import { getCurrentSession } from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession()
    const { prompt, style } = await request.json()

    // 构建提示词
    const fullPrompt = `Generate text in ${style} style: ${prompt}`

    // 调用 AI
    const result = await callAI(fullPrompt, {
      maxTokens: 500,
      temperature: 0.8,
      userId: session?.user?.id,
      toolId: 'text-generator'
    })

    return NextResponse.json({
      success: true,
      text: result.response,
      metadata: {
        cost: result.cost,
        tokensUsed: result.totalTokens,
        modelUsed: result.modelUsed,
        usedFallback: result.usedFallback
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate text' },
      { status: 500 }
    )
  }
}
```

### 示例 2: 代码解释工具

```typescript
// app/api/tools/code-explainer/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { callAI } from '@/lib/ai/service'
import { getCurrentSession } from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession()
    const { code, language } = await request.json()

    const prompt = `Explain the following ${language} code in simple terms:

\`\`\`${language}
${code}
\`\`\`

Provide:
1. What the code does
2. Key concepts used
3. Potential improvements`

    const result = await callAI(prompt, {
      maxTokens: 800,
      temperature: 0.3, // 降低温度以获得更准确的解释
      userId: session?.user?.id,
      toolId: 'code-explainer'
    })

    return NextResponse.json({
      success: true,
      explanation: result.response,
      cost: result.cost
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to explain code' },
      { status: 500 }
    )
  }
}
```

### 示例 3: 翻译工具

```typescript
// app/api/tools/translator/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { callAI } from '@/lib/ai/service'
import { getCurrentSession } from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession()
    const { text, sourceLang, targetLang } = await request.json()

    const prompt = `Translate the following text from ${sourceLang} to ${targetLang}. Only provide the translation, no explanations:

${text}`

    const result = await callAI(prompt, {
      maxTokens: Math.ceil(text.length * 2), // 动态设置 token 限制
      temperature: 0.3,
      userId: session?.user?.id,
      toolId: 'translator'
    })

    return NextResponse.json({
      success: true,
      translation: result.response.trim(),
      cost: result.cost
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    )
  }
}
```

---

## 在服务端组件中使用

### 示例: 内容推荐

```typescript
// app/recommendations/page.tsx
import { callAI } from '@/lib/ai/service'
import { getCurrentSession } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'

export default async function RecommendationsPage() {
  const session = await getCurrentSession()

  // 获取用户历史
  const userHistory = await prisma.usageRecord.findMany({
    where: { userId: session?.user?.id },
    include: { tool: true },
    take: 10,
    orderBy: { createdAt: 'desc' }
  })

  // 生成推荐
  const toolNames = userHistory.map(h => h.tool.name).join(', ')
  const prompt = `Based on these tools used: ${toolNames}. Recommend 3 similar tools and explain why.`

  const result = await callAI(prompt, {
    maxTokens: 300,
    temperature: 0.7,
    userId: session?.user?.id
  })

  return (
    <div>
      <h1>Recommended Tools</h1>
      <div>{result.response}</div>
    </div>
  )
}
```

---

## 错误处理

### 完整的错误处理示例

```typescript
import { callAI } from '@/lib/ai/service'

async function robustAICall(prompt: string) {
  try {
    const result = await callAI(prompt, {
      maxTokens: 500,
      temperature: 0.7
    })

    if (!result.success) {
      throw new Error('AI call was not successful')
    }

    // 检查是否使用了备用模型
    if (result.usedFallback) {
      console.warn(`Used fallback model (level ${result.fallbackLevel})`)
    }

    // 检查成本
    if (result.cost > 0.1) {
      console.warn(`High cost detected: $${result.cost}`)
    }

    return {
      success: true,
      data: result.response,
      metadata: {
        cost: result.cost,
        tokens: result.totalTokens,
        latency: result.latencyMs
      }
    }

  } catch (error) {
    console.error('AI call failed:', error)

    // 返回友好的错误信息
    return {
      success: false,
      error: 'AI service is temporarily unavailable. Please try again later.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
```

### 重试机制（额外的重试层）

```typescript
async function callAIWithRetry(
  prompt: string,
  maxRetries: number = 2
) {
  let lastError: Error | null = null

  for (let i = 0; i <= maxRetries; i++) {
    try {
      const result = await callAI(prompt, {
        maxTokens: 500
      })
      return result
    } catch (error) {
      lastError = error as Error
      console.log(`Attempt ${i + 1} failed, retrying...`)

      // 等待一段时间再重试
      if (i < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
      }
    }
  }

  throw lastError || new Error('All retries failed')
}
```

---

## 高级用法

### 批量处理

```typescript
async function batchProcess(items: string[]) {
  const results = []

  for (const item of items) {
    try {
      const result = await callAI(`Process this: ${item}`, {
        maxTokens: 200
      })
      results.push({
        item,
        result: result.response,
        cost: result.cost
      })

      // 避免请求过快
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error) {
      results.push({
        item,
        error: 'Failed to process'
      })
    }
  }

  return results
}
```

### 流式处理（准备中）

```typescript
// 注意：当前版本暂不支持流式输出
// 以下是未来版本的示例代码

async function streamAI(prompt: string) {
  const stream = await callAI(prompt, {
    stream: true,
    maxTokens: 1000
  })

  for await (const chunk of stream) {
    console.log(chunk.text)
    // 实时显示生成的文本
  }
}
```

### 带上下文的对话

```typescript
interface Message {
  role: 'user' | 'assistant'
  content: string
}

async function chatWithContext(
  messages: Message[],
  newMessage: string
) {
  // 构建包含历史的提示词
  const context = messages
    .map(m => `${m.role}: ${m.content}`)
    .join('\n')

  const prompt = `${context}\nuser: ${newMessage}\nassistant:`

  const result = await callAI(prompt, {
    maxTokens: 500,
    temperature: 0.8
  })

  return result.response
}

// 使用示例
const conversation: Message[] = [
  { role: 'user', content: 'What is React?' },
  { role: 'assistant', content: 'React is a JavaScript library...' }
]

const response = await chatWithContext(
  conversation,
  'Can you give me an example?'
)
```

### 成本控制

```typescript
async function costControlledAI(
  prompt: string,
  maxCost: number = 0.01 // 最大成本 $0.01
) {
  // 估算 token 数量（粗略估计：1 token ≈ 4 字符）
  const estimatedTokens = Math.ceil(prompt.length / 4)

  // 根据成本限制计算最大输出 token
  // 假设平均价格 $15/M tokens
  const maxOutputTokens = Math.floor(
    (maxCost * 1000000) / 15 - estimatedTokens
  )

  if (maxOutputTokens < 50) {
    throw new Error('Cost limit too low for this prompt')
  }

  const result = await callAI(prompt, {
    maxTokens: Math.min(maxOutputTokens, 1000)
  })

  if (result.cost > maxCost) {
    console.warn(`Cost exceeded limit: $${result.cost} > $${maxCost}`)
  }

  return result
}
```

### 缓存结果

```typescript
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!
})

async function cachedAI(
  prompt: string,
  cacheKey: string,
  ttl: number = 3600 // 缓存 1 小时
) {
  // 检查缓存
  const cached = await redis.get(cacheKey)
  if (cached) {
    console.log('Cache hit')
    return cached
  }

  // 调用 AI
  const result = await callAI(prompt, {
    maxTokens: 500
  })

  // 存入缓存
  await redis.setex(cacheKey, ttl, result.response)

  return result.response
}

// 使用示例
const response = await cachedAI(
  'What is the capital of France?',
  'ai:capital:france'
)
```

### 并发控制

```typescript
import pLimit from 'p-limit'

async function processWithConcurrency(
  items: string[],
  concurrency: number = 3
) {
  const limit = pLimit(concurrency)

  const promises = items.map(item =>
    limit(async () => {
      const result = await callAI(`Process: ${item}`, {
        maxTokens: 200
      })
      return {
        item,
        result: result.response
      }
    })
  )

  return Promise.all(promises)
}

// 使用示例：同时最多处理 3 个请求
const results = await processWithConcurrency(
  ['item1', 'item2', 'item3', 'item4', 'item5'],
  3
)
```

---

## 最佳实践

### 1. 提示词优化

```typescript
// ❌ 不好的提示词
const badPrompt = 'translate this'

// ✅ 好的提示词
const goodPrompt = `Translate the following English text to French.
Maintain the tone and style of the original text.

Text: "${text}"

Translation:`
```

### 2. Token 限制

```typescript
// 根据任务类型设置合理的 token 限制
const tokenLimits = {
  summary: 200,
  translation: 500,
  codeGeneration: 1000,
  essay: 2000
}

const result = await callAI(prompt, {
  maxTokens: tokenLimits.summary
})
```

### 3. 温度设置

```typescript
// 不同任务使用不同的温度
const temperatures = {
  factual: 0.1,      // 事实性任务（翻译、总结）
  balanced: 0.7,     // 平衡（对话、问答）
  creative: 0.9      // 创造性任务（写作、头脑风暴）
}

const result = await callAI(prompt, {
  temperature: temperatures.creative
})
```

### 4. 错误日志

```typescript
async function loggedAICall(prompt: string) {
  const startTime = Date.now()

  try {
    const result = await callAI(prompt, {
      maxTokens: 500
    })

    // 记录成功调用
    console.log({
      type: 'ai_call_success',
      latency: Date.now() - startTime,
      cost: result.cost,
      tokens: result.totalTokens,
      usedFallback: result.usedFallback
    })

    return result
  } catch (error) {
    // 记录失败调用
    console.error({
      type: 'ai_call_failure',
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    throw error
  }
}
```

---

## 完整示例：AI 驱动的内容审核工具

```typescript
// app/api/tools/content-moderator/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { callAI } from '@/lib/ai/service'
import { getCurrentSession } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { content } = await request.json()

    // 检查内容长度
    if (content.length > 5000) {
      return NextResponse.json(
        { error: 'Content too long (max 5000 characters)' },
        { status: 400 }
      )
    }

    // 构建审核提示词
    const prompt = `Analyze the following content for:
1. Inappropriate language
2. Spam or promotional content
3. Harmful or offensive material

Content: "${content}"

Respond in JSON format:
{
  "safe": true/false,
  "issues": ["issue1", "issue2"],
  "severity": "low/medium/high",
  "recommendation": "approve/review/reject"
}`

    // 调用 AI
    const result = await callAI(prompt, {
      maxTokens: 300,
      temperature: 0.2, // 低温度以获得一致的结果
      userId: session.user.id,
      toolId: 'content-moderator'
    })

    // 解析 AI 响应
    let analysis
    try {
      analysis = JSON.parse(result.response)
    } catch {
      // 如果 AI 没有返回有效的 JSON，使用默认值
      analysis = {
        safe: true,
        issues: [],
        severity: 'low',
        recommendation: 'review'
      }
    }

    // 记录审核结果
    await prisma.contentModeration.create({
      data: {
        userId: session.user.id,
        content,
        analysis,
        cost: result.cost,
        modelUsed: result.modelUsed
      }
    })

    return NextResponse.json({
      success: true,
      analysis,
      metadata: {
        cost: result.cost,
        tokensUsed: result.totalTokens
      }
    })

  } catch (error) {
    console.error('Content moderation error:', error)
    return NextResponse.json(
      { error: 'Moderation failed' },
      { status: 500 }
    )
  }
}
```

---

更多示例和最佳实践，请参考主文档 [README.md](./README.md)。
