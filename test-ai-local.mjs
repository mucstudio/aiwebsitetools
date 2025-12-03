import fetch from 'node-fetch'

async function test() {
  console.log('Testing /api/ai/call...\n')
  
  const res = await fetch('http://localhost:3000/api/ai/call', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Fingerprint': 'test-fingerprint-123'
    },
    body: JSON.stringify({
      prompt: 'Test prompt',
      toolId: 'cmioem2wc0002d3p4cnok9zfe'
    })
  })

  const data = await res.json()
  console.log('Response:', JSON.stringify(data, null, 2))
  
  if (data.usage) {
    console.log('\nUsage data found:')
    console.log('- remaining:', data.usage.remaining)
    console.log('- inputTokens:', data.usage.inputTokens)
    console.log('- outputTokens:', data.usage.outputTokens)
  } else {
    console.log('\n⚠️  No usage data in response!')
  }
}

test().catch(console.error)
