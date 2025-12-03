import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - 获取所有启用的菜单项（公开接口，供前端使用）
export async function GET(request: NextRequest) {
  try {
    const menuItems = await prisma.menuItem.findMany({
      where: {
        isActive: true,
        parentId: null, // 只获取顶级菜单
      },
      orderBy: { order: "asc" },
      include: {
        children: {
          where: { isActive: true },
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
