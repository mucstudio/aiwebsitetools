import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const tool = await prisma.tool.findUnique({
    where: { slug: 'aura-check' },
    include: {
      category: true
    }
  })

  if (!tool) {
    console.log('工具不存在！')
  } else {
    console.log('工具信息：')
    console.log('- 名称:', tool.name)
    console.log('- Slug:', tool.slug)
    console.log('- 是否发布:', tool.isPublished ? '是' : '否')
    console.log('- 是否付费:', tool.isPremium ? '是' : '否')
    console.log('- 分类:', tool.category?.name)
    console.log('- 组件类型:', tool.componentType)
  }

  await prisma.$disconnect()
}

main()
