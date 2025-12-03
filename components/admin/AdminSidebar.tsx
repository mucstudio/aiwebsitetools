"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: "📊",
  },
  {
    title: "工具管理",
    href: "/admin/tools",
    icon: "🛠️",
  },
  {
    title: "分类管理",
    href: "/admin/categories",
    icon: "📁",
  },
  {
    title: "AI 模型管理",
    icon: "🤖",
    children: [
      {
        title: "AI 供应商",
        href: "/admin/ai-providers",
      },
      {
        title: "全局配置",
        href: "/admin/ai-config",
      },
    ],
  },
  {
    title: "用户管理",
    href: "/admin/users",
    icon: "👥",
  },
  {
    title: "订阅计划",
    href: "/admin/plans",
    icon: "💳",
  },
  {
    title: "支付管理",
    href: "/admin/payments",
    icon: "💰",
  },
  {
    title: "系统文档",
    icon: "📚",
    defaultCollapsed: false,
    children: [
      {
        title: "🏭 工厂模式指南",
        href: "/admin/docs/factory-pattern",
      },
      {
        title: "🚀 快速启动",
        href: "/admin/docs/factory-quickstart",
      },
      {
        title: "✨ 增强功能",
        href: "/admin/docs/factory-enhanced",
      },
      {
        title: "🤖 AI 模型系统",
        href: "/admin/docs/ai-models",
      },
      {
        title: "⏱️ 使用限制系统",
        href: "/admin/docs/usage-limits",
      },
    ],
  },
  {
    title: "网站设置",
    href: "/admin/settings",
    icon: "⚙️",
  },
  {
    title: "账户设置",
    href: "/admin/account",
    icon: "👤",
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [collapsedMenus, setCollapsedMenus] = useState<Record<string, boolean>>(() => {
    // 初始化默认折叠状态
    const initial: Record<string, boolean> = {}
    menuItems.forEach((item) => {
      if (item.children && item.defaultCollapsed) {
        initial[item.title] = true
      }
    })
    return initial
  })

  const toggleMenu = (title: string) => {
    setCollapsedMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  return (
    <div className="w-64 bg-card border-r min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold px-4">管理后台</h2>
      </div>
      <nav className="space-y-1">
        {menuItems.map((item) => {
          // 如果有子菜单
          if (item.children) {
            const hasActiveChild = item.children.some((child) => pathname === child.href || pathname.startsWith(child.href + '/'))
            const isCollapsed = collapsedMenus[item.title] && !hasActiveChild

            return (
              <div key={item.title} className="space-y-1">
                <button
                  onClick={() => toggleMenu(item.title)}
                  className={cn(
                    "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors",
                    hasActiveChild ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.title}</span>
                  </div>
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                {!isCollapsed && (
                  <div className="ml-4 space-y-1">
                    {item.children.map((child) => {
                      const isActive = pathname === child.href || pathname.startsWith(child.href + '/')
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          )}
                        >
                          <span>{child.title}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          // 普通菜单项
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.title}</span>
            </Link>
          )
        })}
      </nav>
      <div className="mt-8 px-4 space-y-3">
        <Link
          href="/"
          className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← 返回前台
        </Link>
        <button
          onClick={() => {
            if (confirm("确定要退出登录吗？")) {
              window.location.href = "/api/auth/signout"
            }
          }}
          className="block text-sm text-red-600 hover:text-red-700 transition-colors"
        >
          退出登录
        </button>
      </div>
    </div>
  )
}
