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
    console.log('- ID:', tool.id)
    console.log('- 名称:', tool.name)
    console.log('- Slug:', tool.slug)
    console.log('- 是否发布:', tool.isPublished ? '是' : '否')
    console.log('- 是否付费:', tool.isPremium ? '是' : '否')
    console.log('- 分类:', tool.category?.name)
    console.log('- 组件类型:', tool.componentType)
    console.log('- 使用次数 (usageCount):', tool.usageCount)

    // 查询使用记录
    const records = await prisma.usageRecord.findMany({
      where: { toolId: tool.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    console.log('\n最近的使用记录 (最多5条):')
    if (records.length === 0) {
      console.log('❌ 没有找到任何使用记录！')
    } else {
      console.log(`✅ 找到 ${records.length} 条记录`)
      records.forEach((record, index) => {
        console.log(`\n记录 ${index + 1}:`)
        console.log('  - 创建时间:', record.createdAt)
        console.log('  - 使用了 AI:', record.usedAI ? '是' : '否')
        console.log('  - AI Tokens:', record.aiTokens || 0)
      })
    }
  }

  await prisma.$disconnect()
}

main()
