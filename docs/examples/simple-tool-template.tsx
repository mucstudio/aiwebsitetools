/**
 * 简单工具模板
 *
 * 使用方法：
 * 1. 复制此文件到 components/tools/ 目录
 * 2. 重命名为你的工具名，例如：my-tool.tsx
 * 3. 修改组件名和功能
 * 4. 在后台添加工具，componentType 设置为文件名（不含.tsx）
 */

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface MyToolProps {
  toolId: string
  config?: any
}

export default function MyTool({ toolId, config }: MyToolProps) {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")

  const processText = () => {
    // 在这里添加你的处理逻辑
    const result = input.toUpperCase() // 示例：转大写
    setOutput(result)
  }

  return (
    <div className="space-y-6">
      {/* 输入卡片 */}
      <Card>
        <CardHeader>
          <CardTitle>输入文本</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="在此输入..."
            rows={8}
          />
          <Button onClick={processText} className="mt-4">
            处理
          </Button>
        </CardContent>
      </Card>

      {/* 输出卡片 */}
      {output && (
        <Card>
          <CardHeader>
            <CardTitle>处理结果</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea value={output} readOnly rows={8} className="bg-gray-50" />
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
