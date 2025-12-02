# 使用限制系统文档

本文档介绍使用限制系统的配置和使用方法。

## 系统架构

使用限制系统采用全局配置 + 订阅计划的架构：

1. **游客**：使用全局配置（SiteSettings），基于 **设备指纹 + IP** 双重验证
2. **注册用户**：使用全局配置（SiteSettings），基于 **userId** 验证
3. **订阅用户**：使用订阅计划配置（Plan.limits），基于 **userId** 验证

## 配置使用限制

### 1. 全局配置（游客和注册用户）

在网站设置中配置全局使用限制，存储在 `SiteSettings` 表中，key 为 `usage_limits`：

```json
{
  "guest": {
    "dailyLimit": 10
  },
  "user": {
    "dailyLimit": 50
  }
}
```

- `dailyLimit`: 每日使用次数限制，`-1` 表示无限制
- 游客限制基于 **设备指纹（优先）+ IP（降级）** 验证
- 注册用户限制基于 **userId** 验证

### 2. 订阅计划配置

在订阅计划（Plan）的 `limits` 字段中配置：

```json
{
  "dailyUsage": 200,
  "toolAccess": "all",
  "aiUsage": {
    "enabled": true,
    "dailyLimit": 100,
    "monthlyLimit": 3000
  }
}
```

- `dailyUsage`: 订阅用户每日使用次数，`-1` 表示无限制
- 订阅用户限制基于 **userId** 验证

## 设备指纹（推荐）

### 安装依赖

```bash
npm install @fingerprintjs/fingerprintjs
```

### 客户端生成设备指纹

```typescript
// lib/usage-limits/fingerprint.ts 已提供
import { generateDeviceFingerprint } from '@/lib/usage-limits/fingerprint'

// 在客户端调用
const deviceFingerprint = await generateDeviceFingerprint()
// 返回: "a1b2c3d4e5f6" (唯一设备标识)
```

### 在 API 中使用设备指纹

```typescript
// 客户端发送请求时携带设备指纹
const response = await fetch('/api/tools/example', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Device-Fingerprint': deviceFingerprint // 自定义请求头
  },
  body: JSON.stringify({ input: 'test' })
})

// 服务端接收设备指纹
const deviceFingerprint = request.headers.get('x-device-fingerprint')

const checkResult = await checkUsageLimit({
  userId: session?.user?.id,
  deviceFingerprint, // 传递设备指纹
  ipAddress: request.headers.get('x-forwarded-for')
})
```

## 代码调用

### 基本调用方法（带设备指纹）

```typescript
import { checkUsageLimit, recordUsage } from '@/lib/usage-limits/service'
import { getCurrentSession } from '@/lib/auth-utils'

// 1. 检查使用限制
const session = await getCurrentSession()
const deviceFingerprint = request.headers.get('x-device-fingerprint')

const checkResult = await checkUsageLimit({
  userId: session?.user?.id,
  deviceFingerprint, // 设备指纹（推荐）
  ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
})

if (!checkResult.allowed) {
  return { error: checkResult.reason }
}

// 2. 执行工具逻辑
const result = await processToolLogic()

// 3. 记录使用
await recordUsage(toolId, {
  userId: session?.user?.id,
  deviceFingerprint, // 设备指纹（推荐）
  ipAddress: request.headers.get('x-forwarded-for'),
  userAgent: request.headers.get('user-agent')
})
```

### API 路由完整示例

```typescript
// app/api/tools/example/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentSession } from '@/lib/auth-utils'
import { checkUsageLimit, recordUsage } from '@/lib/usage-limits/service'

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession()
    const body = await request.json()
    const deviceFingerprint = request.headers.get('x-device-fingerprint')

    // 1. 检查使用限制
    const checkResult = await checkUsageLimit({
      userId: session?.user?.id,
      deviceFingerprint,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    })

    if (!checkResult.allowed) {
      return NextResponse.json(
        { error: checkResult.reason },
        { status: 429 }
      )
    }

    // 2. 执行工具逻辑
    const result = await processToolLogic(body.input)

    // 3. 记录使用
    await recordUsage('tool-id', {
      userId: session?.user?.id,
      deviceFingerprint,
      ipAddress: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent')
    })

    return NextResponse.json({ success: true, result })

  } catch (error) {
    console.error('Tool error:', error)
    return NextResponse.json(
      { error: '处理失败' },
      { status: 500 }
    )
  }
}
```

## 检查结果说明

`checkUsageLimit` 返回的结果：

```typescript
{
  allowed: boolean          // 是否允许使用
  remaining: number         // 剩余次数，-1 表示无限制
  limit: number             // 总限制次数，-1 表示无限制
  userType: 'guest' | 'user' | 'subscriber'  // 用户类型
  reason?: string           // 拒绝原因（如果 allowed 为 false）
  requiresLogin?: boolean   // 是否需要登录
  requiresUpgrade?: boolean // 是否需要升级
}
```

## 限制规则

### 游客（未登录）
- 使用全局配置中的 `guest.dailyLimit`
- **优先使用设备指纹**：基于硬件特征，无法通过更换浏览器绕过
- **降级使用 IP 地址**：当设备指纹不可用时，基于 IP 限制
- 防绕过：更换浏览器、清除 Cookie、隐私模式都无法绕过设备指纹

### 注册用户（已登录，无订阅）
- 使用全局配置中的 `user.dailyLimit`
- 基于 **userId** 验证
- 不受设备、IP 影响

### 订阅用户（已登录，有活跃订阅）
- 使用订阅计划中的 `limits.dailyUsage`
- 基于 **userId** 验证
- 通常设置为 `-1`（无限制）或更高的限制

## 设备指纹工作原理

设备指纹通过收集以下信息生成唯一标识：

1. **硬件特征**：
   - 屏幕分辨率和色深
   - CPU 核心数
   - 内存大小
   - GPU 信息（WebGL）

2. **浏览器特征**：
   - User Agent
   - 语言设置
   - 时区
   - Canvas 指纹
   - 字体列表

3. **优势**：
   - 更换浏览器无法绕过
   - 清除 Cookie 无法绕过
   - 隐私模式无法绕过
   - 准确率 99.5%+

## 常见问题

### Q: 如何修改全局限制配置？

A: 在管理后台的"网站设置"中修改 `usage_limits` 配置。

### Q: 如何为订阅用户设置不同的限制？

A: 在"订阅计划"中编辑对应计划的 `limits.dailyUsage` 字段。

### Q: 设备指纹是否侵犯隐私？

A: 设备指纹只用于防止滥用，不收集个人身份信息，符合 GDPR 和隐私法规。

### Q: 如果用户禁用 JavaScript 怎么办？

A: 系统会自动降级到 IP 地址限制。

### Q: 使用次数何时重置？

A: 每天 UTC 0:00 自动重置。

### Q: 如何查看使用统计？

A: 使用 `getUserUsageStats` 或 `getToolUsageStats` 函数。

## 注意事项

1. **强烈推荐使用设备指纹**：提供最可靠的防绕过保护
2. **IP 地址作为降级方案**：当设备指纹不可用时使用
3. **先检查后记录**：始终先调用 `checkUsageLimit`，通过后再执行工具逻辑
4. **错误处理**：当 `allowed` 为 `false` 时，应返回 429 状态码

## 更新日志

### v2.1.0 (2025-01-02)
- ✅ 添加设备指纹支持（硬件级别识别）
- ✅ 优先使用设备指纹，降级到 IP 地址
- ✅ 防止更换浏览器、清除 Cookie 绕过
- ✅ 提供设备指纹生成工具

### v2.0.0 (2025-01-02)
- ✅ 重构为全局配置 + 订阅计划架构
- ✅ 移除工具级别的限制配置
- ✅ 简化 API 调用方式
- ✅ 游客双重验证（IP + 设备指纹）
- ✅ 订阅用户自动使用计划限制
