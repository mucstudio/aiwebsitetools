"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, ChevronRight, Wrench, Home, CreditCard, Info, Heart, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface MenuItem {
  id: string
  label: string
  url: string
  icon?: string | null
  openInNewTab: boolean
  children?: MenuItem[]
}

interface SidebarNavProps {
  items: MenuItem[]
}

export function SidebarNav({ items }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <div className="space-y-1">
      {items.map((item) => (
        <SidebarNavItem key={item.id} item={item} pathname={pathname} />
      ))}
    </div>
  )
}

function SidebarNavItem({ item, pathname }: { item: MenuItem; pathname: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const hasChildren = item.children && item.children.length > 0
  const isActive = pathname === item.url || (hasChildren && item.children?.some(child => pathname === child.url))

  const Icon = getIcon(item.icon)

  if (hasChildren) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-between gap-3 mb-1 font-normal",
              isActive && "bg-accent text-accent-foreground font-medium"
            )}
          >
            <div className="flex items-center gap-3">
              <Icon className="h-4 w-4" />
              {item.label}
            </div>
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-4 space-y-1">
          {item.children?.map((child) => (
            <Link
              key={child.id}
              href={child.url}
              target={child.openInNewTab ? "_blank" : undefined}
              rel={child.openInNewTab ? "noopener noreferrer" : undefined}
            >
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-start gap-3 mb-1 font-normal h-9",
                  pathname === child.url && "bg-accent/50 text-accent-foreground font-medium"
                )}
              >
                {child.label}
              </Button>
            </Link>
          ))}
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <Link
      href={item.url}
      target={item.openInNewTab ? "_blank" : undefined}
      rel={item.openInNewTab ? "noopener noreferrer" : undefined}
    >
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-3 mb-1 font-normal",
          pathname === item.url && "bg-accent text-accent-foreground font-medium"
        )}
      >
        <Icon className="h-4 w-4" />
        {item.label}
      </Button>
    </Link>
  )
}

function getIcon(iconName?: string | null) {
  switch (iconName) {
    case "Home": return Home
    case "Wrench": return Wrench
    case "CreditCard": return CreditCard
    case "Info": return Info
    case "Heart": return Heart
    case "LayoutDashboard": return LayoutDashboard
    default: return Wrench
  }
}