# 添加新工具 - 快速参考手册

> **重要提示**：所有工具组件必须接收 `toolId` 和 `config` 作为 props，这是系统架构的核心要求。

---

## 📋 目录

1. [使用 AI 的工具](#使用-ai-的工具)
2. [不使用 AI 的工具](#不使用-ai-的工具)
3. [工具组件规范](#工具组件规范)
4. [API 接口说明](#api-接口说明)
5. [常见问题](#常见问题)

---

## 使用 AI 的工具

### 完整示例（推荐）

```typescript
'use client'

import { useState, useEffect } from 'react'
import { generateDeviceFingerprint } from '@/lib/usage-limits/fingerprint'

// ============================================================
// 1. 定义组件 Props 接口（必需）
// ============================================================
// 所有工具组件必须接收这两个 props：
// - toolId: 工具的唯一标识符（由系统自动传入）
// - config: 工具的配置信息（可选，由管理员在后台配置）
interface YourToolProps {
  toolId: string    // 必需：工具 ID，用于记录使用统计
  config?: any      // 可选：工具配置，可以存储自定义设置
}

// ============================================================
// 2. 导出组件（必须使用 default export）
// ============================================================
export default function YourTool({ toolId, config }: YourToolProps) {
  // ============================================================
  // 3. 状态管理
  // ============================================================
  const [fp, setFp] = useState<string>()           // 设备指纹，用于游客身份识别
  const [text, setText] = useState('')             // 用户输入
  const [result, setResult] = useState('')         // AI 返回结果
  const [remaining, setRemaining] = useState('--') // 剩余使用次数
  const [loading, setLoading] = useState(false)    // 加载状态

  // ============================================================
  // 4. 初始化：生成设备指纹并检查剩余次数
  // ============================================================
  useEffect(() => {
    const init = async () => {
      // 生成设备指纹（基于硬件特征的唯一标识）
      // 注意：不需要存储到 localStorage，每次生成的值都相同
      const fingerprint = await generateDeviceFingerprint()
      setFp(fingerprint)

      // 检查当前用户的剩余使用次数
      try {
        const res = await fetch('/api/usage/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Device-Fingerprint': fingerprint  // 传递设备指纹用于身份识别
          },
          body: JSON.stringify({})
        })
        const data = await res.json()

        // 更新剩余次数显示（-1 表示无限制）
        if (data.remaining !== undefined) {
          setRemaining(data.remaining === -1 ? '∞' : data.remaining.toString())
        }
      } catch (e) {
        console.error('Failed to check usage:', e)
      }
    }
    init()
  }, [])

  // ============================================================
  // 5. 处理 AI 调用
  // ============================================================
  const handleSubmit = async () => {
    // 验证输入
    if (!text.trim()) {
      alert('请输入内容')
      return
    }

    setLoading(true)

    try {
      // 调用 AI API
      const res = await fetch('/api/ai/call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Fingerprint': fp || ''  // 传递设备指纹
        },
        body: JSON.stringify({
          prompt: `你的提示词：${text}`,    // AI 提示词
          toolId: toolId                     // 使用传入的 toolId（重要！）
        })
      })

      // 处理响应
      if (!res.ok) {
        throw new Error('AI 调用失败')
      }

      const data = await res.json()

      // 设置 AI 返回的结果
      setResult(data.response)

      // 更新剩余使用次数（API 会自动扣减）
      if (data.usage) {
        setRemaining(data.usage.remaining === -1 ? '∞' : data.usage.remaining.toString())
      }
    } catch (error: any) {
      alert(error.message || '处理失败')
    } finally {
      setLoading(false)
    }
  }

  // ============================================================
  // 6. 渲染 UI
  // ============================================================
  return (
    <div>
      {/* 显示剩余次数 */}
      <div>剩余次数: {remaining}</div>

      {/* 输入框 */}
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="输入内容..."
        disabled={loading}
      />

      {/* 提交按钮 */}
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? '处理中...' : '提交'}
      </button>

      {/* 显示结果 */}
      {result && <div>结果: {result}</div>}
    </div>
  )
}
```

### 关键要点说明

**✅ 使用 AI 的工具特点：**
1. **必须手动检查限制**：调用 AI 前先调用 `/api/usage/check` 检查是否允许使用
2. **必须手动记录使用**：AI 调用成功后调用 `/api/usage/record` 记录使用次数
3. **返回 token 和成本信息**：响应中包含 `usage.inputTokens`、`usage.outputTokens`、`usage.cost`
4. **必须传递 `toolId`**：使用组件接收的 `toolId` prop，不要硬编码
5. **避免失败扣费**：先调用 AI，成功后再记录使用，防止 AI 失败但仍扣除次数

---

## 不使用 AI 的工具

### 完整示例（推荐）

```typescript
'use client'

import { useState, useEffect } from 'react'
import { generateDeviceFingerprint } from '@/lib/usage-limits/fingerprint'

// ============================================================
// 1. 定义组件 Props 接口（必需）
// ============================================================
interface YourToolProps {
  toolId: string    // 必需：工具 ID
  config?: any      // 可选：工具配置
}

// ============================================================
// 2. 导出组件
// ============================================================
export default function YourTool({ toolId, config }: YourToolProps) {
  // ============================================================
  // 3. 状态管理
  // ============================================================
  const [fp, setFp] = useState<string>()           // 设备指纹
  const [text, setText] = useState('')             // 用户输入
  const [result, setResult] = useState('')         // 处理结果
  const [remaining, setRemaining] = useState('--') // 剩余次数
  const [loading, setLoading] = useState(false)    // 加载状态

  // ============================================================
  // 4. 初始化：生成设备指纹并检查剩余次数
  // ============================================================
  useEffect(() => {
    const init = async () => {
      // 生成设备指纹（基于硬件特征，不需要存储）
      const fingerprint = await generateDeviceFingerprint()
      setFp(fingerprint)

      // 检查剩余使用次数
      try {
        const res = await fetch('/api/usage/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Device-Fingerprint': fingerprint
          },
          body: JSON.stringify({})
        })
        const data = await res.json()

        if (data.remaining !== undefined) {
          setRemaining(data.remaining === -1 ? '∞' : data.remaining.toString())
        }
      } catch (e) {
        console.error('Failed to check usage:', e)
      }
    }
    init()
  }, [])

  // ============================================================
  // 5. 处理工具逻辑
  // ============================================================
  const handleSubmit = async () => {
    // 验证输入
    if (!text.trim()) {
      alert('请输入内容')
      return
    }

    setLoading(true)

    try {
      // ============================================================
      // 步骤 1: 检查使用限制（必需）
      // ============================================================
      const checkRes = await fetch('/api/usage/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Fingerprint': fp || ''
        },
        body: JSON.stringify({})
      })
      const checkData = await checkRes.json()

      // 如果超出限制，阻止继续执行
      if (!checkData.allowed) {
        alert(checkData.reason || '使用次数已达上限')
        return
      }

      // ============================================================
      // 步骤 2: 执行工具的核心逻辑
      // ============================================================
      // 这里是你的工具逻辑，例如：
      const processedResult = text.length  // 示例：计算文本长度
      setResult(`结果: ${processedResult}`)

      // ============================================================
      // 步骤 3: 记录使用（必需）
      // ============================================================
      const recordRes = await fetch('/api/usage/record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Fingerprint': fp || ''
        },
        body: JSON.stringify({
          toolId: toolId,        // 使用传入的 toolId（重要！）
          usedAI: false,         // 标记未使用 AI
          aiTokens: 0,           // AI token 消耗（未使用则为 0）
          aiCost: 0              // AI 成本（未使用则为 0）
        })
      })

      if (!recordRes.ok) {
        console.error('Failed to record usage')
      }

      // ============================================================
      // 步骤 4: 更新剩余次数显示
      // ============================================================
      // 重新检查剩余次数
      const newCheckRes = await fetch('/api/usage/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Fingerprint': fp || ''
        },
        body: JSON.stringify({})
      })
      const newCheckData = await newCheckRes.json()

      if (newCheckData.remaining !== undefined) {
        setRemaining(newCheckData.remaining === -1 ? '∞' : newCheckData.remaining.toString())
      }

    } catch (error: any) {
      alert(error.message || '处理失败')
    } finally {
      setLoading(false)
    }
  }

  // ============================================================
  // 6. 渲染 UI
  // ============================================================
  return (
    <div>
      {/* 显示剩余次数 */}
      <div>剩余次数: {remaining}</div>

      {/* 输入框 */}
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="输入内容..."
        disabled={loading}
      />

      {/* 提交按钮 */}
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? '处理中...' : '提交'}
      </button>

      {/* 显示结果 */}
      {result && <div>{result}</div>}
    </div>
  )
}
```

### 关键要点说明

**✅ 不使用 AI 的工具特点：**
1. **必须手动检查限制**：调用 `/api/usage/check` 检查是否允许使用
2. **必须手动记录使用**：调用 `/api/usage/record` 记录使用次数
3. **执行顺序很重要**：检查 → 执行逻辑 → 记录使用
4. **需要更新剩余次数**：记录后重新检查以更新显示

---

## 工具组件规范

### 必需的 Props 接口

```typescript
interface YourToolProps {
  toolId: string    // 必需：工具的唯一标识符
  config?: any      // 可选：工具的配置信息
}
```

### 组件导出规范

```typescript
// ✅ 正确：使用 default export
export default function YourTool({ toolId, config }: YourToolProps) {
  // ...
}

// ❌ 错误：不要使用 named export
export function YourTool({ toolId, config }: YourToolProps) {
  // ...
}

// ❌ 错误：不要忽略 props
export default function YourTool() {
  // ...
}
```

### 文件命名规范

- 文件位置：`components/tools/YourTool.tsx`
- 组件名称：使用 PascalCase（如 `AuraCheck`、`Base64Encoder`）
- 在后台管理中配置的 `componentType` 必须与文件名完全一致

---

## API 接口说明

### 1. `/api/usage/check` - 检查使用限制

**用途**：检查当前用户是否还有剩余使用次数

**请求**：
```typescript
POST /api/usage/check
Headers: {
  'Content-Type': 'application/json',
  'X-Device-Fingerprint': string  // 设备指纹
}
Body: {}
```

**响应**：
```typescript
{
  allowed: boolean,        // 是否允许使用
  remaining: number,       // 剩余次数（-1 表示无限制）
  limit: number,           // 每日限制
  userType: string,        // 用户类型：GUEST | USER | SUBSCRIBER
  reason?: string,         // 不允许使用的原因
  requiresLogin?: boolean, // 是否需要登录
  requiresUpgrade?: boolean // 是否需要升级
}
```

### 2. `/api/usage/record` - 记录使用

**用途**：记录工具使用，扣减使用次数

**请求**：
```typescript
POST /api/usage/record
Headers: {
  'Content-Type': 'application/json',
  'X-Device-Fingerprint': string  // 设备指纹
}
Body: {
  toolId: string,      // 工具 ID（必需）
  usedAI?: boolean,    // 是否使用了 AI（可选，默认 false）
  aiTokens?: number,   // AI token 消耗（可选）
  aiCost?: number      // AI 成本（可选）
}
```

**响应**：
```typescript
{
  success: boolean,
  message: string
}
```

**注意**：此 API 会先检查使用限制，如果超出限制会返回 429 错误。

### 3. `/api/ai/call` - 调用 AI

**用途**：调用 AI 模型并自动处理使用限制

**请求**：
```typescript
POST /api/ai/call
Headers: {
  'Content-Type': 'application/json',
  'X-Device-Fingerprint': string  // 设备指纹
}
Body: {
  prompt: string,      // AI 提示词（必需）
  toolId: string       // 工具 ID（必需）
}
```

**响应**：
```typescript
{
  response: string,    // AI 返回的内容
  usage: {
    remaining: number,    // 剩余次数
    inputTokens: number,  // 输入 token 数
    outputTokens: number, // 输出 token 数
    cost: number          // 本次调用成本
  }
}
```

**特点**：
- 自动检查使用限制
- 自动记录使用
- 自动处理 AI 调用
- 支持备用模型（如果主模型失败）

---

## 常见问题

### Q1: 为什么必须接收 `toolId` prop？

**A**: 系统使用动态路由 `/tools/[slug]`，通过 `ToolRenderer` 组件动态加载工具。`toolId` 由系统自动传入，用于：
- 记录使用统计
- 关联使用记录到具体工具
- 生成使用报表

### Q2: 可以硬编码 `toolId` 吗？

**A**: ❌ 不推荐！虽然 API 支持 slug，但应该使用传入的 `toolId`：

```typescript
// ❌ 错误：硬编码
toolId: 'my-tool-slug'

// ✅ 正确：使用 prop
toolId: toolId
```

### Q3: 不使用 AI 的工具必须记录使用吗？

**A**: ✅ 是的！必须调用 `/api/usage/record`，否则：
- 使用次数不会扣减
- 无法生成使用统计
- 用户可以无限使用

### Q4: 如何测试工具的使用限制？

**A**:
1. 在后台设置较小的每日限制（如 3 次）
2. 多次使用工具
3. 检查剩余次数是否正确递减
4. 达到限制后应该显示错误提示

### Q5: 设备指纹是什么？如何防止绕过？

**A**: 设备指纹是基于硬件特征（Canvas、WebGL、屏幕分辨率等）生成的唯一标识，用于识别游客身份。

**防绕过机制**：
- **指纹 + IP 双重追踪**：系统同时追踪设备指纹和 IP 地址的使用次数
- **取最大值**：使用次数 = max(指纹使用次数, IP 总使用次数)
- **防止更换浏览器**：即使用户更换浏览器（新指纹），IP 总使用次数不变
- **数据库存储**：使用记录存储在数据库，不依赖浏览器存储

**示例**：
```
用户在 Chrome 使用 3 次：
- 指纹 A 使用次数: 3
- IP 总使用次数: 3
- 有效使用次数: max(3, 3) = 3 ✅

用户切换到 Firefox：
- 指纹 B 使用次数: 0（新指纹）
- IP 总使用次数: 3
- 有效使用次数: max(0, 3) = 3 ✅ 防绕过成功！
```

**无法防御**：只有使用 VPN 更换 IP 才能绕过（但成本较高）

---

## 完整示例参考

查看现有工具的实现：
- **使用 AI**：`components/tools/AuraCheck.tsx`
- **不使用 AI**：`components/tools/Base64Encoder.tsx`、`components/tools/WordCounter.tsx`

---

---

## 防绕过机制说明

### 工作原理

系统使用 **指纹 + IP 双重追踪** 机制防止用户绕过使用限制：

1. **追踪设备指纹**：基于硬件特征生成的唯一标识
2. **追踪 IP 地址**：记录每个 IP 的总使用次数
3. **取最大值**：`有效使用次数 = max(指纹使用次数, IP 总使用次数)`

### 防御效果

| 用户行为 | 防御结果 |
|---------|---------|
| 清除浏览器数据 | ✅ 已防御（指纹基于硬件特征）|
| 更换浏览器 | ✅ 已防御（IP 总使用次数不变）|
| 使用隐私模式 | ✅ 已防御（指纹和 IP 仍可追踪）|
| 清除 Cookie | ✅ 已防御（不依赖 Cookie）|
| 使用 VPN 换 IP | ❌ 可绕过（但成本较高）|

### 实现细节

详见：[ANTI_BYPASS_IMPLEMENTATION.md](../../ANTI_BYPASS_IMPLEMENTATION.md)

---

**最后更新**: 2025-12-03 (添加防绕过机制说明)
