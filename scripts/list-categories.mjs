import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

try {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true
    }
  })

  console.log('📁 可用分类：\n')
  categories.forEach(cat => {
    console.log(`ID: ${cat.id}`)
    console.log(`名称: ${cat.name}`)
    console.log(`Slug: ${cat.slug}`)
    console.log('---')
  })
} catch (error) {
  console.error('❌ 查询失败:', error.message)
} finally {
  await prisma.$disconnect()
}
