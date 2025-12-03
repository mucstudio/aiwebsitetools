import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

try {
  const tool = await prisma.tool.findUnique({
    where: { slug: 'dream-stream' }
  })

  console.log('Tool found:')
  console.log('ID:', tool?.id)
  console.log('Slug:', tool?.slug)
  console.log('Component Type:', tool?.componentType)
  console.log('Requires AI:', tool?.requiresAI)
} catch (error) {
  console.error('Error:', error.message)
} finally {
  await prisma.$disconnect()
}
