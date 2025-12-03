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

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const records = await prisma.usageRecord.findMany({
    where: {
      toolId: tool.id,
      createdAt: { gte: todayStart }
    },
    orderBy: { createdAt: 'desc' }
  })

  console.log('=== 今天的使用记录 ===')
  console.log('总共:', records.length, '条\n')

  records.forEach((record, index) => {
    console.log('记录', index + 1)
    console.log('  SessionId:', record.sessionId || '无')
    console.log('  IP:', record.ipAddress || '无')
    console.log('  UserId:', record.userId || '游客')
    console.log()
  })

  await prisma.$disconnect()
}

main()
