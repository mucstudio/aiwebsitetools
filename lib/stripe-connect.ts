/**
 * Stripe Connect OAuth Integration
 * Provides secure OAuth-based connection to Stripe accounts
 */

import { prisma } from "@/lib/prisma"

interface StripeOAuthTokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  stripe_publishable_key: string
  stripe_user_id: string
  scope: string
  livemode: boolean
}

/**
 * Generate Stripe Connect OAuth URL
 */
export function getStripeConnectURL(state: string): string {
  const clientId = process.env.STRIPE_CONNECT_CLIENT_ID
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/connect/stripe/callback`

  if (!clientId) {
    throw new Error("STRIPE_CONNECT_CLIENT_ID not configured")
  }

  const params = new URLSearchParams({
    client_id: clientId,
    state,
    scope: "read_write",
    redirect_uri: redirectUri,
    response_type: "code",
    "stripe_user[business_type]": "company",
    "stripe_user[country]": "US",
  })

  return `https://connect.stripe.com/oauth/authorize?${params.toString()}`
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeStripeCode(code: string): Promise<StripeOAuthTokenResponse> {
  const clientSecret = process.env.STRIPE_SECRET_KEY

  if (!clientSecret) {
    throw new Error("STRIPE_SECRET_KEY not configured")
  }

  const response = await fetch("https://connect.stripe.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Bearer ${clientSecret}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Stripe OAuth error: ${error.error_description || error.error}`)
  }

  return await response.json()
}

/**
 * Refresh Stripe access token
 */
export async function refreshStripeToken(refreshToken: string): Promise<StripeOAuthTokenResponse> {
  const clientSecret = process.env.STRIPE_SECRET_KEY

  if (!clientSecret) {
    throw new Error("STRIPE_SECRET_KEY not configured")
  }

  const response = await fetch("https://connect.stripe.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Bearer ${clientSecret}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Stripe token refresh error: ${error.error_description || error.error}`)
  }

  return await response.json()
}

/**
 * Save Stripe connection to database
 */
export async function saveStripeConnection(tokenData: StripeOAuthTokenResponse) {
  const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days

  await prisma.setting.upsert({
    where: { key: "stripe_connected_account_id" },
    create: {
      key: "stripe_connected_account_id",
      value: tokenData.stripe_user_id,
    },
    update: {
      value: tokenData.stripe_user_id,
    },
  })

  await prisma.setting.upsert({
    where: { key: "stripe_access_token" },
    create: {
      key: "stripe_access_token",
      value: tokenData.access_token,
    },
    update: {
      value: tokenData.access_token,
    },
  })

  await prisma.setting.upsert({
    where: { key: "stripe_refresh_token" },
    create: {
      key: "stripe_refresh_token",
      value: tokenData.refresh_token,
    },
    update: {
      value: tokenData.refresh_token,
    },
  })

  await prisma.setting.upsert({
    where: { key: "stripe_publishable_key" },
    create: {
      key: "stripe_publishable_key",
      value: tokenData.stripe_publishable_key,
    },
    update: {
      value: tokenData.stripe_publishable_key,
    },
  })

  await prisma.setting.upsert({
    where: { key: "stripe_token_expires_at" },
    create: {
      key: "stripe_token_expires_at",
      value: expiresAt.toISOString(),
    },
    update: {
      value: expiresAt.toISOString(),
    },
  })

  await prisma.setting.upsert({
    where: { key: "stripe_connected_at" },
    create: {
      key: "stripe_connected_at",
      value: new Date().toISOString(),
    },
    update: {
      value: new Date().toISOString(),
    },
  })

  await prisma.setting.upsert({
    where: { key: "stripe_connection_status" },
    create: {
      key: "stripe_connection_status",
      value: "connected",
    },
    update: {
      value: "connected",
    },
  })
}

/**
 * Get Stripe access token (refresh if needed)
 */
export async function getStripeAccessToken(): Promise<string | null> {
  const settings = await prisma.setting.findMany({
    where: {
      key: {
        in: ["stripe_access_token", "stripe_refresh_token", "stripe_token_expires_at"],
      },
    },
  })

  const settingsMap = settings.reduce((acc, s) => {
    acc[s.key] = s.value
    return acc
  }, {} as Record<string, string>)

  const accessToken = settingsMap.stripe_access_token
  const refreshToken = settingsMap.stripe_refresh_token
  const expiresAt = settingsMap.stripe_token_expires_at

  if (!accessToken) {
    return null
  }

  // Check if token is expired
  if (expiresAt && new Date(expiresAt) < new Date()) {
    if (!refreshToken) {
      return null
    }

    // Refresh token
    try {
      const newTokenData = await refreshStripeToken(refreshToken)
      await saveStripeConnection(newTokenData)
      return newTokenData.access_token
    } catch (error) {
      console.error("Failed to refresh Stripe token:", error)
      return null
    }
  }

  return accessToken
}

/**
 * Disconnect Stripe account
 */
export async function disconnectStripe() {
  const keysToDelete = [
    "stripe_connected_account_id",
    "stripe_access_token",
    "stripe_refresh_token",
    "stripe_publishable_key",
    "stripe_token_expires_at",
    "stripe_connected_at",
  ]

  await prisma.setting.deleteMany({
    where: {
      key: {
        in: keysToDelete,
      },
    },
  })

  await prisma.setting.upsert({
    where: { key: "stripe_connection_status" },
    create: {
      key: "stripe_connection_status",
      value: "disconnected",
    },
    update: {
      value: "disconnected",
    },
  })
}

/**
 * Check if Stripe is connected
 */
export async function isStripeConnected(): Promise<boolean> {
  const status = await prisma.setting.findUnique({
    where: { key: "stripe_connection_status" },
  })

  return status?.value === "connected"
}
