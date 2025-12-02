/**
 * 检查生产服务器的 AI 调用错误
 */

async function checkProductionError() {
  console.log('🔍 Checking production server error...\n')

  try {
    const response = await fetch('https://inspoaibox.com/api/ai/call', {
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
    console.log('\n📄 Response Body:')
    console.log(text)

    if (text) {
      try {
        const json = JSON.parse(text)
        console.log('\n📦 Parsed Error:')
        console.log(JSON.stringify(json, null, 2))
      } catch (e) {
        console.log('\n⚠️  Response is not JSON')
      }
    }

  } catch (error) {
    console.error('❌ Request failed:', error.message)
  }
}

checkProductionError()
