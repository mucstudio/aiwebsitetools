"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"

export default function AIConfigPage() {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [models, setModels] = useState<any[]>([])
  const [configuredModels, setConfiguredModels] = useState<any[]>([])

  const [formData, setFormData] = useState({
    primaryModelId: "",
    fallback1ModelId: "",
    fallback2ModelId: "",
    retryAttempts: "3",
    timeoutSeconds: "30",
    enableFallback: true,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setFetching(true)

      // Fetch all active models
      const modelsResponse = await fetch("/api/admin/ai-models")
      if (modelsResponse.ok) {
        const modelsData = await modelsResponse.json()
        setModels(modelsData.models.filter((m: any) => m.isActive && m.provider.isActive))
      }

      // Fetch current config
      const configResponse = await fetch("/api/admin/ai-config")
      if (configResponse.ok) {
        const configData = await configResponse.json()
        if (configData.config) {
          setFormData({
            primaryModelId: configData.config.primaryModelId || "",
            fallback1ModelId: configData.config.fallback1ModelId || "",
            fallback2ModelId: configData.config.fallback2ModelId || "",
            retryAttempts: configData.config.retryAttempts.toString(),
            timeoutSeconds: configData.config.timeoutSeconds.toString(),
            enableFallback: configData.config.enableFallback,
          })
          setConfiguredModels(configData.models || [])
        }
      }
    } catch (err) {
      console.error("Failed to fetch data:", err)
      setError("加载配置失败")
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/admin/ai-config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          primaryModelId: formData.primaryModelId || undefined,
          fallback1ModelId: formData.fallback1ModelId || undefined,
          fallback2ModelId: formData.fallback2ModelId || undefined,
          retryAttempts: parseInt(formData.retryAttempts),
          timeoutSeconds: parseInt(formData.timeoutSeconds),
          enableFallback: formData.enableFallback,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "保存失败")
      }

      setSuccess("配置保存成功")
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败，请重试")
    } finally {
      setLoading(false)
    }
  }

  const getModelInfo = (modelId: string) => {
    return models.find((m) => m.id === modelId)
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">AI 全局配置</h1>
        <p className="text-muted-foreground">配置主模型和备用模型，实现故障转移</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>模型选择</CardTitle>
              <CardDescription>
                选择主模型和备用模型。当主模型失败时，系统会自动切换到备用模型。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Primary Model */}
              <div className="space-y-2">
                <Label htmlFor="primaryModelId">主模型 *</Label>
                <select
                  id="primaryModelId"
                  value={formData.primaryModelId}
                  onChange={(e) => setFormData({ ...formData, primaryModelId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">选择主模型</option>
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.provider.name} - {model.name} (${model.inputPrice}/${model.outputPrice} per M tokens)
                    </option>
                  ))}
                </select>
                {formData.primaryModelId && getModelInfo(formData.primaryModelId) && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900">
                          {getModelInfo(formData.primaryModelId)?.name}
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                          {getModelInfo(formData.primaryModelId)?.description}
                        </p>
                        <div className="flex gap-3 mt-2 text-xs text-blue-700">
                          <span>上下文: {getModelInfo(formData.primaryModelId)?.contextWindow.toLocaleString()}</span>
                          <span>最大输出: {getModelInfo(formData.primaryModelId)?.maxTokens.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Fallback Model 1 */}
              <div className="space-y-2">
                <Label htmlFor="fallback1ModelId">备用模型 1</Label>
                <select
                  id="fallback1ModelId"
                  value={formData.fallback1ModelId}
                  onChange={(e) => setFormData({ ...formData, fallback1ModelId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  disabled={!formData.enableFallback}
                >
                  <option value="">不使用备用模型 1</option>
                  {models
                    .filter((m) => m.id !== formData.primaryModelId)
                    .map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.provider.name} - {model.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Fallback Model 2 */}
              <div className="space-y-2">
                <Label htmlFor="fallback2ModelId">备用模型 2</Label>
                <select
                  id="fallback2ModelId"
                  value={formData.fallback2ModelId}
                  onChange={(e) => setFormData({ ...formData, fallback2ModelId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  disabled={!formData.enableFallback}
                >
                  <option value="">不使用备用模型 2</option>
                  {models
                    .filter((m) => m.id !== formData.primaryModelId && m.id !== formData.fallback1ModelId)
                    .map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.provider.name} - {model.name}
                      </option>
                    ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>故障转移配置</CardTitle>
              <CardDescription>配置重试和超时参数</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableFallback">启用故障转移</Label>
                  <p className="text-xs text-muted-foreground">
                    主模型失败时自动切换到备用模型
                  </p>
                </div>
                <Switch
                  id="enableFallback"
                  checked={formData.enableFallback}
                  onCheckedChange={(checked) => setFormData({ ...formData, enableFallback: checked })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="retryAttempts">重试次数</Label>
                  <Input
                    id="retryAttempts"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.retryAttempts}
                    onChange={(e) => setFormData({ ...formData, retryAttempts: e.target.value })}
                    required
                  />
                  <p className="text-xs text-muted-foreground">单个模型的重试次数</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeoutSeconds">超时时间（秒）</Label>
                  <Input
                    id="timeoutSeconds"
                    type="number"
                    min="5"
                    max="300"
                    value={formData.timeoutSeconds}
                    onChange={(e) => setFormData({ ...formData, timeoutSeconds: e.target.value })}
                    required
                  />
                  <p className="text-xs text-muted-foreground">API 请求超时时间</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="p-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 text-sm text-green-500 bg-green-50 border border-green-200 rounded-md flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              保存配置
            </Button>
          </div>
        </div>
      </form>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md max-w-3xl">
        <h3 className="font-semibold mb-2">💡 故障转移机制</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• <strong>主模型</strong>：默认使用的 AI 模型</li>
          <li>• <strong>备用模型 1</strong>：主模型失败时自动切换</li>
          <li>• <strong>备用模型 2</strong>：备用模型 1 也失败时使用</li>
          <li>• 每个模型会重试指定次数后才切换到下一个</li>
          <li>• 所有模型都失败后会返回错误</li>
          <li>• 使用日志会记录实际使用的模型和故障转移情况</li>
        </ul>
      </div>

      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md max-w-3xl">
        <h3 className="font-semibold mb-2">⚠️ 注意事项</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• 建议主模型和备用模型来自不同供应商，提高可用性</li>
          <li>• 备用模型的定价可能不同，注意成本控制</li>
          <li>• 修改配置后立即生效，影响所有新的 AI 调用</li>
          <li>• 定期检查使用日志，了解故障转移频率</li>
        </ul>
      </div>
    </div>
  )
}
