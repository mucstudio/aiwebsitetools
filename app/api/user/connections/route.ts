import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentSession } from "@/lib/auth-utils"
import { getOAuthSettings } from "@/lib/settings"

export async function GET(request: NextRequest) {
    try {
        const session = await getCurrentSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Get enabled providers from settings
        const oauthSettings = await getOAuthSettings()

        // Get user's connected accounts
        const accounts = await prisma.account.findMany({
            where: {
                userId: session.user.id,
            },
            select: {
                provider: true,
            },
        })

        const connectedProviders = accounts.map(account => account.provider)

        // Construct response with provider status and connection status
        const providers = [
            {
                id: "google",
                name: "Google",
                enabled: oauthSettings.google.enabled,
                connected: connectedProviders.includes("google"),
            },
            {
                id: "github",
                name: "GitHub",
                enabled: oauthSettings.github.enabled,
                connected: connectedProviders.includes("github"),
            },
            {
                id: "facebook",
                name: "Facebook",
                enabled: oauthSettings.facebook.enabled,
                connected: connectedProviders.includes("facebook"),
            },
            {
                id: "twitter",
                name: "Twitter",
                enabled: oauthSettings.twitter.enabled,
                connected: connectedProviders.includes("twitter"),
            },
            {
                id: "discord",
                name: "Discord",
                enabled: oauthSettings.discord.enabled,
                connected: connectedProviders.includes("discord"),
            },
        ].filter(provider => provider.enabled)

        return NextResponse.json({ providers })
    } catch (error) {
        console.error("Failed to fetch connected accounts:", error)
        return NextResponse.json(
            { error: "Failed to fetch connected accounts" },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await getCurrentSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { provider } = await request.json()

        if (!provider) {
            return NextResponse.json({ error: "Provider is required" }, { status: 400 })
        }

        // Prevent disconnecting if it's the only login method and no password set
        // Check if user has a password
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { password: true },
        })

        const accounts = await prisma.account.findMany({
            where: { userId: session.user.id },
        })

        if (!user?.password && accounts.length <= 1) {
            return NextResponse.json(
                { error: "Cannot disconnect the only login method. Please set a password first." },
                { status: 400 }
            )
        }

        // Delete the account connection
        await prisma.account.deleteMany({
            where: {
                userId: session.user.id,
                provider: provider,
            },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Failed to disconnect account:", error)
        return NextResponse.json(
            { error: "Failed to disconnect account" },
            { status: 500 }
        )
    }
}
