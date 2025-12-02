"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export default function EditPlanPage() {
  const router = useRouter()
  const params = useParams()
  const planId = params.id as string

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState("")
  const [features, setFeatures] = useState<string[]>([''])

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: "0",
    interval: "month",
    stripePriceId: "",
    dailyUsage: "10",
    order: "0",
    isActive: true,
  })

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await fetch(`/api/admin/plans/${planId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch plan")
        }

        const data = await response.json()
        const plan = data.plan

        setFormData({
          name: plan.name,
          slug: plan.slug,
          description: plan.description || "",
          price: plan.price.toString(),
          interval: plan.interval,
          stripePriceId: plan.stripePriceId || "",
          dailyUsage: (plan.limits as any)?.dailyUsage?.toString() || "10",
          order: plan.order.toString(),
          isActive: plan.isActive,
        })

        setFeatures(Array.isArray(plan.features) && plan.features.length > 0 ? plan.features : [''])
      } catch (err) {
        setError("加载计划失败")
      } finally {
        setFetching(false)
      }
    }

    fetchPlan()
  }, [planId])

  const handleAddFeature = () => {
    setFeatures([...features, ''])
  }

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index))
  }

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...features]
    newFeatures[index] = value
    setFeatures(newFeatures)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/admin/plans/${planId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          price: parseFloat(formData.price),
          interval: formData.interval,
          stripePriceId: formData.stripePriceId || null,
          features: features.filter(f => f.trim() !== ''),
          limits: {
            dailyUsage: parseInt(formData.dailyUsage),
            toolAccess: parseFloat(formData.price) === 0 ? 'basic' : 'all',
          },
          order: parseInt(formData.order),
          isActive: formData.isActive,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "更新失败")
      }

      router.push("/admin/plans")
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新失败，请重试")
    } finally {
      setLoading(false)
    }
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
        <h1 className="text-3xl font-bold">编辑计划</h1>
        <p className="text-muted-foreground">修改订阅计划信息</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>计划的基本信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">计划名称 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如: Pro"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL 标识 *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="例如: pro"
                  required
                />
                <p className="text-xs text-muted-foreground">用于 URL，只能包含小写字母、数字和连字符</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="例如: 适合专业用户"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="isActive">启用此计划</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>定价信息</CardTitle>
              <CardDescription>设置计划的价格和计费周期</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">价格 (USD) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interval">计费周期 *</Label>
                  <select
                    id="interval"
                    value={formData.interval}
                    onChange={(e) => setFormData({ ...formData, interval: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  >
                    <option value="month">月付</option>
                    <option value="year">年付</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stripePriceId">Stripe Price ID</Label>
                <Input
                  id="stripePriceId"
                  value={formData.stripePriceId}
                  onChange={(e) => setFormData({ ...formData, stripePriceId: e.target.value })}
                  placeholder="price_xxxxxxxxxxxxx"
                />
                <p className="text-xs text-muted-foreground">从 Stripe 控制台获取</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>功能列表</CardTitle>
              <CardDescription>列出此计划包含的功能</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    placeholder="例如: 访问所有工具"
                  />
                  {features.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveFeature(index)}
                    >
                      删除
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddFeature}
              >
                + 添加功能
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>使用限制</CardTitle>
              <CardDescription>设置计划的使用限制</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dailyUsage">每日使用次数</Label>
                <Input
                  id="dailyUsage"
                  type="number"
                  min="-1"
                  value={formData.dailyUsage}
                  onChange={(e) => setFormData({ ...formData, dailyUsage: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">-1 表示无限制</p>
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
              保存更改
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/plans")}
            >
              取消
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
