import { NextRequest, NextResponse } from "next/server"
import { getCurrentSession } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const securitySchema = z.object({
  twoFactorEnabled: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  loginAlerts: z.boolean().optional(),
})

export async function PUT(request: NextRequest) {
  try {
    const session = await getCurrentSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = securitySchema.parse(body)

    // Update or create user security settings
    const settings = await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      update: validatedData,
      create: {
        userId: session.user.id,
        ...validatedData,
      },
    })

    return NextResponse.json({
      message: "Security settings updated successfully",
      settings,
    })
  } catch (error) {
    console.error("Security settings update error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to update settings, please try again" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      )
    }

    // Get user security settings
    let settings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id },
    })

    // If user doesn't have settings record, create default settings
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId: session.user.id,
          twoFactorEnabled: false,
          emailNotifications: true,
          loginAlerts: true,
        },
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Get security settings error:", error)

    return NextResponse.json(
      { error: "Failed to get settings" },
      { status: 500 }
    )
  }
}
