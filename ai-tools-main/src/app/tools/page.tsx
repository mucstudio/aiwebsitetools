'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ToolCard from '@/components/ToolCard'
import LoadingSpinner from '@/components/LoadingSpinner'

interface Tool {
  id: number
  name: string
  slug: string
  description?: string | null
  icon?: string | null
  likes: number
  views: number
  categoryId: number
}

interface Category {
  id: number
  name: string
  slug: string
  icon?: string | null
  tools: Tool[]
}

export default function ToolsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/tools/categories')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      // 静默处理错误
    } finally {
      setLoading(false)
    }
  }

  const scrollToCategory = (slug: string) => {
    setActiveCategory(slug)
    const element = document.getElementById(`category-${slug}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex-1">
          <LoadingSpinner />
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            {/* Sidebar - Desktop only */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                    Categories
                  </h2>
                  <nav className="space-y-1">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => scrollToCategory(category.slug)}
                        className={`w-full text-left px-4 py-2.5 rounded-xl transition-all duration-200 ${
                          activeCategory === category.slug
                            ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 font-semibold shadow-sm'
                            : 'text-gray-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {category.icon && <span className="text-lg">{category.icon}</span>}
                          <span>{category.name}</span>
                          <span className="ml-auto text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                            {category.tools.length}
                          </span>
                        </span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              <div className="mb-8">
                <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                  All Tools
                </h1>
                <p className="text-gray-600 text-lg">
                  Browse our collection of <span className="font-semibold text-purple-600">{categories.reduce((acc, cat) => acc + cat.tools.length, 0)}</span> free online tools
                </p>
              </div>

              {/* Mobile Category Filter */}
              <div className="lg:hidden mb-6">
                <select
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm"
                  onChange={(e) => scrollToCategory(e.target.value)}
                  value={activeCategory || ''}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.icon} {category.name} ({category.tools.length})
                    </option>
                  ))}
                </select>
              </div>

              {/* Tools by Category */}
              <div className="space-y-12">
                {categories.map((category) => (
                  <section key={category.id} id={`category-${category.slug}`}>
                    <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-gradient-to-r from-purple-200 to-pink-200">
                      {category.icon && <span className="text-3xl">{category.icon}</span>}
                      <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
                      <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-semibold">
                        {category.tools.length} {category.tools.length === 1 ? 'tool' : 'tools'}
                      </span>
                    </div>

                    {category.tools.length > 0 ? (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {category.tools.map((tool) => (
                          <ToolCard key={tool.id} tool={tool} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-dashed border-purple-200">
                        <p className="text-gray-500">No tools in this category yet.</p>
                      </div>
                    )}
                  </section>
                ))}
              </div>

              {categories.length === 0 && (
                <div className="text-center py-16 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-dashed border-purple-200">
                  <p className="text-gray-500 text-lg">No tools available yet. Check back soon!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
