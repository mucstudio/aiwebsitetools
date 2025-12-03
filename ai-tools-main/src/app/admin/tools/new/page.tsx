'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import LoadingSpinner from '@/components/LoadingSpinner'
import ToolEditorV2 from '@/components/ToolEditorV2'
import { ArrowLeft } from 'lucide-react'

interface Category {
  id: number
  name: string
  slug: string
}

export default function NewToolPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    checkAuth()
    fetchCategories()
  }, [])

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

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/tools/categories')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (data: any) => {
    setSaving(true)

    try {
      const response = await fetch('/api/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (response.ok) {
        alert('Tool created successfully!')
        router.push('/admin/tools')
      } else {
        alert(result.error || 'Failed to create tool')
      }
    } catch (error) {
      console.error('Error creating tool:', error)
      alert('Failed to create tool')
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
          <h1 className="text-3xl font-bold text-gray-900">Add New Tool</h1>
          <p className="text-gray-600 mt-2">Create a new tool for your platform</p>
        </div>

        {/* Tool Editor V2 - Supports React Components */}
        <ToolEditorV2
          categories={categories}
          onSave={handleSave}
          onCancel={handleCancel}
          saving={saving}
        />
      </div>
    </AdminLayout>
  )
}
