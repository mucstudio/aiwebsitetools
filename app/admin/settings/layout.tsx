"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Settings,
  Globe,
  CreditCard,
  Mail,
  Shield,
  Zap,
} from "lucide-react"

const settingsNav = [
  {
    title: "基本设置",
    href: "/admin/settings",
    icon: Settings,
    description: "网站基本信息配置",
  },
  {
    title: "SEO 设置",
    href: "/admin/settings/seo",
    icon: Globe,
    description: "搜索引擎优化",
  },
  {
    title: "登录设置",
    href: "/admin/settings/oauth",
    icon: Shield,
    description: "第三方登录配置",
  },
  {
    title: "支付配置",
    href: "/admin/settings/payment",
    icon: CreditCard,
    description: "Stripe 支付集成",
  },
  {
    title: "邮件配置",
    href: "/admin/settings/email",
    icon: Mail,
    description: "邮件发送服务",
  },
  {
    title: "安全设置",
    href: "/admin/settings/security",
    icon: Shield,
    description: "安全和权限配置",
  },
  {
    title: "功能开关",
    href: "/admin/settings/features",
    icon: Zap,
    description: "启用或禁用功能",
  },
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">网站设置</h1>
        <p className="text-muted-foreground">管理网站的各项配置</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* 侧边栏导航 */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {settingsNav.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{item.title}</p>
                    <p
                      className={cn(
                        "text-xs mt-0.5",
                        isActive
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground"
                      )}
                    >
                      {item.description}
                    </p>
                  </div>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* 主内容区域 */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
