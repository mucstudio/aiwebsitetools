/**
 * 🎨 通用工具 Hook - 增强版（支持泛型）
 *
 * 封装所有工具的通用逻辑：
 * - 设备指纹获取
 * - API 调用
 * - 加载状态管理
 * - 错误处理
 * - 剩余次数更新
 *
 * 新增功能：
 * - ✅ TypeScript 泛型支持（类型安全）
 * - ✅ 更好的错误处理
 * - ✅ 支持多种返回格式
 *
 * 使用方式：
 * ```typescript
 * // 文本结果
 * const { execute, result } = useToolAction<string>('roast-resume')
 *
 * // JSON 结果
 * interface MbtiResult {
 *   mbti_type: string
 *   percentage: number
 * }
 * const { execute, result } = useToolAction<MbtiResult>('mbti-test')
 * ```
 */

'use client'

import { useState, useEffect } from 'react'
import { generateDeviceFingerprint } from '@/lib/usage-limits/fingerprint'

export interface UseToolActionOptions {
  onSuccess?: (result: any) => void
  onError?: (error: string) => void
  autoCheckUsage?: boolean  // 是否自动检查使用次数（默认 true）
}

export interface UseToolActionReturn<T = any> {
  execute: (input: any) => Promise<void>
  result: T | null
  loading: boolean
  error: string
  remaining: number | string
  reset: () => void
  isReady: boolean  // 设备指纹是否准备好
}

/**
 * 通用工具 Hook（支持泛型）
 *
 * @param toolId - 工具ID（对应 API 路由 /api/tools/[toolId]）
 * @param options - 可选配置
 * @returns 工具执行函数和状态
 *
 * @example
 * // 文本结果
 * const { execute, result, loading } = useToolAction<string>('roast-resume')
 *
 * @example
 * // JSON 结果
 * interface MbtiResult {
 *   mbti_type: string
 *   percentage: number
 *   careers: string[]
 * }
 * const { execute, result } = useToolAction<MbtiResult>('mbti-test')
 */
export function useToolAction<T = any>(
  toolId: string,
  options?: UseToolActionOptions
): UseToolActionReturn<T> {
  const [fingerprint, setFingerprint] = useState<string>()
  const [result, setResult] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [remaining, setRemaining] = useState<number | string>('--')
  const [isReady, setIsReady] = useState(false)

  const autoCheckUsage = options?.autoCheckUsage !== false

  // 初始化：生成设备指纹并检查使用次数
  useEffect(() => {
    const init = async () => {
      try {
        // 1. 生成设备指纹
        const fp = await generateDeviceFingerprint()
        setFingerprint(fp)

        // 2. 检查使用次数（如果启用）
        if (autoCheckUsage) {
          const res = await fetch('/api/usage/check', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Device-Fingerprint': fp
            },
            body: JSON.stringify({})
          })

          const data = await res.json()
          if (data.remaining !== undefined) {
            setRemaining(data.remaining === -1 ? '∞' : data.remaining)
          }
        }

        setIsReady(true)
      } catch (e) {
        console.error('Failed to initialize tool:', e)
        setError('Failed to initialize. Please refresh the page.')
      }
    }

    init()
  }, [autoCheckUsage])

  /**
   * 执行工具
   */
  const execute = async (input: any) => {
    if (!fingerprint) {
      setError('Device fingerprint not ready')
      return
    }

    setLoading(true)
    setError('')

    try {
      // 调用工具 API
      const res = await fetch(`/api/tools/${toolId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Fingerprint': fingerprint
        },
        body: JSON.stringify({
          userInput: input,
          fingerprint
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Request failed')
      }

      // 更新结果（类型安全）
      setResult(data.result as T)

      // 更新剩余次数
      if (data.remaining !== undefined) {
        setRemaining(data.remaining === -1 ? '∞' : data.remaining)
      }

      // 调用成功回调
      if (options?.onSuccess) {
        options.onSuccess(data.result)
      }

    } catch (err: any) {
      const errorMessage = err.message || 'Unknown error'
      setError(errorMessage)

      // 调用错误回调
      if (options?.onError) {
        options.onError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  /**
   * 重置状态
   */
  const reset = () => {
    setResult(null)
    setError('')
  }

  return {
    execute,
    result,
    loading,
    error,
    remaining,
    reset,
    isReady
  }
}
