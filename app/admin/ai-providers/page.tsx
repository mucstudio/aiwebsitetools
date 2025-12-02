"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

interface AIModel {
  id: string
  name: string
  modelId: string
  isActive: boolean
  inputPrice: number
  outputPrice: number
  maxTokens: number
}

interface AIProvider {
  id: string
  name: string
  type: string
  apiEndpoint: string
  description: string | null
  isActive: boolean
  createdAt: string
  _count: {
    models: number
  }
  models?: AIModel[]
}

export default function AIProvidersPage() {
  const [providers, setProviders] = useState<AIProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchingModels, setFetchingModels] = useState<string | null>(null)

  useEffect(() => {
    fetchProvidersWithModels()
  }, [])

  const fetchProvidersWithModels = async () => {
    try {
      const response = await fetch('/api/admin/ai-providers')
      if (response.ok) {
        const data = await response.json()

        // 同时获取每个供应商的模型
        const providersWithModels = await Promise.all(
          data.providers.map(async (provider: AIProvider) => {
            if (provider._count.models > 0) {
              const modelsResponse = await fetch(`/api/admin/ai-models?providerId=${provider.id}`)
              if (modelsResponse.ok) {
                const modelsData = await modelsResponse.json()
                return { ...provider, models: modelsData.models }
              }
            }
            return provider
          })
        )

        setProviders(providersWithModels)
      }
    } catch (error) {
      console.error('Failed to fetch providers:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchModels = async (providerId: string) => {
    setFetchingModels(providerId)
    try {
      const response = await fetch(`/api/admin/ai-providers/${providerId}/fetch-models`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        alert(`成功获取 ${data.summary.created} 个新模型，更新 ${data.summary.updated} 个模型`)
        await fetchProvidersWithModels()
      } else {
        const error = await response.json()
        alert(`获取模型失败: ${error.error}`)
      }
    } catch (error) {
      alert('获取模型失败，请检查网络连接')
    } finally {
      setFetchingModels(null)
    }
  }

  const toggleProvider = async (providerId: string) => {
    try {
      const response = await fetch(`/api/admin/ai-providers/${providerId}/toggle`, {
        method: 'POST'
      })

      if (response.ok) {
        await fetchProvidersWithModels()
      }
    } catch (error) {
      alert('操作失败')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">AI 供应商管理</h1>
          <p className="text-muted-foreground">管理 AI 模型供应商和 API 配置</p>
        </div>
        <Link href="/admin/ai-providers/new">
          <Button>+ 添加供应商</Button>
        </Link>
      </div>

      {providers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">暂无 AI 供应商</p>
            <Link href="/admin/ai-providers/new">
              <Button>添加第一个供应商</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {providers.map((provider) => (
            <Card key={provider.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle>{provider.name}</CardTitle>
                      <Badge variant={provider.isActive ? "default" : "secondary"}>
                        {provider.isActive ? "已启用" : "已禁用"}
                      </Badge>
                      <Badge variant="outline">{provider.type.toUpperCase()}</Badge>
                    </div>
                    {provider.description && (
                      <CardDescription>{provider.description}</CardDescription>
                    )}
                    <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                      <span>模型数量: {provider._count.models}</span>
                      <span>API 端点: {provider.apiEndpoint}</span>
                      <span>创建时间: {new Date(provider.createdAt).toLocaleDateString('zh-CN')}</span>
                    </div>

                    {/* 模型列表 - 一行显示 */}
                    {provider.models && provider.models.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-xs text-muted-foreground mb-2">模型列表:</div>
                        <div className="flex flex-wrap gap-2">
                          {provider.models.map((model) => (
                            <Badge key={model.id} variant={model.isActive ? "default" : "secondary"}>
                              {model.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/ai-providers/${provider.id}/edit`}>
                      <Button variant="outline" size="sm">编辑</Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchModels(provider.id)}
                      disabled={fetchingModels === provider.id}
                    >
                      {fetchingModels === provider.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          获取中...
                        </>
                      ) : (
                        '获取模型'
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleProvider(provider.id)}
                    >
                      {provider.isActive ? "禁用" : "启用"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="font-semibold mb-2">💡 使用提示</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• 添加供应商后，点击"获取模型"按钮自动拉取该供应商的所有可用模型</li>
          <li>• 模型会直接显示在供应商卡片下方</li>
          <li>• 支持的供应商类型：OpenAI、Anthropic、Google、Custom（OpenAI 兼容）</li>
          <li>• API Key 会被加密存储，确保安全</li>
        </ul>
      </div>
    </div>
  )
}
