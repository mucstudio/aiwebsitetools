import { Footer } from "@/components/layout/Footer"
import { requireAuth } from "@/lib/auth-utils"
import Link from "next/link"
import { Home, User, Shield, CreditCard, Heart, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth()

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: Home },
    { label: "Profile", href: "/dashboard/profile", icon: User },
    { label: "Favorites", href: "/dashboard/favorites", icon: Heart },
    { label: "Subscription", href: "/dashboard/subscription", icon: CreditCard },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ]

  return (
    <>
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px] pointer-events-none"></div>

        {/* Dashboard Top Navigation */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 relative z-10">
          <div className="container flex h-14 items-center">
            <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground flex items-center gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <main className="flex-1 p-6 relative z-10">
          {children}
        </main>
      </div>
      <Footer showLinks={false} />
    </>
  )
}
