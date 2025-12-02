# 使用限制集成示例

本文档展示如何在工具中集成使用限制系统（包含设备指纹）。

## 安装依赖

```bash
npm install @fingerprintjs/fingerprintjs
```

## 客户端：生成设备指纹

```typescript
// app/tools/example/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { generateDeviceFingerprint } from '@/lib/usage-limits/fingerprint'

export default function ExampleToolPage() {
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>('')

  useEffect(() => {
    // 页面加载时生成设备指纹
    generateDeviceFingerprint().then(setDeviceFingerprint)
  }, [])

  const handleSubmit = async () => {
    const response = await fetch('/api/tools/example', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-Fingerprint': deviceFingerprint // 传递设备指纹
      },
      body: JSON.stringify({ input: 'test' })
    })

    const data = await response.json()
    // 处理响应
  }

  return (
    <div>
      <button onClick={handleSubmit}>提交</button>
    </div>
  )
}
```

## 服务端：完整示例 1（普通工具）

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

    // 1. 检查使用限制
    const checkResult = await checkUsageLimit({
      userId: session?.user?.id,
      deviceFingerprint, // 设备指纹（推荐）
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    })

    if (!checkResult.allowed) {
      return NextResponse.json(
        { error: checkResult.reason },
        { status: 429 }
      )
    }

    // 2. 执行工具逻辑
    const words = text.trim().split(/\s+/).length
    const chars = text.length

    // 3. 记录使用
    await recordUsage('word-counter-tool-id', {
      userId: session?.user?.id,
      deviceFingerprint,
      ipAddress: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent')
    })

    return NextResponse.json({
      success: true,
      words,
      chars
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

## 服务端：完整示例 2（AI 工具）

```typescript
// app/api/tools/ai-writer/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentSession } from '@/lib/auth-utils'
import { checkUsageLimit, recordUsage } from '@/lib/usage-limits/service'
import { callAI } from '@/lib/ai/client'

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession()
    const { prompt } = await request.json()
    const deviceFingerprint = request.headers.get('x-device-fingerprint')

    // 1. 检查使用限制
    const checkResult = await checkUsageLimit({
      userId: session?.user?.id,
      deviceFingerprint,
      ipAddress: request.headers.get('x-forwarded-for')
    })

    if (!checkResult.allowed) {
      return NextResponse.json(
        { error: checkResult.reason },
        { status: 429 }
      )
    }

    // 2. 调用 AI
    const aiResponse = await callAI({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }]
    })

    // 3. 记录使用（包含 AI 信息）
    await recordUsage('ai-writer-tool-id', {
      userId: session?.user?.id,
      deviceFingerprint,
      ipAddress: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
      usedAI: true,
      aiTokens: aiResponse.usage.total_tokens,
      aiCost: aiResponse.cost
    })

    return NextResponse.json({
      success: true,
      text: aiResponse.content
    })

  } catch (error) {
    console.error('AI writer error:', error)
    return NextResponse.json(
      { error: '处理失败' },
      { status: 500 }
    )
  }
}
```

## 检查结果处理

```typescript
const checkResult = await checkUsageLimit({
  userId: session?.user?.id,
  deviceFingerprint: request.headers.get('x-device-fingerprint'),
  ipAddress: request.headers.get('x-forwarded-for')
})

// 根据不同情况返回不同的错误信息
if (!checkResult.allowed) {
  if (checkResult.requiresLogin) {
    return NextResponse.json(
      {
        error: '请登录后继续使用',
        action: 'LOGIN',
        loginUrl: '/login'
      },
      { status: 401 }
    )
  }

  if (checkResult.requiresUpgrade) {
    return NextResponse.json(
      {
        error: '免费用户每日限额已用完',
        action: 'UPGRADE',
        upgradeUrl: '/pricing'
      },
      { status: 429 }
    )
  }

  return NextResponse.json(
    { error: checkResult.reason },
    { status: 429 }
  )
}
```

## 获取使用统计

```typescript
import { getUserUsageStats, getToolUsageStats } from '@/lib/usage-limits/service'

// 获取用户使用统计
const userStats = await getUserUsageStats({
  userId: session?.user?.id,
  sessionId: request.cookies.get('session-id')?.value,
  ipAddress: request.headers.get('x-forwarded-for')
})

console.log(userStats)
// { today: 5, thisMonth: 87, total: 234 }

// 获取工具使用统计
const toolStats = await getToolUsageStats('tool-id')
console.log(toolStats)
// { today: 120, thisMonth: 3450, total: 12890 }
```

## React Hook 示例（可选）

```typescript
// hooks/useDeviceFingerprint.ts
import { useState, useEffect } from 'react'
import { generateDeviceFingerprint } from '@/lib/usage-limits/fingerprint'

export function useDeviceFingerprint() {
  const [fingerprint, setFingerprint] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    generateDeviceFingerprint()
      .then(setFingerprint)
      .finally(() => setLoading(false))
  }, [])

  return { fingerprint, loading }
}

// 使用
function MyComponent() {
  const { fingerprint, loading } = useDeviceFingerprint()

  const handleSubmit = async () => {
    if (loading) return

    await fetch('/api/tools/example', {
      method: 'POST',
      headers: {
        'X-Device-Fingerprint': fingerprint
      },
      body: JSON.stringify({ input: 'test' })
    })
  }

  return <button onClick={handleSubmit}>提交</button>
}
```

## 注意事项

1. **强烈推荐使用设备指纹**：提供最可靠的防绕过保护
2. **客户端生成，服务端验证**：设备指纹在客户端生成，通过请求头传递给服务端
3. **自动降级**：如果设备指纹不可用，系统自动降级到 IP 地址限制
4. **始终传递完整参数**：userId、deviceFingerprint、ipAddress 都应该传递
5. **先检查后执行**：始终先调用 `checkUsageLimit`，通过后再执行工具逻辑
6. **记录在最后**：工具逻辑执行成功后再调用 `recordUsage`

## 相关文档

- [使用限制系统完整文档](./README.md)
- [设备指纹工具](./fingerprint.ts)
