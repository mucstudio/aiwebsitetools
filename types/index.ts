import { User, Plan, Tool, Category, Subscription } from '@prisma/client'

export type UserWithSubscription = User & {
  subscription: (Subscription & { plan: Plan }) | null
}

export type ToolWithCategory = Tool & {
  category: Category
}

export type ToolWithStats = Tool & {
  category: Category
  _count: {
    usageRecords: number
    favorites: number
  }
}

export interface NavItem {
  title: string
  href: string
  disabled?: boolean
  external?: boolean
}

export interface SiteConfig {
  name: string
  description: string
  url: string
  ogImage: string
  links: {
    twitter?: string
    github?: string
  }
}

export interface DashboardConfig {
  mainNav: NavItem[]
  sidebarNav: NavItem[]
}

export interface AdminConfig {
  sidebarNav: NavItem[]
}
