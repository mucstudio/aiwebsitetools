'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Plus, Edit, Trash2, Eye, Heart, FolderTree, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react'

interface Category {
  id: number
  name: string
  slug: string
  icon?: string | null
  sortOrder: number
}

interface Tool {
  id: number
  name: string
  slug: string
  description?: string | null
  icon?: string | null
  likes: number
  views: number
  categoryId: number
  sortOrder: number
  category: {
    id: number
    name: string
    slug: string
  }
}

interface CategoryWithTools extends Category {
  tools: Tool[]
}

export default function AdminToolsPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<CategoryWithTools[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())

  useEffect(() => {
    checkAuth()
    fetchData()
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

  const fetchData = async () => {
    try {
      // Fetch categories and tools
      const [categoriesRes, toolsRes] = await Promise.all([
        fetch('/api/tools/categories'),
        fetch('/api/tools')
      ])

      const categoriesData: Category[] = await categoriesRes.json()
      const toolsData: Tool[] = await toolsRes.json()

      // Group tools by category
      const categoriesWithTools: CategoryWithTools[] = categoriesData.map(category => ({
        ...category,
        tools: toolsData.filter(tool => tool.categoryId === category.id)
      }))

      setCategories(categoriesWithTools)

      // Expand all categories by default
      setExpandedCategories(new Set(categoriesWithTools.map(c => c.id)))
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleCategory = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const handleDeleteTool = async (id: number) => {
    if (!confirm('Are you sure you want to delete this tool?')) return

    try {
      const response = await fetch(`/api/tools?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error deleting tool:', error)
    }
  }

  const handleDeleteCategory = async (id: number) => {
    const category = categories.find(c => c.id === id)
    if (category && category.tools.length > 0) {
      alert('Cannot delete category with tools. Please delete or move the tools first.')
      return
    }

    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const response = await fetch(`/api/tools/categories?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error deleting category:', error)
    }
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tools & Categories</h1>
            <p className="text-gray-600 mt-2">Manage your tools organized by categories</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/admin/categories')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FolderTree className="w-5 h-5" />
              <span>Manage Categories</span>
            </button>
            <button
              onClick={() => router.push('/admin/tools/new')}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Tool</span>
            </button>
          </div>
        </div>

        {/* Categories with Tools */}
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Category Header */}
              <div className="bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between p-4">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    {expandedCategories.has(category.id) ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                    {category.icon && (
                      <span className="text-2xl">{category.icon}</span>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-500">{category.tools.length} tools</p>
                    </div>
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/admin/categories?edit=${category.id}`)}
                      className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
                      title="Edit Category"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Tools Grid */}
              {expandedCategories.has(category.id) && (
                <div className="p-4">
                  {category.tools.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No tools in this category yet.</p>
                      <button
                        onClick={() => router.push('/admin/tools/new')}
                        className="mt-2 text-primary-600 hover:text-primary-700 text-sm"
                      >
                        Add your first tool
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {category.tools.map((tool) => (
                        <div key={tool.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          {/* Tool Icon & Name */}
                          <div className="flex items-start gap-3 mb-3">
                            {tool.icon && (
                              <span className="text-3xl flex-shrink-0">{tool.icon}</span>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 truncate">{tool.name}</h4>
                              {tool.description && (
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                  {tool.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              <span>{tool.views}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              <span>{tool.likes}</span>
                            </div>
                            <span className="text-xs">Sort: {tool.sortOrder}</span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                            <button
                              onClick={() => window.open(`/tools/${tool.slug}`, '_blank')}
                              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                              title="View Tool"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span>View</span>
                            </button>
                            <button
                              onClick={() => router.push(`/admin/tools/edit/${tool.id}`)}
                              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
                              title="Edit Tool"
                            >
                              <Edit className="w-4 h-4" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteTool(tool.id)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Tool"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {categories.length === 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <FolderTree className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
              <p className="text-gray-500 mb-4">Create your first category to organize your tools</p>
              <button
                onClick={() => router.push('/admin/categories')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Create Category</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
