"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { UserMenu } from "./UserMenu"
import { SidebarNav } from "./SidebarNav"
import { SidebarSearch } from "./SidebarSearch"

interface MobileNavProps {
  session: any
  siteName: string
  menuItems: any[]
}

export function MobileNav({ session, siteName, menuItems }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex items-center justify-between p-4 w-full">
      <Link href="/" className="flex items-center gap-2 font-bold text-lg">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-primary-foreground shadow-md">
          AI
        </div>
        <span className="truncate max-w-[150px]">{siteName}</span>
      </Link>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <div className="flex flex-col h-full">
            <div className="p-6 border-b">
              <Link href="/" className="flex items-center gap-2 font-bold text-xl" onClick={() => setOpen(false)}>
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-primary-foreground shadow-md">
                  AI
                </div>
                <span>{siteName}</span>
              </Link>
            </div>

            <div className="p-4">
              <SidebarSearch />
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              <SidebarNav items={menuItems} />
            </nav>

            <div className="p-4 border-t space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Theme</span>
                <ThemeToggle />
              </div>
              <div className="pt-2">
                <UserMenu session={session} />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}