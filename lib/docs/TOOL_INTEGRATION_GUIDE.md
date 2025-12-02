# 小工具集成指南：AI模型与使用限制系统

本文档专门指导开发者在添加新的小工具时，如何正确集成 **AI 模型系统** 和 **使用限制系统**。

---

## 目录

1. [快速开始](#快速开始)
2. [完整集成流程](#完整集成流程)
3. [AI 模型调用](#ai-模型调用)
4. [使用限制检查](#使用限制检查)
5. [完整代码示例](#完整代码示例)
6. [最佳实践](#最佳实践)
7. [常见问题](#常见问题)

---

## 快速开始

### 核心概念

在添加新工具时，你需要：

1. **使用限制检查**：在执行工具逻辑前，检查用户是否还有使用次数
2. **AI 模型调用**（可选）：如果工具需要 AI 能力，调用统一的 AI 服务
3. **使用记录**：执行完成后，记录本次使用（包含 AI 消耗）

### 基本流程

```typescript
// 1. 检查使用限制
const checkResult = await checkUsageLimit({ ... })
if (!checkResult.allowed) {
  return { error: '使用次数已达上限' }
}

// 2. 执行工具逻辑（可选：调用 AI）
const result = await processToolLogic()

// 3. 记录使用
await recordUsage(toolId, { ... })

return { success: true, result }
```

---

## 完整集成流程

### 步骤 1：创建 API 路由

在 `app/api/tools/[your-tool]/route.ts` 创建工具的 API 端点：

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentSession } from '@/lib/auth-utils'
import { checkUsageLimit, recordUsage } from '@/lib/usage-limits/service'
import { callAI } from '@/lib/ai/service'

export async function POST(request: NextRequest) {
  try {
    // 1. 获取用户会话
    const session = await getCurrentSession()

    // 2. 解析请求数据
    const body = await request.json()
    const { input } = body

    // 3. 获取设备指纹（用于游客限制）
    const deviceFingerprint = request.headers.get('x-device-fingerprint')
    const ipAddress = request.headers.get('x-forwarded-for') ||
                      request.headers.get('x-real-ip')

    // 4. 检查使用限制
    const checkResult = await checkUsageLimit({
      userId: session?.user?.id,
      deviceFingerprint,
      ipAddress
    })

    if (!checkResult.allowed) {
      return NextResponse.json(
        {
          error: checkResult.reason,
          requiresLogin: checkResult.requiresLogin,
          requiresUpgrade: checkResult.requiresUpgrade
        },
        { status: 429 }
      )
    }

    // 5. 执行工具逻辑
    const result = await processYourTool(input)

    // 6. 记录使用
    await recordUsage('your-tool-id', {
      userId: session?.user?.id,
      deviceFingerprint,
      ipAddress,
      userAgent: request.headers.get('user-agent')
    })

    return NextResponse.json({
      success: true,
      result,
      remaining: checkResult.remaining
    })

  } catch (error) {
    console.error('Tool error:', error)
    return NextResponse.json(
      { error: '处理失败，请稍后重试' },
      { status: 500 }
    )
  }
}

// 工具逻辑函数
async function processYourTool(input: string) {
  // 实现你的工具逻辑
  return { output: input.toUpperCase() }
}
```

### 步骤 2：前端集成设备指纹

在客户端调用 API 时，需要携带设备指纹：

```typescript
// components/tools/YourToolComponent.tsx
'use client'

import { useState, useEffect } from 'react'
import { generateDeviceFingerprint } from '@/lib/usage-limits/fingerprint'

export default function YourToolComponent() {
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>()
  const [result, setResult] = useState<any>()
  const [loading, setLoading] = useState(false)

  // 生成设备指纹
  useEffect(() => {
    generateDeviceFingerprint().then(setDeviceFingerprint)
  }, [])

  const handleSubmit = async (input: string) => {
    setLoading(true)

    try {
      const response = await fetch('/api/tools/your-tool', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Fingerprint': deviceFingerprint || ''
        },
        body: JSON.stringify({ input })
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          // 使用次数已达上限
          if (data.requiresLogin) {
            alert('请登录以获得更多使用次数')
          } else if (data.requiresUpgrade) {
            alert('请升级订阅以获得更多使用次数')
          } else {
            alert(data.error)
          }
        }
        return
      }

      setResult(data.result)

    } catch (error) {
      console.error('Request failed:', error)
      alert('请求失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* 你的工具 UI */}
    </div>
  )
}
```

---

## AI 模型调用

### 何时使用 AI

如果你的工具需要以下能力，应该集成 AI：

- 文本生成、改写、翻译
- 内容总结、提取
- 智能分析、建议
- 对话、问答
- 代码生成、解释

### 基本 AI 调用

```typescript
import { callAI } from '@/lib/ai/service'

async function processWithAI(input: string, userId?: string) {
  try {
    const result = await callAI(
      `请处理以下内容：${input}`,
      {
        temperature: 0.7,      // 创造性（0-1）
        maxTokens: 500,        // 最大输出长度
        userId: userId,        // 用户ID（用于统计）
        toolId: 'your-tool-id' // 工具ID（用于统计）
      }
    )

    if (result.success) {
      return {
        output: result.response,
        tokensUsed: result.totalTokens,
        cost: result.cost
      }
    } else {
      throw new Error('AI 调用失败')
    }

  } catch (error) {
    console.error('AI error:', error)
    throw new Error('AI 服务暂时不可用')
  }
}
```

### 带 AI 的完整示例

```typescript
export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession()
    const body = await request.json()
    const deviceFingerprint = request.headers.get('x-device-fingerprint')
    const ipAddress = request.headers.get('x-forwarded-for')

    // 1. 检查使用限制
    const checkResult = await checkUsageLimit({
      userId: session?.user?.id,
      deviceFingerprint,
      ipAddress
    })

    if (!checkResult.allowed) {
      return NextResponse.json(
        { error: checkResult.reason },
        { status: 429 }
      )
    }

    // 2. 调用 AI 处理
    const aiResult = await callAI(
      `请将以下文本翻译成英文：${body.text}`,
      {
        maxTokens: 1000,
        temperature: 0.3,
        userId: session?.user?.id,
        toolId: 'translator'
      }
    )

    // 3. 记录使用（包含 AI 消耗）
    await recordUsage('translator', {
      userId: session?.user?.id,
      deviceFingerprint,
      ipAddress,
      userAgent: request.headers.get('user-agent'),
      usedAI: true,                    // 标记使用了 AI
      aiTokens: aiResult.totalTokens,  // AI token 消耗
      aiCost: aiResult.cost            // AI 成本
    })

    return NextResponse.json({
      success: true,
      translation: aiResult.response,
      tokensUsed: aiResult.totalTokens,
      cost: aiResult.cost,
      remaining: checkResult.remaining
    })

  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json(
      { error: '翻译失败' },
      { status: 500 }
    )
  }
}
```

---

## 使用限制检查

### 限制规则说明

系统自动根据用户类型应用不同的限制：

| 用户类型 | 限制来源 | 验证方式 | 默认限制 |
|---------|---------|---------|---------|
| 游客（未登录） | 全局配置 | 设备指纹 + IP | 10次/天 |
| 注册用户（无订阅） | 全局配置 | userId | 50次/天 |
| 订阅用户（有活跃订阅） | 订阅计划 | userId | 根据计划 |

### checkUsageLimit 参数说明

```typescript
interface CheckUsageLimitParams {
  userId?: string           // 用户ID（注册用户/订阅用户）
  deviceFingerprint?: string // 设备指纹（游客，强烈推荐）
  ipAddress?: string        // IP地址（游客，降级方案）
}

interface UsageCheckResult {
  allowed: boolean          // 是否允许使用
  remaining: number         // 剩余次数（-1 表示无限制）
  limit: number             // 总限制次数（-1 表示无限制）
  userType: 'guest' | 'user' | 'subscriber'  // 用户类型
  reason?: string           // 拒绝原因（如果 allowed 为 false）
  requiresLogin?: boolean   // 是否需要登录
  requiresUpgrade?: boolean // 是否需要升级
}
```

### 处理不同的限制结果

```typescript
const checkResult = await checkUsageLimit({
  userId: session?.user?.id,
  deviceFingerprint,
  ipAddress
})

if (!checkResult.allowed) {
  // 根据用户类型返回不同的提示
  if (checkResult.requiresLogin) {
    // 游客达到限制，提示登录
    return NextResponse.json({
      error: '今日免费使用次数已用完',
      message: '登录后可获得更多使用次数',
      action: 'login'
    }, { status: 429 })
  } else if (checkResult.requiresUpgrade) {
    // 注册用户达到限制，提示升级
    return NextResponse.json({
      error: '今日使用次数已达上限',
      message: '升级订阅可获得更多使用次数',
      action: 'upgrade'
    }, { status: 429 })
  } else {
    // 订阅用户达到限制
    return NextResponse.json({
      error: checkResult.reason
    }, { status: 429 })
  }
}

// 在响应中返回剩余次数
return NextResponse.json({
  success: true,
  result: data,
  usage: {
    remaining: checkResult.remaining,
    limit: checkResult.limit,
    userType: checkResult.userType
  }
})
```

---

## 完整代码示例

### 示例 1：简单工具（不使用 AI）

```typescript
// app/api/tools/word-counter/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentSession } from '@/lib/auth-utils'
import { checkUsageLimit, recordUsage } from '@/lib/usage-limits/service'

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession()
    const { text } = await request.json()
    const deviceFingerprint = request.headers.get('x-device-fingerprint')
    const ipAddress = request.headers.get('x-forwarded-for')

    // 检查使用限制
    const checkResult = await checkUsageLimit({
      userId: session?.user?.id,
      deviceFingerprint,
      ipAddress
    })

    if (!checkResult.allowed) {
      return NextResponse.json(
        { error: checkResult.reason },
        { status: 429 }
      )
    }

    // 执行工具逻辑
    const wordCount = text.trim().split(/\s+/).length
    const charCount = text.length

    // 记录使用
    await recordUsage('word-counter', {
      userId: session?.user?.id,
      deviceFingerprint,
      ipAddress,
      userAgent: request.headers.get('user-agent')
    })

    return NextResponse.json({
      success: true,
      wordCount,
      charCount,
      remaining: checkResult.remaining
    })

  } catch (error) {
    console.error('Word counter error:', error)
    return NextResponse.json(
      { error: '处理失败' },
      { status: 500 }
    )
  }
}
```

### 示例 2：AI 驱动的工具

```typescript
// app/api/tools/content-improver/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentSession } from '@/lib/auth-utils'
import { checkUsageLimit, recordUsage } from '@/lib/usage-limits/service'
import { callAI } from '@/lib/ai/service'

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession()
    const { content, style } = await request.json()
    const deviceFingerprint = request.headers.get('x-device-fingerprint')
    const ipAddress = request.headers.get('x-forwarded-for')

    // 1. 检查使用限制
    const checkResult = await checkUsageLimit({
      userId: session?.user?.id,
      deviceFingerprint,
      ipAddress
    })

    if (!checkResult.allowed) {
      return NextResponse.json(
        {
          error: checkResult.reason,
          requiresLogin: checkResult.requiresLogin,
          requiresUpgrade: checkResult.requiresUpgrade
        },
        { status: 429 }
      )
    }

    // 2. 构建 AI 提示词
    const prompt = `请将以下内容改写为${style}风格，保持原意但提升表达质量：

${content}

要求：
1. 保持原文的核心意思
2. 使用${style}的语言风格
3. 提升可读性和专业性
4. 只返回改写后的内容，不要添加额外说明`

    // 3. 调用 AI
    const aiResult = await callAI(prompt, {
      temperature: 0.7,
      maxTokens: 2000,
      userId: session?.user?.id,
      toolId: 'content-improver'
    })

    if (!aiResult.success) {
      return NextResponse.json(
        { error: 'AI 服务暂时不可用，请稍后重试' },
        { status: 503 }
      )
    }

    // 4. 记录使用（包含 AI 消耗）
    await recordUsage('content-improver', {
      userId: session?.user?.id,
      deviceFingerprint,
      ipAddress,
      userAgent: request.headers.get('user-agent'),
      usedAI: true,
      aiTokens: aiResult.totalTokens,
      aiCost: aiResult.cost
    })

    // 5. 返回结果
    return NextResponse.json({
      success: true,
      improvedContent: aiResult.response,
      metadata: {
        tokensUsed: aiResult.totalTokens,
        cost: aiResult.cost,
        modelUsed: aiResult.modelUsed,
        usedFallback: aiResult.usedFallback
      },
      usage: {
        remaining: checkResult.remaining,
        limit: checkResult.limit
      }
    })

  } catch (error) {
    console.error('Content improver error:', error)
    return NextResponse.json(
      { error: '处理失败，请稍后重试' },
      { status: 500 }
    )
  }
}
```

### 示例 3：批量处理工具

```typescript
// app/api/tools/batch-processor/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentSession } from '@/lib/auth-utils'
import { checkUsageLimit, recordUsage } from '@/lib/usage-limits/service'
import { callAI } from '@/lib/ai/service'

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession()
    const { items } = await request.json() // 批量项目数组
    const deviceFingerprint = request.headers.get('x-device-fingerprint')
    const ipAddress = request.headers.get('x-forwarded-for')

    // 检查使用限制（批量处理算一次使用）
    const checkResult = await checkUsageLimit({
      userId: session?.user?.id,
      deviceFingerprint,
      ipAddress
    })

    if (!checkResult.allowed) {
      return NextResponse.json(
        { error: checkResult.reason },
        { status: 429 }
      )
    }

    // 批量处理
    const results = []
    let totalTokens = 0
    let totalCost = 0

    for (const item of items) {
      const aiResult = await callAI(
        `处理：${item}`,
        {
          maxTokens: 500,
          userId: session?.user?.id,
          toolId: 'batch-processor'
        }
      )

      results.push({
        input: item,
        output: aiResult.response
      })

      totalTokens += aiResult.totalTokens
      totalCost += aiResult.cost
    }

    // 记录使用（批量处理算一次）
    await recordUsage('batch-processor', {
      userId: session?.user?.id,
      deviceFingerprint,
      ipAddress,
      userAgent: request.headers.get('user-agent'),
      usedAI: true,
      aiTokens: totalTokens,
      aiCost: totalCost
    })

    return NextResponse.json({
      success: true,
      results,
      metadata: {
        itemsProcessed: items.length,
        totalTokens,
        totalCost
      },
      remaining: checkResult.remaining
    })

  } catch (error) {
    console.error('Batch processor error:', error)
    return NextResponse.json(
      { error: '批量处理失败' },
      { status: 500 }
    )
  }
}
```

---

## 最佳实践

### 1. 使用限制检查

✅ **推荐做法**：

```typescript
// 始终在执行工具逻辑前检查限制
const checkResult = await checkUsageLimit({ ... })
if (!checkResult.allowed) {
  return error response
}

// 执行工具逻辑
const result = await processLogic()

// 记录使用
await recordUsage(...)
```

❌ **不推荐做法**：

```typescript
// 不要在执行后才检查限制
const result = await processLogic()

const checkResult = await checkUsageLimit({ ... })
if (!checkResult.allowed) {
  // 太晚了，逻辑已经执行
}
```

### 2. 设备指纹使用

✅ **推荐做法**：

```typescript
// 前端生成设备指纹
const deviceFingerprint = await generateDeviceFingerprint()

// 通过请求头传递
headers: {
  'X-Device-Fingerprint': deviceFingerprint
}

// 后端接收
const deviceFingerprint = request.headers.get('x-device-fingerprint')
```

❌ **不推荐做法**：

```typescript
// 不要只依赖 IP 地址（容易被 VPN 绕过）
const checkResult = await checkUsageLimit({
  ipAddress: ipAddress // 缺少设备指纹
})
```

### 3. AI 调用优化

✅ **推荐做法**：

```typescript
// 设置合理的 maxTokens
const result = await callAI(prompt, {
  maxTokens: 500,  // 根据实际需求设置
  temperature: 0.7
})

// 精简提示词
const prompt = `简洁明确的指令：${input}`
```

❌ **不推荐做法**：

```typescript
// 不要使用过大的 maxTokens
const result = await callAI(prompt, {
  maxTokens: 10000  // 浪费成本
})

// 不要使用冗长的提示词
const prompt = `这是一个非常长的提示词，包含很多不必要的说明...`
```

### 4. 错误处理

✅ **推荐做法**：

```typescript
try {
  const checkResult = await checkUsageLimit({ ... })

  if (!checkResult.allowed) {
    return NextResponse.json(
      {
        error: checkResult.reason,
        requiresLogin: checkResult.requiresLogin,
        requiresUpgrade: checkResult.requiresUpgrade
      },
      { status: 429 }
    )
  }

  const result = await processLogic()
  await recordUsage(...)

  return NextResponse.json({ success: true, result })

} catch (error) {
  console.error('Tool error:', error)
  return NextResponse.json(
    { error: '处理失败，请稍后重试' },
    { status: 500 }
  )
}
```

### 5. 返回剩余次数

✅ **推荐做法**：

```typescript
// 在响应中返回剩余次数，让前端显示
return NextResponse.json({
  success: true,
  result: data,
  usage: {
    remaining: checkResult.remaining,
    limit: checkResult.limit,
    userType: checkResult.userType
  }
})
```

前端显示：

```typescript
// 显示剩余次数
{data.usage.remaining !== -1 && (
  <p className="text-sm text-muted-foreground">
    今日剩余使用次数：{data.usage.remaining}/{data.usage.limit}
  </p>
)}
```

---

## 常见问题

### Q1: 如何判断工具是否需要使用 AI？

**A**: 考虑以下因素：

- ✅ 需要 AI：文本生成、翻译、总结、智能分析、对话
- ❌ 不需要 AI：简单计算、格式转换、编码解码、字数统计

### Q2: 批量处理应该算几次使用？

**A**: 建议算一次使用，但在 `recordUsage` 时记录实际的 AI token 消耗：

```typescript
await recordUsage('tool-id', {
  userId: session?.user?.id,
  usedAI: true,
  aiTokens: totalTokens,  // 累计所有批量项目的 token
  aiCost: totalCost       // 累计所有批量项目的成本
})
```

### Q3: 如何处理 AI 调用失败？

**A**: AI 系统有自动故障转移机制，会尝试备用模型。如果所有模型都失败：

```typescript
try {
  const aiResult = await callAI(prompt, options)

  if (!aiResult.success) {
    return NextResponse.json(
      { error: 'AI 服务暂时不可用，请稍后重试' },
      { status: 503 }
    )
  }

} catch (error) {
  // 所有 AI 模型都失败了
  return NextResponse.json(
    { error: 'AI 服务暂时不可用' },
    { status: 503 }
  )
}
```

### Q4: 设备指纹不可用怎么办？

**A**: 系统会自动降级到 IP 地址限制：

```typescript
const checkResult = await checkUsageLimit({
  userId: session?.user?.id,
  deviceFingerprint,  // 可能为 null
  ipAddress           // 降级方案
})
```

### Q5: 如何测试使用限制？

**A**: 在开发环境中，可以临时修改全局限制：

1. 访问 `/admin/settings`
2. 修改 `usage_limits` 配置
3. 设置较小的限制值（如 2 次）进行测试

### Q6: 如何查看 AI 使用统计？

**A**: 查询 `AIUsageLog` 表：

```typescript
// 查看某个工具的 AI 使用情况
const stats = await prisma.aIUsageLog.aggregate({
  where: {
    toolId: 'your-tool-id',
    status: 'success'
  },
  _sum: {
    totalTokens: true,
    cost: true
  },
  _count: true
})

console.log('Total calls:', stats._count)
console.log('Total tokens:', stats._sum.totalTokens)
console.log('Total cost:', stats._sum.cost)
```

### Q7: 订阅用户的限制如何配置？

**A**: 在订阅计划（Plan）中配置：

```json
{
  "dailyUsage": 200,  // 每日使用次数，-1 表示无限制
  "aiUsage": {
    "enabled": true,
    "dailyLimit": 100,
    "monthlyLimit": 3000
  }
}
```

### Q8: 如何为不同工具设置不同的限制？

**A**: 当前版本使用全局限制。如果需要特殊限制，可以在工具代码中添加额外检查：

```typescript
// 检查全局限制
const checkResult = await checkUsageLimit({ ... })

// 添加工具特定的限制
if (checkResult.userType === 'guest' && specialToolRequirement) {
  return NextResponse.json(
    { error: '此工具需要登录后使用' },
    { status: 403 }
  )
}
```

---

## 相关文档

- [AI 模型系统完整文档](../ai/docs/README.md)
- [使用限制系统完整文档](../usage-limits/README.md)
- [工具创建完整指南](../../TOOL_CREATION_GUIDE.md)

---

## 更新日志

### v1.0.0 (2025-01-02)
- ✅ 初始版本
- ✅ AI 模型集成指南
- ✅ 使用限制集成指南
- ✅ 完整代码示例
- ✅ 最佳实践和常见问题

---

**提示**：如果在集成过程中遇到问题，请先查看本文档的"常见问题"部分，或参考完整的系统文档。
