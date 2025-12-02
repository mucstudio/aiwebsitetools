# AI 模型系统使用文档

本文档介绍如何使用 AI 模型系统，包括配置、调用和管理。

## 目录

1. [快速开始](#快速开始)
2. [供应商配置](#供应商配置)
3. [模型管理](#模型管理)
4. [全局配置](#全局配置)
5. [API 调用示例](#api-调用示例)
6. [故障转移机制](#故障转移机制)
7. [成本统计](#成本统计)
8. [常见问题](#常见问题)

---

## 快速开始

### 1. 添加 AI 供应商

访问 `/admin/ai-providers`，点击"添加供应商"按钮：

```
供应商名称: OpenAI
标识符: openai
供应商类型: openai
API 端点: https://api.openai.com/v1
API Key: sk-your-api-key-here
```

### 2. 获取模型列表

添加供应商后，点击"获取模型"按钮，系统会自动拉取该供应商的所有可用模型。

### 3. 配置全局模型

访问 `/admin/ai-config`，选择主模型和备用模型：

```
主模型: GPT-4 Turbo
备用模型 1: Claude 3.5 Sonnet
备用模型 2: Gemini Pro
```

### 4. 调用 AI

在代码中调用 AI：

```typescript
import { callAI } from '@/lib/ai/service'

const result = await callAI('Hello, how are you?', {
  maxTokens: 100,
  temperature: 0.7,
  userId: 'user-id',
  toolId: 'tool-id',
})

console.log(result.response) // AI 的回复
console.log(result.cost) // 本次调用成本
```

---

## 供应商配置

### 支持的供应商类型

#### 1. OpenAI

```typescript
{
  name: "OpenAI",
  slug: "openai",
  type: "openai",
  apiEndpoint: "https://api.openai.com/v1",
  apiKey: "sk-..."
}
```

**支持的模型**：
- GPT-4 系列（gpt-4, gpt-4-turbo, gpt-4o）
- GPT-3.5 系列（gpt-3.5-turbo）

#### 2. Anthropic

```typescript
{
  name: "Anthropic",
  slug: "anthropic",
  type: "anthropic",
  apiEndpoint: "https://api.anthropic.com/v1",
  apiKey: "sk-ant-..."
}
```

**支持的模型**：
- Claude 3.5 系列（claude-3-5-sonnet, claude-3-5-haiku）
- Claude 3 系列（claude-3-opus, claude-3-sonnet, claude-3-haiku）

#### 3. Google AI

```typescript
{
  name: "Google AI",
  slug: "google",
  type: "google",
  apiEndpoint: "https://generativelanguage.googleapis.com/v1",
  apiKey: "AIza..."
}
```

**支持的模型**：
- Gemini 1.5 系列（gemini-1.5-pro, gemini-1.5-flash）
- Gemini Pro

#### 4. Custom（自定义/第三方中转）

```typescript
{
  name: "Custom Provider",
  slug: "custom",
  type: "custom",
  apiEndpoint: "https://your-api-endpoint.com/v1",
  apiKey: "your-api-key"
}
```

**要求**：必须兼容 OpenAI API 格式

---

## 模型管理

### 自动获取模型

1. 访问 `/admin/ai-providers`
2. 找到对应的供应商
3. 点击"获取模型"按钮
4. 系统会自动拉取并保存所有可用模型

### 手动添加模型

适用于自定义模型或第三方中转服务：

1. 访问 `/admin/ai-models`
2. 点击"手动添加模型"
3. 填写模型信息：

```
供应商: 选择已添加的供应商
模型名称: GPT-4 Custom
模型 ID: gpt-4-custom
输入价格: 30 ($/M tokens)
输出价格: 60 ($/M tokens)
最大输出 Token: 4096
上下文窗口: 8192
```

### 模型配置说明

| 字段 | 说明 | 示例 |
|------|------|------|
| 模型名称 | 显示名称 | GPT-4 Turbo |
| 模型 ID | API 调用时使用的标识符 | gpt-4-turbo |
| 输入价格 | 每百万输入 token 的价格（美元） | 10 |
| 输出价格 | 每百万输出 token 的价格（美元） | 30 |
| 最大输出 Token | 单次请求最大输出 token 数 | 4096 |
| 上下文窗口 | 模型支持的最大上下文长度 | 128000 |
| 支持视觉 | 是否支持图像输入 | ✓ |
| 支持工具调用 | 是否支持 Function Calling | ✓ |
| 支持流式输出 | 是否支持 Streaming | ✓ |

---

## 全局配置

### 配置主模型和备用模型

访问 `/admin/ai-config` 进行配置：

```typescript
{
  primaryModelId: "model-id-1",      // 主模型
  fallback1ModelId: "model-id-2",    // 备用模型 1
  fallback2ModelId: "model-id-3",    // 备用模型 2
  retryAttempts: 3,                  // 每个模型的重试次数
  timeoutSeconds: 30,                // 请求超时时间（秒）
  enableFallback: true               // 是否启用故障转移
}
```

### 配置建议

1. **主模型**：选择性能最好、最稳定的模型
2. **备用模型 1**：选择不同供应商的模型，提高可用性
3. **备用模型 2**：作为最后的保障
4. **重试次数**：建议 2-3 次
5. **超时时间**：根据模型响应速度调整，建议 30-60 秒

---

## API 调用示例

### 基础调用

```typescript
import { callAI } from '@/lib/ai/service'

// 最简单的调用
const result = await callAI('What is the capital of France?')

console.log(result.response) // "The capital of France is Paris."
console.log(result.success) // true
console.log(result.modelUsed) // "model-id"
console.log(result.cost) // 0.0015
```

### 带参数调用

```typescript
const result = await callAI('Write a short poem about AI', {
  temperature: 0.9,        // 创造性（0-1）
  maxTokens: 200,          // 最大输出长度
  userId: 'user-123',      // 用户 ID（用于统计）
  toolId: 'poem-generator' // 工具 ID（用于统计）
})
```

### 错误处理

```typescript
try {
  const result = await callAI('Your prompt here', {
    maxTokens: 100
  })

  if (result.success) {
    console.log('Response:', result.response)
    console.log('Cost:', result.cost)
    console.log('Tokens:', result.totalTokens)
  }
} catch (error) {
  console.error('AI call failed:', error.message)
  // 所有模型都失败了
}
```

### 在工具中使用

```typescript
// app/api/tools/my-tool/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { callAI } from '@/lib/ai/service'
import { getCurrentSession } from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
  const session = await getCurrentSession()
  const { prompt } = await request.json()

  try {
    const result = await callAI(prompt, {
      maxTokens: 500,
      temperature: 0.7,
      userId: session?.user?.id,
      toolId: 'my-tool'
    })

    return NextResponse.json({
      success: true,
      response: result.response,
      cost: result.cost,
      tokensUsed: result.totalTokens
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'AI service unavailable' },
      { status: 503 }
    )
  }
}
```

---

## 故障转移机制

### 工作流程

```
1. 尝试调用主模型
   ├─ 成功 → 返回结果
   └─ 失败 → 重试（最多 N 次）
       └─ 仍失败 → 切换到备用模型 1

2. 尝试调用备用模型 1
   ├─ 成功 → 返回结果（标记使用了备用模型）
   └─ 失败 → 重试（最多 N 次）
       └─ 仍失败 → 切换到备用模型 2

3. 尝试调用备用模型 2
   ├─ 成功 → 返回结果（标记使用了备用模型）
   └─ 失败 → 抛出错误（所有模型都失败）
```

### 故障转移信息

调用结果中包含故障转移信息：

```typescript
{
  success: true,
  response: "...",
  modelUsed: "backup-model-id",
  usedFallback: true,      // 是否使用了备用模型
  fallbackLevel: 1,        // 0=主模型, 1=备用1, 2=备用2
  latencyMs: 1500          // 响应时间（毫秒）
}
```

### 监控故障转移

查看使用日志（`AIUsageLog` 表）：

```sql
SELECT
  modelId,
  usedFallback,
  fallbackLevel,
  COUNT(*) as count
FROM AIUsageLog
WHERE createdAt > NOW() - INTERVAL '24 hours'
GROUP BY modelId, usedFallback, fallbackLevel
```

---

## 成本统计

### 查看总成本

```typescript
// 查询某个用户的总成本
const totalCost = await prisma.aIUsageLog.aggregate({
  where: {
    userId: 'user-id',
    status: 'success'
  },
  _sum: {
    cost: true
  }
})

console.log('Total cost:', totalCost._sum.cost)
```

### 查看模型使用情况

```typescript
// 查询各模型的使用次数和成本
const modelStats = await prisma.aIUsageLog.groupBy({
  by: ['modelId'],
  where: {
    createdAt: {
      gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 最近 30 天
    }
  },
  _count: true,
  _sum: {
    cost: true,
    totalTokens: true
  }
})
```

### 成本优化建议

1. **选择合适的模型**：根据任务复杂度选择模型
   - 简单任务：使用 GPT-3.5 或 Claude Haiku
   - 复杂任务：使用 GPT-4 或 Claude Sonnet

2. **控制 Token 使用**：
   - 设置合理的 `maxTokens`
   - 精简提示词
   - 避免重复调用

3. **使用缓存**：
   - 对相同的提示词缓存结果
   - 设置合理的缓存过期时间

4. **监控异常**：
   - 定期检查失败率
   - 及时发现和修复问题

---

## 常见问题

### Q1: 如何添加第三方 API 中转服务？

A: 选择"Custom"类型，填入中转服务的 API 端点和密钥。确保中转服务兼容 OpenAI API 格式。

```typescript
{
  type: "custom",
  apiEndpoint: "https://api.your-proxy.com/v1",
  apiKey: "your-proxy-key"
}
```

### Q2: API Key 如何存储？

A: API Key 使用 AES-256-CBC 加密后存储在数据库中，只在调用时解密。加密密钥存储在环境变量 `ENCRYPTION_KEY` 中。

### Q3: 如何测试 AI 配置是否正确？

A: 添加供应商后，点击"获取模型"按钮。如果能成功获取模型列表，说明配置正确。

### Q4: 故障转移会增加延迟吗？

A: 只有在主模型失败时才会触发故障转移。正常情况下不会增加延迟。

### Q5: 如何查看 AI 调用日志？

A: 所有调用都记录在 `AIUsageLog` 表中，包括：
- 提示词和响应
- Token 使用量
- 成本
- 响应时间
- 是否使用备用模型

### Q6: 可以为不同工具配置不同的模型吗？

A: 目前使用全局配置。未来版本会支持为每个工具单独配置模型。

### Q7: 如何限制 AI 使用成本？

A: 可以在 Plan 的 `limits` 中配置：

```json
{
  "aiUsage": {
    "enabled": true,
    "dailyLimit": 10,
    "monthlyLimit": 100
  }
}
```

### Q8: 支持流式输出吗？

A: 当前版本暂不支持流式输出，将在后续版本中添加。

---

## 环境变量配置

在 `.env` 文件中添加：

```bash
# AI 加密密钥（必须）
ENCRYPTION_KEY=your-secret-encryption-key-change-this

# 可选：默认超时时间
AI_TIMEOUT_SECONDS=30

# 可选：默认重试次数
AI_RETRY_ATTEMPTS=3
```

---

## 更新日志

### v1.0.0 (2024-12-02)
- ✅ 支持 OpenAI、Anthropic、Google AI
- ✅ 自动获取模型列表
- ✅ 手动添加自定义模型
- ✅ 主模型和备用模型配置
- ✅ 故障转移机制
- ✅ 成本统计和使用日志
- ✅ API Key 加密存储

### 计划中的功能
- 🔄 流式输出支持
- 🔄 为每个工具单独配置模型
- 🔄 AI 响应缓存
- 🔄 更详细的使用统计和图表
- 🔄 成本预警和限额

---

## 技术支持

如有问题，请查看：
- [API 调用示例](./examples.md)
- [供应商接入指南](./providers.md)
- [故障排查指南](./troubleshooting.md)
