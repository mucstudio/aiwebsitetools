import fetch from 'node-fetch'

async function test() {
  console.log('Testing /api/usage/check...\n')
  
  // 测试1: 使用设备指纹
  console.log('=== 测试 1: 使用设备指纹 ===')
  const res1 = await fetch('http://localhost:3000/api/usage/check', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Fingerprint': 'test-fp-123'
    },
    body: JSON.stringify({})
  })
  const data1 = await res1.json()
  console.log('Response:', JSON.stringify(data1, null, 2))
  
  // 测试2: 不使用设备指纹
  console.log('\n=== 测试 2: 不使用设备指纹 ===')
  const res2 = await fetch('http://localhost:3000/api/usage/check', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  })
  const data2 = await res2.json()
  console.log('Response:', JSON.stringify(data2, null, 2))
}

test().catch(console.error)
