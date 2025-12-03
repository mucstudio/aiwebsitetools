'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import LoadingSpinner from './LoadingSpinner'

interface AdminAuthGuardProps {
  children: React.ReactNode
}

/**
 * AdminAuthGuard - 管理后台认证保护组件
 *
 * 功能：
 * 1. 在渲染子组件前先检查用户认证状态
 * 2. 未认证用户自动重定向到登录页
 * 3. 认证检查期间显示加载状态，避免闪烁
 *
 * 使用方法：
 * ```tsx
 * export default function AdminPage() {
 *   return (
 *     <AdminAuthGuard>
 *       <AdminLayout>
 *         // 你的页面内容
 *       </AdminLayout>
 *     </AdminAuthGuard>
 *   )
 * }
 * ```
 */
export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check')
      const data = await response.json()

      if (!data.authenticated) {
        // 未认证，重定向到登录页
        router.push('/admin/login')
      } else {
        // 已认证，允许渲染子组件
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      // 认证检查失败，重定向到登录页
      router.push('/admin/login')
    } finally {
      setIsChecking(false)
    }
  }

  // 认证检查期间显示加载状态
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <LoadingSpinner />
      </div>
    )
  }

  // 未认证时不渲染任何内容（正在重定向）
  if (!isAuthenticated) {
    return null
  }

  // 已认证，渲染子组件
  return <>{children}</>
}
