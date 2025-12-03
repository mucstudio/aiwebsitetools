# User API 使用指南

本指南介绍如何在前端工具（React 组件和 HTML iframe）中访问当前登录用户的个人信息。

## 概述

用户信息 API 允许工具访问当前登录用户的以下信息：
- 基本信息（姓名、邮箱、电话、地址、城市、国家）
- 社交媒体账号（TikTok、Instagram、Facebook、Twitter、YouTube、LinkedIn、个人网站）
- 个人简介（Bio）
- 会员等级

## API 端点

### `/api/user/profile-data`

**方法**: GET

**响应格式**:
```json
{
  "authenticated": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+1 234 567 8900",
    "address": "123 Main Street",
    "city": "New York",
    "country": "United States",
    "socialMedia": {
      "tiktok": "@username",
      "instagram": "@username",
      "facebook": "https://facebook.com/username",
      "twitter": "@username",
      "youtube": "https://youtube.com/@channel",
      "linkedin": "https://linkedin.com/in/username",
      "website": "https://example.com"
    },
    "bio": "User bio text...",
    "membershipTier": "PREMIUM"
  }
}
```

## 在 React 组件中使用

### 方法 1: 使用内置的 UserAPI

React 工具可以直接使用注入的 `UserAPI` 对象：

```jsx
import React, { useState, useEffect } from 'react'

export default function ToolComponent() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 获取用户信息
    UserAPI.getUserProfile().then(userData => {
      setUser(userData)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <div>Loading user info...</div>
  }

  if (!user) {
    return <div>Please login to use this tool.</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Welcome, {user.name}!
      </h1>
      <p>Email: {user.email}</p>
      <p>Location: {user.city}, {user.country}</p>
    </div>
  )
}
```

### 方法 2: 获取格式化的用户信息（用于 AI）

```jsx
import React, { useState } from 'react'

export default function AIToolComponent() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)

    // 获取格式化的用户信息
    const userInfo = await UserAPI.formatUserInfoForAI({
      includeBasicInfo: true,
      includeSocialMedia: true,
      includeBio: true
    })

    // 将用户信息发送给 AI
    const prompt = `${userInfo}\n\nBased on the user's information above, generate a personalized bio for their social media profile.`

    // 调用 AI API
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    })

    const data = await response.json()
    setResult(data.result)
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        AI Bio Generator
      </h1>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
      >
        {loading ? 'Generating...' : 'Generate Bio'}
      </button>

      {result && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Generated Bio:</h3>
          <p>{result}</p>
        </div>
      )}
    </div>
  )
}
```

### 方法 3: 只获取特定信息

```jsx
import React, { useState, useEffect } from 'react'

export default function SocialMediaTool() {
  const [socialMedia, setSocialMedia] = useState(null)

  useEffect(() => {
    // 只获取社交媒体信息
    UserAPI.getUserSocialMedia().then(data => {
      setSocialMedia(data)
    })
  }, [])

  if (!socialMedia) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Your Social Media</h2>
      <ul className="space-y-2">
        {socialMedia.tiktok && <li>TikTok: {socialMedia.tiktok}</li>}
        {socialMedia.instagram && <li>Instagram: {socialMedia.instagram}</li>}
        {socialMedia.twitter && <li>Twitter: {socialMedia.twitter}</li>}
        {socialMedia.youtube && <li>YouTube: {socialMedia.youtube}</li>}
      </ul>
    </div>
  )
}
```

## 在 HTML/iframe 工具中使用

对于传统的 HTML iframe 工具，需要在 HTML 中引入 UserAPI 脚本：

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Tool</title>
  <script src="/user-api.js"></script>
</head>
<body>
  <div id="app">
    <h1>Loading...</h1>
  </div>

  <script>
    // 等待页面加载完成
    window.addEventListener('DOMContentLoaded', async () => {
      // 检查用户是否登录
      const isLoggedIn = await UserAPI.isUserLoggedIn()

      if (!isLoggedIn) {
        document.getElementById('app').innerHTML = `
          <div style="text-align: center; padding: 40px;">
            <h2>Please Login</h2>
            <p>You need to login to use this tool.</p>
            <a href="/login" style="color: #6366f1;">Go to Login</a>
          </div>
        `
        return
      }

      // 获取用户信息
      const user = await UserAPI.getUserProfile()

      document.getElementById('app').innerHTML = `
        <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
          <h1>Welcome, ${user.name}!</h1>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Location:</strong> ${user.city}, ${user.country}</p>

          <h2>Social Media</h2>
          <ul>
            ${user.socialMedia.tiktok ? `<li>TikTok: ${user.socialMedia.tiktok}</li>` : ''}
            ${user.socialMedia.instagram ? `<li>Instagram: ${user.socialMedia.instagram}</li>` : ''}
            ${user.socialMedia.twitter ? `<li>Twitter: ${user.socialMedia.twitter}</li>` : ''}
          </ul>
        </div>
      `
    })
  </script>
</body>
</html>
```

## UserAPI 方法参考

### `getUserProfile()`
获取完整的用户信息对象。

**返回**: `Promise<Object|null>`

```javascript
const user = await UserAPI.getUserProfile()
// user = { id, email, name, phone, city, country, socialMedia, bio, membershipTier }
```

### `isUserLoggedIn()`
检查用户是否已登录。

**返回**: `Promise<boolean>`

```javascript
const loggedIn = await UserAPI.isUserLoggedIn()
if (loggedIn) {
  // 用户已登录
}
```

### `getUserBasicInfo()`
只获取用户的基本信息（不包含社交媒体）。

**返回**: `Promise<Object|null>`

```javascript
const basicInfo = await UserAPI.getUserBasicInfo()
// basicInfo = { name, email, phone, city, country, address }
```

### `getUserSocialMedia()`
只获取用户的社交媒体信息。

**返回**: `Promise<Object|null>`

```javascript
const social = await UserAPI.getUserSocialMedia()
// social = { tiktok, instagram, facebook, twitter, youtube, linkedin, website }
```

### `formatUserInfoForAI(options)`
将用户信息格式化为适合发送给 AI 的文本格式。

**参数**:
- `options.includeBasicInfo` (boolean): 包含基本信息，默认 true
- `options.includeSocialMedia` (boolean): 包含社交媒体，默认 true
- `options.includeBio` (boolean): 包含个人简介，默认 true

**返回**: `Promise<string>`

```javascript
const userInfo = await UserAPI.formatUserInfoForAI({
  includeBasicInfo: true,
  includeSocialMedia: true,
  includeBio: true
})

// 输出示例:
// User Information:
// - Name: John Doe
// - Email: john@example.com
// - Phone: +1 234 567 8900
// - Location: New York, United States
//
// Social Media:
// - TikTok: @johndoe
// - Instagram: @johndoe
// - Twitter: @johndoe
//
// Bio: Software developer and tech enthusiast...
```

## 实际应用场景

### 1. AI 个性化内容生成

```jsx
const generatePersonalizedContent = async () => {
  const userInfo = await UserAPI.formatUserInfoForAI()

  const prompt = `${userInfo}

Based on the user's profile, generate 5 personalized TikTok video ideas that would resonate with their audience.`

  // 发送给 AI...
}
```

### 2. 自动填充表单

```jsx
const autoFillForm = async () => {
  const user = await UserAPI.getUserBasicInfo()

  document.getElementById('name').value = user.name
  document.getElementById('email').value = user.email
  document.getElementById('phone').value = user.phone
}
```

### 3. 社交媒体链接生成器

```jsx
const generateSocialLinks = async () => {
  const social = await UserAPI.getUserSocialMedia()

  const links = []
  if (social.tiktok) links.push(`https://tiktok.com/@${social.tiktok}`)
  if (social.instagram) links.push(`https://instagram.com/${social.instagram}`)

  return links
}
```

### 4. 会员功能限制

```jsx
const checkPremiumFeature = async () => {
  const user = await UserAPI.getUserProfile()

  if (user.membershipTier === 'FREE') {
    alert('This feature is only available for Premium members!')
    return false
  }

  return true
}
```

## 安全注意事项

1. **不要在客户端存储敏感信息**: UserAPI 返回的数据不包含密码等敏感信息
2. **验证用户权限**: 在后端 API 中始终验证用户权限，不要仅依赖前端检查
3. **HTTPS**: 确保在生产环境使用 HTTPS
4. **数据缓存**: UserAPI 会缓存用户数据 5 分钟，如果用户更新了资料，可能需要刷新页面

## 常见问题

### Q: 用户未登录时会发生什么？
A: `getUserProfile()` 会返回 `null`，`isUserLoggedIn()` 会返回 `false`。

### Q: 如何刷新用户数据？
A: 调用 `UserAPI.clearUserCache()` 清除缓存，然后重新调用 `getUserProfile()`。

### Q: 可以修改用户信息吗？
A: UserAPI 只提供读取功能。要修改用户信息，需要调用 `/api/user/profile` PUT 端点。

### Q: iframe 工具中无法访问 UserAPI？
A: 确保在 HTML 中引入了 `<script src="/user-api.js"></script>`。

## 示例工具

完整的示例工具代码请参考：
- `/examples/user-info-display-tool.tsx` - 显示用户信息
- `/examples/ai-bio-generator-tool.tsx` - AI 个人简介生成器
- `/examples/social-media-card-tool.html` - 社交媒体名片生成器（HTML）
