/**
 * 测试防绕过机制
 *
 * 测试场景：
 * 1. 同一指纹+IP：使用次数正常累加
 * 2. 更换指纹（模拟更换浏览器）：IP 总使用次数生效，防止绕过
 * 3. 更换 IP（模拟 VPN）：新 IP 可以重新使用
 */

const baseUrl = 'http://localhost:3000'

// 模拟不同的设备指纹和 IP
const fingerprint1 = 'fp-chrome-12345'
const fingerprint2 = 'fp-firefox-67890'
const fingerprint3 = 'fp-safari-abcde'
const ip1 = '192.168.1.100'
const ip2 = '10.0.0.50'

console.log('=== 防绕过机制测试 ===\n')

async function checkUsage(fingerprint, ip, label) {
  const res = await fetch(`${baseUrl}/api/usage/check`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Fingerprint': fingerprint,
      'X-Forwarded-For': ip  // 模拟 IP
    },
    body: JSON.stringify({})
  })
  const data = await res.json()
  console.log(`${label}:`, {
    fingerprint: fingerprint.substring(0, 15) + '...',
    ip,
    remaining: data.remaining,
    limit: data.limit,
    allowed: data.allowed
  })
  return data
}

async function recordUsage(fingerprint, ip, toolId = 'test-tool') {
  const res = await fetch(`${baseUrl}/api/usage/record`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Fingerprint': fingerprint,
      'X-Forwarded-For': ip
    },
    body: JSON.stringify({ toolId, usedAI: false })
  })
  return await res.json()
}

async function runTests() {
  try {
    console.log('📋 测试 1: 同一指纹+IP，正常使用')
    console.log('─'.repeat(50))

    // 使用 3 次
    for (let i = 1; i <= 3; i++) {
      await recordUsage(fingerprint1, ip1)
      const data = await checkUsage(fingerprint1, ip1, `  第 ${i} 次使用后`)
      if (i === 3) {
        console.log(`  ✅ 预期：剩余次数减少到 ${data.limit - 3}`)
      }
    }

    console.log('\n🔄 测试 2: 更换浏览器（新指纹，同一 IP）')
    console.log('─'.repeat(50))

    const before = await checkUsage(fingerprint2, ip1, '  更换前（新指纹）')
    console.log(`  ℹ️  新指纹使用次数: 0`)
    console.log(`  ℹ️  IP 总使用次数: 3`)
    console.log(`  ℹ️  有效使用次数: max(0, 3) = 3`)

    if (before.remaining === before.limit - 3) {
      console.log(`  ✅ 防绕过成功！剩余次数仍为 ${before.remaining}（基于 IP 总使用次数）`)
    } else {
      console.log(`  ❌ 防绕过失败！剩余次数为 ${before.remaining}（应该是 ${before.limit - 3}）`)
    }

    console.log('\n🔄 测试 3: 继续使用新指纹')
    console.log('─'.repeat(50))

    await recordUsage(fingerprint2, ip1)
    const after = await checkUsage(fingerprint2, ip1, '  使用 1 次后')

    if (after.remaining === after.limit - 4) {
      console.log(`  ✅ IP 总使用次数正确累加到 4`)
    }

    console.log('\n🌐 测试 4: 更换 IP（模拟 VPN）')
    console.log('─'.repeat(50))

    const newIp = await checkUsage(fingerprint1, ip2, '  新 IP 检查')

    if (newIp.remaining === newIp.limit) {
      console.log(`  ✅ 新 IP 可以重新使用（剩余 ${newIp.remaining} 次）`)
    } else {
      console.log(`  ⚠️  新 IP 剩余次数: ${newIp.remaining}`)
    }

    console.log('\n🔄 测试 5: 第三个浏览器（同一 IP）')
    console.log('─'.repeat(50))

    const third = await checkUsage(fingerprint3, ip1, '  第三个指纹')

    if (third.remaining === third.limit - 4) {
      console.log(`  ✅ 防绕过机制持续生效！`)
      console.log(`  ℹ️  即使是全新的指纹，仍然基于 IP 总使用次数限制`)
    }

    console.log('\n📊 测试总结')
    console.log('─'.repeat(50))
    console.log('✅ 防绕过机制工作原理：')
    console.log('   1. 追踪每个指纹的使用次数')
    console.log('   2. 追踪每个 IP 的总使用次数')
    console.log('   3. 取两者的较大值作为有效使用次数')
    console.log('   4. 用户更换浏览器时，IP 总使用次数不变')
    console.log('   5. 只有更换 IP（VPN）才能绕过限制')

  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    console.error('提示：请确保开发服务器正在运行 (npm run dev)')
  }
}

runTests()
