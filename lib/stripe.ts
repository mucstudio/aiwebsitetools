import Stripe from "stripe"
import { getPaymentSettings } from "@/lib/settings"

let stripeInstance: Stripe | null = null

/**
 * 获取 Stripe 实例
 */
export async function getStripe(): Promise<Stripe | null> {
  const settings = await getPaymentSettings()

  if (!settings.enabled) {
    console.warn("Payment is disabled in settings")
    return null
  }

  if (!settings.stripeSecretKey) {
    console.error("Stripe secret key not configured")
    return null
  }

  // 如果已经有实例，直接返回
  if (stripeInstance) {
    return stripeInstance
  }

  try {
    stripeInstance = new Stripe(settings.stripeSecretKey, {
      apiVersion: "2024-11-20.acacia",
      typescript: true,
    })

    return stripeInstance
  } catch (error) {
    console.error("Failed to initialize Stripe:", error)
    return null
  }
}

/**
 * 获取 Stripe 可发布密钥（用于客户端）
 */
export async function getStripePublishableKey(): Promise<string> {
  const settings = await getPaymentSettings()
  return settings.stripePublishableKey
}

/**
 * 检查支付是否启用
 */
export async function isPaymentEnabled(): Promise<boolean> {
  const settings = await getPaymentSettings()
  return settings.enabled && !!settings.stripeSecretKey
}

/**
 * 获取支付货币
 */
export async function getPaymentCurrency(): Promise<string> {
  const settings = await getPaymentSettings()
  return settings.currency.toLowerCase()
}

/**
 * 测试 Stripe 连接
 */
export async function testStripeConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    const stripe = await getStripe()

    if (!stripe) {
      return { success: false, error: "Stripe not configured" }
    }

    // 尝试获取账户信息来测试连接
    await stripe.balance.retrieve()

    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to connect to Stripe",
    }
  }
}
