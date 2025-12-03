import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('=== 检查使用限制配置 ===\n')
  
  // 查询使用限制配置
  const settings = await prisma.siteSettings.findUnique({
    where: { key: 'usage_limits' }
  })

  if (!settings) {
    console.log('❌ 未找到使用限制配置，将使用默认值：')
    console.log('- 游客每日限制: 10')
    console.log('- 注册用户每日限制: 50')
  } else {
    console.log('✅ 使用限制配置：')
    console.log(JSON.stringify(settings.value, null, 2))
  }

  // 查询今天的使用记录（游客）
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const todayCount = await prisma.usageRecord.count({
    where: {
      userId: null,  // 游客
      createdAt: { gte: todayStart }
    }
  })

  console.log('\n=== 今天的使用情况 ===')
  console.log('今天游客总使用次数:', todayCount)

  // 查询 aura-check 工具今天的使用记录
  const tool = await prisma.tool.findUnique({
    where: { slug: 'aura-check' }
  })

  if (tool) {
    const toolTodayCount = await prisma.usageRecord.count({
      where: {
        toolId: tool.id,
        createdAt: { gte: todayStart }
      }
    })
    console.log('aura-check 今天使用次数:', toolTodayCount)
  }

  await prisma.$disconnect()
}

main()
