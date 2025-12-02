"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Loader2, X, BookOpen, Code2, Lightbulb } from "lucide-react"
import Link from "next/link"

export default function NewToolPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [categories, setCategories] = useState<any[]>([])
  const [tagInput, setTagInput] = useState("")

  const defaultComponentCode = `"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ToolProps {
  toolId: string
  config?: any
}

export default function MyTool({ toolId, config }: ToolProps) {
  const [input, setInput] = useState("")
  const [result, setResult] = useState("")

  const handleProcess = () => {
    // 在这里实现你的工具逻辑
    setResult(input)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>输入</CardTitle>
          <CardDescription>输入你的内容</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="input">输入内容</Label>
            <Input
              id="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入内容..."
            />
          </div>
          <Button onClick={handleProcess}>处理</Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>结果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gray-50 rounded-lg">
              {result}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}`

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
    componentCode: defaultComponentCode,
  })

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/admin/categories")
        if (response.ok) {
          const data = await response.json()
          setCategories(data.categories)
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err)
      }
    }

    fetchCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/admin/tools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "创建失败")
      }

      router.push("/admin/tools")
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建失败，请重试")
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">创建新工具</h1>
        <p className="text-muted-foreground">添加新的在线工具</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧表单 */}
        <form onSubmit={handleSubmit} className="lg:col-span-2">
          <div className="grid gap-6">
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
                  {categories
                    .filter((cat) => !cat.parentId)
                    .map((parentCategory) => (
                      <>
                        <option key={parentCategory.id} value={parentCategory.id}>
                          {parentCategory.name}
                        </option>
                        {categories
                          .filter((cat) => cat.parentId === parentCategory.id)
                          .map((childCategory) => (
                            <option key={childCategory.id} value={childCategory.id}>
                              &nbsp;&nbsp;└─ {childCategory.name}
                            </option>
                          ))}
                      </>
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
              <CardTitle>组件代码 *</CardTitle>
              <CardDescription>直接在这里编写 React 组件代码，系统会自动保存到文件</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="componentCode">React 组件代码</Label>
                <Textarea
                  id="componentCode"
                  value={formData.componentCode}
                  onChange={(e) => setFormData({ ...formData, componentCode: e.target.value })}
                  placeholder="输入 React 组件代码..."
                  rows={20}
                  className="font-mono text-sm"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  💡 提示：组件必须导出为 default，接收 toolId 和 config 参数。已提供默认模板，可以直接修改使用。
                </p>
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
              创建工具
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

        {/* 右侧教程侧边栏 */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                快速指南
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 步骤指南 */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm">1</span>
                  填写基本信息
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1 ml-8">
                  <li>• 工具名称和描述</li>
                  <li>• URL 标识（slug）</li>
                  <li>• 选择分类</li>
                  <li>• 添加图标（可选）</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm">2</span>
                  编写组件代码
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1 ml-8">
                  <li>• 使用提供的模板</li>
                  <li>• 实现工具逻辑</li>
                  <li>• 使用 UI 组件</li>
                  <li>• 导出为 default</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm">3</span>
                  配置 SEO
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1 ml-8">
                  <li>• SEO 标题和描述</li>
                  <li>• 添加相关标签</li>
                  <li>• 优化搜索排名</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm">4</span>
                  发布设置
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1 ml-8">
                  <li>• 选择是否付费</li>
                  <li>• 决定是否立即发布</li>
                  <li>• 提交创建</li>
                </ul>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  重要提示
                </h3>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p className="bg-yellow-50 border border-yellow-200 rounded p-2">
                    <strong className="text-yellow-800">组件类型</strong>必须与文件名一致，例如：<code className="text-xs bg-white px-1 py-0.5 rounded">word-counter</code>
                  </p>
                  <p className="bg-blue-50 border border-blue-200 rounded p-2">
                    组件代码会自动保存到 <code className="text-xs bg-white px-1 py-0.5 rounded">components/tools/</code> 目录
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Code2 className="h-4 w-4" />
                  可用组件库
                </h3>
                <div className="text-xs space-y-2">
                  <div>
                    <p className="font-medium text-foreground mb-1">UI 组件：</p>
                    <div className="text-muted-foreground space-y-0.5">
                      <p>• @/components/ui/card</p>
                      <p>• @/components/ui/button</p>
                      <p>• @/components/ui/input</p>
                      <p>• @/components/ui/textarea</p>
                      <p>• @/components/ui/label</p>
                      <p>• @/components/ui/switch</p>
                      <p>• @/components/ui/tabs</p>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-1">图标库：</p>
                    <p className="text-muted-foreground">• lucide-react</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-1">图表库：</p>
                    <div className="text-muted-foreground space-y-0.5">
                      <p>• recharts (推荐)</p>
                      <p>• chart.js + react-chartjs-2</p>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-1">功能库：</p>
                    <div className="text-muted-foreground space-y-0.5">
                      <p>• react-datepicker (日期选择)</p>
                      <p>• @uiw/react-md-editor (Markdown)</p>
                      <p>• prismjs (代码高亮)</p>
                      <p>• qrcode.react (二维码)</p>
                      <p>• html2canvas (截图)</p>
                      <p>• jspdf (PDF生成)</p>
                      <p>• @dnd-kit (拖拽)</p>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-1">工具库：</p>
                    <div className="text-muted-foreground space-y-0.5">
                      <p>• date-fns (日期处理)</p>
                      <p>• zod (数据验证)</p>
                      <p>• clsx (类名合并)</p>
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded p-2 mt-2">
                    <p className="text-green-800 font-medium">✅ 所有库已安装</p>
                    <p className="text-green-700 mt-1 text-xs">
                      可以直接在组件代码中使用以上所有库
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-3">学习资源</h3>
                <div className="space-y-2 text-sm">
                  <Link
                    href="/admin/docs/tool-creation"
                    className="block text-blue-600 hover:underline"
                  >
                    📚 完整开发指南
                  </Link>
                  <Link
                    href="/admin/docs/tool-examples"
                    className="block text-blue-600 hover:underline"
                  >
                    💻 代码示例
                  </Link>
                  <Link
                    href="/admin/tools"
                    className="block text-blue-600 hover:underline"
                  >
                    🔧 查看现有工具
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
