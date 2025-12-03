'use client'

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Pencil, Trash2, Copy, Check } from "lucide-react"

interface CategoryRowProps {
  category: {
    id: string
    name: string
    slug: string
    description: string | null
    icon: string | null
    order: number
    parentId?: string | null
    _count: {
      tools: number
      children: number
    }
  }
  level: number
}

export function CategoryRow({ category, level }: CategoryRowProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopyId = async () => {
    await navigator.clipboard.writeText(category.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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

  const canDelete = category._count.tools === 0 && category._count.children === 0

  return (
    <div
      className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors"
      style={{ paddingLeft: `${1.5 + level * 2}rem` }}
    >
      <div className="flex items-center gap-3 flex-1">
        {level === 1 && <span className="text-muted-foreground">└─</span>}
        {category.icon && <span className="text-xl">{category.icon}</span>}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="font-medium">{category.name}</span>
            <span className="text-sm text-muted-foreground">({category.slug})</span>
            <button
              onClick={handleCopyId}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-muted hover:bg-muted/80 rounded transition-colors"
              title="点击复制分类ID"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">已复制</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span className="font-mono">{category.id.slice(0, 8)}...</span>
                </>
              )}
            </button>
          </div>
          {category.description && (
            <p className="text-sm text-muted-foreground mt-0.5">{category.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>工具: {category._count.tools}</span>
          {level === 0 && <span>子分类: {category._count.children}</span>}
          <span>排序: {category.order}</span>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/admin/categories/${category.id}/edit`}>
            <Button variant="ghost" size="sm">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            onClick={handleDelete}
            variant="ghost"
            size="sm"
            disabled={!canDelete || deleting}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
