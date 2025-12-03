import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const tool = await prisma.tool.findUnique({
    where: { slug: 'aura-check' }
  })

  if (\!tool) {
    console.log('工具不存在')
    return
  }

  console.log('工具 ID:', tool.id)
  console.log('使用次数:', tool.usageCount)

  const records = await prisma.usageRecord.findMany({
    where: { toolId: tool.id },
    orderBy: { createdAt: 'desc' },
    take: 5
  })

  console.log('使用记录数:', records.length)
  console.log(JSON.stringify(records, null, 2))

  await prisma.()
}

main()
