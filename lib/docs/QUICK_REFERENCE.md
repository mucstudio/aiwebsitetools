# 添加新工具 - 前端调用

## 用 AI 的工具

```typescript
'use client'
import { useState, useEffect } from 'react'
import { generateDeviceFingerprint } from '@/lib/usage-limits/fingerprint'

export default function YourTool() {
  const [fp, setFp] = useState<string>()
  const [text, setText] = useState('')
  const [result, setResult] = useState('')

  useEffect(() => {
    generateDeviceFingerprint().then(setFp)
  }, [])

  const handle = async () => {
    const res = await fetch('/api/ai/call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-Fingerprint': fp || ''
      },
      body: JSON.stringify({
        prompt: `你的提示词：${text}`,
        toolId: 'your-tool-id'
      })
    })
    const data = await res.json()
    setResult(data.response)
  }

  return (
    <div>
      <input value={text} onChange={e => setText(e.target.value)} />
      <button onClick={handle}>提交</button>
      <div>{result}</div>
    </div>
  )
}
```

## 不用 AI 的工具

```typescript
'use client'
import { useState, useEffect } from 'react'
import { generateDeviceFingerprint } from '@/lib/usage-limits/fingerprint'

export default function YourTool() {
  const [fp, setFp] = useState<string>()
  const [text, setText] = useState('')

  useEffect(() => {
    generateDeviceFingerprint().then(setFp)
  }, [])

  const handle = async () => {
    // 检查限制
    const check = await fetch('/api/usage/check', {
      method: 'POST',
      headers: { 'X-Device-Fingerprint': fp || '' }
    })
    const checkData = await check.json()
    if (!checkData.allowed) {
      alert(checkData.reason)
      return
    }

    // 你的逻辑
    const result = text.length

    // 记录使用
    await fetch('/api/usage/record', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-Fingerprint': fp || ''
      },
      body: JSON.stringify({ toolId: 'your-tool-id' })
    })

    alert(`结果: ${result}`)
  }

  return (
    <div>
      <input value={text} onChange={e => setText(e.target.value)} />
      <button onClick={handle}>提交</button>
    </div>
  )
}
```

完。
