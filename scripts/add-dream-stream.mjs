import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// 读取 DreamStream 组件代码
const componentCode = fs.readFileSync(
  path.join(process.cwd(), 'components/tools/DreamStream.tsx'),
  'utf-8'
)

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

  console.log('✅ Dream Stream 工具添加成功！')
  console.log('ID:', tool.id)
  console.log('URL:', `/tools/${tool.slug}`)
} catch (error) {
  console.error('❌ 添加失败:', error.message)
} finally {
  await prisma.$disconnect()
}
