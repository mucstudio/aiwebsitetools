import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateCorporateClapback() {
  try {
    const updatedTool = await prisma.tool.update({
      where: {
        slug: 'corporate-clapback',
      },
      data: {
        name: 'Corporate Clapback 98',
        description: 'Transform your rage into professional emails. Don\'t get fired. Get promoted.',
        seoTitle: 'Corporate Clapback 98 - Professional Email Generator',
        seoDescription: 'Transform your rage into professional emails with Corporate Clapback 98. Don\'t get fired, get promoted.',
      },
    })
    console.log('✅ Tool "Corporate Clapback" updated successfully:', updatedTool.name)
  } catch (error) {
    console.error('❌ Failed to update tool "Corporate Clapback":', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

updateCorporateClapback()
