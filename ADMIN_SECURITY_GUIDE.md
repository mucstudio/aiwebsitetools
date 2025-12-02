# 管理员安全系统指南

本文档详细说明了 AI Website Tools 的管理员安全系统配置和使用方法。

## 📋 目录

1. [功能概述](#功能概述)
2. [环境变量配置](#环境变量配置)
3. [数据库迁移](#数据库迁移)
4. [管理员初始化](#管理员初始化)
5. [IP 白名单](#ip-白名单)
6. [审计日志](#审计日志)
7. [权限系统](#权限系统)
8. [安全最佳实践](#安全最佳实践)

---

## 功能概述

### ✅ 已实现的安全功能

1. **管理员账号管理**
   - 从 .env 配置管理员信息
   - 自动创建/更新管理员账号
   - 密码加密存储（bcrypt）

2. **IP 白名单**
   - 限制管理后台访问 IP
   - 支持多个 IP 配置
   - 自动获取真实客户端 IP

3. **审计日志**
   - 记录所有管理员操作
   - 包含 IP、用户代理等信息
   - 自动清理过期日志

4. **权限系统**
   - 细粒度权限控制
   - 角色权限映射
   - 管理员拥有所有权限

5. **服务器端鉴权**
   - Next.js Server Components
   - 无法客户端绕过
   - 自动重定向未授权访问

---

## 环境变量配置

### 1. 复制环境变量模板

```bash
cp .env.example .env
```

### 2. 配置管理员信息

在 `.env` 文件中设置以下变量：

```env
# 管理员配置
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_NAME="System Administrator"
ADMIN_PASSWORD="your-secure-password-min-8-chars"

# IP 白名单（逗号分隔，留空允许所有 IP）
ADMIN_IP_WHITELIST=127.0.0.1,192.168.1.100

# 审计日志
ENABLE_AUDIT_LOG=true
AUDIT_LOG_RETENTION_DAYS=90
```

### 3. 配置说明

| 变量 | 必填 | 说明 |
|------|------|------|
| `ADMIN_EMAIL` | ✅ | 管理员邮箱，用于登录 |
| `ADMIN_NAME` | ❌ | 管理员姓名，默认 "Administrator" |
| `ADMIN_PASSWORD` | ✅ | 管理员密码，至少 8 个字符 |
| `ADMIN_IP_WHITELIST` | ❌ | IP 白名单，留空允许所有 IP |
| `ENABLE_AUDIT_LOG` | ❌ | 是否启用审计日志，默认 true |
| `AUDIT_LOG_RETENTION_DAYS` | ❌ | 日志保留天数，默认 90 天 |

---

## 数据库迁移

### 1. 生成 Prisma Client

```bash
npm run db:generate
```

### 2. 推送数据库架构

```bash
npm run db:push
```

或使用迁移：

```bash
npm run db:migrate
```

### 3. 新增的数据库表

- `AuditLog` - 审计日志表
- `Permission` - 权限表
- `RolePermission` - 角色权限关联表

---

## 管理员初始化

### 1. 初始化管理员账号

```bash
npm run admin:init
```

这个命令会：
- ✅ 从 .env 读取管理员信息
- ✅ 创建管理员账号（如果不存在）
- ✅ 升级现有用户为管理员（如果已存在）
- ✅ 显示 IP 白名单和审计日志配置

### 2. 更新管理员密码

```bash
npm run admin:update-password
```

### 3. 初始化权限系统

```bash
npm run permissions:init
```

这个命令会：
- ✅ 创建所有权限（27 个）
- ✅ 为管理员角色分配所有权限
- ✅ 显示权限统计信息

### 4. 完整初始化流程

```bash
# 1. 推送数据库架构
npm run db:push

# 2. 初始化权限系统
npm run permissions:init

# 3. 创建管理员账号
npm run admin:init
```

---

## IP 白名单

### 1. 配置 IP 白名单

在 `.env` 中设置：

```env
# 允许单个 IP
ADMIN_IP_WHITELIST=192.168.1.100

# 允许多个 IP（逗号分隔）
ADMIN_IP_WHITELIST=127.0.0.1,192.168.1.100,10.0.0.1

# 允许所有 IP（留空或不设置）
ADMIN_IP_WHITELIST=
```

### 2. IP 获取优先级

系统会按以下顺序获取真实 IP：

1. `x-forwarded-for` header（代理/负载均衡）
2. `x-real-ip` header（Nginx）
3. `cf-connecting-ip` header（Cloudflare）
4. 直接连接 IP

### 3. 访问被拒绝

如果 IP 不在白名单中：
- 自动重定向到 `/unauthorized?reason=ip`
- 在控制台记录警告日志
- 不会创建审计日志

### 4. 生产环境建议

```env
# 仅允许办公室和 VPN IP
ADMIN_IP_WHITELIST=203.0.113.10,203.0.113.11,10.8.0.0/24
```

⚠️ **注意**：确保将你的 IP 添加到白名单，否则无法访问管理后台！

---

## 审计日志

### 1. 启用审计日志

```env
ENABLE_AUDIT_LOG=true
AUDIT_LOG_RETENTION_DAYS=90
```

### 2. 记录的操作

审计日志会自动记录：

- ✅ 管理员登录/登出
- ✅ 访问管理后台
- ✅ 创建/编辑/删除资源
- ✅ 查看敏感信息
- ✅ 导出数据

### 3. 记录的信息

每条审计日志包含：

```typescript
{
  userId: string        // 用户 ID
  userEmail: string     // 用户邮箱
  action: string        // 操作类型：LOGIN, CREATE, UPDATE, DELETE, etc.
  resource: string      // 资源类型：USER, TOOL, CATEGORY, etc.
  resourceId: string    // 资源 ID
  details: object       // 详细信息（JSON）
  ipAddress: string     // IP 地址
  userAgent: string     // 用户代理
  status: string        // SUCCESS 或 FAILED
  createdAt: DateTime   // 创建时间
}
```

### 4. 使用审计日志

```typescript
import { createAuditLog } from "@/lib/audit-log"

// 记录操作
await createAuditLog({
  userId: session.user.id,
  userEmail: session.user.email,
  action: "DELETE",
  resource: "USER",
  resourceId: userId,
  details: {
    userName: user.name,
    reason: "违规用户",
  },
  status: "SUCCESS",
})
```

### 5. 查询审计日志

```typescript
import { getAuditLogs } from "@/lib/audit-log"

// 获取日志
const { logs, total } = await getAuditLogs({
  userId: "user_id",
  action: "DELETE",
  resource: "USER",
  limit: 50,
  offset: 0,
})
```

### 6. 清理过期日志

```typescript
import { cleanupOldAuditLogs } from "@/lib/audit-log"

// 清理超过保留期的日志
await cleanupOldAuditLogs()
```

建议设置定时任务每天清理一次。

---

## 权限系统

### 1. 权限列表

系统包含以下权限分类：

#### 用户管理 (users)
- `users.view` - 查看用户
- `users.create` - 创建用户
- `users.edit` - 编辑用户
- `users.delete` - 删除用户

#### 工具管理 (tools)
- `tools.view` - 查看工具
- `tools.create` - 创建工具
- `tools.edit` - 编辑工具
- `tools.delete` - 删除工具
- `tools.publish` - 发布工具

#### 分类管理 (categories)
- `categories.view` - 查看分类
- `categories.create` - 创建分类
- `categories.edit` - 编辑分类
- `categories.delete` - 删除分类

#### 订阅计划 (plans)
- `plans.view` - 查看计划
- `plans.create` - 创建计划
- `plans.edit` - 编辑计划
- `plans.delete` - 删除计划

#### 支付管理 (payments)
- `payments.view` - 查看支付记录
- `payments.refund` - 退款

#### 系统设置 (settings)
- `settings.view` - 查看设置
- `settings.edit` - 编辑设置

#### 审计日志 (audit_logs)
- `audit_logs.view` - 查看日志
- `audit_logs.export` - 导出日志

### 2. 检查权限

```typescript
import { hasPermission } from "@/lib/permissions"

// 检查单个权限
const canEdit = await hasPermission(userId, "users.edit")

if (!canEdit) {
  return { error: "没有权限" }
}
```

### 3. 检查多个权限

```typescript
import { hasAnyPermission, hasAllPermissions } from "@/lib/permissions"

// 检查是否有任意一个权限
const canManageUsers = await hasAnyPermission(userId, [
  "users.create",
  "users.edit",
  "users.delete"
])

// 检查是否有所有权限
const canFullyManage = await hasAllPermissions(userId, [
  "users.view",
  "users.edit"
])
```

### 4. 获取用户权限

```typescript
import { getUserPermissions } from "@/lib/permissions"

const permissions = await getUserPermissions(userId)
// 返回: ["users.view", "users.edit", ...]
```

### 5. API 路由权限检查

```typescript
import { requirePermission } from "@/lib/permissions"
import { auth } from "@/lib/auth"

export async function DELETE(request: Request) {
  const session = await auth()

  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  try {
    await requirePermission("users.delete")(session.user.id)
  } catch (error) {
    return new Response("Permission denied", { status: 403 })
  }

  // 执行删除操作...
}
```

---

## 安全最佳实践

### 1. 密码安全

✅ **推荐做法：**
- 使用至少 12 个字符的强密码
- 包含大小写字母、数字和特殊字符
- 定期更换密码（每 90 天）
- 不要在多个系统使用相同密码

❌ **避免：**
- 使用简单密码（如 "admin123"）
- 使用个人信息（生日、姓名等）
- 在代码中硬编码密码

### 2. IP 白名单

✅ **推荐做法：**
- 生产环境必须启用 IP 白名单
- 仅添加必要的 IP 地址
- 使用 VPN 统一出口 IP
- 定期审查白名单

❌ **避免：**
- 生产环境留空白名单
- 添加公共 IP 段
- 长期不更新白名单

### 3. 审计日志

✅ **推荐做法：**
- 始终启用审计日志
- 定期审查异常操作
- 保留足够长的日志（90-180 天）
- 导出重要日志备份

❌ **避免：**
- 禁用审计日志
- 保留期过短（< 30 天）
- 从不审查日志

### 4. 权限管理

✅ **推荐做法：**
- 遵循最小权限原则
- 定期审查用户权限
- 及时撤销离职人员权限
- 为不同角色创建不同账号

❌ **避免：**
- 给所有人管理员权限
- 共享管理员账号
- 长期不审查权限

### 5. 环境变量

✅ **推荐做法：**
- 使用 `.env.local` 存储敏感信息
- 不要提交 `.env` 到 Git
- 使用环境变量管理工具（如 Vercel、Railway）
- 定期轮换密钥

❌ **避免：**
- 在代码中硬编码密钥
- 提交 `.env` 文件到版本控制
- 在日志中打印敏感信息

### 6. 生产部署

✅ **推荐做法：**
```env
# 生产环境配置示例
NODE_ENV=production
ADMIN_EMAIL=admin@company.com
ADMIN_PASSWORD="Str0ng!P@ssw0rd#2024"
ADMIN_IP_WHITELIST=203.0.113.10,203.0.113.11
ENABLE_AUDIT_LOG=true
AUDIT_LOG_RETENTION_DAYS=180
```

### 7. 监控和告警

建议设置以下监控：

- 🔔 失败登录次数过多
- 🔔 来自未知 IP 的访问尝试
- 🔔 敏感操作（删除用户、修改权限）
- 🔔 异常时间段的访问（凌晨 2-5 点）

---

## 故障排查

### 问题 1：无法访问管理后台

**症状：** 访问 `/admin` 被重定向到 `/unauthorized`

**可能原因：**
1. IP 不在白名单中
2. 用户角色不是 ADMIN
3. 未登录

**解决方法：**
```bash
# 1. 检查 IP 白名单配置
echo $ADMIN_IP_WHITELIST

# 2. 检查用户角色
npm run db:studio
# 在 Prisma Studio 中查看用户的 role 字段

# 3. 临时禁用 IP 白名单
# 在 .env 中设置：
ADMIN_IP_WHITELIST=
```

### 问题 2：管理员初始化失败

**症状：** 运行 `npm run admin:init` 报错

**可能原因：**
1. 数据库未连接
2. 环境变量未设置
3. 密码太短

**解决方法：**
```bash
# 1. 检查数据库连接
npm run db:studio

# 2. 检查环境变量
cat .env | grep ADMIN

# 3. 确保密码至少 8 个字符
```

### 问题 3：审计日志未记录

**症状：** 操作没有生成审计日志

**可能原因：**
1. `ENABLE_AUDIT_LOG` 未设置为 true
2. 数据库表未创建

**解决方法：**
```bash
# 1. 检查配置
echo $ENABLE_AUDIT_LOG

# 2. 推送数据库架构
npm run db:push

# 3. 检查 AuditLog 表是否存在
npm run db:studio
```

---

## 维护任务

### 每日任务

```bash
# 清理过期审计日志（建议设置 cron job）
npm run cleanup:audit-logs
```

### 每周任务

- 审查审计日志中的异常操作
- 检查失败登录记录
- 验证 IP 白名单是否需要更新

### 每月任务

- 审查用户权限
- 更新管理员密码
- 备份审计日志
- 检查系统安全更新

---

## 相关文档

- [NextAuth.js 文档](https://next-auth.js.org/)
- [Prisma 文档](https://www.prisma.io/docs)
- [Next.js 安全最佳实践](https://nextjs.org/docs/app/building-your-application/security)

---

## 技术支持

如有问题，请联系：
- 邮箱：admin@yourdomain.com
- GitHub Issues：[项目地址]

---

**最后更新：** 2024-12-01
**版本：** 1.0.0
