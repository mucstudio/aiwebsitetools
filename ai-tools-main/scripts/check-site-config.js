const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkSiteConfig() {
  try {
    const config = await prisma.siteConfig.findFirst()

    console.log('=== Site Configuration ===\n')

    if (!config) {
      console.log('❌ NO SITE CONFIG FOUND!')
      console.log('\nThis is the problem! You need to initialize site config.')
    } else {
      console.log('Site Config ID:', config.id)
      console.log('Default AI Model ID:', config.defaultAIModelId || '❌ NOT SET')
      console.log('Backup AI Model 1:', config.backupAIModelId1 || 'Not set')
      console.log('Backup AI Model 2:', config.backupAIModelId2 || 'Not set')
      console.log('Backup AI Model 3:', config.backupAIModelId3 || 'Not set')

      if (!config.defaultAIModelId) {
        console.log('\n⚠️  WARNING: Default AI Model is not set!')
        console.log('This is why your AI tools are failing.')
        console.log('\nSolution: Go to http://localhost:3000/admin/ai-config')
        console.log('and set a default model.')
      } else {
        console.log('\n✅ Default AI Model is configured')
      }
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSiteConfig()
