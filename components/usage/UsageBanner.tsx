"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, Info } from "lucide-react"
import Link from "next/link"

interface UsageCheckResult {
  allowed: boolean
  remaining: number
  limit: number
  userType: 'guest' | 'user' | 'subscriber'
  reason?: string
  requiresLogin?: boolean
  requiresUpgrade?: boolean
}

interface UsageBannerProps {
  toolId: string
  className?: string
}

export function UsageBanner({ toolId, className = "" }: UsageBannerProps) {
  const { data: session, status } = useSession()
  const [usageInfo, setUsageInfo] = useState<UsageCheckResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUsage()
  }, [toolId, session])

  const checkUsage = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/usage/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ toolId }),
      })

      if (response.ok) {
        const data = await response.json()
        setUsageInfo(data)
      }
    } catch (error) {
      console.error('Failed to check usage:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !usageInfo) {
    return null
  }

  // 订阅用户且无限制
  if (usageInfo.userType === 'subscriber' && usageInfo.limit === -1) {
    return (
      <div className={`flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg ${className}`}>
        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-900">
            Subscriber: Unlimited Access
          </p>
          <p className="text-xs text-green-700">
            You have unlimited access to this tool
          </p>
        </div>
      </div>
    )
  }

  // 游客模式
  if (usageInfo.userType === 'guest') {
    return (
      <div className={`flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg ${className}`}>
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-900">
            Guest Mode: {usageInfo.remaining}/{usageInfo.limit} uses remaining today
          </p>
          <p className="text-xs text-blue-700">
            Sign in to get more uses and access premium features
          </p>
        </div>
        <Link href="/login">
          <Button size="sm" variant="outline">
            Sign In
          </Button>
        </Link>
      </div>
    )
  }

  // 注册用户
  if (usageInfo.userType === 'user') {
    const isLowRemaining = usageInfo.remaining <= 2 && usageInfo.remaining > 0

    return (
      <div className={`flex items-center gap-3 p-4 ${
        isLowRemaining
          ? 'bg-yellow-50 border-yellow-200'
          : 'bg-blue-50 border-blue-200'
      } border rounded-lg ${className}`}>
        {isLowRemaining ? (
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
        ) : (
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
        )}
        <div className="flex-1">
          <p className={`text-sm font-medium ${
            isLowRemaining ? 'text-yellow-900' : 'text-blue-900'
          }`}>
            {usageInfo.remaining}/{usageInfo.limit} uses remaining today
          </p>
          <p className={`text-xs ${
            isLowRemaining ? 'text-yellow-700' : 'text-blue-700'
          }`}>
            Upgrade to Pro for unlimited access
          </p>
        </div>
        <Link href="/pricing">
          <Button size="sm" variant={isLowRemaining ? "default" : "outline"}>
            Upgrade
          </Button>
        </Link>
      </div>
    )
  }

  // 订阅用户但有限制
  if (usageInfo.userType === 'subscriber' && usageInfo.limit > 0) {
    return (
      <div className={`flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg ${className}`}>
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-900">
            {usageInfo.remaining}/{usageInfo.limit} uses remaining today
          </p>
          <p className="text-xs text-blue-700">
            Your subscription includes {usageInfo.limit} uses per day for this tool
          </p>
        </div>
      </div>
    )
  }

  return null
}
