"use client"

import { useState, useCallback } from 'react'

interface UsageCheckResult {
  allowed: boolean
  remaining: number
  limit: number
  userType: 'guest' | 'user' | 'subscriber'
  reason?: string
  requiresLogin?: boolean
  requiresUpgrade?: boolean
}

export function useUsageLimit(toolId: string) {
  const [checking, setChecking] = useState(false)
  const [recording, setRecording] = useState(false)

  /**
   * 检查使用限制
   */
  const checkLimit = useCallback(async (): Promise<UsageCheckResult> => {
    setChecking(true)
    try {
      const response = await fetch('/api/usage/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ toolId }),
      })

      if (!response.ok) {
        throw new Error('Failed to check usage limit')
      }

      const data = await response.json()
      return data
    } finally {
      setChecking(false)
    }
  }, [toolId])

  /**
   * 记录使用
   */
  const recordUsage = useCallback(async (options?: {
    usedAI?: boolean
    aiTokens?: number
    aiCost?: number
  }): Promise<boolean> => {
    setRecording(true)
    try {
      const response = await fetch('/api/usage/record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolId,
          ...options,
        }),
      })

      if (response.status === 429) {
        // 达到限制
        const data = await response.json()
        return false
      }

      if (!response.ok) {
        throw new Error('Failed to record usage')
      }

      return true
    } catch (error) {
      console.error('Record usage error:', error)
      return false
    } finally {
      setRecording(false)
    }
  }, [toolId])

  /**
   * 检查并记录使用（组合操作）
   */
  const checkAndRecord = useCallback(async (options?: {
    usedAI?: boolean
    aiTokens?: number
    aiCost?: number
  }): Promise<{
    success: boolean
    result?: UsageCheckResult
  }> => {
    // 先检查限制
    const checkResult = await checkLimit()

    if (!checkResult.allowed) {
      return {
        success: false,
        result: checkResult,
      }
    }

    // 记录使用
    const recorded = await recordUsage(options)

    return {
      success: recorded,
      result: checkResult,
    }
  }, [checkLimit, recordUsage])

  return {
    checking,
    recording,
    checkLimit,
    recordUsage,
    checkAndRecord,
  }
}
