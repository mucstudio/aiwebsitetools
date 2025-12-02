/**
 * 调试 AI 调用问题
 */

async function debugAICall() {
  console.log('🔍 Debugging AI call...\n')

  try {
    const response = await fetch('http://localhost:3000/api/ai/call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-Fingerprint': 'test-fingerprint'
      },
      body: JSON.stringify({
        prompt: 'Test message',
        toolId: 'aura-check'
      })
    })

    console.log('📊 Status:', response.status, response.statusText)
    console.log('📋 Headers:', Object.fromEntries(response.headers.entries()))

    const text = await response.text()
    console.log('\n📄 Raw Response:')
    console.log(text)

    if (text) {
      try {
        const json = JSON.parse(text)
        console.log('\n📦 Parsed JSON:')
        console.log(JSON.stringify(json, null, 2))
      } catch (e) {
        console.log('\n⚠️  Response is not valid JSON')
      }
    }

  } catch (error) {
    console.error('❌ Request failed:', error.message)
    console.error(error.stack)
  }
}

debugAICall()
