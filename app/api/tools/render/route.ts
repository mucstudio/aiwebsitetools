import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { promises as fs } from "fs"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const { toolId } = await request.json()

    if (!toolId) {
      return NextResponse.json(
        { error: "Tool ID is required" },
        { status: 400 }
      )
    }

    // 获取工具信息
    const tool = await prisma.tool.findUnique({
      where: { id: toolId },
    })

    if (!tool) {
      return NextResponse.json(
        { error: "Tool not found" },
        { status: 404 }
      )
    }

    // 读取组件代码
    const componentPath = path.join(
      process.cwd(),
      'components',
      'tools',
      `${tool.componentType}.tsx`
    )

    try {
      const componentCode = await fs.readFile(componentPath, 'utf-8')

      return NextResponse.json({
        success: true,
        componentCode,
        componentType: tool.componentType,
      })
    } catch (error) {
      return NextResponse.json(
        { error: "Component file not found" },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error("Render tool error:", error)
    return NextResponse.json(
      { error: "Failed to render tool" },
      { status: 500 }
    )
  }
}
