import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { createAuditLog } from "@/lib/audit-log"
import { clearSettingsCache } from "@/lib/settings"

// 获取设置
export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const key = searchParams.get("key")

    if (key) {
      // 获取单个设置
      const setting = await prisma.siteSettings.findUnique({
        where: { key },
      })

      return NextResponse.json({ setting })
    } else {
      // 获取所有设置
      const settings = await prisma.siteSettings.findMany()

      // 转换为键值对对象
      const settingsObj = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value
        return acc
      }, {} as Record<string, any>)

      return NextResponse.json({ settings: settingsObj })
    }
  } catch (error) {
    console.error("Get settings error:", error)
    return NextResponse.json(
      { error: "Failed to get settings" },
      { status: 500 }
    )
  }
}

// 保存设置
export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { key, value } = body

    if (!key) {
      return NextResponse.json(
        { error: "Key is required" },
        { status: 400 }
      )
    }

    // 保存或更新设置
    const setting = await prisma.siteSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })

    // 记录审计日志
    await createAuditLog({
      userId: session.user.id,
      userEmail: session.user.email || undefined,
      action: "UPDATE",
      resource: "SETTINGS",
      resourceId: setting.id,
      details: {
        key,
        action: "update_setting",
      },
    })

    // 清除设置缓存，确保前端获取最新数据
    clearSettingsCache()

    return NextResponse.json({
      success: true,
      setting,
    })
  } catch (error) {
    console.error("Save settings error:", error)
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    )
  }
}

// 批量保存设置
export async function PUT(request: Request) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { settings } = body

    if (!settings || typeof settings !== "object") {
      return NextResponse.json(
        { error: "Settings object is required" },
        { status: 400 }
      )
    }

    // 批量保存设置
    const promises = Object.entries(settings).map(([key, value]) =>
      prisma.siteSettings.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    )

    await Promise.all(promises)

    // 记录审计日志
    await createAuditLog({
      userId: session.user.id,
      userEmail: session.user.email || undefined,
      action: "UPDATE",
      resource: "SETTINGS",
      details: {
        keys: Object.keys(settings),
        action: "batch_update_settings",
      },
    })

    // 清除设置缓存，确保前端获取最新数据
    clearSettingsCache()

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully",
    })
  } catch (error) {
    console.error("Batch save settings error:", error)
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    )
  }
}
