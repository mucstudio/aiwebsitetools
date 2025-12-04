import { NextRequest, NextResponse } from "next/server"
import { getCurrentSession } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"

const SETTING_KEY = "connect_settings"

const defaultSettings = {
  showConnect: true,
  twitter: "",
  github: "",
  email: "",
  facebook: "",
  youtube: "",
  instagram: "",
  linkedin: "",
  tiktok: "",
}

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession()

    // Allow public access for sidebar rendering, but restrict sensitive data if needed
    // For now, these are public social links, so it's fine.
    
    const setting = await prisma.siteSettings.findUnique({
      where: { key: SETTING_KEY },
    })

    if (!setting) {
      return NextResponse.json(defaultSettings)
    }

    return NextResponse.json(setting.value)
  } catch (error) {
    console.error("Get connect settings error:", error)
    return NextResponse.json(
      { error: "Failed to get settings" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession()

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate body structure if needed, for now we trust the admin input to match the shape
    const settings = { ...defaultSettings, ...body }

    await prisma.siteSettings.upsert({
      where: { key: SETTING_KEY },
      update: { value: settings },
      create: { key: SETTING_KEY, value: settings },
    })

    return NextResponse.json({ message: "Settings saved successfully" })
  } catch (error) {
    console.error("Save connect settings error:", error)
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    )
  }
}