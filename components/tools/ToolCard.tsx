"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles, Heart, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import FingerprintJS from "@fingerprintjs/fingerprintjs"

interface ToolCardProps {
  tool: {
    id: string
    name: string
    slug: string
    description: string
    isPremium: boolean
    usageCount: number
    likeCount: number
  }
}

export function ToolCard({ tool }: ToolCardProps) {
  const [likes, setLikes] = useState(tool.likeCount)
  const [views, setViews] = useState(tool.usageCount)
  const [hasLiked, setHasLiked] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const [fingerprint, setFingerprint] = useState<string | null>(null)

  useEffect(() => {
    // Initialize fingerprint
    const initFingerprint = async () => {
      const fp = await FingerprintJS.load()
      const result = await fp.get()
      setFingerprint(result.visitorId)
    }
    initFingerprint()
  }, [])

  useEffect(() => {
    // Check if user has liked (client-side check for immediate feedback, though server is source of truth)
    if (fingerprint) {
      fetch(`/api/tools/${tool.slug}/stats?fingerprint=${fingerprint}`)
        .then(res => res.json())
        .then(data => {
          if (data.hasLiked) setHasLiked(true)
          setLikes(data.likes)
          setViews(data.views)
        })
        .catch(console.error)
    }
  }, [fingerprint, tool.slug])

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (hasLiked || isLiking || !fingerprint) return

    setIsLiking(true)
    // Optimistic update
    setLikes(prev => prev + 1)
    setHasLiked(true)

    try {
      const res = await fetch(`/api/tools/${tool.slug}/stats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "like", fingerprint }),
      })

      if (!res.ok) {
        // Revert if failed
        setLikes(prev => prev - 1)
        setHasLiked(false)
      }
    } catch (error) {
      console.error("Error liking tool:", error)
      setLikes(prev => prev - 1)
      setHasLiked(false)
    } finally {
      setIsLiking(false)
    }
  }

  const handleView = async () => {
    // Fire and forget view increment
    try {
      await fetch(`/api/tools/${tool.slug}/stats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "view", fingerprint }),
      })
    } catch (error) {
      console.error("Error tracking view:", error)
    }
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-primary/10 hover:border-primary/30 bg-card/50 backdrop-blur-sm flex flex-col h-full">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className="p-2 rounded-md bg-muted group-hover:bg-primary/10 transition-colors text-muted-foreground group-hover:text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          {tool.isPremium && (
            <Badge variant="default" className="bg-gradient-to-r from-primary to-purple-600 border-0">
              PRO
            </Badge>
          )}
        </div>
        <CardTitle className="text-xl group-hover:text-primary transition-colors">
          {tool.name}
        </CardTitle>
        <CardDescription className="line-clamp-2 mt-2 flex-1">
          {tool.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-auto">
        <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1" title="Views">
              <Eye className="h-4 w-4" />
              <span>{views.toLocaleString()}</span>
            </div>
            <button 
              onClick={handleLike}
              disabled={hasLiked}
              className={cn(
                "flex items-center gap-1 transition-colors hover:text-red-500 disabled:cursor-default",
                hasLiked && "text-red-500"
              )}
              title={hasLiked ? "You liked this" : "Like this tool"}
            >
              <Heart className={cn("h-4 w-4", hasLiked && "fill-current")} />
              <span>{likes.toLocaleString()}</span>
            </button>
          </div>
        </div>
        <Link href={`/tools/${tool.slug}`} onClick={handleView}>
          <Button variant="outline" className="w-full group-hover:border-primary/50 group-hover:text-primary transition-all">
            Launch Tool <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}