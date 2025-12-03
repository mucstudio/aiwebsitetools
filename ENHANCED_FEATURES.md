# 🚀 工具工厂模式 - 增强功能指南

## ✨ 新增功能

### 1. 可定制的安全配置
每个工具可以独立配置自己的安全策略，包括：
- 自定义黑名单
- 敏感度级别（low/medium/high）
- 输入长度限制
- 允许的语言

### 2. TypeScript 泛型支持
前端 Hook 现在支持泛型，提供完整的类型安全和 IDE 自动补全。

### 3. 多种返回格式
支持文本、JSON、图片等多种返回格式，自动处理。

### 4. 增强的错误处理
更详细的错误信息和更好的用户体验。

---

## 📚 使用示例

### 示例 1：毒舌简历点评（文本 + 自定义安全配置）

**后端** - `app/api/tools/roast-resume/route.ts`:

```typescript
import { createToolHandler, callAI } from '@/lib/create-tool-handler'

const SYSTEM_PROMPT = `你是一个刻薄的硅谷HR面试官。请用毒舌、讽刺的语气点评用户的简历概要。
要求：
- 指出逻辑漏洞
- 使用"福报"、"底层逻辑"等互联网黑话进行嘲讽
- 保持专业但尖锐的风格`

const roastProcessor = async (input: string) => {
  const prompt = `${SYSTEM_PROMPT}\n\n用户简历概要：${input}`
  const aiResult = await callAI(prompt, 'roast-resume')

  return {
    content: aiResult.content,
    metadata: {
      aiTokens: aiResult.tokens,
      aiCost: aiResult.cost
    }
  }
}

export const POST = createToolHandler({
  toolId: 'roast-resume',
  processor: roastProcessor,
  safetyConfig: {
    blacklist: ['薪资造假', '学历造假'],  // 工具特定的敏感词
    sensitivity: 'low',                      // 降低敏感度（允许更多表达）
    minLength: 20,                           // 至少20个字符
    maxLength: 2000                          // 最多2000个字符
  }
})
```

**前端** - `app/tools/roast-resume/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useToolAction } from '@/hooks/useToolAction'
import ReactMarkdown from 'react-markdown'

export default function RoastResumePage() {
  const [resume, setResume] = useState('')

  // 指定泛型为 string（文本结果）
  const { execute, result, loading, error, remaining, isReady } = useToolAction<string>('roast-resume')

  return (
    <div className="container max-w-4xl mx-auto py-12">
      <h1 className="text-4xl font-bold mb-8 text-center text-red-600">
        毒舌简历点评
      </h1>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <label className="block text-lg font-medium mb-4">
          你的简历概要：
        </label>

        <textarea
          value={resume}
          onChange={(e) => setResume(e.target.value)}
          placeholder="例如：5年React开发经验，精通前端技术栈..."
          className="w-full p-4 border rounded-lg mb-4"
          rows={6}
          disabled={!isReady}
        />

        <button
          onClick={() => execute(resume)}
          disabled={loading || !isReady}
          className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 disabled:opacity-50"
        >
          {loading ? '正在吐槽中...' : '开始吐槽'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* 因为泛型是 string，TypeScript 知道 result 是字符串 */}
        {result && (
          <div className="mt-8 p-6 bg-red-50 rounded-lg border-l-4 border-red-500">
            <h3 className="text-xl font-bold mb-4 text-red-700">HR 的毒舌点评：</h3>
            <div className="prose prose-red max-w-none">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-500 text-center">
          剩余次数：{remaining}
        </div>
      </div>
    </div>
  )
}
```

---

### 示例 2：MBTI 性格分析（JSON + 泛型）

**后端** - `app/api/tools/mbti-test/route.ts`:

```typescript
import { createToolHandler, callAI } from '@/lib/create-tool-handler'

// 定义返回的 JSON 结构
interface MbtiResult {
  mbti_type: string
  percentage: number
  careers: string[]
  roast_comment: string
}

const SYSTEM_PROMPT = `分析用户输入的行为，判断其 MBTI 类型。
必须返回严格的 JSON 格式：
{
  "mbti_type": "INTJ",
  "percentage": 85,
  "careers": ["Architect", "Scientist"],
  "roast_comment": "你这人太无趣了"
}`

const mbtiProcessor = async (input: string) => {
  const prompt = `${SYSTEM_PROMPT}\n\n用户描述：${input}`
  const aiResult = await callAI(prompt, 'mbti-test')

  // 解析 JSON
  let data: MbtiResult
  try {
    let cleanContent = aiResult.content.trim()
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    }
    data = JSON.parse(cleanContent)
  } catch (error) {
    data = {
      mbti_type: "XXXX",
      percentage: 0,
      careers: ["需要更多信息"],
      roast_comment: "无法准确分析，请提供更详细的描述"
    }
  }

  return {
    content: data,
    metadata: {
      aiTokens: aiResult.tokens,
      aiCost: aiResult.cost
    }
  }
}

export const POST = createToolHandler({
  toolId: 'mbti-test',
  processor: mbtiProcessor,
  safetyConfig: {
    minLength: 20,
    maxLength: 1000,
    allowedLanguages: ['zh', 'en']  // 只允许中文和英文
  }
})
```

**前端** - `app/tools/mbti-test/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useToolAction } from '@/hooks/useToolAction'

// 定义我们期望的 JSON 结构（与后端一致）
interface MbtiResult {
  mbti_type: string
  percentage: number
  careers: string[]
  roast_comment: string
}

export default function MbtiTestPage() {
  const [description, setDescription] = useState('')

  // 指定泛型为 MbtiResult（JSON 结果）
  // TypeScript 会自动补全 result 的所有字段！
  const { execute, result, loading, error, remaining } = useToolAction<MbtiResult>('mbti-test')

  return (
    <div className="container max-w-4xl mx-auto py-12">
      <h1 className="text-4xl font-bold mb-8 text-center text-blue-600">
        MBTI 性格分析
      </h1>

      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-lg p-8">
        <label className="block text-lg font-medium mb-4">
          描述你的性格特点：
        </label>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="例如：我喜欢独处，思考问题很深入，不太喜欢社交..."
          className="w-full p-4 border rounded-lg mb-4"
          rows={5}
        />

        <button
          onClick={() => execute(description)}
          disabled={loading}
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? '分析中...' : '开始分析'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* TypeScript 自动补全 result 的所有字段！ */}
        {result && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-6">
              <h2 className="text-6xl font-bold text-blue-600 mb-2">
                {result.mbti_type}
              </h2>
              <div className="text-gray-500">
                匹配度: {result.percentage}%
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold mb-3 text-gray-800">
                推荐职业：
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.careers.map((career, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {career}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <p className="text-gray-700 italic">
                "{result.roast_comment}"
              </p>
            </div>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-500 text-center">
          剩余次数：{remaining}
        </div>
      </div>
    </div>
  )
}
```

---

### 示例 3：中文诗歌生成器（语言限制）

**后端** - `app/api/tools/chinese-poem/route.ts`:

```typescript
import { createToolHandler, callAI } from '@/lib/create-tool-handler'

const poemProcessor = async (input: string) => {
  const prompt = `你是一位古典诗人，请根据用户的主题创作一首七言绝句。

主题：${input}

要求：
1. 严格遵循七言绝句格式（四句，每句七字）
2. 注意平仄和韵律
3. 意境优美，富有诗意`

  const aiResult = await callAI(prompt, 'chinese-poem')
  return { content: aiResult.content }
}

export const POST = createToolHandler({
  toolId: 'chinese-poem',
  processor: poemProcessor,
  safetyConfig: {
    allowedLanguages: ['zh'],  // 只允许中文输入
    minLength: 2,
    maxLength: 50,
    sensitivity: 'low'  // 诗歌创作需要更多表达自由
  }
})
```

---

## 🎯 安全配置详解

### SafetyConfig 接口

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

### 核心功能

#### 1. 黑名单模式（默认）
拦截包含特定关键词的内容，节省 AI 成本：

```typescript
safetyConfig: {
  blacklist: ['薪资造假', '学历造假', '虚假经历'],
  sensitivity: 'low'
}
```

#### 2. 白名单模式
只允许包含特定关键词的内容，限制工具用途：

```typescript
safetyConfig: {
  whitelist: ['javascript', 'python', 'code', '代码', '编程'],
  minLength: 10
}
```

#### 3. 语言限制
限制输入语言，避免处理不相关内容：

```typescript
safetyConfig: {
  allowedLanguages: ['zh'],  // 只允许中文
  minLength: 2,
  maxLength: 50
}
```

#### 4. 自定义验证器
完全自定义的验证逻辑：

```typescript
safetyConfig: {
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
```

### 敏感度级别

| 级别 | 说明 | 额外拦截词 | 适用场景 |
|------|------|-----------|---------|
| **low** | 宽松 | 无 | 创意工具、诗歌生成 |
| **medium** | 中等（默认） | fuck, shit, damn | 一般工具 |
| **high** | 严格 | fuck, shit, damn, hell, ass, bitch, crap | 儿童工具、教育工具 |

### 全局黑名单

以下词汇在所有工具中默认被拦截（除非设置 `ignoreGlobalBlacklist: true`）：

```typescript
const globalBlacklist = [
  'rape', 'murder', 'kill', 'suicide', 'bomb', 'terrorist',
  'abuse', 'pedophile', 'nazi', 'genocide', 'violence', 'weapon'
]
```

### 使用建议

```typescript
// ✅ 推荐：创意工具使用低敏感度
safetyConfig: {
  sensitivity: 'low',
  blacklist: ['特定领域敏感词']
}

// ✅ 推荐：技术问答使用白名单
safetyConfig: {
  whitelist: ['javascript', 'python', 'code', '技术', '编程'],
  minLength: 10
}

// ✅ 推荐：教育工具使用高敏感度
safetyConfig: {
  sensitivity: 'high',
  blacklist: ['暴力', '恐怖'],
  minLength: 10
}

// ✅ 推荐：中文专用工具限制语言
safetyConfig: {
  allowedLanguages: ['zh'],
  sensitivity: 'low'
}

// ⚠️ 慎用：忽略全局黑名单
safetyConfig: {
  ignoreGlobalBlacklist: true,  // 只在特殊情况下使用
  blacklist: ['自定义黑名单']
}
```

### 效果对比

**没有 SafetyConfig：**
```
用户输入 "暴力内容" → 调用 AI → 浪费成本 ❌
```

**有 SafetyConfig：**
```
用户输入 "暴力内容" → 黑名单拦截 → 不调用 AI → 节省成本 ✅
```

### 更多示例

查看完整的使用示例和最佳实践：
- [SafetyConfig 完整指南](SAFETY_CONFIG_GUIDE.md)

---

## 🔧 TypeScript 泛型使用

### 文本结果

```typescript
const { result } = useToolAction<string>('tool-id')
// result 类型：string | null
```

### JSON 结果

```typescript
interface MyResult {
  field1: string
  field2: number
}

const { result } = useToolAction<MyResult>('tool-id')
// result 类型：MyResult | null
// IDE 会自动补全 result.field1, result.field2
```

### 数组结果

```typescript
interface Item {
  name: string
  value: number
}

const { result } = useToolAction<Item[]>('tool-id')
// result 类型：Item[] | null
```

---

## 📊 性能优化

### 1. 跳过使用次数检查（适用于无限制工具）

```typescript
const { result } = useToolAction('tool-id', {
  autoCheckUsage: false  // 不检查使用次数
})
```

### 2. 成功/错误回调

```typescript
const { result } = useToolAction('tool-id', {
  onSuccess: (result) => {
    console.log('Success:', result)
    // 可以在这里做额外处理
  },
  onError: (error) => {
    console.error('Error:', error)
    // 可以在这里上报错误
  }
})
```

### 3. 检查准备状态

```typescript
const { isReady, execute } = useToolAction('tool-id')

// 只在准备好后才允许提交
<button disabled={!isReady || loading}>
  {isReady ? '提交' : '初始化中...'}
</button>
```

---

## 🎨 完整示例对比

### 原有方式（不推荐）

```typescript
// ❌ 没有类型安全
const { result } = useToolAction('mbti-test')

// 需要手动类型断言
if (result) {
  const data = result as any
  console.log(data.mbti_type)  // 没有自动补全
}
```

### 新方式（推荐）

```typescript
// ✅ 完整的类型安全
interface MbtiResult {
  mbti_type: string
  percentage: number
}

const { result } = useToolAction<MbtiResult>('mbti-test')

// IDE 自动补全！
if (result) {
  console.log(result.mbti_type)  // ✅ 自动补全
  console.log(result.percentage) // ✅ 自动补全
}
```

---

## 🚀 下一步

1. 查看 [TOOL_FACTORY_GUIDE.md](./TOOL_FACTORY_GUIDE.md) 了解基础用法
2. 查看 [QUICK_START.md](./QUICK_START.md) 快速创建第一个工具
3. 参考本文档的示例创建带有自定义安全配置的工具

---

## 💡 最佳实践

1. **始终使用泛型**：提供更好的类型安全和开发体验
2. **合理配置安全策略**：根据工具特性选择合适的敏感度
3. **添加自定义黑名单**：针对特定领域添加敏感词
4. **使用语言限制**：对于特定语言的工具，限制输入语言
5. **提供清晰的错误提示**：帮助用户理解为什么输入被拒绝

祝你开发愉快！🎉
