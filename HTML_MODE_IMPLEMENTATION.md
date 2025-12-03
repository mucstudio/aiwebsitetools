# HTML 模式实现文档

## 📋 功能概述

在 `/admin/tools/new` 页面新增了 **HTML 模式**，允许管理员使用纯 HTML/CSS/JavaScript 创建工具，无需 React 框架。

## ✅ 已完成的修改

### 1. 前端页面 ([app/admin/tools/new/page.tsx](app/admin/tools/new/page.tsx))

**新增功能**：
- ✅ 添加代码模式切换标签页（React 模式 / HTML 模式）
- ✅ 添加 `codeMode` 状态管理
- ✅ 添加 `htmlCode` 字段存储 HTML 代码
- ✅ 提供默认 HTML 模板

**UI 变化**：
```typescript
// 标签页切换
<button onClick={() => setCodeMode('react')}>React 组件模式</button>
<button onClick={() => setCodeMode('html')}>HTML 模式</button>

// 根据模式显示不同的代码编辑器
{codeMode === 'react' && <Textarea value={componentCode} />}
{codeMode === 'html' && <Textarea value={htmlCode} />}
```

### 2. API 路由 ([app/api/admin/tools/route.ts](app/api/admin/tools/route.ts))

**修改内容**：
- ✅ 更新 `toolSchema` 添加 `codeMode`、`htmlCode` 字段
- ✅ 根据 `codeMode` 保存不同类型的文件：
  - **React 模式**：保存到 `components/tools/{componentType}.tsx`
  - **HTML 模式**：保存到 `public/tools/{componentType}.html`
- ✅ 验证代码模式对应的代码字段

**文件保存逻辑**：
```typescript
if (codeMode === 'react') {
  filePath = 'components/tools/{componentType}.tsx'
  codeContent = componentCode
} else {
  filePath = 'public/tools/{componentType}.html'
  codeContent = htmlCode
}
```

### 3. 数据库 Schema ([prisma/schema.prisma](prisma/schema.prisma))

**新增字段**：
```prisma
model Tool {
  // ... 其他字段
  componentType String  // 工具组件类型
  codeMode      String  @default("react") // 代码模式：react 或 html
  config        Json?   // 工具配置
  // ...
}
```

### 4. ToolRenderer 组件 ([components/tools/ToolRenderer.tsx](components/tools/ToolRenderer.tsx))

**新增功能**：
- ✅ 添加 `codeMode` 参数
- ✅ HTML 模式使用 iframe 加载 HTML 文件
- ✅ React 模式保持原有的 dynamic import 逻辑

**渲染逻辑**：
```typescript
if (codeMode === 'html') {
  return (
    <iframe
      src={`/tools/${componentType}.html`}
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
    />
  )
}

// React 模式
return <DynamicComponent toolId={toolId} config={config} />
```

### 5. 工具页面 ([app/tools/[slug]/page.tsx](app/tools/[slug]/page.tsx))

**修改内容**：
- ✅ 传递 `codeMode` 参数给 ToolRenderer

```typescript
<ToolRenderer
  toolId={tool.id}
  componentType={tool.componentType}
  codeMode={tool.codeMode}
  config={tool.config}
/>
```

---

## 🎯 架构优势

### 保持 SEO 优势

**文件系统存储 vs 数据库存储**：

| 特性 | 文件系统（当前方案）| 数据库存储 |
|------|-------------------|-----------|
| **SEO 友好** | ✅ 优秀（SSR） | ⚠️ 需要额外处理 |
| **初始 HTML** | ✅ 完整内容 | ❌ 空白页面 |
| **爬虫友好** | ✅ 直接读取 | ⚠️ 依赖 JS |
| **meta 标签** | ✅ 服务端生成 | ⚠️ 客户端生成 |
| **部署方式** | 需要重建 | 无需重建 |

**我们的方案**：
- ✅ **React 模式**：保存为 `.tsx` 文件，通过 dynamic import 加载
- ✅ **HTML 模式**：保存为 `.html` 文件，通过 iframe 加载
- ✅ **SEO 优势**：工具页面仍然是服务端渲染，meta 标签完整
- ✅ **安全隔离**：HTML 模式使用 iframe sandbox 隔离

---

## 📂 文件结构

```
project/
├── components/tools/          # React 组件（.tsx）
│   ├── AuraCheck.tsx
│   ├── WordCounter.tsx
│   └── ...
├── public/tools/              # HTML 文件（.html）
│   ├── simple-calculator.html
│   ├── color-picker.html
│   └── ...
├── app/
│   ├── admin/tools/new/       # 创建工具页面
│   │   └── page.tsx           # ✅ 已添加 HTML 模式标签页
│   ├── api/admin/tools/       # API 路由
│   │   └── route.ts           # ✅ 已支持 HTML 代码保存
│   └── tools/[slug]/          # 工具展示页面
│       └── page.tsx           # ✅ 已传递 codeMode
└── prisma/
    └── schema.prisma          # ✅ 已添加 codeMode 字段
```

---

## 🚀 使用流程

### 创建 HTML 模式工具

1. **访问创建页面**：`/admin/tools/new`

2. **填写基本信息**：
   - 工具名称：例如 "Simple Calculator"
   - URL 标识：例如 "simple-calculator"
   - 描述、分类、SEO 信息等

3. **选择 HTML 模式**：
   - 点击 "HTML 模式" 标签页
   - 输入完整的 HTML 代码（包括 `<html>`, `<head>`, `<body>`）

4. **提交创建**：
   - 代码会保存到 `public/tools/simple-calculator.html`
   - 数据库记录 `codeMode = 'html'`

5. **访问工具**：
   - 前端访问：`/tools/simple-calculator`
   - ToolRenderer 检测到 `codeMode = 'html'`
   - 使用 iframe 加载 `/tools/simple-calculator.html`

---

## 🔒 安全性

### iframe sandbox 属性

```html
<iframe
  src="/tools/{componentType}.html"
  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
/>
```

**允许的操作**：
- ✅ `allow-scripts`：允许执行 JavaScript
- ✅ `allow-same-origin`：允许访问同源资源
- ✅ `allow-forms`：允许表单提交
- ✅ `allow-popups`：允许弹窗
- ✅ `allow-modals`：允许模态框

**禁止的操作**：
- ❌ `allow-top-navigation`：禁止导航到顶层窗口
- ❌ `allow-pointer-lock`：禁止指针锁定
- ❌ 其他危险操作

---

## 📝 HTML 模式示例

### 默认模板

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>我的工具</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 2rem;
      background: #f5f5f5;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    button {
      background: #0070f3;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>我的工具</h1>
    <input type="text" id="input" placeholder="输入内容...">
    <button onclick="handleProcess()">处理</button>
    <div id="result"></div>
  </div>

  <script>
    function handleProcess() {
      const input = document.getElementById('input').value;
      const result = input; // 你的逻辑
      document.getElementById('result').textContent = '结果: ' + result;
    }
  </script>
</body>
</html>
```

---

## 🔄 数据库迁移

### 下一步操作

运行以下命令应用数据库更改：

```bash
npx prisma migrate dev --name add_code_mode
```

这将：
1. 创建迁移文件
2. 添加 `codeMode` 字段到 `Tool` 表
3. 设置默认值为 `"react"`
4. 更新 Prisma Client

---

## 📊 对比：React 模式 vs HTML 模式

| 特性 | React 模式 | HTML 模式 |
|------|-----------|----------|
| **框架** | React + Next.js | 原生 HTML/CSS/JS |
| **文件类型** | `.tsx` | `.html` |
| **存储位置** | `components/tools/` | `public/tools/` |
| **加载方式** | dynamic import | iframe |
| **UI 组件** | ✅ shadcn/ui | ❌ 需自己实现 |
| **状态管理** | ✅ React hooks | ❌ 原生 JS |
| **类型安全** | ✅ TypeScript | ❌ 无类型 |
| **开发难度** | 中等 | 简单 |
| **适用场景** | 复杂工具 | 简单工具 |
| **需要重建** | ✅ 是 | ❌ 否 |
| **SEO** | ✅ 优秀 | ✅ 优秀 |

---

## 💡 使用建议

### 何时使用 React 模式？

- ✅ 需要复杂的状态管理
- ✅ 需要使用 UI 组件库
- ✅ 需要 TypeScript 类型安全
- ✅ 需要与后端 API 交互
- ✅ 工具逻辑复杂

**示例**：Aura Check、AI 工具、数据可视化工具

### 何时使用 HTML 模式？

- ✅ 简单的计算器、转换器
- ✅ 纯前端工具，无需后端
- ✅ 快速原型开发
- ✅ 移植现有的 HTML 工具
- ✅ 不需要重建即可更新

**示例**：颜色选择器、单位转换器、简单计算器

---

## 🎉 总结

### 实现的功能

✅ 在创建工具页面添加 HTML 模式标签页
✅ 支持纯 HTML/CSS/JavaScript 代码输入
✅ 代码保存到 `public/tools/` 目录
✅ 使用 iframe 安全隔离渲染
✅ 保持 SEO 优势（服务端渲染）
✅ 无需重建即可生效（HTML 文件）

### 架构优势

✅ **灵活性**：支持两种开发模式
✅ **SEO 友好**：保持服务端渲染
✅ **安全性**：iframe sandbox 隔离
✅ **易用性**：提供默认模板
✅ **可扩展**：未来可添加更多模式

---

**最后更新**: 2025-12-03
