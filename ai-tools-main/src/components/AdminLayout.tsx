'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import AdminSidebar from './AdminSidebar'
import LoadingSpinner from './LoadingSpinner'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [pathname])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check')
      const data = await response.json()

      if (!data.authenticated) {
        // 未认证，重定向到登录页
        router.push('/admin/login')
      } else {
        // 已认证，允许渲染内容
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

  // 认证检查期间显示加载状态（不显示侧边栏）
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

  // 已认证，渲染完整的管理后台布局
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
