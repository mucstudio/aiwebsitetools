'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import LoadingSpinner from '@/components/LoadingSpinner'
import ToolEditorV2 from '@/components/ToolEditorV2'
import { ArrowLeft } from 'lucide-react'

interface Category {
  id: number
  name: string
  slug: string
}

interface Tool {
  id: number
  name: string
  slug: string
  description?: string
  toolType: string
  code: string
  componentCode?: string | null
  styleCode?: string | null
  configJson?: string | null
  icon?: string
  categoryId: number
  sortOrder: number
  skipSecurityCheck: boolean
}

export default function EditToolPage() {
  const router = useRouter()
  const params = useParams()
  const toolId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [tool, setTool] = useState<Tool | null>(null)

  useEffect(() => {
    checkAuth()
    fetchData()
  }, [toolId])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check')
      const data = await response.json()
      if (!data.authenticated) {
        router.push('/admin/login')
      }
    } catch (error) {
      router.push('/admin/login')
    }
  }

  const fetchData = async () => {
    try {
      // Fetch categories
      const categoriesResponse = await fetch('/api/tools/categories')
      const categoriesData = await categoriesResponse.json()
      setCategories(categoriesData)

      // Fetch tool
      const toolResponse = await fetch(`/api/tools?id=${toolId}`)
      if (!toolResponse.ok) {
        alert('Tool not found')
        router.push('/admin/tools')
        return
      }
      const toolData = await toolResponse.json()
      setTool(toolData)
    } catch (error) {
      console.error('Error fetching data:', error)
      alert('Failed to load tool')
      router.push('/admin/tools')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (data: any) => {
    setSaving(true)

    try {
      const response = await fetch('/api/tools', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (response.ok) {
        alert('Tool updated successfully!')
        router.push('/admin/tools')
      } else {
        alert(result.error || 'Failed to update tool')
      }
    } catch (error) {
      console.error('Error updating tool:', error)
      alert('Failed to update tool')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/tools')
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    )
  }

  if (!tool) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-600">Tool not found</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/tools')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Tools
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Tool</h1>
          <p className="text-gray-600 mt-2">Update tool information and code</p>
        </div>

        {/* Tool Editor V2 - Supports React Components */}
        <ToolEditorV2
          initialData={{
            id: tool.id,
            name: tool.name,
            description: tool.description || '',
            toolType: tool.toolType || 'iframe',
            code: tool.code,
            componentCode: tool.componentCode || undefined,
            styleCode: tool.styleCode || undefined,
            configJson: tool.configJson || undefined,
            icon: tool.icon || '🔧',
            categoryId: tool.categoryId,
            sortOrder: tool.sortOrder,
            skipSecurityCheck: tool.skipSecurityCheck
          }}
          categories={categories}
          onSave={handleSave}
          onCancel={handleCancel}
          saving={saving}
        />
      </div>
    </AdminLayout>
  )
}
