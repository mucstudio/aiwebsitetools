import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

/**
 * 权限定义
 */
export const PERMISSIONS = {
  // 用户管理
  USERS_VIEW: "users.view",
  USERS_CREATE: "users.create",
  USERS_EDIT: "users.edit",
  USERS_DELETE: "users.delete",

  // 工具管理
  TOOLS_VIEW: "tools.view",
  TOOLS_CREATE: "tools.create",
  TOOLS_EDIT: "tools.edit",
  TOOLS_DELETE: "tools.delete",
  TOOLS_PUBLISH: "tools.publish",

  // 分类管理
  CATEGORIES_VIEW: "categories.view",
  CATEGORIES_CREATE: "categories.create",
  CATEGORIES_EDIT: "categories.edit",
  CATEGORIES_DELETE: "categories.delete",

  // 订阅计划管理
  PLANS_VIEW: "plans.view",
  PLANS_CREATE: "plans.create",
  PLANS_EDIT: "plans.edit",
  PLANS_DELETE: "plans.delete",

  // 支付记录
  PAYMENTS_VIEW: "payments.view",
  PAYMENTS_REFUND: "payments.refund",

  // 系统设置
  SETTINGS_VIEW: "settings.view",
  SETTINGS_EDIT: "settings.edit",

  // 审计日志
  AUDIT_LOGS_VIEW: "audit_logs.view",
  AUDIT_LOGS_EXPORT: "audit_logs.export",
} as const

/**
 * 默认角色权限配置
 */
export const DEFAULT_ROLE_PERMISSIONS = {
  USER: [
    // 普通用户没有管理权限
  ],
  ADMIN: [
    // 管理员拥有所有权限
    ...Object.values(PERMISSIONS),
  ],
}

/**
 * 检查用户是否有指定权限
 */
export async function hasPermission(
  userId: string,
  permission: string
): Promise<boolean> {
  try {
    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (!user) {
      return false
    }

    // 管理员拥有所有权限
    if (user.role === "ADMIN") {
      return true
    }

    // 检查角色权限
    const rolePermission = await prisma.rolePermission.findFirst({
      where: {
        role: user.role,
        permission: {
          name: permission,
        },
      },
    })

    return !!rolePermission
  } catch (error) {
    console.error("Error checking permission:", error)
    return false
  }
}

/**
 * 检查用户是否有多个权限中的任意一个
 */
export async function hasAnyPermission(
  userId: string,
  permissions: string[]
): Promise<boolean> {
  for (const permission of permissions) {
    if (await hasPermission(userId, permission)) {
      return true
    }
  }
  return false
}

/**
 * 检查用户是否有所有指定权限
 */
export async function hasAllPermissions(
  userId: string,
  permissions: string[]
): Promise<boolean> {
  for (const permission of permissions) {
    if (!(await hasPermission(userId, permission))) {
      return false
    }
  }
  return true
}

/**
 * 获取用户的所有权限
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (!user) {
      return []
    }

    // 管理员拥有所有权限
    if (user.role === "ADMIN") {
      return Object.values(PERMISSIONS)
    }

    // 获取角色权限
    const rolePermissions = await prisma.rolePermission.findMany({
      where: { role: user.role },
      include: { permission: true },
    })

    return rolePermissions.map(rp => rp.permission.name)
  } catch (error) {
    console.error("Error getting user permissions:", error)
    return []
  }
}

/**
 * 初始化权限系统
 */
export async function initializePermissions() {
  console.log("🔐 初始化权限系统...")

  try {
    // 创建所有权限
    const permissionCategories = {
      users: ["view", "create", "edit", "delete"],
      tools: ["view", "create", "edit", "delete", "publish"],
      categories: ["view", "create", "edit", "delete"],
      plans: ["view", "create", "edit", "delete"],
      payments: ["view", "refund"],
      settings: ["view", "edit"],
      audit_logs: ["view", "export"],
    }

    for (const [category, actions] of Object.entries(permissionCategories)) {
      for (const action of actions) {
        const permissionName = `${category}.${action}`
        const description = `${action.charAt(0).toUpperCase() + action.slice(1)} ${category}`

        await prisma.permission.upsert({
          where: { name: permissionName },
          update: { description, category },
          create: { name: permissionName, description, category },
        })
      }
    }

    console.log("✅ 权限创建完成")

    // 为管理员角色分配所有权限
    const allPermissions = await prisma.permission.findMany()

    for (const permission of allPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          role_permissionId: {
            role: "ADMIN",
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          role: "ADMIN",
          permissionId: permission.id,
        },
      })
    }

    console.log("✅ 管理员权限分配完成")
    console.log(`   总计 ${allPermissions.length} 个权限`)

  } catch (error) {
    console.error("❌ 权限初始化失败:", error)
    throw error
  }
}

/**
 * 权限检查中间件（用于 API 路由）
 */
export function requirePermission(permission: string) {
  return async (userId: string) => {
    const hasAccess = await hasPermission(userId, permission)
    if (!hasAccess) {
      throw new Error(`Permission denied: ${permission}`)
    }
    return true
  }
}
