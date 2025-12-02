/**
 * 权限系统初始化脚本
 * 创建所有权限并为管理员角色分配权限
 *
 * 运行方式：
 * npm run permissions:init
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function initPermissions() {
  console.log("🔐 开始初始化权限系统...")

  try {
    // 定义权限分类和操作
    const permissionCategories = {
      users: {
        actions: ["view", "create", "edit", "delete"],
        description: "用户管理",
      },
      tools: {
        actions: ["view", "create", "edit", "delete", "publish"],
        description: "工具管理",
      },
      categories: {
        actions: ["view", "create", "edit", "delete"],
        description: "分类管理",
      },
      plans: {
        actions: ["view", "create", "edit", "delete"],
        description: "订阅计划管理",
      },
      payments: {
        actions: ["view", "refund"],
        description: "支付管理",
      },
      settings: {
        actions: ["view", "edit"],
        description: "系统设置",
      },
      audit_logs: {
        actions: ["view", "export"],
        description: "审计日志",
      },
    }

    let totalPermissions = 0

    // 创建所有权限
    for (const [category, config] of Object.entries(permissionCategories)) {
      console.log(`\n📋 创建 ${config.description} 权限...`)

      for (const action of config.actions) {
        const permissionName = `${category}.${action}`
        const description = `${action.charAt(0).toUpperCase() + action.slice(1)} ${config.description}`

        const permission = await prisma.permission.upsert({
          where: { name: permissionName },
          update: { description, category },
          create: { name: permissionName, description, category },
        })

        console.log(`   ✓ ${permissionName}`)
        totalPermissions++
      }
    }

    console.log(`\n✅ 权限创建完成，共 ${totalPermissions} 个权限`)

    // 为管理员角色分配所有权限
    console.log("\n👑 为管理员角色分配权限...")

    const allPermissions = await prisma.permission.findMany()
    let assignedCount = 0

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
      assignedCount++
    }

    console.log(`✅ 管理员权限分配完成，共 ${assignedCount} 个权限`)

    // 显示权限统计
    console.log("\n📊 权限统计:")
    for (const [category, config] of Object.entries(permissionCategories)) {
      const count = config.actions.length
      console.log(`   ${config.description}: ${count} 个权限`)
    }

    console.log("\n✨ 权限系统初始化完成！")

  } catch (error) {
    console.error("❌ 权限初始化失败:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// 运行初始化
initPermissions()
