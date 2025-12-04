/**
 * PayPal Commerce Platform OAuth Integration
 * Provides secure OAuth-based connection to PayPal merchant accounts
 */

import { prisma } from "@/lib/prisma"

interface PayPalOAuthTokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

interface PayPalMerchantInfo {
  merchant_id: string
  tracking_id: string
  products: string[]
  capabilities: string[]
}

/**
 * Generate PayPal Partner Referral URL
 */
export function getPayPalConnectURL(trackingId: string): string {
  const partnerId = process.env.PAYPAL_PARTNER_ID
  const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/connect/paypal/callback`

  if (!partnerId) {
    throw new Error("PAYPAL_PARTNER_ID not configured")
  }

  const params = new URLSearchParams({
    partnerId,
    partnerLogoUrl: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
    returnToPartnerUrl: returnUrl,
    product: "PPCP", // PayPal Commerce Platform
    secondaryProducts: "payment_methods",
    capabilities: "PAYPAL_WALLET_VAULTING_ADVANCED",
    integrationType: "FO", // First-party OAuth
    features: "PAYMENT,REFUND,PARTNER_FEE",
    trackingId,
  })

  const baseURL = process.env.PAYPAL_MODE === "live"
    ? "https://www.paypal.com"
    : "https://www.sandbox.paypal.com"

  return `${baseURL}/bizsignup/partner/entry?${params.toString()}`
}

/**
 * Get PayPal access token using client credentials
 */
async function getPayPalClientToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials not configured")
  }

  const baseURL = process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com"

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

  const response = await fetch(`${baseURL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })

  if (!response.ok) {
    throw new Error("Failed to get PayPal client token")
  }

  const data = await response.json()
  return data.access_token
}

/**
 * Get merchant credentials using auth code
 */
export async function getPayPalMerchantCredentials(
  authCode: string,
  sharedId: string
): Promise<PayPalMerchantInfo> {
  const clientToken = await getPayPalClientToken()

  const baseURL = process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com"

  const response = await fetch(
    `${baseURL}/v1/customer/partners/${process.env.PAYPAL_PARTNER_ID}/merchant-integrations/${sharedId}`,
    {
      headers: {
        "Authorization": `Bearer ${clientToken}`,
        "Content-Type": "application/json",
      },
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`PayPal merchant info error: ${error.message || "Unknown error"}`)
  }

  const data = await response.json()

  return {
    merchant_id: data.merchant_id,
    tracking_id: data.tracking_id,
    products: data.products || [],
    capabilities: data.capabilities || [],
  }
}

/**
 * Save PayPal connection to database
 */
export async function savePayPalConnection(merchantInfo: PayPalMerchantInfo) {
  await prisma.setting.upsert({
    where: { key: "paypal_merchant_id" },
    create: {
      key: "paypal_merchant_id",
      value: merchantInfo.merchant_id,
    },
    update: {
      value: merchantInfo.merchant_id,
    },
  })

  await prisma.setting.upsert({
    where: { key: "paypal_connected_at" },
    create: {
      key: "paypal_connected_at",
      value: new Date().toISOString(),
    },
    update: {
      value: new Date().toISOString(),
    },
  })

  await prisma.setting.upsert({
    where: { key: "paypal_connection_status" },
    create: {
      key: "paypal_connection_status",
      value: "connected",
    },
    update: {
      value: "connected",
    },
  })
}

/**
 * Disconnect PayPal account
 */
export async function disconnectPayPal() {
  const keysToDelete = [
    "paypal_merchant_id",
    "paypal_connected_at",
  ]

  await prisma.setting.deleteMany({
    where: {
      key: {
        in: keysToDelete,
      },
    },
  })

  await prisma.setting.upsert({
    where: { key: "paypal_connection_status" },
    create: {
      key: "paypal_connection_status",
      value: "disconnected",
    },
    update: {
      value: "disconnected",
    },
  })
}

/**
 * Check if PayPal is connected
 */
export async function isPayPalConnected(): Promise<boolean> {
  const status = await prisma.setting.findUnique({
    where: { key: "paypal_connection_status" },
  })

  return status?.value === "connected"
}

/**
 * Get PayPal merchant ID
 */
export async function getPayPalMerchantId(): Promise<string | null> {
  const setting = await prisma.setting.findUnique({
    where: { key: "paypal_merchant_id" },
  })

  return setting?.value || null
}
