/**
 * 管理员初始化脚本
 * 从 .env 文件读取管理员信息并创建管理员账号
 *
 * 运行方式：
 * npx tsx scripts/init-admin.ts
 */

import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function initAdmin() {
  console.log("🚀 开始初始化管理员账号...")

  // 从环境变量读取管理员信息
  const adminEmail = process.env.ADMIN_EMAIL
  const adminName = process.env.ADMIN_NAME || "Administrator"
  const adminPassword = process.env.ADMIN_PASSWORD

  // 验证必填字段
  if (!adminEmail) {
    console.error("❌ 错误：未设置 ADMIN_EMAIL 环境变量")
    process.exit(1)
  }

  if (!adminPassword) {
    console.error("❌ 错误：未设置 ADMIN_PASSWORD 环境变量")
    process.exit(1)
  }

  if (adminPassword.length < 8) {
    console.error("❌ 错误：管理员密码至少需要 8 个字符")
    process.exit(1)
  }

  try {
    // 检查管理员是否已存在
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    })

    if (existingAdmin) {
      if (existingAdmin.role === "ADMIN") {
        console.log(`ℹ️  管理员账号已存在: ${adminEmail}`)

        // 询问是否更新密码
        const shouldUpdate = process.argv.includes("--update-password")

        if (shouldUpdate) {
          const hashedPassword = await bcrypt.hash(adminPassword, 10)
          await prisma.user.update({
            where: { email: adminEmail },
            data: {
              password: hashedPassword,
              name: adminName,
            },
          })
          console.log("✅ 管理员密码已更新")
        } else {
          console.log("💡 提示：使用 --update-password 参数可以更新密码")
        }
      } else {
        // 将现有用户升级为管理员
        await prisma.user.update({
          where: { email: adminEmail },
          data: {
            role: "ADMIN",
            name: adminName,
          },
        })
        console.log(`✅ 用户 ${adminEmail} 已升级为管理员`)
      }
    } else {
      // 创建新的管理员账号
      const hashedPassword = await bcrypt.hash(adminPassword, 10)

      const admin = await prisma.user.create({
        data: {
          email: adminEmail,
          name: adminName,
          password: hashedPassword,
          role: "ADMIN",
          emailVerified: new Date(), // 管理员账号默认已验证
        },
      })

      console.log(`✅ 管理员账号创建成功！`)
      console.log(`   邮箱: ${admin.email}`)
      console.log(`   姓名: ${admin.name}`)
      console.log(`   角色: ${admin.role}`)
    }

    // 显示 IP 白名单配置
    const ipWhitelist = process.env.ADMIN_IP_WHITELIST
    if (ipWhitelist && ipWhitelist.trim()) {
      console.log(`\n🔒 IP 白名单已启用:`)
      ipWhitelist.split(",").forEach(ip => {
        console.log(`   - ${ip.trim()}`)
      })
    } else {
      console.log(`\n⚠️  警告：未配置 IP 白名单，所有 IP 都可以访问管理后台`)
      console.log(`   建议在 .env 中设置 ADMIN_IP_WHITELIST`)
    }

    // 显示审计日志配置
    const auditLogEnabled = process.env.ENABLE_AUDIT_LOG === "true"
    console.log(`\n📝 审计日志: ${auditLogEnabled ? "已启用" : "未启用"}`)
    if (auditLogEnabled) {
      const retentionDays = process.env.AUDIT_LOG_RETENTION_DAYS || "90"
      console.log(`   保留天数: ${retentionDays} 天`)
    }

    console.log("\n✨ 管理员初始化完成！")
    console.log(`\n🔐 登录信息:`)
    console.log(`   URL: ${process.env.NEXT_PUBLIC_APP_URL}/admin`)
    console.log(`   邮箱: ${adminEmail}`)
    console.log(`   密码: [已加密存储]`)

  } catch (error) {
    console.error("❌ 初始化失败:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// 运行初始化
initAdmin()
