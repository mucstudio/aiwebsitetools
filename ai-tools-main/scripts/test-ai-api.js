// Test AI API directly
async function testAI() {
  try {
    console.log('Testing AI API...\n')

    const response = await fetch('http://localhost:3000/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant.'
          },
          {
            role: 'user',
            content: 'Say "Hello, I am working!" in one sentence.'
          }
        ],
        temperature: 0.7,
        maxTokens: 100,
        fingerprint: 'test-fingerprint-123'
      })
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))

    const data = await response.json()
    console.log('\nResponse body:')
    console.log(JSON.stringify(data, null, 2))

    if (!response.ok) {
      console.log('\n❌ API call failed!')
      console.log('Error:', data.error)
    } else {
      console.log('\n✅ API call successful!')
      console.log('AI Response:', data.content)
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    console.error('Stack:', error.stack)
  }
}

testAI()
