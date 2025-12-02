import { prisma } from "@/lib/prisma"
import { sendVerificationEmail } from "@/lib/email"
import crypto from "crypto"

/**
 * 生成验证令牌
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

/**
 * 创建邮箱验证令牌
 */
export async function createVerificationToken(
  email: string,
  type: "email_verification" | "password_reset" = "email_verification"
): Promise<string> {
  // 删除该邮箱的旧令牌
  await prisma.emailVerification.deleteMany({
    where: {
      email,
      type,
    },
  })

  const token = generateToken()
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 24) // 24小时后过期

  await prisma.emailVerification.create({
    data: {
      email,
      token,
      type,
      expiresAt,
    },
  })

  return token
}

/**
 * 验证令牌
 */
export async function verifyToken(
  token: string,
  type: "email_verification" | "password_reset" = "email_verification"
): Promise<{ valid: boolean; email?: string; error?: string }> {
  const verification = await prisma.emailVerification.findUnique({
    where: { token },
  })

  if (!verification) {
    return { valid: false, error: "无效的验证令牌" }
  }

  if (verification.type !== type) {
    return { valid: false, error: "令牌类型不匹配" }
  }

  if (verification.expiresAt < new Date()) {
    // 删除过期的令牌
    await prisma.emailVerification.delete({
      where: { token },
    })
    return { valid: false, error: "验证令牌已过期" }
  }

  return { valid: true, email: verification.email }
}

/**
 * 使用令牌（验证后删除）
 */
export async function consumeToken(token: string): Promise<void> {
  await prisma.emailVerification.delete({
    where: { token },
  })
}

/**
 * 发送邮箱验证邮件
 */
export async function sendEmailVerification(
  email: string,
  baseUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await createVerificationToken(email, "email_verification")
    const verificationUrl = `${baseUrl}/verify-email?token=${token}`

    return await sendVerificationEmail(email, verificationUrl)
  } catch (error: any) {
    console.error("Failed to send verification email:", error)
    return { success: false, error: error.message || "发送验证邮件失败" }
  }
}

/**
 * 发送密码重置邮件
 */
export async function sendPasswordResetEmail(
  email: string,
  baseUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // 为了安全，不透露用户是否存在
      return { success: true }
    }

    const token = await createVerificationToken(email, "password_reset")
    const resetUrl = `${baseUrl}/reset-password?token=${token}`

    const { sendPasswordResetEmail: sendEmail } = await import("@/lib/email")
    return await sendEmail(email, resetUrl)
  } catch (error: any) {
    console.error("Failed to send password reset email:", error)
    return { success: false, error: error.message || "发送重置邮件失败" }
  }
}

/**
 * 验证邮箱
 */
export async function verifyEmail(token: string): Promise<{ success: boolean; error?: string }> {
  const result = await verifyToken(token, "email_verification")

  if (!result.valid) {
    return { success: false, error: result.error }
  }

  try {
    // 更新用户的邮箱验证状态
    await prisma.user.update({
      where: { email: result.email },
      data: { emailVerified: new Date() },
    })

    // 删除已使用的令牌
    await consumeToken(token)

    return { success: true }
  } catch (error: any) {
    console.error("Failed to verify email:", error)
    return { success: false, error: "验证失败，请重试" }
  }
}

/**
 * 清理过期的令牌
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const result = await prisma.emailVerification.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  })

  return result.count
}
