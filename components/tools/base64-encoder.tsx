"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Base64EncoderProps {
  toolId: string
  config?: any
}

export default function Base64Encoder({ toolId, config }: Base64EncoderProps) {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [error, setError] = useState("")
  const [mode, setMode] = useState<"encode" | "decode">("encode")

  const handleEncode = () => {
    if (!input.trim()) {
      setError("请输入要编码的文本")
      return
    }

    try {
      setError("")
      const encoded = btoa(unescape(encodeURIComponent(input)))
      setOutput(encoded)
    } catch (err) {
      setError("编码失败，请检查输入内容")
    }
  }

  const handleDecode = () => {
    if (!input.trim()) {
      setError("请输入要解码的 Base64 字符串")
      return
    }

    try {
      setError("")
      const decoded = decodeURIComponent(escape(atob(input)))
      setOutput(decoded)
    } catch (err) {
      setError("解码失败，请确保输入的是有效的 Base64 字符串")
    }
  }

  const handleProcess = () => {
    if (mode === "encode") {
      handleEncode()
    } else {
      handleDecode()
    }
  }

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output)
      alert("已复制到剪贴板")
    }
  }

  const handleClear = () => {
    setInput("")
    setOutput("")
    setError("")
  }

  const handleSwap = () => {
    setInput(output)
    setOutput("")
    setMode(mode === "encode" ? "decode" : "encode")
  }

  return (
    <div className="space-y-6">
      {/* 模式选择 */}
      <Card>
        <CardHeader>
          <CardTitle>选择模式</CardTitle>
          <CardDescription>选择编码或解码模式</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={(v) => setMode(v as "encode" | "decode")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="encode">编码 (Encode)</TabsTrigger>
              <TabsTrigger value="decode">解码 (Decode)</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* 输入区域 */}
      <Card>
        <CardHeader>
          <CardTitle>{mode === "encode" ? "输入文本" : "输入 Base64"}</CardTitle>
          <CardDescription>
            {mode === "encode"
              ? "在下方输入需要编码的文本"
              : "在下方输入需要解码的 Base64 字符串"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "encode" ? "输入文本..." : "输入 Base64 字符串..."}
            rows={8}
            className="font-mono"
          />
          <div className="flex gap-2 mt-4">
            <Button onClick={handleProcess}>
              {mode === "encode" ? "编码" : "解码"}
            </Button>
            <Button onClick={handleClear} variant="outline">
              清除
            </Button>
            {output && (
              <Button onClick={handleSwap} variant="outline">
                交换输入输出
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 输出区域 */}
      {output && (
        <Card>
          <CardHeader>
            <CardTitle>{mode === "encode" ? "Base64 结果" : "解码结果"}</CardTitle>
            <CardDescription>
              {mode === "encode" ? "编码后的 Base64 字符串" : "解码后的文本"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={output}
              readOnly
              rows={8}
              className="font-mono bg-gray-50"
            />
            <div className="flex gap-2 mt-4">
              <Button onClick={handleCopy}>
                复制结果
              </Button>
              <div className="text-sm text-muted-foreground flex items-center ml-auto">
                长度: {output.length} 字符
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 错误提示 */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 使用说明 */}
      <Alert>
        <AlertDescription>
          <strong>使用说明：</strong>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li><strong>编码模式：</strong>将普通文本转换为 Base64 编码字符串</li>
            <li><strong>解码模式：</strong>将 Base64 编码字符串还原为普通文本</li>
            <li><strong>支持 UTF-8：</strong>完整支持中文和其他 Unicode 字符</li>
            <li><strong>交换功能：</strong>可以快速将输出结果作为新的输入</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  )
}
