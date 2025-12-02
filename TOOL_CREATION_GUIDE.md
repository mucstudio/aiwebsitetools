# 工具创建完整指南

## 快速开始（3步创建工具）

### 步骤 1：创建工具组件文件

在 `components/tools/` 目录下创建新文件，例如 `json-formatter.tsx`：

```tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface JsonFormatterProps {
  toolId: string
  config?: any
}

export default function JsonFormatter({ toolId, config }: JsonFormatterProps) {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")

  const formatJson = () => {
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed, null, 2))
    } catch (error) {
      setOutput("Invalid JSON")
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>输入 JSON</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="粘贴 JSON 代码..."
            rows={10}
          />
          <Button onClick={formatJson} className="mt-4">
            格式化
          </Button>
        </CardContent>
      </Card>

      {output && (
        <Card>
          <CardHeader>
            <CardTitle>格式化结果</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea value={output} readOnly rows={10} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

### 步骤 2：在后台添加工具

1. 访问 `/admin/tools/new`
2. 填写表单：
   - **工具名称**: JSON Formatter
   - **URL 标识**: json-formatter
   - **描述**: Format and beautify JSON code
   - **分类**: 选择一个分类
   - **组件类型**: `json-formatter` ⚠️ **必须与文件名一致（不含.tsx）**
   - **图标**: 📝
   - **SEO 标题**: Free JSON Formatter Online
   - **SEO 描述**: Format and beautify JSON code online
   - **标签**: json, formatter, beautify
   - **发布工具**: ✅ 勾选

3. 点击"创建工具"

### 步骤 3：访问工具

访问 `http://localhost:3000/tools/json-formatter` 即可使用

---

## 现有工具组件列表

以下组件已创建，可直接在后台使用：

| 组件文件名 | componentType 值 | 功能 |
|-----------|-----------------|------|
| `word-counter.tsx` | `word-counter` | 字数统计 |
| `case-converter.tsx` | `case-converter` | 大小写转换 |
| `base64-encoder.tsx` | `base64-encoder` | Base64 编码/解码 |

---

## 工具组件模板

### 模板 1：简单文本处理工具

```tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface ToolNameProps {
  toolId: string
  config?: any
}

export default function ToolName({ toolId, config }: ToolNameProps) {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")

  const processText = () => {
    // 你的处理逻辑
    const result = input.toUpperCase() // 示例
    setOutput(result)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>输入</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={8}
          />
          <Button onClick={processText} className="mt-4">
            处理
          </Button>
        </CardContent>
      </Card>

      {output && (
        <Card>
          <CardHeader>
            <CardTitle>结果</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea value={output} readOnly rows={8} />
            <Button
              onClick={() => navigator.clipboard.writeText(output)}
              className="mt-4"
            >
              复制
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

### 模板 2：带多个选项的工具

```tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ToolNameProps {
  toolId: string
  config?: any
}

export default function ToolName({ toolId, config }: ToolNameProps) {
  const [mode, setMode] = useState<"option1" | "option2">("option1")

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>选择模式</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="option1">选项 1</TabsTrigger>
              <TabsTrigger value="option2">选项 2</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* 工具内容 */}
    </div>
  )
}
```

---

## 常见问题

### Q: 为什么工具加载失败？

**A:** 检查以下几点：
1. 组件文件名必须与 `componentType` 完全一致
2. 文件必须在 `components/tools/` 目录下
3. 组件必须 export default
4. 组件必须接收 `toolId` 和 `config` props

### Q: 如何添加图标？

**A:** 在后台"图标"字段输入 emoji，例如：📝 🔧 🎨 📊

### Q: 如何让工具显示在首页？

**A:** 在后台编辑工具，勾选"发布工具"

### Q: 如何修改工具？

**A:**
1. 修改组件文件：`components/tools/your-tool.tsx`
2. 修改工具信息：访问 `/admin/tools` → 点击"编辑"

---

## 可用的 UI 组件

你可以在工具中使用以下组件：

```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
```

---

## 完整示例：URL 编码器

**文件**: `components/tools/url-encoder.tsx`

```tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface UrlEncoderProps {
  toolId: string
  config?: any
}

export default function UrlEncoder({ toolId, config }: UrlEncoderProps) {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [mode, setMode] = useState<"encode" | "decode">("encode")

  const process = () => {
    try {
      if (mode === "encode") {
        setOutput(encodeURIComponent(input))
      } else {
        setOutput(decodeURIComponent(input))
      }
    } catch (error) {
      setOutput("处理失败")
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>模式选择</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="encode">编码</TabsTrigger>
              <TabsTrigger value="decode">解码</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>输入</CardTitle>
          <CardDescription>
            {mode === "encode" ? "输入要编码的 URL" : "输入要解码的 URL"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={6}
          />
          <div className="flex gap-2 mt-4">
            <Button onClick={process}>
              {mode === "encode" ? "编码" : "解码"}
            </Button>
            <Button onClick={() => { setInput(""); setOutput("") }} variant="outline">
              清除
            </Button>
          </div>
        </CardContent>
      </Card>

      {output && (
        <Card>
          <CardHeader>
            <CardTitle>结果</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea value={output} readOnly rows={6} className="bg-gray-50" />
            <Button
              onClick={() => navigator.clipboard.writeText(output)}
              className="mt-4"
            >
              复制结果
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

**后台配置**:
- 组件类型: `url-encoder`
- 其他字段按需填写

---

## 需要帮助？

如果遇到问题：
1. 检查浏览器控制台错误
2. 确认文件名和 componentType 一致
3. 确认组件语法正确
4. 查看本文档的模板和示例
