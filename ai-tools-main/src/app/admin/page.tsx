'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminLayout from '@/components/AdminLayout'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Wrench, FolderOpen, TrendingUp, Users, CreditCard } from 'lucide-react'

interface Stats {
  totalTools: number
  totalCategories: number
  totalViews: number
  totalLikes: number
  totalUsers: number
  totalSubscriptions: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    totalTools: 0,
    totalCategories: 0,
    totalViews: 0,
    totalLikes: 0,
    totalUsers: 0,
    totalSubscriptions: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check')
      const data = await response.json()
      if (!data.authenticated) {
        router.push('/admin/login')
        return false
      }
      return true
    } catch (error) {
      router.push('/admin/login')
      return false
    }
  }

  const fetchStats = async () => {
    try {
      // 先检查认证
      const isAuthenticated = await checkAuth()
      if (!isAuthenticated) {
        return
      }

      const [categoriesRes, toolsRes, usersRes, subscriptionsRes] = await Promise.all([
        fetch('/api/tools/categories'),
        fetch('/api/tools'),
        fetch('/api/admin/users?limit=1'),
        fetch('/api/admin/subscriptions')
      ])

      const categories = await categoriesRes.json()
      const tools = await toolsRes.json()
      const usersData = await usersRes.json()
      const subscriptionsData = await subscriptionsRes.json()

      const totalViews = tools.reduce((sum: number, tool: any) => sum + tool.views, 0)
      const totalLikes = tools.reduce((sum: number, tool: any) => sum + tool.likes, 0)

      setStats({
        totalTools: tools.length,
        totalCategories: categories.length,
        totalViews,
        totalLikes,
        totalUsers: usersData.pagination?.total || 0,
        totalSubscriptions: subscriptionsData.subscriptions?.length || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/admin/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your tools and categories</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Tools</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalTools}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Wrench className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Categories</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalCategories}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Subscriptions</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalSubscriptions}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Views</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalViews}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Likes</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalLikes}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <Link
              href="/admin/tools"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
            >
              <Wrench className="w-6 h-6 text-primary-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Manage Tools</h3>
                <p className="text-sm text-gray-600">Add, edit, or delete tools</p>
              </div>
            </Link>

            <Link
              href="/admin/categories"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
            >
              <FolderOpen className="w-6 h-6 text-primary-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Manage Categories</h3>
                <p className="text-sm text-gray-600">Organize your tool categories</p>
              </div>
            </Link>

            <Link
              href="/admin/users"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
            >
              <Users className="w-6 h-6 text-purple-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Manage Users</h3>
                <p className="text-sm text-gray-600">View and manage user accounts</p>
              </div>
            </Link>

            <Link
              href="/admin/subscriptions"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all"
            >
              <CreditCard className="w-6 h-6 text-orange-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Manage Subscriptions</h3>
                <p className="text-sm text-gray-600">Configure subscription plans</p>
              </div>
            </Link>

            <Link
              href="/admin/payment"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
            >
              <CreditCard className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Payment Settings</h3>
                <p className="text-sm text-gray-600">Configure Stripe & PayPal</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
