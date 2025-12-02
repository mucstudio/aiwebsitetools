/**
 * 本地测试 AI 调用
 * 测试 /api/ai/call 端点是否正常工作
 */

async function testAICall() {
  console.log('🧪 Testing AI call endpoint...\n')

  try {
    const response = await fetch('http://localhost:3000/api/ai/call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-Fingerprint': 'test-fingerprint'
      },
      body: JSON.stringify({
        prompt: 'Say "Hello, this is a test!" in a friendly way.',
        toolId: 'test-tool'
      })
    })

    console.log('📊 Response Status:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Error Response:', errorText)
      return
    }

    const data = await response.json()

    console.log('\n✅ Success!')
    console.log('📝 AI Response:', data.response)
    console.log('📈 Usage Stats:', {
      inputTokens: data.usage?.inputTokens,
      outputTokens: data.usage?.outputTokens,
      cost: data.usage?.cost,
      remaining: data.usage?.remaining
    })

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// 运行测试
testAICall()
