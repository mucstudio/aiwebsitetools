"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

export default function NewAIProviderPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    type: "openai" as "openai" | "anthropic" | "google" | "custom",
    apiEndpoint: "https://api.openai.com/v1",
    apiKey: "",
    description: "",
    order: "0",
  })

  const providerTypes = [
    { value: "openai", label: "OpenAI", endpoint: "https://api.openai.com/v1" },
    { value: "anthropic", label: "Anthropic", endpoint: "https://api.anthropic.com/v1" },
    { value: "google", label: "Google AI", endpoint: "https://generativelanguage.googleapis.com/v1" },
    { value: "custom", label: "Custom (OpenAI Compatible)", endpoint: "" },
  ]

  const handleTypeChange = (type: string) => {
    const provider = providerTypes.find((p) => p.value === type)
    setFormData({
      ...formData,
      type: type as any,
      apiEndpoint: provider?.endpoint || "",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/admin/ai-providers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          order: parseInt(formData.order),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "创建失败")
      }

      router.push("/admin/ai-providers")
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建失败，请重试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">添加 AI 供应商</h1>
        <p className="text-muted-foreground">配置新的 AI 模型供应商</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>供应商的基本配置</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">供应商名称 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如: OpenAI"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">标识符 *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="例如: openai"
                  required
                />
                <p className="text-xs text-muted-foreground">用于内部标识，只能包含小写字母、数字和连字符</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">供应商类型 *</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  {providerTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  选择供应商类型，Custom 类型需要兼容 OpenAI API 格式
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiEndpoint">API 端点 *</Label>
                <Input
                  id="apiEndpoint"
                  type="url"
                  value={formData.apiEndpoint}
                  onChange={(e) => setFormData({ ...formData, apiEndpoint: e.target.value })}
                  placeholder="https://api.openai.com/v1"
                  required
                />
                <p className="text-xs text-muted-foreground">API 的基础 URL</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key *</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  placeholder="sk-..."
                  required
                />
                <p className="text-xs text-muted-foreground">API 密钥将被加密存储</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="供应商的描述信息"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">显示顺序</Label>
                <Input
                  id="order"
                  type="number"
                  min="0"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">数字越小越靠前</p>
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="p-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              创建供应商
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/ai-providers")}
            >
              取消
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
