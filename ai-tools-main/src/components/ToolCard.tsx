'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, Eye } from 'lucide-react'

interface ToolCardProps {
  tool: {
    id: number
    name: string
    slug: string
    description?: string | null
    icon?: string | null
    likes: number
    views: number
  }
}

export default function ToolCard({ tool }: ToolCardProps) {
  const router = useRouter()
  const [liked, setLiked] = useState(false)
  const [localLikes, setLocalLikes] = useState(tool.likes)

  useEffect(() => {
    // Check if already liked
    const likedTools = JSON.parse(localStorage.getItem('likedTools') || '[]')
    setLiked(likedTools.includes(tool.slug))
  }, [tool.slug])

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent link navigation
    e.stopPropagation() // Stop event bubbling

    if (liked) return

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
        likedTools.push(tool.slug)
        localStorage.setItem('likedTools', JSON.stringify(likedTools))
      }
    } catch (error) {
      console.error('Error liking tool:', error)
    }
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if not clicking on the like button
    if ((e.target as HTMLElement).closest('.like-button')) {
      e.preventDefault()
      return
    }
    router.push(`/tools/${tool.slug}`)
  }

  return (
    <div
      onClick={handleCardClick}
      className="group cursor-pointer bg-white rounded-2xl border-2 border-gray-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
    >
      <div className="p-6">
        {/* Icon */}
        <div className="flex items-center justify-center w-14 h-14 mb-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl group-hover:from-purple-200 group-hover:to-pink-200 transition-all duration-300 shadow-sm">
          {tool.icon ? (
            <span className="text-3xl">{tool.icon}</span>
          ) : (
            <span className="text-3xl">🛠️</span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
          {tool.name}
        </h3>

        {/* Description */}
        {tool.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
            {tool.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm pt-4 border-t border-gray-100">
          <button
            onClick={handleLike}
            disabled={liked}
            className={`like-button flex items-center gap-1.5 transition-all duration-200 ${
              liked
                ? 'text-red-500 cursor-not-allowed'
                : 'text-gray-500 hover:text-red-500 hover:scale-110'
            }`}
            title={liked ? 'Already liked' : 'Like this tool'}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            <span className="font-semibold">{localLikes}</span>
          </button>
          <div className="flex items-center gap-1.5 text-gray-500">
            <Eye className="w-4 h-4" />
            <span className="font-semibold">{tool.views}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
