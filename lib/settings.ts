import { prisma } from "@/lib/prisma"

// 缓存设置，避免频繁查询数据库
let settingsCache: Record<string, any> = {}
let cacheTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存

/**
 * 获取所有设置
 */
export async function getSettings(): Promise<Record<string, any>> {
  const now = Date.now()

  // 如果缓存有效，直接返回
  if (cacheTime && now - cacheTime < CACHE_DURATION) {
    return settingsCache
  }

  try {
    const settings = await prisma.siteSettings.findMany()

    // 转换为键值对对象
    settingsCache = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, any>)

    cacheTime = now
    return settingsCache
  } catch (error) {
    console.error("Failed to load settings:", error)
    return {}
  }
}

/**
 * 获取单个设置
 */
export async function getSetting<T = any>(key: string, defaultValue?: T): Promise<T> {
  const settings = await getSettings()
  return settings[key] !== undefined ? settings[key] : defaultValue
}

/**
 * 清除设置缓存
 */
export function clearSettingsCache() {
  settingsCache = {}
  cacheTime = 0
}

/**
 * 获取 SEO 设置
 */
export async function getSEOSettings() {
  const settings = await getSettings()

  return {
    title: settings.seo_title || "AI Website Tools - Free Online Tools for Everyone",
    description: settings.seo_description || "Access a collection of powerful online tools for text processing, image editing, development utilities, and more.",
    keywords: settings.seo_keywords || "online tools, web tools, text tools, image tools, developer tools",
    ogTitle: settings.og_title || settings.seo_title || "AI Website Tools",
    ogDescription: settings.og_description || settings.seo_description || "",
    ogImage: settings.og_image || "/og-image.jpg",
    twitterCard: settings.twitter_card || "summary_large_image",
    twitterSite: settings.twitter_site || "",
    twitterCreator: settings.twitter_creator || "",
    googleAnalyticsId: settings.google_analytics_id || "",
    googleSiteVerification: settings.google_site_verification || "",
  }
}

/**
 * 获取支付设置
 */
export async function getPaymentSettings() {
  const settings = await getSettings()

  return {
    stripePublishableKey: settings.stripe_publishable_key || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
    stripeSecretKey: settings.stripe_secret_key || process.env.STRIPE_SECRET_KEY || "",
    stripeWebhookSecret: settings.stripe_webhook_secret || process.env.STRIPE_WEBHOOK_SECRET || "",
    paypalClientId: settings.paypal_client_id || process.env.PAYPAL_CLIENT_ID || "",
    paypalClientSecret: settings.paypal_client_secret || process.env.PAYPAL_CLIENT_SECRET || "",
    paypalWebhookId: settings.paypal_webhook_id || process.env.PAYPAL_WEBHOOK_ID || "",
    currency: settings.payment_currency || "USD",
    enabled: settings.payment_enabled !== false,
    testMode: settings.test_mode === true,
  }
}

/**
 * 获取邮件设置
 */
export async function getEmailSettings() {
  const settings = await getSettings()

  return {
    provider: settings.email_provider || "smtp",
    smtpHost: settings.smtp_host || "",
    smtpPort: settings.smtp_port || "587",
    smtpUser: settings.smtp_user || "",
    smtpPassword: settings.smtp_password || "",
    smtpFromEmail: settings.smtp_from_email || process.env.EMAIL_FROM || "",
    smtpFromName: settings.smtp_from_name || "AI Website Tools",
    smtpSecure: settings.smtp_secure !== false,
    resendApiKey: settings.resend_api_key || process.env.RESEND_API_KEY || "",
    sendgridApiKey: settings.sendgrid_api_key || "",
    enabled: settings.email_enabled !== false,
  }
}

/**
 * 获取安全设置
 */
export async function getSecuritySettings() {
  const settings = await getSettings()

  return {
    requireEmailVerification: settings.require_email_verification === true,
    allowRegistration: settings.allow_registration !== false,
    allowSocialLogin: settings.allow_social_login !== false,
    sessionTimeout: parseInt(settings.session_timeout || "7"),
    maxLoginAttempts: parseInt(settings.max_login_attempts || "5"),
    lockoutDuration: parseInt(settings.lockout_duration || "15"),
    passwordMinLength: parseInt(settings.password_min_length || "8"),
    passwordRequireUppercase: settings.password_require_uppercase !== false,
    passwordRequireLowercase: settings.password_require_lowercase !== false,
    passwordRequireNumbers: settings.password_require_numbers !== false,
    passwordRequireSpecial: settings.password_require_special === true,
    enable2FA: settings.enable_2fa === true,
    enableCaptcha: settings.enable_captcha === true,
    captchaSiteKey: settings.captcha_site_key || "",
    captchaSecretKey: settings.captcha_secret_key || "",
  }
}

/**
 * 获取功能开关设置
 */
export async function getFeatureSettings() {
  const settings = await getSettings()

  return {
    enableUserDashboard: settings.enable_user_dashboard !== false,
    enableFavorites: settings.enable_favorites !== false,
    enableUsageTracking: settings.enable_usage_tracking !== false,
    enableApiAccess: settings.enable_api_access === true,
    enableToolRatings: settings.enable_tool_ratings !== false,
    enableToolComments: settings.enable_tool_comments !== false,
    enableToolSharing: settings.enable_tool_sharing !== false,
    enableDarkMode: settings.enable_dark_mode !== false,
    enableNotifications: settings.enable_notifications !== false,
    enableNewsletter: settings.enable_newsletter !== false,
    enableBlog: settings.enable_blog !== false,
    enableDocumentation: settings.enable_documentation !== false,
    enableSupportChat: settings.enable_support_chat === true,
    enableAnalytics: settings.enable_analytics !== false,
    maintenanceMode: settings.maintenance_mode === true,
    maintenanceMessage: settings.maintenance_message || "网站正在维护中，请稍后再试。",
  }
}

/**
 * 获取网站基本信息
 */
export async function getSiteInfo() {
  const settings = await getSettings()

  return {
    siteName: settings.site_name || "AI Website Tools",
    siteDescription: settings.site_description || "Powerful online tools for everyone",
    siteUrl: settings.site_url || process.env.NEXT_PUBLIC_APP_URL || "https://aiwebsitetools.com",
    contactEmail: settings.contact_email || "hello@aiwebsitetools.com",
    supportEmail: settings.support_email || "support@aiwebsitetools.com",
    companyName: settings.company_name || "AI Website Tools Inc.",
  }
}
/**
 * 获取 OAuth 设置
 */
export async function getOAuthSettings() {
  const settings = await getSettings()

  return {
    google: {
      enabled: settings.oauth_google_enabled === "true",
      clientId: settings.oauth_google_client_id || process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: settings.oauth_google_client_secret || process.env.GOOGLE_CLIENT_SECRET || "",
    },
    github: {
      enabled: settings.oauth_github_enabled === "true",
      clientId: settings.oauth_github_client_id || process.env.GITHUB_CLIENT_ID || "",
      clientSecret: settings.oauth_github_client_secret || process.env.GITHUB_CLIENT_SECRET || "",
    },
    facebook: {
      enabled: settings.oauth_facebook_enabled === "true",
      clientId: settings.oauth_facebook_client_id || process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: settings.oauth_facebook_client_secret || process.env.FACEBOOK_CLIENT_SECRET || "",
    },
    twitter: {
      enabled: settings.oauth_twitter_enabled === "true",
      clientId: settings.oauth_twitter_client_id || process.env.TWITTER_CLIENT_ID || "",
      clientSecret: settings.oauth_twitter_client_secret || process.env.TWITTER_CLIENT_SECRET || "",
    },
    discord: {
      enabled: settings.oauth_discord_enabled === "true",
      clientId: settings.oauth_discord_client_id || process.env.DISCORD_CLIENT_ID || "",
      clientSecret: settings.oauth_discord_client_secret || process.env.DISCORD_CLIENT_SECRET || "",
    },
  }
}
