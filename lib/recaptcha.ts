import { getSecuritySettings } from "@/lib/settings"

/**
 * 验证 reCAPTCHA token
 */
export async function verifyRecaptcha(token: string): Promise<{ success: boolean; error?: string }> {
  const settings = await getSecuritySettings()

  if (!settings.enableCaptcha) {
    // 如果未启用 reCAPTCHA，直接返回成功
    return { success: true }
  }

  if (!settings.captchaSecretKey) {
    console.error("reCAPTCHA secret key not configured")
    return { success: false, error: "reCAPTCHA 未配置" }
  }

  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${settings.captchaSecretKey}&response=${token}`,
    })

    const data = await response.json()

    if (!data.success) {
      return {
        success: false,
        error: "reCAPTCHA 验证失败",
      }
    }

    // 检查分数（如果使用 reCAPTCHA v3）
    if (data.score !== undefined && data.score < 0.5) {
      return {
        success: false,
        error: "验证分数过低，请重试",
      }
    }

    return { success: true }
  } catch (error: any) {
    console.error("reCAPTCHA verification error:", error)
    return {
      success: false,
      error: "验证失败，请重试",
    }
  }
}

/**
 * 检查是否需要 reCAPTCHA
 */
export async function isRecaptchaEnabled(): Promise<boolean> {
  const settings = await getSecuritySettings()
  return settings.enableCaptcha && !!settings.captchaSiteKey
}

/**
 * 获取 reCAPTCHA Site Key
 */
export async function getRecaptchaSiteKey(): Promise<string | null> {
  const settings = await getSecuritySettings()
  return settings.enableCaptcha ? settings.captchaSiteKey : null
}
