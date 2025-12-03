import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 修改这里的值
const toolData = {
  slug: 'dream-stream',
  name: 'Dream Stream',
  description: 'Unlock the secrets of your subconscious mind. Decode your dreams with mystical, psychological, or unhinged interpretations.',
  icon: '🌙',
  categoryId: 'cmioem2lf0000d3p42gr64zgj',
  componentType: 'dream-stream',
  codeMode: 'react',
  isPremium: false,
  isPublished: true,
  requiresAI: true,
  tags: ['dream', 'psychology', 'mystical', 'interpretation', 'subconscious'],
  seoTitle: 'Dream Stream - AI Dream Interpreter | Decode Your Dreams',
  seoDescription: 'Unlock the secrets of your subconscious mind with AI-powered dream interpretation. Choose from mystical, psychological, or unhinged analysis styles.'
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
