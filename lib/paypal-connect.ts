/**
 * PayPal Commerce Platform OAuth Integration
 * Provides secure OAuth-based connection to PayPal merchant accounts
 */

import { prisma } from "@/lib/prisma"
import { getPaymentSettings, getSiteInfo } from "@/lib/settings"

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
export async function getPayPalConnectURL(trackingId: string): Promise<string> {
  const settings = await getPaymentSettings()
  const siteInfo = await getSiteInfo()

  const partnerId = settings.paypalPartnerId
  const returnUrl = `${siteInfo.siteUrl}/api/connect/paypal/callback`

  if (!partnerId) {
    throw new Error("PAYPAL_PARTNER_ID not configured")
  }

  const params = new URLSearchParams({
    partnerId,
    partnerLogoUrl: `${siteInfo.siteUrl}/logo.png`,
    returnToPartnerUrl: returnUrl,
    product: "PPCP", // PayPal Commerce Platform
    secondaryProducts: "payment_methods",
    capabilities: "PAYPAL_WALLET_VAULTING_ADVANCED",
    integrationType: "FO", // First-party OAuth
    features: "PAYMENT,REFUND,PARTNER_FEE",
    trackingId,
  })

  const baseURL = settings.paypalMode === "live"
    ? "https://www.paypal.com"
    : "https://www.sandbox.paypal.com"

  return `${baseURL}/bizsignup/partner/entry?${params.toString()}`
}

/**
 * Get PayPal access token using client credentials
 */
async function getPayPalClientToken(): Promise<string> {
  const settings = await getPaymentSettings()
  const clientId = settings.paypalClientId
  const clientSecret = settings.paypalClientSecret

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials not configured")
  }

  const baseURL = settings.paypalMode === "live"
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
  const settings = await getPaymentSettings()

  const baseURL = settings.paypalMode === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com"

  const response = await fetch(
    `${baseURL}/v1/customer/partners/${settings.paypalPartnerId}/merchant-integrations/${sharedId}`,
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
  await prisma.siteSettings.upsert({
    where: { key: "paypal_merchant_id" },
    create: {
      key: "paypal_merchant_id",
      value: merchantInfo.merchant_id,
    },
    update: {
      value: merchantInfo.merchant_id,
    },
  })

  await prisma.siteSettings.upsert({
    where: { key: "paypal_connected_at" },
    create: {
      key: "paypal_connected_at",
      value: new Date().toISOString(),
    },
    update: {
      value: new Date().toISOString(),
    },
  })

  await prisma.siteSettings.upsert({
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

  await prisma.siteSettings.deleteMany({
    where: {
      key: {
        in: keysToDelete,
      },
    },
  })

  await prisma.siteSettings.upsert({
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
  const status = await prisma.siteSettings.findUnique({
    where: { key: "paypal_connection_status" },
  })

  return status?.value === "connected"
}

/**
 * Get PayPal merchant ID
 */
export async function getPayPalMerchantId(): Promise<string | null> {
  const setting = await prisma.siteSettings.findUnique({
    where: { key: "paypal_merchant_id" },
  })

  return (setting?.value as string) || null
}
