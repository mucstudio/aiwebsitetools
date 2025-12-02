"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CaseConverterProps {
  toolId: string
  config?: any
}

export default function CaseConverter({ toolId, config }: CaseConverterProps) {
  const [inputText, setInputText] = useState("")
  const [outputText, setOutputText] = useState("")
  const [error, setError] = useState("")

  const convertCase = (type: string) => {
    if (!inputText.trim()) {
      setError("请输入文本")
      return
    }

    setError("")
    let result = ""

    switch (type) {
      case "uppercase":
        result = inputText.toUpperCase()
        break
      case "lowercase":
        result = inputText.toLowerCase()
        break
      case "capitalize":
        result = inputText.replace(/\b\w/g, (char) => char.toUpperCase())
        break
      case "sentence":
        result = inputText.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (char) => char.toUpperCase())
        break
      case "toggle":
        result = inputText.split('').map(char => {
          return char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()
        }).join('')
        break
      case "camel":
        result = inputText
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
        break
      case "snake":
        result = inputText
          .replace(/\s+/g, '_')
          .replace(/[A-Z]/g, (char) => '_' + char.toLowerCase())
          .replace(/^_/, '')
          .toLowerCase()
        break
      case "kebab":
        result = inputText
          .replace(/\s+/g, '-')
          .replace(/[A-Z]/g, (char) => '-' + char.toLowerCase())
          .replace(/^-/, '')
          .toLowerCase()
        break
      default:
        result = inputText
    }

    setOutputText(result)
  }

  const handleCopy = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText)
      alert("文本已复制到剪贴板")
    }
  }

  const handleClear = () => {
    setInputText("")
    setOutputText("")
    setError("")
  }

  return (
    <div className="space-y-6">
      {/* 输入区域 */}
      <Card>
        <CardHeader>
          <CardTitle>输入文本</CardTitle>
          <CardDescription>在下方输入需要转换的文本</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="在此输入文本..."
            rows={6}
          />
        </CardContent>
      </Card>

      {/* 转换按钮 */}
      <Card>
        <CardHeader>
          <CardTitle>选择转换类型</CardTitle>
          <CardDescription>点击按钮转换文本格式</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <Button onClick={() => convertCase("uppercase")} variant="outline">
              全部大写
            </Button>
            <Button onClick={() => convertCase("lowercase")} variant="outline">
              全部小写
            </Button>
            <Button onClick={() => convertCase("capitalize")} variant="outline">
              首字母大写
            </Button>
            <Button onClick={() => convertCase("sentence")} variant="outline">
              句首大写
            </Button>
            <Button onClick={() => convertCase("toggle")} variant="outline">
              切换大小写
            </Button>
            <Button onClick={() => convertCase("camel")} variant="outline">
              驼峰命名
            </Button>
            <Button onClick={() => convertCase("snake")} variant="outline">
              蛇形命名
            </Button>
            <Button onClick={() => convertCase("kebab")} variant="outline">
              短横线命名
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 输出区域 */}
      {outputText && (
        <Card>
          <CardHeader>
            <CardTitle>转换结果</CardTitle>
            <CardDescription>转换后的文本</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={outputText}
              readOnly
              rows={6}
              className="font-mono bg-gray-50"
            />
            <div className="flex gap-2 mt-4">
              <Button onClick={handleCopy}>
                复制结果
              </Button>
              <Button onClick={handleClear} variant="outline">
                清除全部
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 使用说明 */}
      <Alert>
        <AlertDescription>
          <strong>转换类型说明：</strong>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li><strong>全部大写：</strong> HELLO WORLD</li>
            <li><strong>全部小写：</strong> hello world</li>
            <li><strong>首字母大写：</strong> Hello World</li>
            <li><strong>句首大写：</strong> Hello world. This is a test.</li>
            <li><strong>驼峰命名：</strong> helloWorld</li>
            <li><strong>蛇形命名：</strong> hello_world</li>
            <li><strong>短横线命名：</strong> hello-world</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  )
}
