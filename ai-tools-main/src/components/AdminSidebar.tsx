'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Wrench,
  FolderTree,
  Users,
  CreditCard,
  DollarSign,
  Settings,
  LogOut,
  ExternalLink,
  BookOpen,
  Brain,
  Code
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  subItems?: NavItem[]
}

export default function AdminSidebar() {
  const pathname = usePathname()

  const navItems: NavItem[] = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      href: '/admin/tools',
      label: 'Tools',
      icon: <Wrench className="w-5 h-5" />,
      subItems: [
        {
          href: '/admin/api-docs',
          label: 'API Documentation',
          icon: <BookOpen className="w-4 h-4" />
        }
      ]
    },
    {
      href: '/admin/categories',
      label: 'Categories',
      icon: <FolderTree className="w-5 h-5" />
    },
    {
      href: '/admin/users',
      label: 'Users',
      icon: <Users className="w-5 h-5" />
    },
    {
      href: '/admin/subscriptions',
      label: 'Subscriptions',
      icon: <CreditCard className="w-5 h-5" />
    },
    {
      href: '/admin/payment',
      label: 'Payment Settings',
      icon: <DollarSign className="w-5 h-5" />
    },
    {
      href: '/admin/ai-config',
      label: 'AI Configuration',
      icon: <Brain className="w-5 h-5" />,
      subItems: [
        {
          href: '/admin/ai-config/examples',
          label: 'Frontend Examples',
          icon: <Code className="w-4 h-4" />
        }
      ]
    },
    {
      href: '/admin/integration-guide',
      label: 'Integration Guide',
      icon: <BookOpen className="w-5 h-5" />
    },
    {
      href: '/admin/settings',
      label: 'Global Settings',
      icon: <Settings className="w-5 h-5" />
    }
  ]

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      window.location.href = '/admin/login'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
            <p className="text-xs text-gray-500">Management Console</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>

              {/* Submenu */}
              {item.subItems && item.subItems.length > 0 && (
                <ul className="mt-1 ml-4 space-y-1">
                  {item.subItems.map((subItem) => (
                    <li key={subItem.href}>
                      <Link
                        href={subItem.href}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm ${
                          isActive(subItem.href)
                            ? 'bg-primary-50 text-primary-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {subItem.icon}
                        <span>{subItem.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}

          {/* Frontend Homepage Link */}
          <li>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
              <span>Frontend Homepage</span>
            </a>
          </li>
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
