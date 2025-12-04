import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
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

// GET - 获取单个菜单项
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession()

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      )
    }

    const menuItem = await prisma.menuItem.findUnique({
      where: { id: params.id },
      include: {
        children: true,
        parent: true,
      },
    })

    if (!menuItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ menuItem })
  } catch (error) {
    console.error("Get menu item error:", error)
    return NextResponse.json(
      { error: "Failed to get menu item" },
      { status: 500 }
    )
  }
}

// PUT - 更新菜单项
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const menuItem = await prisma.menuItem.update({
      where: { id: params.id },
      data: validatedData,
    })

    revalidatePath("/", "layout")

    return NextResponse.json({
      message: "Menu item updated successfully",
      menuItem,
    })
  } catch (error) {
    console.error("Update menu item error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to update menu item" },
      { status: 500 }
    )
  }
}

// DELETE - 删除菜单项
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession()

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      )
    }

    await prisma.menuItem.delete({
      where: { id: params.id },
    })

    revalidatePath("/", "layout")

    return NextResponse.json({
      message: "Menu item deleted successfully",
    })
  } catch (error) {
    console.error("Delete menu item error:", error)
    return NextResponse.json(
      { error: "Failed to delete menu item" },
      { status: 500 }
    )
  }
}
