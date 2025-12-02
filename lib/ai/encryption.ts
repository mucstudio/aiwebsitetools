import crypto from 'crypto'

// 从环境变量获取加密密钥
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-this-in-production'
const ALGORITHM = 'aes-256-cbc'

// 确保密钥长度为 32 字节
function getKey(): Buffer {
  return crypto.createHash('sha256').update(ENCRYPTION_KEY).digest()
}

/**
 * 加密 API Key
 */
export function encryptApiKey(apiKey: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv)

  let encrypted = cipher.update(apiKey, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  // 返回 iv:encrypted 格式
  return `${iv.toString('hex')}:${encrypted}`
}

/**
 * 解密 API Key
 */
export function decryptApiKey(encryptedApiKey: string): string {
  const parts = encryptedApiKey.split(':')
  if (parts.length !== 2) {
    throw new Error('Invalid encrypted API key format')
  }

  const iv = Buffer.from(parts[0], 'hex')
  const encrypted = parts[1]

  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv)

  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}
