import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 修改这里的值
const toolData = {
  slug: 'corporate-clapback',              // 工具URL名
  name: 'Corporate Clapback 98',         // 显示名称
  description: 'Transform your rage into professional emails. Do not get fired. Get promoted.', // 工具描述
  categoryId: 'cmioem2lf0000d3p42gr64zgj',      // Entertainment 分类ID
  componentType: 'corporate-clapback',     // 组件名（和slug一样）
  isPublished: true               // true=上线，false=隐藏
}

try {
  const tool = await prisma.tool.create({
    data: toolData
  })

  console.log('✅ 工具添加成功！')
  console.log('ID:', tool.id)
  console.log('URL:', `/tools/${tool.slug}`)
} catch (error) {
  console.error('❌ 添加失败:', error.message)
} finally {
  await prisma.$disconnect()
}
