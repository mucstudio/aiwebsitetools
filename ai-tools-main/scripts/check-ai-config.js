const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkAIConfig() {
  try {
    console.log('=== Checking AI Configuration ===\n')

    // Check AI Providers
    const providers = await prisma.aIProvider.findMany()
    console.log(`Found ${providers.length} AI Provider(s):\n`)

    if (providers.length === 0) {
      console.log('❌ NO AI PROVIDERS CONFIGURED!')
      console.log('\nThis is why you\'re getting "Server cooked" error.')
      console.log('You need to configure at least one AI provider in the admin panel.')
      console.log('\nGo to: http://localhost:3000/admin/ai-config')
    } else {
      providers.forEach(provider => {
        console.log(`Provider ID: ${provider.id}`)
        console.log(`Name: ${provider.name}`)
        console.log(`Type: ${provider.type}`)
        console.log(`Enabled: ${provider.enabled ? '✅' : '❌'}`)
        console.log(`Is Default: ${provider.isDefault ? '✅' : '❌'}`)
        console.log(`API Key: ${provider.apiKey ? '***configured***' : '❌ MISSING'}`)
        console.log(`Base URL: ${provider.baseUrl || 'default'}`)
        console.log('---')
      })

      // Check for default provider
      const defaultProvider = providers.find(p => p.isDefault && p.enabled)
      if (!defaultProvider) {
        console.log('\n⚠️  WARNING: No default AI provider is enabled!')
        console.log('You need to enable at least one provider and set it as default.')
      } else {
        console.log(`\n✅ Default provider: ${defaultProvider.name}`)
      }
    }

    // Check AI Models
    const models = await prisma.aIModel.findMany({
      include: {
        provider: true
      }
    })

    console.log(`\n\nFound ${models.length} AI Model(s):\n`)
    models.forEach(model => {
      console.log(`Model: ${model.name}`)
      console.log(`Provider: ${model.provider.name}`)
      console.log(`Enabled: ${model.enabled ? '✅' : '❌'}`)
      console.log(`Is Default: ${model.isDefault ? '✅' : '❌'}`)
      console.log('---')
    })

  } catch (error) {
    console.error('Error checking AI config:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAIConfig()
