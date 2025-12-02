import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('=== 检查 AI 配置 ===\n')

  // 1. 检查 AI 提供商
  const providers = await prisma.aIProvider.findMany()
  console.log('📡 AI 提供商数量:', providers.length)
  if (providers.length > 0) {
    providers.forEach(p => {
      console.log(`  - ${p.name} (${p.type}): ${p.isActive ? '✅ 激活' : '❌ 未激活'}`)
    })
  } else {
    console.log('  ❌ 没有配置任何 AI 提供商')
  }
  console.log()

  // 2. 检查 AI 模型
  const models = await prisma.aIModel.findMany({
    include: { provider: true }
  })
  console.log('🤖 AI 模型数量:', models.length)
  if (models.length > 0) {
    models.forEach(m => {
      console.log(`  - ${m.name} (${m.modelId})`)
      console.log(`    提供商: ${m.provider.name}`)
      console.log(`    状态: ${m.isActive ? '✅ 激活' : '❌ 未激活'}`)
    })
  } else {
    console.log('  ❌ 没有配置任何 AI 模型')
  }
  console.log()

  // 3. 检查 AI 配置
  const aiConfig = await prisma.aIConfig.findFirst()
  console.log('⚙️  AI 配置:')
  if (!aiConfig) {
    console.log('  ❌ 没有 AI 配置记录')
  } else {
    console.log('  - 主模型 ID:', aiConfig.primaryModelId || '❌ 未设置')
    console.log('  - 启用备用:', aiConfig.enableFallback ? '✅ 是' : '❌ 否')
    console.log('  - 备用模型 1:', aiConfig.fallback1ModelId || '未设置')
    console.log('  - 备用模型 2:', aiConfig.fallback2ModelId || '未设置')
  }
  console.log()

  // 4. 诊断
  console.log('💡 诊断结果:')
  if (providers.length === 0) {
    console.log('  ❌ 需要添加 AI 提供商（OpenAI/Anthropic/Google）')
  }
  if (models.length === 0) {
    console.log('  ❌ 需要添加 AI 模型')
  }
  if (!aiConfig || !aiConfig.primaryModelId) {
    console.log('  ❌ 需要配置主 AI 模型')
  }

  const activeProviders = providers.filter(p => p.isActive)
  const activeModels = models.filter(m => m.isActive)

  if (activeProviders.length === 0) {
    console.log('  ❌ 没有激活的 AI 提供商')
  }
  if (activeModels.length === 0) {
    console.log('  ❌ 没有激活的 AI 模型')
  }

  if (providers.length > 0 && models.length > 0 && aiConfig && aiConfig.primaryModelId) {
    const primaryModel = models.find(m => m.id === aiConfig.primaryModelId)
    if (primaryModel) {
      if (primaryModel.isActive && primaryModel.provider.isActive) {
        console.log('  ✅ AI 配置正常')
      } else {
        console.log('  ⚠️  主模型或其提供商未激活')
      }
    } else {
      console.log('  ❌ 主模型不存在')
    }
  }

  await prisma.$disconnect()
}

main()
