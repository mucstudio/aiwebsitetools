import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testAICall() {
  console.log('=== 测试 AI 调用 ===\n')

  try {
    // 1. 获取 AI 配置
    const aiConfig = await prisma.aIConfig.findFirst()

    if (!aiConfig || !aiConfig.primaryModelId) {
      console.log('❌ 错误: 没有找到 AI 配置或主模型')
      return
    }

    console.log('✅ AI 配置存在')
    console.log('   主模型 ID:', aiConfig.primaryModelId)

    // 2. 获取主模型信息
    const primaryModel = await prisma.aIModel.findUnique({
      where: { id: aiConfig.primaryModelId },
      include: { provider: true }
    })

    if (!primaryModel) {
      console.log('❌ 错误: 主模型不存在')
      return
    }

    console.log('✅ 主模型信息:')
    console.log('   名称:', primaryModel.name)
    console.log('   模型 ID:', primaryModel.modelId)
    console.log('   是否激活:', primaryModel.isActive)
    console.log('   提供商:', primaryModel.provider.name)
    console.log('   提供商类型:', primaryModel.provider.type)
    console.log('   提供商激活:', primaryModel.provider.isActive)
    console.log('   API 端点:', primaryModel.provider.apiEndpoint)
    console.log('   API 密钥:', primaryModel.provider.apiKey ? '已设置 (长度: ' + primaryModel.provider.apiKey.length + ')' : '❌ 未设置')

    // 3. 检查提供商类型是否支持
    const supportedTypes = ['openai', 'anthropic', 'google', 'custom']
    if (!supportedTypes.includes(primaryModel.provider.type)) {
      console.log('\n❌ 错误: 不支持的提供商类型:', primaryModel.provider.type)
      console.log('   支持的类型:', supportedTypes.join(', '))
      return
    }

    console.log('\n✅ 提供商类型支持')

    // 4. 测试 API 调用
    console.log('\n🔄 测试 API 调用...')

    const testPrompt = "Say 'Hello, this is a test!' in one sentence."

    try {
      const apiKey = primaryModel.provider.apiKey
      const apiEndpoint = primaryModel.provider.apiEndpoint
      const modelId = primaryModel.modelId

      console.log('   请求 URL:', `${apiEndpoint}/chat/completions`)
      console.log('   模型:', modelId)

      const response = await fetch(`${apiEndpoint}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            { role: "user", content: testPrompt }
          ],
          temperature: 0.9,
          max_tokens: 100
        })
      })

      console.log('   响应状态:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.log('❌ API 调用失败:')
        console.log('   状态码:', response.status)
        console.log('   错误信息:', errorText.substring(0, 500))
        return
      }

      const data = await response.json()
      console.log('✅ API 调用成功!')
      console.log('   响应:', JSON.stringify(data, null, 2).substring(0, 500))

      if (data.choices && data.choices[0] && data.choices[0].message) {
        console.log('\n✅ AI 回复:', data.choices[0].message.content)
      }

    } catch (apiError) {
      console.log('❌ API 调用异常:', apiError.message)
      console.log('   详细信息:', apiError)
    }

  } catch (error) {
    console.log('❌ 测试失败:', error.message)
    console.log('   详细信息:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAICall()
