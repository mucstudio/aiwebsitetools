'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface CategoryCardProps {
  category: {
    id: string
    name: string
    slug: string
    description: string | null
    icon: string | null
    order: number
    _count: {
      tools: number
    }
  }
}

export function CategoryCard({ category }: CategoryCardProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`确定要删除分类"${category.name}"吗？`)) {
      return
    }

    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || '删除失败')
        return
      }

      router.refresh()
    } catch (error) {
      alert('删除失败')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {category.icon && <span className="text-2xl">{category.icon}</span>}
              <CardTitle>{category.name}</CardTitle>
            </div>
            <CardDescription>{category.description}</CardDescription>
            <div className="mt-3 text-sm text-muted-foreground">
              <p>工具数量: {category._count.tools}</p>
              <p>URL 标识: {category.slug}</p>
              <p>排序: {category.order}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Link href={`/admin/categories/${category.id}/edit`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">编辑</Button>
          </Link>
          <Button
            onClick={handleDelete}
            variant="destructive"
            size="sm"
            className="flex-1"
            disabled={category._count.tools > 0 || deleting}
          >
            {deleting ? '删除中...' : '删除'}
          </Button>
        </div>
        {category._count.tools > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            * 有工具的分类无法删除
          </p>
        )}
      </CardContent>
    </Card>
  )
}
