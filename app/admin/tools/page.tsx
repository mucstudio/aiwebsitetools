"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

interface Tool {
  id: string
  name: string
  slug: string
  description: string
  componentType: string
  icon: string | null
  isPremium: boolean
  isPublished: boolean
  usageCount: number
  createdAt: string
  category: {
    id: string
    name: string
  }
  _count: {
    usageRecords: number
  }
}

export default function AdminToolsPage() {
  const [tools, setTools] = useState<Tool[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"list" | "grouped">("grouped")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [toolsRes, categoriesRes] = await Promise.all([
        fetch('/api/admin/tools'),
        fetch('/api/admin/categories')
      ])

      if (toolsRes.ok) {
        const toolsData = await toolsRes.json()
        setTools(toolsData.tools)
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData.categories)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (toolId: string, toolName: string) => {
    if (!confirm(`确定要删除工具"${toolName}"吗？此操作无法撤销。`)) {
      return
    }

    setDeleting(toolId)
    try {
      const response = await fetch(`/api/admin/tools/${toolId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('工具删除成功')
        await fetchData()
      } else {
        const data = await response.json()
        alert(`删除失败: ${data.error}`)
      }
    } catch (error) {
      alert('删除失败，请重试')
    } finally {
      setDeleting(null)
    }
  }

  // 筛选工具
  const filteredTools = selectedCategory === "all"
    ? tools
    : tools.filter(tool => tool.category.id === selectedCategory)

  // 按分类分组工具
  const groupedTools = categories.reduce((acc, category) => {
    const categoryTools = tools.filter(tool => tool.category.id === category.id)
    if (categoryTools.length > 0) {
      acc[category.id] = {
        category,
        tools: categoryTools
      }
    }
    return acc
  }, {} as Record<string, { category: any; tools: Tool[] }>)

  // 渲染单个工具卡片
  const renderToolCard = (tool: Tool) => (
    <Card key={tool.id} className="h-full flex flex-col">
      <CardHeader className="flex-1">
        <div className="space-y-3">
          {/* 图标和标题 */}
          <div className="flex items-start gap-2">
            {tool.icon && <span className="text-2xl flex-shrink-0">{tool.icon}</span>}
            <CardTitle className="text-lg line-clamp-2">{tool.name}</CardTitle>
          </div>

          {/* 描述 */}
          <CardDescription className="line-clamp-2 text-sm">
            {tool.description}
          </CardDescription>

          {/* 标签 */}
          <div className="flex flex-wrap gap-1.5">
            <Badge variant={tool.isPublished ? "default" : "secondary"} className="text-xs">
              {tool.isPublished ? "已发布" : "草稿"}
            </Badge>
            {tool.isPremium && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
                付费
              </Badge>
            )}
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
              {tool.category.name}
            </Badge>
          </div>

          {/* 统计信息 */}
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <span>使用:</span>
              <span className="font-medium">{tool._count.usageRecords.toLocaleString()}</span>
            </div>
            <div className="truncate">
              <span>组件: </span>
              <code className="text-xs bg-gray-100 px-1 rounded">{tool.componentType}</code>
            </div>
            <div className="truncate">
              <span>ID: </span>
              <code className="text-xs bg-gray-100 px-1 rounded select-all">{tool.id}</code>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* 操作按钮 */}
      <CardContent className="pt-0 pb-4">
        <div className="flex gap-2">
          <Link href={`/admin/tools/${tool.id}/edit`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">编辑</Button>
          </Link>
          <Link href={`/tools/${tool.slug}`} target="_blank" className="flex-1">
            <Button variant="outline" size="sm" className="w-full">查看</Button>
          </Link>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDelete(tool.id, tool.name)}
            disabled={deleting === tool.id}
            className="flex-1"
          >
            {deleting === tool.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              '删除'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

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
          <h1 className="text-3xl font-bold">工具管理</h1>
          <p className="text-muted-foreground">管理所有在线工具</p>
        </div>
        <Link href="/admin/tools/new">
          <Button>+ 添加新工具</Button>
        </Link>
      </div>

      {/* 快速提示 */}
      <Card className="mb-6 border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">💡</div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2">快速添加工具</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">现有可用组件：</strong>
                  <code className="mx-1 px-1.5 py-0.5 bg-white rounded border text-xs">word-counter</code>
                  <code className="mx-1 px-1.5 py-0.5 bg-white rounded border text-xs">case-converter</code>
                  <code className="mx-1 px-1.5 py-0.5 bg-white rounded border text-xs">base64-encoder</code>
                </p>
                <p>
                  点击"添加新工具"，填写信息后即可使用。<strong className="text-red-600">组件类型必须与文件名一致</strong>。
                </p>
                <p>
                  <Link href="/admin/docs/tool-creation" className="text-blue-600 hover:underline font-medium">
                    📚 查看完整开发指南
                  </Link>
                  {" · "}
                  <Link href="/admin/docs/tool-examples" className="text-blue-600 hover:underline font-medium">
                    💻 查看代码示例
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 分类筛选和视图切换 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">筛选分类:</span>
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
          >
            全部 ({tools.length})
          </Button>
          {categories.map((category) => {
            const count = tools.filter(t => t.category.id === category.id).length
            if (count === 0) return null
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.icon} {category.name} ({count})
              </Button>
            )
          })}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">视图:</span>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            列表
          </Button>
          <Button
            variant={viewMode === "grouped" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grouped")}
          >
            分组
          </Button>
        </div>
      </div>

      {/* 工具列表 */}
      {tools.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">暂无工具</p>
            <Link href="/admin/tools/new">
              <Button>创建第一个工具</Button>
            </Link>
          </CardContent>
        </Card>
      ) : viewMode === "list" ? (
        /* 列表视图 - 网格布局 */
        <div>
          {filteredTools.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">该分类下暂无工具</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTools.map((tool) => renderToolCard(tool))}
            </div>
          )}
        </div>
      ) : (
        /* 分组视图 - 网格布局 */
        <div className="space-y-8">
          {Object.entries(groupedTools)
            .filter(([categoryId]) => selectedCategory === "all" || categoryId === selectedCategory)
            .map(([categoryId, data]) => {
              const { category, tools: categoryTools } = data as { category: any; tools: Tool[] }
              return (
                <div key={categoryId}>
                  <div className="flex items-center gap-3 mb-4">
                    {category.icon && <span className="text-3xl">{category.icon}</span>}
                    <div>
                      <h2 className="text-2xl font-bold">{category.name}</h2>
                      <p className="text-sm text-muted-foreground">
                        {category.description || `${categoryTools.length} 个工具`}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {categoryTools.map((tool: Tool) => renderToolCard(tool))}
                  </div>
                </div>
              )
            })}
          {Object.keys(groupedTools).length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">暂无工具</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
