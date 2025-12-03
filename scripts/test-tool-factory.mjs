/**
 * 🧪 工具工厂测试脚本
 *
 * 用于快速测试新创建的工具是否正常工作
 *
 * 使用方法：
 * node scripts/test-tool-factory.mjs aura-check "I just saved a cat from a tree"
 */

import fetch from 'node-fetch'

const BASE_URL = 'http://localhost:3000'

async function testTool(toolId, input) {
  console.log(`\n🧪 Testing tool: ${toolId}`)
  console.log(`📝 Input: ${input}`)
  console.log('─'.repeat(50))

  try {
    // 1. 生成模拟设备指纹
    const fingerprint = `test-fp-${Date.now()}`

    // 2. 调用工具 API
    const response = await fetch(`${BASE_URL}/api/tools/${toolId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-Fingerprint': fingerprint
      },
      body: JSON.stringify({
        userInput: input,
        fingerprint
      })
    })

    const data = await response.json()

    // 3. 显示结果
    if (response.ok) {
      console.log('✅ Success!')
      console.log('\n📊 Result:')
      console.log(JSON.stringify(data.result, null, 2))

      if (data.metadata) {
        console.log('\n📈 Metadata:')
        console.log(`  - AI Tokens: ${data.metadata.aiTokens || 0}`)
        console.log(`  - AI Cost: $${data.metadata.aiCost || 0}`)
      }

      if (data.remaining !== undefined) {
        console.log(`\n🔢 Remaining: ${data.remaining}`)
      }
    } else {
      console.log('❌ Error!')
      console.log(`  Status: ${response.status}`)
      console.log(`  Message: ${data.error}`)
    }

  } catch (error) {
    console.log('💥 Exception!')
    console.log(`  ${error.message}`)
  }

  console.log('─'.repeat(50))
}

// 主函数
async function main() {
  const toolId = process.argv[2]
  const input = process.argv[3]

  if (!toolId || !input) {
    console.log('Usage: node scripts/test-tool-factory.mjs <toolId> "<input>"')
    console.log('\nExamples:')
    console.log('  node scripts/test-tool-factory.mjs aura-check "I just saved a cat"')
    console.log('  node scripts/test-tool-factory.mjs dream-interpreter "I dreamed of flying"')
    console.log('  node scripts/test-tool-factory.mjs roast-resume "5 years experience in React"')
    process.exit(1)
  }

  await testTool(toolId, input)
}

main()
