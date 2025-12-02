/**
 * 设备指纹生成工具
 *
 * 用于生成唯一的设备标识，防止游客通过更换浏览器、清除 Cookie 等方式绕过使用限制
 */

/**
 * 在客户端生成设备指纹
 *
 * 使用方法：
 * 1. 安装 @fingerprintjs/fingerprintjs: npm install @fingerprintjs/fingerprintjs
 * 2. 在客户端调用此函数获取设备指纹
 * 3. 将设备指纹传递给 API
 *
 * @returns 设备指纹字符串
 */
export async function generateDeviceFingerprint(): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('generateDeviceFingerprint can only be called in browser')
  }

  try {
    // 动态导入 FingerprintJS
    const FingerprintJS = await import('@fingerprintjs/fingerprintjs')
    const fp = await FingerprintJS.load()
    const result = await fp.get()

    return result.visitorId
  } catch (error) {
    console.error('Failed to generate device fingerprint:', error)
    // 降级方案：使用简单的浏览器特征组合
    return generateFallbackFingerprint()
  }
}

/**
 * 降级方案：使用简单的浏览器特征生成指纹
 * 当 FingerprintJS 不可用时使用
 */
function generateFallbackFingerprint(): string {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  const features = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 0,
    navigator.deviceMemory || 0,
  ]

  // Canvas 指纹
  if (ctx) {
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillText('Device Fingerprint', 2, 2)
    features.push(canvas.toDataURL())
  }

  // WebGL 指纹
  const gl = canvas.getContext('webgl')
  if (gl) {
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    if (debugInfo) {
      features.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL))
      features.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL))
    }
  }

  // 生成哈希
  return simpleHash(features.join('|'))
}

/**
 * 简单的哈希函数
 */
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

/**
 * 在服务端从请求头中提取设备特征
 * 作为设备指纹的补充验证
 */
export function extractDeviceInfo(request: Request): {
  userAgent: string
  acceptLanguage: string
  acceptEncoding: string
} {
  const headers = request.headers

  return {
    userAgent: headers.get('user-agent') || '',
    acceptLanguage: headers.get('accept-language') || '',
    acceptEncoding: headers.get('accept-encoding') || '',
  }
}
