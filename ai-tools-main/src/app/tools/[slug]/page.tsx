'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import LoadingSpinner from '@/components/LoadingSpinner'
import { ToolRuntime, ToolRuntimeErrorBoundary } from '@/lib/toolRuntime'
import { Heart, Eye, ArrowLeft, Bookmark } from 'lucide-react'

interface Tool {
  id: number
  name: string
  slug: string
  description?: string | null
  toolType: string
  code: string
  componentCode?: string | null
  styleCode?: string | null
  configJson?: string | null
  icon?: string | null
  likes: number
  views: number
  category: {
    id: number
    name: string
    slug: string
  }
}

export default function ToolDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const [tool, setTool] = useState<Tool | null>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [localLikes, setLocalLikes] = useState(0)
  const [favorited, setFavorited] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const toolHeaderRef = useRef<HTMLDivElement>(null)
  const toolContainerRef = useRef<HTMLDivElement>(null)
  const hasRecordedView = useRef(false)

  useEffect(() => {
    checkAuth()
    fetchTool()
    checkLikedStatus()
  }, [params.slug])

  // Record view only once per tool
  useEffect(() => {
    if (tool && !hasRecordedView.current) {
      hasRecordedView.current = true
      recordView()
    }
  }, [tool])

  // Inject iframe code for legacy tools
  useEffect(() => {
    if (tool && tool.toolType === 'iframe' && toolContainerRef.current) {
      // Clear previous content
      toolContainerRef.current.innerHTML = ''

      // Create an iframe for isolation
      const iframe = document.createElement('iframe')
      iframe.style.width = '100%'
      iframe.style.minHeight = 'calc(100vh - 134px)'
      iframe.style.border = 'none'
      iframe.sandbox.add('allow-scripts', 'allow-same-origin', 'allow-forms', 'allow-popups', 'allow-modals', 'allow-downloads')

      // Append iframe to container
      toolContainerRef.current.appendChild(iframe)

      // Get current year for footer
      const currentYear = new Date().getFullYear()

      // Footer HTML to inject (centrally managed)
      const footerHTML = `
        <footer style="margin-top: auto; padding: 2rem 1rem; text-align: center; font-size: 0.875rem; color: #6b7280;">
          <div style="max-width: 1200px; margin: 0 auto;">
            <p>© ${currentYear} Online Tools Platform. All rights reserved.</p>
            <p style="margin-top: 0.5rem;">Built with Next.js, React, and Tailwind CSS</p>
          </div>
        </footer>
      `

      // Write tool code to iframe with injected footer
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
      if (iframeDoc) {
        iframeDoc.open()

        // Parse the tool code to inject footer before closing body tag
        let modifiedCode = tool.code

        // Check if there's a closing body tag
        if (modifiedCode.includes('</body>')) {
          // Inject footer before closing body tag
          modifiedCode = modifiedCode.replace('</body>', `${footerHTML}</body>`)
        } else if (modifiedCode.includes('</html>')) {
          // If no body tag but has html tag, inject before closing html
          modifiedCode = modifiedCode.replace('</html>', `${footerHTML}</html>`)
        } else {
          // Otherwise append at the end
          modifiedCode += footerHTML
        }

        // Minimal style injection - don't override tool's layout
        const styleInjection = `
          <style>
            /* System injected styles - minimal interference */
            html {
              min-height: 100vh;
            }
          </style>
        `

        // Inject style before closing head or at the beginning
        if (modifiedCode.includes('</head>')) {
          modifiedCode = modifiedCode.replace('</head>', `${styleInjection}</head>`)
        } else {
          modifiedCode = styleInjection + modifiedCode
        }

        iframeDoc.write(modifiedCode)
        iframeDoc.close()

        // Send tool ID after iframe loads
        iframe.onload = () => {
          iframe.contentWindow?.postMessage(
            { type: 'TOOL_ID', toolId: tool.id },
            '*'
          )
        }
      }
    }
  }, [tool])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/user/me')
      const data = await response.json()
      setIsAuthenticated(data.authenticated)

      if (data.authenticated && tool) {
        // Check if tool is in favorites
        const isFavorited = data.user.favorites.some((fav: any) => fav.slug === params.slug)
        setFavorited(isFavorited)
      }
    } catch (error) {
      setIsAuthenticated(false)
    }
  }

  const fetchTool = async () => {
    try {
      const response = await fetch(`/api/tools/${params.slug}`)
      if (!response.ok) {
        throw new Error('Tool not found')
      }
      const data = await response.json()
      setTool(data)
      setLocalLikes(data.likes)
    } catch (error) {
      // 静默处理错误
      router.push('/tools')
    } finally {
      setLoading(false)
    }
  }

  const recordView = async () => {
    try {
      const response = await fetch(`/api/tools/${params.slug}`)
      if (response.ok) {
        const data = await response.json()
        await fetch('/api/tools/interact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ toolId: data.id, type: 'view' })
        })
      }
    } catch (error) {
      // 静默处理错误
    }
  }

  const checkLikedStatus = () => {
    const likedTools = JSON.parse(localStorage.getItem('likedTools') || '[]')
    setLiked(likedTools.includes(params.slug))
  }

  const handleLike = async () => {
    if (!tool || liked) return

    try {
      const response = await fetch('/api/tools/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolId: tool.id, type: 'like' })
      })

      if (response.ok) {
        setLiked(true)
        setLocalLikes(prev => prev + 1)
        const likedTools = JSON.parse(localStorage.getItem('likedTools') || '[]')
        likedTools.push(params.slug)
        localStorage.setItem('likedTools', JSON.stringify(likedTools))
      }
    } catch (error) {
      // 静默处理错误
    }
  }

  const handleFavorite = async () => {
    if (!tool) return

    if (!isAuthenticated) {
      // Show alert and redirect to login
      alert('Please login to save tools to your favorites')
      router.push('/login')
      return
    }

    try {
      if (favorited) {
        // Remove from favorites
        const response = await fetch(`/api/user/favorites?toolId=${tool.id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          setFavorited(false)
        } else {
          alert('Failed to remove from favorites')
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/user/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ toolId: tool.id })
        })

        if (response.ok) {
          setFavorited(true)
        } else {
          const data = await response.json()
          alert(data.error || 'Failed to add to favorites')
        }
      }
    } catch (error) {
      // 静默处理错误
      alert('An error occurred. Please try again.')
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex-1">
          <LoadingSpinner />
        </main>
      </>
    )
  }

  if (!tool) {
    return null
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Compact Tool Header Bar */}
        <div ref={toolHeaderRef} className="bg-white border-b border-gray-200 sticky top-16 z-10">
          <div className="w-full px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Left: Back button and Tool info */}
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <button
                  onClick={() => router.back()}
                  className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
                  title="Back to Tools"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                {tool.icon && (
                  <div className="flex items-center justify-center w-10 h-10 bg-primary-50 rounded-lg text-xl flex-shrink-0">
                    {tool.icon}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <h1 className="text-lg font-bold text-gray-900 truncate">{tool.name}</h1>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="px-2 py-0.5 bg-primary-50 text-primary-600 rounded-full">
                      {tool.category.name}
                    </span>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{tool.views}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleFavorite}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-sm ${
                    favorited
                      ? 'bg-yellow-50 text-yellow-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-yellow-50 hover:text-yellow-600'
                  }`}
                  title={favorited ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Bookmark className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
                  <span className="hidden sm:inline">{favorited ? 'Saved' : 'Save'}</span>
                </button>

                <button
                  onClick={handleLike}
                  disabled={liked}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-sm ${
                    liked
                      ? 'bg-red-50 text-red-600 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                  <span>{localLikes}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tool Content */}
        {tool.toolType === 'react' ? (
          // React Component Mode
          <div className="w-full min-h-screen bg-gray-50">
            <ToolRuntimeErrorBoundary toolId={tool.id}>
              <ToolRuntime
                componentCode={tool.componentCode || ''}
                styleCode={tool.styleCode || undefined}
                configJson={tool.configJson || undefined}
                toolId={tool.id}
                onError={(error) => console.error('Tool runtime error:', error)}
              />
            </ToolRuntimeErrorBoundary>
          </div>
        ) : (
          // Legacy iframe Mode
          <div
            ref={toolContainerRef}
            className="w-full"
            style={{ minHeight: 'calc(100vh - 134px)' }}
          />
        )}
      </main>
    </>
  )
}
