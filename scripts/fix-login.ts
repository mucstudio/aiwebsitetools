import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixLogin() {
  try {
    console.log('开始修复登录问题...')

    // 1. 禁用邮箱验证要求
    await prisma.siteSettings.deleteMany({
      where: {
        key: 'require_email_verification'
      }
    })
    console.log('✓ 已禁用邮箱验证要求')

    // 2. 设置管理员邮箱为已验证
    const adminEmail = process.env.ADMIN_EMAIL || 'nfksuk@gmail.com'
    const updated = await prisma.user.updateMany({
      where: {
        email: adminEmail
      },
      data: {
        emailVerified: new Date()
      }
    })

    if (updated.count > 0) {
      console.log(`✓ 已设置管理员邮箱 ${adminEmail} 为已验证`)
    } else {
      console.log(`⚠ 未找到邮箱为 ${adminEmail} 的用户`)
    }

    // 3. 清除所有登录锁定
    const cleared = await prisma.loginAttempt.deleteMany({
      where: {
        lockedUntil: {
          not: null
        }
      }
    })
    console.log(`✓ 已清除 ${cleared.count} 个账号锁定`)

    console.log('\n修复完成！现在可以尝试登录了。')
  } catch (error) {
    console.error('修复失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixLogin()
