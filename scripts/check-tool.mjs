import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const slug = process.argv[2] || 'aura-check-v2'

try {
  const tool = await prisma.tool.findFirst({
    where: { slug }
  })

  if (tool) {
    console.log(JSON.stringify(tool, null, 2))
  } else {
    console.log(`工具 ${slug} 不存在`)
  }
} catch (error) {
  console.error('查询失败:', error.message)
} finally {
  await prisma.$disconnect()
}
