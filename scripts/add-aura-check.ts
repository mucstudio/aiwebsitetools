import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addTool() {
  try {
    // 查找或创建分类
    let category = await prisma.category.findFirst({
      where: { slug: 'entertainment' }
    })

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: 'Entertainment',
          slug: 'entertainment',
          description: 'Fun and entertainment tools',
          order: 99
        }
      })
      console.log('✅ 分类已创建:', category.name)
    }

    // 添加工具
    const tool = await prisma.tool.create({
      data: {
        name: 'Aura Check',
        slug: 'aura-check',
        description: 'Calculate your spiritual credit score based on your recent actions. A mystical vibe calculator for Gen Z.',
        categoryId: category.id,
        componentType: 'AuraCheck',
        isPremium: false,
        isPublished: true,
        requiresAI: true,
        seoTitle: 'Aura Check - Vibe Calculator | Calculate Your Spiritual Credit Score',
        seoDescription: 'Did you gain aura or lose it? Enter your recent action to calculate your spiritual credit score with our mystical vibe calculator.',
        tags: ['entertainment', 'fun', 'ai', 'social', 'gen-z']
      }
    })

    console.log('✅ 工具已添加:', tool.name)
    console.log('📝 Slug:', tool.slug)
    console.log('🆔 ID:', tool.id)
    console.log('🔗 访问地址: /tools/' + tool.slug)
  } catch (error) {
    console.error('❌ 添加失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addTool()
