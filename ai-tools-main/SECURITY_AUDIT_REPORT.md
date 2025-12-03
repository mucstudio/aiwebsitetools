# 安全审计报告

**审计日期**: 2025-11-30
**系统**: AI Tools Platform
**审计范围**: API 端点、身份验证、数据暴露

---

## 执行摘要

经过全面的安全审计，发现了多个**严重安全漏洞**，主要集中在：
1. **公开 API 端点暴露敏感数据**（工具源代码完全暴露）
2. **身份验证机制存在严重缺陷**
3. **管理员权限检查不完整**

---

## 🔴 严重安全问题（Critical）

### 1. /api/tools 端点完全暴露工具源代码

**文件**: [src/app/api/tools/route.ts](src/app/api/tools/route.ts)

**问题描述**:
- GET `/api/tools` 端点**无需任何身份验证**即可访问
- 返回**所有工具的完整信息**，包括：
  - `code`: 工具的完整源代码
  - `componentCode`: React 组件完整代码
  - `styleCode`: 样式代码
  - `configJson`: 配置信息
  - `skipSecurityCheck`: 安全检查标志

**代码位置**: [src/app/api/tools/route.ts:6-56](src/app/api/tools/route.ts#L6-L56)

```typescript
// GET /api/tools - Get all tools or single tool by ID
export async function GET(request: Request) {
  // ❌ 没有任何身份验证检查
  const tools = await prisma.tool.findMany({
    include: {
      category: true  // 包含所有关联数据
    }
  })
  return NextResponse.json(tools)  // ❌ 返回完整的工具数据，包括源代码
}
```

**影响**:
- ✅ 任何人都可以访问并复制所有工具的源代码
- ✅ 竞争对手可以轻松克隆整个平台
- ✅ 暴露业务逻辑和算法实现
- ✅ 可能暴露安全漏洞和后门

**风险等级**: 🔴 **严重 (Critical)**

---

### 2. /api/tools/categories 端点暴露所有工具数据

**文件**: [src/app/api/tools/categories/route.ts](src/app/api/tools/categories/route.ts)

**问题描述**:
- GET `/api/tools/categories` 端点**无需身份验证**
- 通过 `include: { tools: true }` 返回所有工具的完整信息

**代码位置**: [src/app/api/tools/categories/route.ts:6-25](src/app/api/tools/categories/route.ts#L6-L25)

```typescript
export async function GET() {
  // ❌ 没有身份验证
  const categories = await prisma.toolCategory.findMany({
    include: {
      tools: {  // ❌ 包含所有工具的完整数据
        orderBy: { sortOrder: 'asc' }
      }
    }
  })
  return NextResponse.json(categories)  // ❌ 返回所有数据
}
```

**影响**:
- 与 `/api/tools` 相同，完全暴露工具源代码
- 通过分类结构暴露系统架构

**风险等级**: 🔴 **严重 (Critical)**

---

### 3. /api/tools/[slug] 端点暴露单个工具完整代码

**文件**: [src/app/api/tools/[slug]/route.ts](src/app/api/tools/[slug]/route.ts)

**问题描述**:
- GET `/api/tools/[slug]` 端点**无需身份验证**
- 返回单个工具的所有信息，包括完整源代码

**代码位置**: [src/app/api/tools/[slug]/route.ts:5-34](src/app/api/tools/[slug]/route.ts#L5-L34)

```typescript
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  // ❌ 没有身份验证
  const tool = await prisma.tool.findUnique({
    where: { slug },
    include: { category: true }
  })
  return NextResponse.json(tool)  // ❌ 返回完整工具数据
}
```

**风险等级**: 🔴 **严重 (Critical)**

---

## 🟠 高危安全问题（High）

### 4. 身份验证机制存在严重缺陷

**文件**: [src/lib/auth.ts](src/lib/auth.ts)

**问题描述**:
- `getSession()` 函数的实现存在严重问题
- Session token 没有被验证或存储
- 直接返回第一个管理员账户，完全忽略 session token

**代码位置**: [src/lib/auth.ts:31-47](src/lib/auth.ts#L31-L47)

```typescript
export async function getSession(): Promise<number | null> {
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)

  if (!sessionToken) {
    return null
  }

  // ❌ 严重问题：注释说明这只是简化实现
  // For simplicity, we're using the session token as admin ID
  // In production, you should use a proper session store

  try {
    const admin = await prisma.admin.findFirst()  // ❌ 直接返回第一个管理员
    return admin?.id || null  // ❌ 完全没有验证 session token
  } catch {
    return null
  }
}
```

**影响**:
- ✅ 任何拥有任意 session cookie 的人都可以获得管理员权限
- ✅ Session token 没有被验证、存储或关联到特定用户
- ✅ 无法追踪或撤销会话
- ✅ 无法实现多管理员系统

**风险等级**: 🟠 **高危 (High)**

---

### 5. 管理员 API 端点缺少角色验证

**问题描述**:
所有管理员 API 端点只检查是否登录，但不验证用户是否真的是管理员：

**受影响的端点**:
- [/api/admin/users](src/app/api/admin/users/route.ts)
- [/api/admin/settings](src/app/api/admin/settings/route.ts)
- [/api/admin/subscriptions](src/app/api/admin/subscriptions/route.ts)
- [/api/admin/payment-config](src/app/api/admin/payment-config/route.ts)
- [/api/ai-providers](src/app/api/ai-providers/route.ts)

**代码模式**:
```typescript
export async function GET(request: Request) {
  await requireAuth()  // ❌ 只检查是否有 session，不检查是否是管理员

  // 执行管理员操作...
}
```

**影响**:
- 如果普通用户获得了 session cookie，可能访问管理员功能
- 无法区分管理员和普通用户的权限

**风险等级**: 🟠 **高危 (High)**

---

## 🟡 中危安全问题（Medium）

### 6. /api/admin/settings 端点暴露敏感配置

**文件**: [src/app/api/admin/settings/route.ts](src/app/api/admin/settings/route.ts)

**问题描述**:
- GET 请求返回解密后的 SMTP 密码
- 虽然需要身份验证，但如果身份验证被绕过，敏感信息将完全暴露

**代码位置**: [src/app/api/admin/settings/route.ts:28-31](src/app/api/admin/settings/route.ts#L28-L31)

```typescript
const decryptedConfig = {
  ...config,
  smtpPassword: config.smtpPassword ? decrypt(config.smtpPassword) : null  // ⚠️ 返回明文密码
}
return NextResponse.json({ success: true, config: decryptedConfig })
```

**建议**: 即使在管理员界面，也应该只返回密码是否已设置，而不是明文密码

**风险等级**: 🟡 **中危 (Medium)**

---

### 7. /api/user/profile-data 端点的 scope 控制不完善

**文件**: [src/app/api/user/profile-data/route.ts](src/app/api/user/profile-data/route.ts)

**问题描述**:
- `scope=full` 时返回完整的用户敏感信息
- 没有实际的授权检查机制
- 注释表明应该检查工具授权，但未实现

**代码位置**: [src/app/api/user/profile-data/route.ts:100-108](src/app/api/user/profile-data/route.ts#L100-L108)

```typescript
if (scope === 'full') {
  // 只有在用户明确授权的情况下才返回完整信息
  // 这里可以检查工具是否被用户授权访问完整信息
  // ⚠️ 但实际上没有任何检查
  responseData.email = user.email // 完整邮箱
  responseData.phone = user.phone
  responseData.address = user.address
  responseData.bio = user.bio
}
```

**风险等级**: 🟡 **中危 (Medium)**

---

## ✅ 做得好的安全措施

### 1. 加密实现
- [src/lib/encryption.ts](src/lib/encryption.ts) 使用了强加密算法（AES-256-GCM）
- 使用 PBKDF2 进行密钥派生
- 正确使用了 salt、IV 和认证标签

### 2. AI Provider API Key 保护
- [src/app/api/ai-providers/route.ts](src/app/api/ai-providers/route.ts) 正确地隐藏了 API keys
- 返回时用 `***` 替换真实密钥

### 3. 密码哈希
- [src/lib/auth.ts](src/lib/auth.ts) 使用 bcrypt 进行密码哈希

---

## 🔧 修复建议

### 优先级 1 - 立即修复（Critical）

#### 1.1 修复 /api/tools 端点数据暴露

**需要修改的文件**:
- [src/app/api/tools/route.ts](src/app/api/tools/route.ts)
- [src/app/api/tools/categories/route.ts](src/app/api/tools/categories/route.ts)
- [src/app/api/tools/[slug]/route.ts](src/app/api/tools/[slug]/route.ts)

**修复方案**:
1. 为公开访问创建专门的字段选择器，只返回必要的字段
2. 敏感字段（code, componentCode, styleCode, configJson）只在管理员认证后返回
3. 创建两个不同的端点：
   - `/api/tools` - 公开访问，返回基本信息
   - `/api/admin/tools` - 管理员访问，返回完整信息

#### 1.2 修复身份验证机制

**需要修改的文件**:
- [src/lib/auth.ts](src/lib/auth.ts)

**修复方案**:
1. 创建 Session 数据表存储会话信息
2. 在 `createSession` 时将 session token 存储到数据库
3. 在 `getSession` 时验证 token 是否存在且有效
4. 添加 session 过期检查
5. 实现 session 清理机制

### 优先级 2 - 尽快修复（High）

#### 2.1 添加管理员角色验证

**修复方案**:
1. 创建 `requireAdminAuth()` 函数
2. 在所有管理员端点使用该函数替代 `requireAuth()`
3. 验证用户是否具有管理员角色

#### 2.2 改进敏感数据返回策略

**修复方案**:
1. SMTP 密码不返回明文，只返回是否已设置
2. 支付配置密钥进一步脱敏
3. 实现字段级别的访问控制

### 优先级 3 - 后续改进（Medium）

#### 3.1 实现完整的授权系统

**修复方案**:
1. 为 `/api/user/profile-data` 实现真正的授权检查
2. 创建工具授权表，记录用户对工具的授权
3. 实现授权审计日志

#### 3.2 添加安全审计日志

**修复方案**:
1. 记录所有敏感操作
2. 记录失败的身份验证尝试
3. 实现异常访问检测

---

## 📊 风险评估总结

| 风险等级 | 数量 | 影响范围 |
|---------|------|---------|
| 🔴 严重 | 3 | 工具源代码完全暴露，业务核心资产泄露 |
| 🟠 高危 | 2 | 身份验证缺陷，可能导致权限提升 |
| 🟡 中危 | 2 | 敏感信息泄露，授权控制不完善 |

**总体风险评级**: 🔴 **严重 (Critical)**

---

## 🎯 下一步行动

1. **立即**: 修复 `/api/tools` 系列端点的数据暴露问题
2. **立即**: 修复身份验证机制的严重缺陷
3. **本周内**: 实现完整的管理员角色验证
4. **本月内**: 完善授权系统和审计日志

---

## 附录：受影响的 API 端点清单

### 无需身份验证的公开端点（需要审查）
- ✅ GET `/api/tools` - **暴露所有工具源代码**
- ✅ GET `/api/tools/categories` - **暴露所有工具源代码**
- ✅ GET `/api/tools/[slug]` - **暴露单个工具源代码**
- GET `/api/tools/rankings` - 需要检查
- GET `/api/subscriptions` - 需要检查

### 需要身份验证但缺少角色验证的端点
- ⚠️ GET/POST/PUT/DELETE `/api/admin/users`
- ⚠️ GET/PUT `/api/admin/settings`
- ⚠️ GET/POST/PUT/DELETE `/api/admin/subscriptions`
- ⚠️ GET/POST/DELETE `/api/admin/payment-config`
- ⚠️ GET/POST/PUT/DELETE `/api/ai-providers`
- ⚠️ POST/PUT/DELETE `/api/tools`
- ⚠️ POST/PUT/DELETE `/api/tools/categories`

---

**报告生成时间**: 2025-11-30
**审计人员**: Claude Code Security Audit
