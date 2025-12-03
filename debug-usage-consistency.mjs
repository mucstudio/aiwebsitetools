/**
 * 调试使用次数不一致问题
 *
 * 问题：同一个设备指纹，多次调用 /api/usage/check 返回不同的 remaining 值
 */

async function testUsageCheck() {
  const baseUrl = 'http://localhost:3000'

  // 模拟设备指纹
  const fingerprint1 = 'test-fingerprint-123'
  const fingerprint2 = 'test-fingerprint-456'

  console.log('=== 测试 1: 使用相同设备指纹 ===')

  // 第一次检查
  const res1 = await fetch(`${baseUrl}/api/usage/check`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Fingerprint': fingerprint1
    },
    body: JSON.stringify({})
  })
  const data1 = await res1.json()
  console.log('第一次检查:', {
    remaining: data1.remaining,
    limit: data1.limit,
    userType: data1.userType
  })

  // 第二次检查（相同指纹）
  const res2 = await fetch(`${baseUrl}/api/usage/check`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Fingerprint': fingerprint1
    },
    body: JSON.stringify({})
  })
  const data2 = await res2.json()
  console.log('第二次检查（相同指纹）:', {
    remaining: data2.remaining,
    limit: data2.limit,
    userType: data2.userType
  })

  console.log('结果一致？', data1.remaining === data2.remaining ? '✅ 是' : '❌ 否')

  console.log('\n=== 测试 2: 使用不同设备指纹 ===')

  // 使用不同指纹
  const res3 = await fetch(`${baseUrl}/api/usage/check`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Fingerprint': fingerprint2
    },
    body: JSON.stringify({})
  })
  const data3 = await res3.json()
  console.log('不同指纹检查:', {
    remaining: data3.remaining,
    limit: data3.limit,
    userType: data3.userType
  })

  console.log('与第一次结果一致？', data1.remaining === data3.remaining ? '✅ 是' : '❌ 否（预期）')

  console.log('\n=== 测试 3: 检查数据库中的使用记录 ===')
  console.log('提示：在数据库中查询 UsageRecord 表，检查 sessionId 字段')
  console.log(`  - 指纹1 (${fingerprint1}) 的记录数`)
  console.log(`  - 指纹2 (${fingerprint2}) 的记录数`)
}

testUsageCheck().catch(console.error)
