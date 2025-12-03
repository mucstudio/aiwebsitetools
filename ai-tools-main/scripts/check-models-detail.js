const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkModels() {
  try {
    const models = await prisma.aIModel.findMany({
      include: {
        provider: true
      }
    })

    console.log('=== Detailed Model Information ===\n')
    console.log(JSON.stringify(models, null, 2))

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkModels()
