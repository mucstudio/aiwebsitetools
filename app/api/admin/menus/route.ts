import { NextRequest, NextResponse } from "next/server"
import { getCurrentSession } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const menuItemSchema = z.object({
  label: z.string().min(1, "菜单标签不能为空"),
  url: z.string().min(1, "菜单链接不能为空"),
  icon: z.string().optional(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
  openInNewTab: z.boolean().default(false),
  parentId: z.string().optional().nullable(),
})

// GET - 获取所有菜单项
export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession()

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      )
    }

    const menuItems = await prisma.menuItem.findMany({
      orderBy: { order: "asc" },
      include: {
        children: {
          orderBy: { order: "asc" },
        },
      },
    })

    return NextResponse.json({ menuItems })
  } catch (error) {
    console.error("Get menu items error:", error)
    return NextResponse.json(
      { error: "Failed to get menu items" },
      { status: 500 }
    )
  }
}

// POST - 创建新菜单项
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
    const validatedData = menuItemSchema.parse(body)

    const menuItem = await prisma.menuItem.create({
      data: validatedData,
    })

    return NextResponse.json({
      message: "Menu item created successfully",
      menuItem,
    })
  } catch (error) {
    console.error("Create menu item error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create menu item" },
      { status: 500 }
    )
  }
}
