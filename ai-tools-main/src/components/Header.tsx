'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Sparkles, User, LogOut, LayoutDashboard, Crown, ChevronDown,
  Menu, X, Zap, Star
} from 'lucide-react'

interface UserData {
  id: number
  email: string
  name?: string
  membershipTier: string
}

interface SiteConfig {
  siteName: string
  siteDescription: string
}

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const isAdmin = pathname?.startsWith('/admin')
  const [user, setUser] = useState<UserData | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [loading, setLoading] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({
    siteName: 'AI Tools',
    siteDescription: ''
  })

  useEffect(() => {
    checkAuth()
    fetchSiteConfig()
  }, [pathname])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/user/me')
      const data = await response.json()

      if (data.authenticated) {
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchSiteConfig = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      const data = await response.json()

      if (data.settings) {
        setSiteConfig({
          siteName: data.settings.siteName || 'AI Tools',
          siteDescription: data.settings.siteDescription || ''
        })
      }
    } catch (error) {
      console.error('Failed to fetch site config:', error)
      // 保持默认值
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/user/logout', { method: 'POST' })
      setUser(null)
      setShowUserMenu(false)
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'PREMIUM':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full">
            <Crown className="w-3 h-3" />
            PRO
          </span>
        )
      case 'ENTERPRISE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold rounded-full">
            <Zap className="w-3 h-3" />
            ENTERPRISE
          </span>
        )
      default:
        return null
    }
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200'
          : 'bg-white border-b border-gray-200'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-black text-gray-900 hover:scale-105 transition-transform group"
          >
            <div className="relative">
              <Sparkles className="w-7 h-7 text-purple-600 group-hover:text-pink-600 transition-colors" />
              <div className="absolute inset-0 blur-lg bg-purple-400 opacity-0 group-hover:opacity-50 transition-opacity"></div>
            </div>
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {siteConfig.siteName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                pathname === '/'
                  ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              Home
            </Link>
            <Link
              href="/tools"
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                pathname?.startsWith('/tools') && !isAdmin
                  ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              Tools
            </Link>
            <Link
              href="/pricing"
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                pathname === '/pricing'
                  ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              Pricing
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="px-4 py-2 text-sm font-semibold text-purple-600 bg-purple-50 rounded-lg"
              >
                Admin
              </Link>
            )}
          </nav>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center gap-3">
            {!loading && (
              <>
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all group"
                    >
                      <div className="relative">
                        <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        {user.membershipTier !== 'FREE' && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center">
                            <Crown className="w-2.5 h-2.5 text-yellow-900" />
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-gray-900 hidden sm:block">
                        {user.name || user.email.split('@')[0]}
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-600 group-hover:text-purple-600 transition-colors" />
                    </button>

                    {/* Dropdown Menu */}
                    {showUserMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowUserMenu(false)}
                        />
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-20">
                          {/* User Info Header */}
                          <div className="px-4 py-4 bg-gradient-to-br from-purple-50 to-pink-50 border-b border-gray-200">
                            <p className="text-sm font-bold text-gray-900 truncate">
                              {user.email}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              {getTierBadge(user.membershipTier)}
                              {user.membershipTier === 'FREE' && (
                                <span className="text-xs text-gray-500">Free Plan</span>
                              )}
                            </div>
                          </div>

                          {/* Menu Items */}
                          <div className="py-2">
                            <Link
                              href="/dashboard"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600 transition-all"
                            >
                              <LayoutDashboard className="w-4 h-4" />
                              Dashboard
                            </Link>

                            {user.membershipTier === 'FREE' && (
                              <Link
                                href="/pricing"
                                onClick={() => setShowUserMenu(false)}
                                className="flex items-center gap-3 px-4 py-3 text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white mx-2 rounded-lg hover:shadow-lg transition-all"
                              >
                                <Star className="w-4 h-4" />
                                Upgrade to Pro
                              </Link>
                            )}

                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                            >
                              <LogOut className="w-4 h-4" />
                              Logout
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="hidden md:flex items-center gap-3">
                    <Link
                      href="/login"
                      className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="group relative px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all overflow-hidden"
                    >
                      <span className="relative z-10">Get Started</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden py-4 border-t border-gray-200 animate-in slide-in-from-top">
            <nav className="flex flex-col gap-2">
              <Link
                href="/"
                onClick={() => setShowMobileMenu(false)}
                className={`px-4 py-3 text-sm font-semibold rounded-lg transition-all ${
                  pathname === '/'
                    ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Home
              </Link>
              <Link
                href="/tools"
                onClick={() => setShowMobileMenu(false)}
                className={`px-4 py-3 text-sm font-semibold rounded-lg transition-all ${
                  pathname?.startsWith('/tools') && !isAdmin
                    ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Tools
              </Link>
              <Link
                href="/pricing"
                onClick={() => setShowMobileMenu(false)}
                className={`px-4 py-3 text-sm font-semibold rounded-lg transition-all ${
                  pathname === '/pricing'
                    ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Pricing
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setShowMobileMenu(false)}
                  className="px-4 py-3 text-sm font-semibold text-purple-600 bg-purple-50 rounded-lg"
                >
                  Admin
                </Link>
              )}

              {!loading && !user && (
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-200">
                  <Link
                    href="/login"
                    onClick={() => setShowMobileMenu(false)}
                    className="px-4 py-3 text-sm font-semibold text-center text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setShowMobileMenu(false)}
                    className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold text-center rounded-lg hover:shadow-lg transition-all"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
