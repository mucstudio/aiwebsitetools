"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Loader2, X } from "lucide-react"

export default function EditToolPage() {
  const router = useRouter()
  const params = useParams()
  const toolId = params.id as string

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState("")
  const [categories, setCategories] = useState<any[]>([])
  const [tagInput, setTagInput] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    categoryId: "",
    componentType: "",
    icon: "",
    isPremium: false,
    isPublished: false,
    seoTitle: "",
    seoDescription: "",
    tags: [] as string[],
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await fetch("/api/admin/categories")
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          setCategories(categoriesData.categories)
        }

        // Fetch tool
        const toolResponse = await fetch(`/api/admin/tools/${toolId}`)
        if (!toolResponse.ok) {
          throw new Error("Failed to fetch tool")
        }

        const toolData = await toolResponse.json()
        const tool = toolData.tool

        setFormData({
          name: tool.name,
          slug: tool.slug,
          description: tool.description,
          categoryId: tool.categoryId,
          componentType: tool.componentType,
          icon: tool.icon || "",
          isPremium: tool.isPremium,
          isPublished: tool.isPublished,
          seoTitle: tool.seoTitle || "",
          seoDescription: tool.seoDescription || "",
          tags: tool.tags || [],
        })
      } catch (err) {
        setError("加载工具失败")
      } finally {
        setFetching(false)
      }
    }

    fetchData()
  }, [toolId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/admin/tools/${toolId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "更新失败")
      }

      router.push("/admin/tools")
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新失败，请重试")
    } finally {
      setLoading(false)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] })
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    })
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
        <h1 className="text-3xl font-bold">编辑工具</h1>
        <p className="text-muted-foreground">修改工具信息</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>工具的基本信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">工具名称 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如: Word Counter"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL 标识 *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="例如: word-counter"
                  required
                />
                <p className="text-xs text-muted-foreground">用于 URL，只能包含小写字母、数字和连字符</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">描述 *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="例如: Count words, characters, sentences, and paragraphs in your text"
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">分类 *</Label>
                <select
                  id="categoryId"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">选择分类</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="componentType">组件类型 *</Label>
                <Input
                  id="componentType"
                  value={formData.componentType}
                  onChange={(e) => setFormData({ ...formData, componentType: e.target.value })}
                  placeholder="例如: word-counter"
                  required
                />
                <p className="text-xs text-muted-foreground">用于加载对应的工具组件</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">图标 (Emoji)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="例如: 📝"
                  maxLength={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO 设置</CardTitle>
              <CardDescription>搜索引擎优化设置</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">SEO 标题</Label>
                <Input
                  id="seoTitle"
                  value={formData.seoTitle}
                  onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                  placeholder="例如: Free Word Counter - Count Words & Characters Online"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoDescription">SEO 描述</Label>
                <Textarea
                  id="seoDescription"
                  value={formData.seoDescription}
                  onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                  placeholder="例如: Free online word counter tool. Count words, characters, sentences, and paragraphs instantly."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">标签</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addTag()
                      }
                    }}
                    placeholder="输入标签后按回车"
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    添加
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-gray-100 rounded-md"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>发布设置</CardTitle>
              <CardDescription>工具的发布和访问设置</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isPremium">付费工具</Label>
                  <p className="text-xs text-muted-foreground">需要付费订阅才能使用</p>
                </div>
                <Switch
                  id="isPremium"
                  checked={formData.isPremium}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPremium: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isPublished">发布工具</Label>
                  <p className="text-xs text-muted-foreground">在前端显示此工具</p>
                </div>
                <Switch
                  id="isPublished"
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                />
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
              onClick={() => router.push("/admin/tools")}
            >
              取消
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
