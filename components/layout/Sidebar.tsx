import Link from "next/link"
import Image from "next/image"
import { unstable_noStore as noStore } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getCurrentSession } from "@/lib/auth-utils"
import { UserMenu } from "./UserMenu"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Input } from "@/components/ui/input"
import { Search, Home, Wrench, CreditCard, Info, Heart, LayoutDashboard, Twitter, Github, Mail, Facebook, Youtube, Instagram, Linkedin, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MobileNav } from "./MobileNav"
import { SidebarNav } from "./SidebarNav"
import { SidebarSearch } from "./SidebarSearch"
import { AnimatedLogo } from "@/components/ui/animated-logo"

export async function Sidebar() {
  noStore()
  const [siteSettings, menuItems, session, connectSettings] = await Promise.all([
    prisma.siteSettings.findMany({
      where: {
        key: {
          in: ['site_name', 'site_logo', 'show_logo', 'logo_type']
        }
      }
    }),
    prisma.menuItem.findMany({
      where: {
        isActive: true,
        parentId: null,
      },
      orderBy: { order: 'asc' },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        }
      }
    }),
    getCurrentSession(),
    prisma.siteSettings.findUnique({
      where: { key: 'connect_settings' }
    })
  ])

  const settingsMap = siteSettings.reduce((acc, s) => {
    acc[s.key] = s.value
    return acc
  }, {} as Record<string, any>)

  const connect = (connectSettings?.value as any) || { showConnect: false }

  const siteName = (settingsMap.site_name as string) || 'AI Website Tools'
  const siteLogo = (settingsMap.site_logo as string) || ''
  const showLogo = settingsMap.show_logo === undefined ? true : (settingsMap.show_logo === true || settingsMap.show_logo === 'true')
  const logoType = (settingsMap.logo_type as string) || 'image'

  // Default menu items if database is empty or for core navigation
  // Only use these if no menus are defined in the database
  const defaultNavItems = menuItems.length === 0 ? [
    { id: "home", label: "Home", url: "/", icon: "Home", openInNewTab: false },
    { id: "tools", label: "Tools", url: "/tools", icon: "Wrench", openInNewTab: false },
    { id: "pricing", label: "Pricing", url: "/pricing", icon: "CreditCard", openInNewTab: false },
    { id: "about", label: "About", url: "/about", icon: "Info", openInNewTab: false },
  ] : []

  if (menuItems.length === 0 && session?.user) {
    defaultNavItems.push({ id: "favorites", label: "Favorites", url: "/dashboard/favorites", icon: "Heart", openInNewTab: false })
    defaultNavItems.push({ id: "dashboard", label: "Dashboard", url: "/dashboard", icon: "LayoutDashboard", openInNewTab: false })
    defaultNavItems.push({ id: "settings", label: "Settings", url: "/dashboard/settings", icon: "Settings", openInNewTab: false })
  }

  const Logo = () => {
    if (!showLogo) {
      return (
        <>
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-primary-foreground shadow-md">
            AI
          </div>
          <span className="truncate">{siteName}</span>
        </>
      )
    }

    if (logoType === 'css') {
      return <AnimatedLogo text="inspoaibox" />
    }

    if (siteLogo) {
      return (
        <div className="relative h-8 w-auto min-w-[32px] aspect-[3/1]">
          <Image
            src={siteLogo}
            alt={siteName}
            fill
            className="object-contain object-left"
          />
        </div>
      )
    }

    // Fallback if showLogo is true but no image and type is image
    return (
      <>
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-primary-foreground shadow-md">
          AI
        </div>
        <span className="truncate">{siteName}</span>
      </>
    )
  }

  return (
    <>
      <div className="md:hidden sticky top-0 z-50 bg-background border-b">
        <MobileNav
          session={session}
          siteName={siteName}
          menuItems={menuItems.length > 0 ? menuItems : defaultNavItems}
          siteLogo={siteLogo}
          showLogo={showLogo}
          logoType={logoType}
        />
      </div>
      <aside className="hidden md:flex h-screen w-64 flex-col fixed left-0 top-0 border-r bg-background z-50">
        {/* Logo & Title */}
        <div className="p-6 border-b flex items-center justify-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl w-full">
            <Logo />
          </Link>
        </div>

        {/* Search */}
        <div className="p-4">
          <SidebarSearch />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.length > 0 ? (
            <SidebarNav items={menuItems} />
          ) : (
            <SidebarNav items={defaultNavItems} />
          )}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t space-y-4">
          {/* Legal Links */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
          </div>

          {/* Connect Icons */}
          {connect.showConnect && (
            <div className="flex items-center gap-1 flex-wrap">
              {connect.twitter && (
                <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                  <a href={connect.twitter} target="_blank" rel="noopener noreferrer">
                    <Twitter className="h-4 w-4" />
                    <span className="sr-only">Twitter</span>
                  </a>
                </Button>
              )}
              {connect.github && (
                <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                  <a href={connect.github} target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4" />
                    <span className="sr-only">GitHub</span>
                  </a>
                </Button>
              )}
              {connect.facebook && (
                <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                  <a href={connect.facebook} target="_blank" rel="noopener noreferrer">
                    <Facebook className="h-4 w-4" />
                    <span className="sr-only">Facebook</span>
                  </a>
                </Button>
              )}
              {connect.youtube && (
                <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                  <a href={connect.youtube} target="_blank" rel="noopener noreferrer">
                    <Youtube className="h-4 w-4" />
                    <span className="sr-only">YouTube</span>
                  </a>
                </Button>
              )}
              {connect.instagram && (
                <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                  <a href={connect.instagram} target="_blank" rel="noopener noreferrer">
                    <Instagram className="h-4 w-4" />
                    <span className="sr-only">Instagram</span>
                  </a>
                </Button>
              )}
              {connect.linkedin && (
                <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                  <a href={connect.linkedin} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-4 w-4" />
                    <span className="sr-only">LinkedIn</span>
                  </a>
                </Button>
              )}
              {connect.tiktok && (
                <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                  <a href={connect.tiktok} target="_blank" rel="noopener noreferrer">
                    <span className="text-[10px] font-bold">TK</span>
                    <span className="sr-only">TikTok</span>
                  </a>
                </Button>
              )}
              {connect.email && (
                <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                  <a href={`mailto:${connect.email}`}>
                    <Mail className="h-4 w-4" />
                    <span className="sr-only">Email</span>
                  </a>
                </Button>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Theme</span>
            <ThemeToggle />
          </div>
          <div className="pt-2">
            <UserMenu session={session} />
          </div>
        </div>
      </aside>
    </>
  )
}