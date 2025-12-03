import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 修改这里的值
const toolData = {
  slug: 'your-tool',              // 工具URL名
  name: 'Your Tool Name',         // 显示名称
  description: 'Tool description', // 工具描述
  categoryId: 'category-id',      // 分类ID（先运行 node scripts/list-categories.mjs 查看）
  componentType: 'your-tool',     // 组件名（和slug一样）
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
