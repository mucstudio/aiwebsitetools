"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EmojiPicker } from "@/components/ui/emoji-picker"
import { Loader2 } from "lucide-react"

export default function EditCategoryPage() {
  const router = useRouter()
  const params = useParams()
  const categoryId = params.id as string

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState("")
  const [categories, setCategories] = useState<Array<{ id: string; name: string; parentId: string | null }>>([])
  const [fetchingCategories, setFetchingCategories] = useState(true)

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "",
    order: "0",
    parentId: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all categories for parent selection
        const categoriesResponse = await fetch("/api/admin/categories")
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          // Filter out current category and its children from parent options
          setCategories(categoriesData.categories.filter((cat: any) =>
            !cat.parentId && cat.id !== categoryId
          ))
        }
        setFetchingCategories(false)

        // Fetch current category
        const response = await fetch(`/api/admin/categories/${categoryId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch category")
        }

        const data = await response.json()
        const category = data.category

        setFormData({
          name: category.name,
          slug: category.slug,
          description: category.description || "",
          icon: category.icon || "",
          order: category.order.toString(),
          parentId: category.parentId || "none",
        })
      } catch (err) {
        setError("加载分类失败")
      } finally {
        setFetching(false)
      }
    }

    fetchData()
  }, [categoryId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          description: formData.description || undefined,
          icon: formData.icon || undefined,
          order: parseInt(formData.order),
          parentId: formData.parentId && formData.parentId !== "none" ? formData.parentId : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "更新失败")
      }

      router.push("/admin/categories")
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
        <h1 className="text-3xl font-bold">编辑分类</h1>
        <p className="text-muted-foreground">修改分类信息</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>分类的基本信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">分类名称 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如: Text Tools"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL 标识 *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="例如: text-tools"
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
                  placeholder="例如: Text processing and editing tools"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">图标 (Emoji)</Label>
                <EmojiPicker
                  value={formData.icon}
                  onChange={(emoji) => setFormData({ ...formData, icon: emoji })}
                />
                <p className="text-xs text-muted-foreground">选择一个 emoji 图标</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentId">父分类（可选）</Label>
                <Select
                  value={formData.parentId}
                  onValueChange={(value) => setFormData({ ...formData, parentId: value })}
                  disabled={fetchingCategories}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择父分类（留空为一级分类）" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">无（一级分类）</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">选择父分类后，此分类将成为二级分类</p>
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
              onClick={() => router.push("/admin/categories")}
            >
              取消
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
