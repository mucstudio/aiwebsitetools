import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const tool = await prisma.tool.findUnique({
    where: { slug: 'aura-check' }
  })

  if (!tool) {
    console.log('工具不存在')
    return
  }

  console.log('=== 当前状态 ===')
  console.log('工具 usageCount:', tool.usageCount)

  // 查询今天的使用记录
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const todayRecords = await prisma.usageRecord.count({
    where: {
      toolId: tool.id,
      createdAt: { gte: todayStart }
    }
  })

  console.log('今天的使用记录数:', todayRecords)

  // 获取全局限制
  const settings = await prisma.siteSettings.findUnique({
    where: { key: 'usage_limits' }
  })

  const limits = settings ? settings.value : { guest: { dailyLimit: 10 } }
  console.log('游客每日限制:', limits.guest.dailyLimit)
  console.log('计算的剩余次数:', limits.guest.dailyLimit - todayRecords)

  await prisma.$disconnect()
}

main()
