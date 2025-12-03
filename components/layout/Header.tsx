import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { getCurrentSession } from "@/lib/auth-utils"
import { UserMenu } from "./UserMenu"
import { ThemeToggle } from "@/components/ui/theme-toggle"

interface MenuItem {
  id: string
  label: string
  url: string
  icon?: string
  openInNewTab: boolean
}

export async function Header() {
  // 服务器端并行获取数据
  const [siteSettings, menuItems, session] = await Promise.all([
    prisma.siteSettings.findUnique({
      where: {
        key: 'site_name'
      }
    }),
    prisma.menuItem.findMany({
      where: {
        isActive: true,
        parentId: null, // 只获取顶级菜单
      },
      orderBy: {
        order: 'asc'
      },
      select: {
        id: true,
        label: true,
        url: true,
        icon: true,
        openInNewTab: true,
      }
    }),
    getCurrentSession()
  ])

  const siteName = (siteSettings?.value as string) || 'AI Website Tools'

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">{siteName}</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={item.url}
                target={item.openInNewTab ? "_blank" : undefined}
                rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.icon && <span>{item.icon}</span>}
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <UserMenu session={session} />
        </div>
      </div>
    </header>
  )
}
