# 🔒 SafetyConfig 安全配置指南

**更新日期**: 2025-12-03
**版本**: v2.0

工厂模式现在支持 `safetyConfig` 参数，允许每个工具自定义安全策略，包括黑名单、白名单、敏感度级别等。

---

## 📋 功能概览

### ✅ 支持的功能

1. **自定义黑名单** - 添加工具特定的禁止词
2. **白名单模式** - 只允许包含特定关键词的内容
3. **敏感度级别** - 三档敏感度控制（low/medium/high）
4. **长度限制** - 自定义最小/最大输入长度
5. **语言限制** - 限制允许的输入语言
6. **自定义验证器** - 完全自定义的验证逻辑
7. **忽略全局黑名单** - 特殊工具可以绕过全局限制

---

## 🎯 SafetyConfig 接口

```typescript
interface SafetyConfig {
  blacklist?: string[]              // 自定义黑名单（会与全局黑名单合并）
  whitelist?: string[]              // 白名单（如果设置，只允许包含这些词的内容）
  ignoreGlobalBlacklist?: boolean   // 是否忽略全局黑名单（默认 false）
  sensitivity?: 'low' | 'medium' | 'high' // 敏感度级别（默认 medium）
  minLength?: number                // 最小输入长度（默认 3）
  maxLength?: number                // 最大输入长度（默认 5000）
  allowedLanguages?: string[]       // 允许的语言（如 ['zh', 'en']）
  customValidator?: (input: string) => { allowed: boolean; reason?: string }
}
```

---

## 📚 使用示例

### 示例 1：自定义黑名单（简历点评工具）

```typescript
// app/api/tools/roast-resume/route.ts
import { createToolHandler, callAI } from '@/lib/tools/create-tool-handler'

const roastProcessor = async (input: string) => {
  const prompt = `你是一个刻薄的HR，点评这份简历：${input}`
  const result = await callAI(prompt, 'roast-resume')
  return { content: result.content }
}

export const POST = createToolHandler({
  toolId: 'roast-resume',
  processor: roastProcessor,
  safetyConfig: {
    // 添加简历相关的敏感词
    blacklist: ['薪资造假', '学历造假', '虚假经历'],
    // 降低敏感度（允许更多表达）
    sensitivity: 'low',
    // 简历至少要 20 个字
    minLength: 20,
    maxLength: 2000
  }
})
```

**效果**：
- ✅ 允许用户输入 "我有 5 年经验"
- ❌ 拦截 "我要薪资造假"
- ❌ 拦截少于 20 字的输入

---

### 示例 2：白名单模式（技术问答工具）

```typescript
// app/api/tools/tech-qa/route.ts
import { createToolHandler, callAI } from '@/lib/tools/create-tool-handler'

const techQAProcessor = async (input: string) => {
  const prompt = `回答这个技术问题：${input}`
  const result = await callAI(prompt, 'tech-qa')
  return { content: result.content }
}

export const POST = createToolHandler({
  toolId: 'tech-qa',
  processor: techQAProcessor,
  safetyConfig: {
    // 只允许包含技术关键词的问题
    whitelist: [
      'javascript', 'python', 'react', 'vue', 'node',
      'typescript', 'api', 'database', 'sql', 'code',
      '代码', '编程', '开发', '技术', '算法'
    ],
    minLength: 10,
    maxLength: 500
  }
})
```

**效果**：
- ✅ 允许 "如何用 React 实现组件？"
- ✅ 允许 "Python 的列表推导式怎么用？"
- ❌ 拦截 "今天天气怎么样？"（不包含技术关键词）
- ❌ 拦截 "你好"（不包含技术关键词）

---

### 示例 3：语言限制（中文诗歌生成器）

```typescript
// app/api/tools/chinese-poem/route.ts
import { createToolHandler, callAI } from '@/lib/tools/create-tool-handler'

const poemProcessor = async (input: string) => {
  const prompt = `根据主题创作一首七言绝句：${input}`
  const result = await callAI(prompt, 'chinese-poem')
  return { content: result.content }
}

export const POST = createToolHandler({
  toolId: 'chinese-poem',
  processor: poemProcessor,
  safetyConfig: {
    // 只允许中文输入
    allowedLanguages: ['zh'],
    minLength: 2,
    maxLength: 50,
    sensitivity: 'low'  // 诗歌创作需要更多表达自由
  }
})
```

**效果**：
- ✅ 允许 "春天"
- ✅ 允许 "明月照大江"
- ❌ 拦截 "spring"（英文）
- ❌ 拦截 "さくら"（日文）

---

### 示例 4：高敏感度（儿童教育工具）

```typescript
// app/api/tools/kids-story/route.ts
import { createToolHandler, callAI } from '@/lib/tools/create-tool-handler'

const storyProcessor = async (input: string) => {
  const prompt = `为儿童创作一个故事：${input}`
  const result = await callAI(prompt, 'kids-story')
  return { content: result.content }
}

export const POST = createToolHandler({
  toolId: 'kids-story',
  processor: storyProcessor,
  safetyConfig: {
    // 高敏感度（严格过滤）
    sensitivity: 'high',
    // 添加儿童不宜的词汇
    blacklist: ['暴力', '恐怖', '血腥', '鬼怪'],
    minLength: 5,
    maxLength: 200
  }
})
```

**效果**：
- ✅ 允许 "小兔子找萝卜"
- ❌ 拦截 "fuck"（高敏感度）
- ❌ 拦截 "暴力"（自定义黑名单）
- ❌ 拦截 "hell"（高敏感度）

---

### 示例 5：自定义验证器（邮箱验证工具）

```typescript
// app/api/tools/email-validator/route.ts
import { createToolHandler } from '@/lib/tools/create-tool-handler'

const emailProcessor = async (input: string) => {
  // 验证邮箱格式
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)
  return {
    content: {
      valid: isValid,
      email: input
    }
  }
}

export const POST = createToolHandler({
  toolId: 'email-validator',
  processor: emailProcessor,
  safetyConfig: {
    // 自定义验证器：必须是邮箱格式
    customValidator: (input: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(input)) {
        return {
          allowed: false,
          reason: 'Please enter a valid email address'
        }
      }
      return { allowed: true }
    },
    minLength: 5,
    maxLength: 100
  }
})
```

**效果**：
- ✅ 允许 "user@example.com"
- ❌ 拦截 "not-an-email"
- ❌ 拦截 "user@"

---

### 示例 6：忽略全局黑名单（创意写作工具）

```typescript
// app/api/tools/creative-writing/route.ts
import { createToolHandler, callAI } from '@/lib/tools/create-tool-handler'

const writingProcessor = async (input: string) => {
  const prompt = `创作一个故事：${input}`
  const result = await callAI(prompt, 'creative-writing')
  return { content: result.content }
}

export const POST = createToolHandler({
  toolId: 'creative-writing',
  processor: writingProcessor,
  safetyConfig: {
    // 忽略全局黑名单（创意写作需要更多自由）
    ignoreGlobalBlacklist: true,
    // 但仍然添加自己的黑名单
    blacklist: ['色情', '儿童不宜'],
    sensitivity: 'low',
    minLength: 10,
    maxLength: 1000
  }
})
```

**效果**：
- ✅ 允许 "murder mystery"（全局黑名单中的词，但被忽略）
- ✅ 允许 "kill the dragon"（全局黑名单中的词，但被忽略）
- ❌ 拦截 "色情"（自定义黑名单）

---

## 📊 敏感度级别对比

| 敏感度 | 额外拦截词 | 适用场景 |
|--------|-----------|---------|
| **low** | 无 | 创意工具、诗歌生成、故事创作 |
| **medium** (默认) | fuck, shit, damn | 一般工具、问答系统 |
| **high** | fuck, shit, damn, hell, ass, bitch, crap | 儿童工具、教育工具、公开平台 |

---

## 🔍 全局黑名单

以下词汇在**所有工具**中默认被拦截（除非设置 `ignoreGlobalBlacklist: true`）：

```typescript
const globalBlacklist = [
  'rape', 'murder', 'kill', 'suicide', 'bomb', 'terrorist',
  'abuse', 'pedophile', 'nazi', 'genocide', 'violence', 'weapon'
]
```

---

## 💡 最佳实践

### 1. 根据工具类型选择敏感度

```typescript
// ✅ 创意工具 - 低敏感度
safetyConfig: {
  sensitivity: 'low',
  blacklist: ['特定领域敏感词']
}

// ✅ 一般工具 - 中等敏感度（默认）
safetyConfig: {
  sensitivity: 'medium'
}

// ✅ 儿童工具 - 高敏感度
safetyConfig: {
  sensitivity: 'high',
  blacklist: ['额外的儿童不宜词汇']
}
```

### 2. 使用白名单限制工具用途

```typescript
// ✅ 技术问答工具 - 只允许技术问题
safetyConfig: {
  whitelist: ['javascript', 'python', 'code', '代码', '编程']
}

// ✅ 医疗咨询工具 - 只允许医疗相关问题
safetyConfig: {
  whitelist: ['症状', '疾病', '治疗', '药物', 'symptom', 'disease']
}
```

### 3. 合理设置长度限制

```typescript
// ✅ 短文本工具（标题生成）
safetyConfig: {
  minLength: 3,
  maxLength: 100
}

// ✅ 长文本工具（文章分析）
safetyConfig: {
  minLength: 100,
  maxLength: 10000
}
```

### 4. 语言限制的使用场景

```typescript
// ✅ 中文专用工具
safetyConfig: {
  allowedLanguages: ['zh']
}

// ✅ 多语言工具
safetyConfig: {
  allowedLanguages: ['zh', 'en', 'ja']
}
```

---

## ⚠️ 注意事项

### 1. 白名单优先级最高

如果设置了白名单，**必须**包含白名单中的至少一个词，否则会被拦截。

```typescript
safetyConfig: {
  whitelist: ['技术', 'code'],
  blacklist: ['暴力']  // 黑名单仍然生效
}
```

### 2. 黑名单会合并

自定义黑名单会与全局黑名单和敏感度黑名单**合并**：

```typescript
// 最终黑名单 = 全局黑名单 + 敏感度黑名单 + 自定义黑名单
safetyConfig: {
  sensitivity: 'medium',  // 添加 fuck, shit, damn
  blacklist: ['自定义词']  // 添加自定义词
}
// 最终拦截：rape, murder, ... + fuck, shit, damn + 自定义词
```

### 3. 语言检测的局限性

语言检测基于字符比例，可能不够精确：

```typescript
// 混合语言文本可能被误判
"Hello 你好"  // 可能被判断为中文或英文，取决于比例
```

### 4. 性能考虑

- 黑名单检查是 O(n*m) 复杂度（n=黑名单长度，m=输入长度）
- 避免设置过长的黑名单（建议 < 100 个词）
- 自定义验证器应该高效执行

---

## 🚀 完整示例：综合配置

```typescript
// app/api/tools/advanced-tool/route.ts
import { createToolHandler, callAI } from '@/lib/tools/create-tool-handler'

const advancedProcessor = async (input: string) => {
  const prompt = `处理输入：${input}`
  const result = await callAI(prompt, 'advanced-tool')
  return { content: result.content }
}

export const POST = createToolHandler({
  toolId: 'advanced-tool',
  processor: advancedProcessor,
  safetyConfig: {
    // 自定义黑名单
    blacklist: ['垃圾', '广告', 'spam'],

    // 白名单（可选）
    // whitelist: ['技术', 'code'],

    // 敏感度级别
    sensitivity: 'medium',

    // 长度限制
    minLength: 10,
    maxLength: 1000,

    // 语言限制
    allowedLanguages: ['zh', 'en'],

    // 自定义验证器
    customValidator: (input: string) => {
      // 检查是否包含 URL
      if (/https?:\/\//.test(input)) {
        return {
          allowed: false,
          reason: 'URLs are not allowed'
        }
      }
      return { allowed: true }
    }
  }
})
```

---

## 📈 效果对比

### 没有 SafetyConfig（之前）

```typescript
export const POST = createToolHandler({
  toolId: 'my-tool',
  processor: myProcessor
})
```

**问题**：
- ❌ 所有工具使用相同的黑名单
- ❌ 无法针对工具特性定制
- ❌ 浪费 AI 成本处理不合规内容

### 有 SafetyConfig（现在）

```typescript
export const POST = createToolHandler({
  toolId: 'my-tool',
  processor: myProcessor,
  safetyConfig: {
    blacklist: ['工具特定敏感词'],
    sensitivity: 'low',
    minLength: 5
  }
})
```

**优势**：
- ✅ 每个工具独立配置
- ✅ 提前拦截不合规内容
- ✅ 节省 AI 调用成本
- ✅ 更好的用户体验

---

## 🎯 总结

SafetyConfig 让你能够：

1. **节省成本** - 在调用 AI 前拦截不合规内容
2. **提高安全性** - 每个工具独立的安全策略
3. **灵活配置** - 7 种配置选项满足各种需求
4. **更好体验** - 快速反馈，不浪费用户时间

---

**更新日志**：
- v2.0 (2025-12-03) - 添加 SafetyConfig 支持
- v1.0 (2025-12-02) - 初始工厂模式发布

**相关文档**：
- [工厂模式完整指南](TOOL_FACTORY_GUIDE.md)
- [增强功能详解](ENHANCED_FEATURES.md)
- [快速启动指南](QUICK_START.md)
