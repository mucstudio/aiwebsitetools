# 🏭 工具工厂模式开发指南

## 📖 概述

本项目采用**工厂模式**架构，将公共逻辑（安全、计费）与业务逻辑（Prompt、AI参数）分离，实现"写一次，到处运行"的开发体验。

### 核心优势

- ✅ **开发效率**：新工具只需 10-50 行代码
- ✅ **一致性**：所有工具自动应用统一的安全策略
- ✅ **可维护性**：修改一处，所有工具同步更新
- ✅ **灵活性**：支持文本、图片、JSON 等多种输出格式

---

## 🏗️ 架构概览

```
工具工厂架构
├── lib/create-tool-handler.ts          # 通用后端业务逻辑工厂
├── hooks/useToolAction.ts              # 通用前端交互 Hook
├── app/api/tools/[toolId]/route.ts     # 每个工具独立的 API 定义
│
├── 页面渲染模式 (二选一):
│   ├── 模式 A (通用): app/tools/[slug]/page.tsx       # 统一渲染入口 (基于数据库配置)
│   └── 模式 B (定制): app/tools/your-tool/page.tsx    # 独立页面入口 (适合强交互/特殊UI)
│
└── 组件复用:
    └── components/tools/              # 工具的具体 UI 组件 (被上述页面引用)
```

### 数据流

```
用户输入
  ↓
前端 (useToolAction Hook)
  ↓
API (/api/tools/[toolId])
  ↓
工厂函数 (createToolHandler)
  ├─ 1. 输入验证
  ├─ 2. 认证检查
  ├─ 3. 使用限制检查
  ├─ 4. 内容审核
  ├─ 5. 执行核心逻辑 (processor)
  ├─ 6. 记录使用
  └─ 7. 返回结果
  ↓
前端展示结果
```

---

## 🚀 快速开始：创建新工具

### 第一步：创建 API 路由

创建文件：`app/api/tools/your-tool/route.ts`

```typescript
import { createToolHandler, callAI } from '@/lib/create-tool-handler'

// 定义核心业务逻辑
const yourToolProcessor = async (input: string) => {
  const prompt = `你的 AI Prompt...

  用户输入：${input}`

  const aiResult = await callAI(prompt, 'your-tool')

  return {
    content: aiResult.content,
    metadata: {
      aiTokens: aiResult.tokens,
      aiCost: aiResult.cost
    }
  }
}

// 导出工具处理器
export const POST = createToolHandler({
  toolId: 'your-tool',
  processor: yourToolProcessor,
  validateInput: (input) => {
    if (typeof input !== 'string' || input.trim().length < 5) {
      return { valid: false, error: '输入太短' }
    }
    return { valid: true }
  }
})
```

### 第二步：选择前端页面模式

#### 模式 A：通用页面 (推荐)
如果你的工具不需要特殊的整页布局（如全屏游戏、特殊背景），可以直接复用通用模板。

1. **创建组件**：`components/tools/YourTool.tsx`
2. **注册组件**：在 `components/tools/ToolRenderer.tsx` 中导入并注册。
3. **数据库配置**：确保数据库中的 `componentType` 与注册的名称一致。
4. **无需创建页面文件**：`app/tools/[slug]/page.tsx` 会自动处理。

#### 模式 B：独立定制页面
如果需要像 "Corporate Clapback" 那样完全自定义的页面结构（包含 Header/Footer 但内容区完全自定义）：

创建文件：`app/tools/your-tool/page.tsx`

```typescript
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma" // 引入数据库客户端
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { YourToolComponent } from "@/components/tools/YourToolComponent" // 你的客户端组件

export default async function YourToolPage() {
  // 1. 动态获取工具数据 (替换硬编码)
  const tool = await prisma.tool.findUnique({
    where: { slug: 'your-tool' }, // 确保 slug 与数据库一致
    include: { category: true }
  })

  if (!tool) return notFound()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex flex-col">
        {/* 动态面包屑和标题区域 */}
         <div className="container py-8 pb-4">
          {/* ...使用 tool.name, tool.description 等变量... */}
        </div>
        
        {/* 你的客户端交互组件 */}
        <YourToolComponent />
      </main>
      <Footer />
    </div>
  )
}
```

### 第三步：在数据库中注册工具

#### 一键添加工具（推荐）

**第一步：获取分类ID**

访问 `/admin/categories`，点击分类旁边的ID按钮复制

或运行命令：
```bash
node scripts/list-categories.mjs
```

**第二步：编辑 `scripts/add-tool.mjs`**

```javascript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 修改这里的值
const toolData = {
  slug: 'your-tool',              // 工具URL名（必须和文件夹名一致）
  name: 'Your Tool Name',         // 显示名称
  description: 'Tool description', // 工具描述
  categoryId: 'clxxx123',         // 从第一步获取的分类ID
  componentType: 'your-tool',     // 组件名（通常和slug一样）
  isPublished: true               // true=上线，false=隐藏
}

try {
  const tool = await prisma.tool.create({
    data: toolData
  })

  console.log('✅ 工具添加成功！')
  console.log('ID:', tool.id)
  console.log('URL:', `/tools/${tool.slug}`)
} catch (error) {
  console.error('❌ 添加失败:', error.message)
} finally {
  await prisma.$disconnect()
}
```

**第三步：运行**
```bash
node scripts/add-tool.mjs
```

---

## 📚 工具类型示例

### 1. 文本生成工具（最常见）

**示例**：Aura Check、毒舌简历点评

```typescript
const textProcessor = async (input: string) => {
  const prompt = `生成文本的 Prompt...`
  const aiResult = await callAI(prompt, 'tool-id')

  return {
    content: aiResult.content,  // 直接返回文本
    metadata: {
      aiTokens: aiResult.tokens,
      aiCost: aiResult.cost
    }
  }
}
```

**前端展示**：
```typescript
{result && <div className="prose">{result}</div>}
```

---

## ⚙️ 配置选项

### createToolHandler 参数

```typescript
export const POST = createToolHandler({
  toolId: 'your-tool',              // 必填：工具ID
  processor: yourProcessor,          // 必填：核心逻辑

  // 可选配置
  requireAuth: false,                // 是否需要登录
  skipUsageCheck: false,             // 是否跳过使用限制检查
  skipContentModeration: false,      // 是否跳过内容审核
  validateInput: (input) => ({       // 输入验证函数
    valid: true,
    error: undefined
  })
})
```

### processor 函数签名

```typescript
type ToolProcessor = (
  input: any,           // 用户输入
  context: {            // 请求上下文
    userId?: string
    sessionId?: string
    ipAddress?: string
    deviceFingerprint?: string
    userAgent?: string
    toolId: string
  }
) => Promise<string | object>
```

---

## 🎨 前端开发指南

### useToolAction Hook

```typescript
const {
  execute,      // 执行函数
  result,       // 结果
  loading,      // 加载状态
  error,        // 错误信息
  remaining,    // 剩余次数
  reset         // 重置函数
} = useToolAction<ResultType>('tool-id')
```

### 完全自定义 UI

工厂模式的优势在于：**逻辑复用，UI 完全自定义**

```typescript
// 赛博朋克风格
<div className="bg-black text-green-500 font-mono">
  <h1 className="glitch-effect">TOOL NAME</h1>
  {/* 自定义 UI */}
</div>

// 治愈系风格
<div className="bg-gradient-to-b from-purple-100 to-pink-100 font-serif">
  <h1 className="text-4xl text-purple-800">Tool Name</h1>
  {/* 自定义 UI */}
</div>
```

---

## 📝 最佳实践

1. **工具命名**：使用 kebab-case（如 `aura-check`）
2. **输入验证**：始终验证用户输入
3. **错误处理**：提供友好的错误提示
4. **动态数据**：即使是自定义页面，也应使用 `prisma` 获取标题、描述等元数据，避免硬编码。
5. **安全性**：不要在前端暴露敏感信息

---

## 🎯 下一步

1. 创建你的第一个工具
2. 测试工具功能
3. 在数据库中注册工具
4. 部署到生产环境

需要帮助？查看示例工具：
- `app/api/tools/aura-check/route.ts` (后端逻辑)
- `app/tools/corporate-clapback/page.tsx` (自定义页面模式示例)
- `app/tools/[slug]/page.tsx` (通用页面渲染器)

---

## 📤 进阶：集成分享功能

使用 `ShareResult` 组件，只需几行代码即可为工具添加**结果截图下载**和**社交分享**（支持 Native Share, Reddit, WhatsApp 等）。

### 1. 引入组件

```typescript
import { useRef } from "react"
import { ShareResult } from "@/components/tools/ShareResult"
```

### 2. 使用示例

```typescript
export default function YourTool({ result }: { result: string }) {
  // 1. 创建 ref 指向结果容器
  const resultRef = useRef<HTMLDivElement>(null)

  return (
    <div>
      {/* 2. 绑定 ref 到需要截图的区域 */}
      <div ref={resultRef} className="p-6 bg-white rounded-xl border relative">
        <h2 className="text-xl font-bold mb-4">Result</h2>
        <div className="prose">{result}</div>
      </div>

      {/* 3. 添加 ShareResult 组件 */}
      <ShareResult 
        contentRef={resultRef}       // 必填：绑定 ref
        title="my-tool-result"       // 选填：下载文件名
        shareText={`Check out my result: ${result.substring(0, 50)}...`} // 选填：分享文案
        watermark="@InspoaiBox.com"  // 选填：图片水印
        className="mt-6"             // 选填：样式
      />
    </div>
  )
}
```

### 3. 核心参数

| 参数 | 说明 |
|---|---|
| `contentRef` | 指向要截图的 DOM 元素 (必填) |
| `watermark` | 下载图片时自动添加的底部水印文字 |
| `shareText` | 社交分享时的预填文案 |

> **提示**：`ShareResult` 会自动检测移动端环境，并优先展示原生分享按钮（调用系统分享菜单）。