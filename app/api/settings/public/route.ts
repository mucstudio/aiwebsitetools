import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        // 获取所有相关的设置
        const settings = await prisma.siteSettings.findMany({
            where: {
                key: {
                    in: [
                        "enable_captcha",
                        "captcha_site_key",
                        "allow_registration",
                        // OAuth providers
                        "oauth_google_enabled", "oauth_google_client_id", "oauth_google_client_secret",
                        "oauth_github_enabled", "oauth_github_client_id", "oauth_github_client_secret",
                        "oauth_facebook_enabled", "oauth_facebook_client_id", "oauth_facebook_client_secret",
                        "oauth_discord_enabled", "oauth_discord_client_id", "oauth_discord_client_secret",
                        "oauth_twitter_enabled", "oauth_twitter_client_id", "oauth_twitter_client_secret",
                    ]
                }
            }
        })

        // 转换为键值对对象
        const settingsObj = settings.reduce((acc, setting) => {
            acc[setting.key] = setting.value
            return acc
        }, {} as Record<string, string>)

        // 构建公开设置对象
        const publicSettings: Record<string, any> = {
            enable_captcha: settingsObj.enable_captcha === "true",
            captcha_site_key: settingsObj.captcha_site_key || "",
            allow_registration: settingsObj.allow_registration !== "false", // 默认为 true，除非明确设置为 false
        }

        // 处理 OAuth 提供商状态
        // 只有当启用且配置了 Client ID 和 Secret 时，才返回 enabled=true
        // 这样前端就不需要知道 Client Secret 了
        const providers = ["google", "github", "facebook", "discord", "twitter"]
        providers.forEach(provider => {
            const isEnabled = settingsObj[`oauth_${provider}_enabled`] === "true"
            const hasClientId = !!settingsObj[`oauth_${provider}_client_id`]
            const hasClientSecret = !!settingsObj[`oauth_${provider}_client_secret`]

            publicSettings[`oauth_${provider}_enabled`] = isEnabled && hasClientId && hasClientSecret
        })

        return NextResponse.json({ settings: publicSettings })
    } catch (error) {
        console.error("Get public settings error:", error)
        return NextResponse.json(
            { error: "Failed to get settings" },
            { status: 500 }
        )
    }
}
