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
      ) : (
        <div className="space-y-4">
          {tools.map((tool) => (
            <Card key={tool.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {tool.icon && <span className="text-2xl">{tool.icon}</span>}
                      <CardTitle>{tool.name}</CardTitle>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        tool.isPublished
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {tool.isPublished ? "已发布" : "草稿"}
                      </span>
                      {tool.isPremium && (
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                          付费
                        </span>
                      )}
                    </div>
                    <CardDescription>{tool.description}</CardDescription>
                    <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                      <span>分类: {tool.category.name}</span>
                      <span>组件: <code className="px-1 bg-gray-100 rounded">{tool.componentType}</code></span>
                      <span>使用次数: {tool._count.usageRecords.toLocaleString()}</span>
                      <span>创建时间: {new Date(tool.createdAt).toLocaleDateString('zh-CN')}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/tools/${tool.id}/edit`}>
                      <Button variant="outline" size="sm">编辑</Button>
                    </Link>
                    <Link href={`/tools/${tool.slug}`} target="_blank">
                      <Button variant="outline" size="sm">查看</Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(tool.id, tool.name)}
                      disabled={deleting === tool.id}
                    >
                      {deleting === tool.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          删除中...
                        </>
                      ) : (
                        '删除'
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
