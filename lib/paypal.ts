import { getPaymentSettings } from "@/lib/settings"

interface PayPalAccessToken {
  access_token: string
  expires_in: number
}

let cachedToken: { token: string; expiresAt: number } | null = null

/**
 * Get PayPal API base URL
 */
async function getPayPalBaseURL(): Promise<string> {
  const settings = await getPaymentSettings()
  return settings.testMode
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com"
}

/**
 * Get PayPal access token
 */
async function getPayPalAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token
  }

  const settings = await getPaymentSettings()

  if (!settings.paypalClientId || !settings.paypalClientSecret) {
    throw new Error("PayPal credentials not configured")
  }

  const baseURL = await getPayPalBaseURL()
  const auth = Buffer.from(
    `${settings.paypalClientId}:${settings.paypalClientSecret}`
  ).toString("base64")

  const response = await fetch(`${baseURL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })

  if (!response.ok) {
    throw new Error("Failed to get PayPal access token")
  }

  const data: PayPalAccessToken = await response.json()

  // Cache token (expires in 9 hours, we cache for 8 hours to be safe)
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 3600) * 1000,
  }

  return data.access_token
}

/**
 * Create PayPal subscription plan
 */
export async function createPayPalPlan(plan: {
  name: string
  description: string
  price: number
  interval: "month" | "year"
}) {
  const token = await getPayPalAccessToken()
  const baseURL = await getPayPalBaseURL()

  const planData = {
    product_id: await getOrCreatePayPalProduct(plan.name, plan.description),
    name: plan.name,
    description: plan.description,
    billing_cycles: [
      {
        frequency: {
          interval_unit: plan.interval === "year" ? "YEAR" : "MONTH",
          interval_count: 1,
        },
        tenure_type: "REGULAR",
        sequence: 1,
        total_cycles: 0, // Infinite
        pricing_scheme: {
          fixed_price: {
            value: plan.price.toString(),
            currency_code: "USD",
          },
        },
      },
    ],
    payment_preferences: {
      auto_bill_outstanding: true,
      setup_fee_failure_action: "CONTINUE",
      payment_failure_threshold: 3,
    },
  }

  const response = await fetch(`${baseURL}/v1/billing/plans`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(planData),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to create PayPal plan: ${error}`)
  }

  const result = await response.json()
  return result.id
}

/**
 * Get or create PayPal product
 */
async function getOrCreatePayPalProduct(
  name: string,
  description: string
): Promise<string> {
  const token = await getPayPalAccessToken()
  const baseURL = await getPayPalBaseURL()

  // Create product
  const productData = {
    name,
    description,
    type: "SERVICE",
    category: "SOFTWARE",
  }

  const response = await fetch(`${baseURL}/v1/catalogs/products`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productData),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to create PayPal product: ${error}`)
  }

  const result = await response.json()
  return result.id
}

/**
 * Create PayPal subscription
 */
export async function createPayPalSubscription(
  planId: string,
  returnUrl: string,
  cancelUrl: string
) {
  const token = await getPayPalAccessToken()
  const baseURL = await getPayPalBaseURL()

  const subscriptionData = {
    plan_id: planId,
    application_context: {
      brand_name: "AI Website Tools",
      locale: "en-US",
      shipping_preference: "NO_SHIPPING",
      user_action: "SUBSCRIBE_NOW",
      payment_method: {
        payer_selected: "PAYPAL",
        payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED",
      },
      return_url: returnUrl,
      cancel_url: cancelUrl,
    },
  }

  const response = await fetch(`${baseURL}/v1/billing/subscriptions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(subscriptionData),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to create PayPal subscription: ${error}`)
  }

  const result = await response.json()

  // Find approval URL
  const approvalLink = result.links.find(
    (link: any) => link.rel === "approve"
  )

  return {
    subscriptionId: result.id,
    approvalUrl: approvalLink?.href,
  }
}

/**
 * Get PayPal subscription details
 */
export async function getPayPalSubscription(subscriptionId: string) {
  const token = await getPayPalAccessToken()
  const baseURL = await getPayPalBaseURL()

  const response = await fetch(
    `${baseURL}/v1/billing/subscriptions/${subscriptionId}`,
    {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  )

  if (!response.ok) {
    throw new Error("Failed to get PayPal subscription")
  }

  return await response.json()
}

/**
 * Cancel PayPal subscription
 */
export async function cancelPayPalSubscription(
  subscriptionId: string,
  reason: string = "User requested cancellation"
) {
  const token = await getPayPalAccessToken()
  const baseURL = await getPayPalBaseURL()

  const response = await fetch(
    `${baseURL}/v1/billing/subscriptions/${subscriptionId}/cancel`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to cancel PayPal subscription: ${error}`)
  }

  return true
}

/**
 * Verify PayPal webhook signature
 */
export async function verifyPayPalWebhook(
  webhookId: string,
  headers: Record<string, string>,
  body: any
): Promise<boolean> {
  const token = await getPayPalAccessToken()
  const baseURL = await getPayPalBaseURL()

  const verificationData = {
    auth_algo: headers["paypal-auth-algo"],
    cert_url: headers["paypal-cert-url"],
    transmission_id: headers["paypal-transmission-id"],
    transmission_sig: headers["paypal-transmission-sig"],
    transmission_time: headers["paypal-transmission-time"],
    webhook_id: webhookId,
    webhook_event: body,
  }

  const response = await fetch(
    `${baseURL}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(verificationData),
    }
  )

  if (!response.ok) {
    return false
  }

  const result = await response.json()
  return result.verification_status === "SUCCESS"
}

/**
 * Check if PayPal is configured
 */
export async function isPayPalEnabled(): Promise<boolean> {
  const settings = await getPaymentSettings()
  return (
    settings.enabled &&
    !!settings.paypalClientId &&
    !!settings.paypalClientSecret
  )
}
