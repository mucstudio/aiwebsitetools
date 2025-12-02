import { NextRequest, NextResponse } from "next/server"
import { getCurrentSession } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { promises as fs } from "fs"
import path from "path"

const toolSchema = z.object({
  name: z.string().min(1, "Tool name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().min(1, "Description is required"),
  categoryId: z.string().min(1, "Category is required"),
  componentType: z.string().min(1, "Component type is required"),
  componentCode: z.string().optional(),
  icon: z.string().optional(),
  config: z.any().optional(),
  isPremium: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  tags: z.array(z.string()).default([]),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession()

    // Check if user is admin
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      )
    }

    const tool = await prisma.tool.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        _count: {
          select: { usageRecords: true, favorites: true },
        },
      },
    })

    if (!tool) {
      return NextResponse.json(
        { error: "Tool not found" },
        { status: 404 }
      )
    }

    // 读取组件代码
    const componentPath = path.join(process.cwd(), 'components', 'tools', `${tool.componentType}.tsx`)
    let componentCode = ""

    try {
      componentCode = await fs.readFile(componentPath, 'utf-8')
    } catch (fileError) {
      console.error("Failed to read component file:", fileError)
      // 如果文件不存在，返回空字符串
      componentCode = ""
    }

    return NextResponse.json({
      tool: {
        ...tool,
        componentCode
      }
    })
  } catch (error) {
    console.error("Get tool error:", error)

    return NextResponse.json(
      { error: "Failed to get tool" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession()

    // Check if user is admin
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = toolSchema.parse(body)

    // Check if tool exists
    const existingTool = await prisma.tool.findUnique({
      where: { id: params.id },
    })

    if (!existingTool) {
      return NextResponse.json(
        { error: "Tool not found" },
        { status: 404 }
      )
    }

    // Check if slug is taken by another tool
    if (validatedData.slug !== existingTool.slug) {
      const slugTaken = await prisma.tool.findUnique({
        where: { slug: validatedData.slug },
      })

      if (slugTaken) {
        return NextResponse.json(
          { error: "A tool with this slug already exists" },
          { status: 400 }
        )
      }
    }

    // 如果提供了组件代码，保存到文件系统
    if (validatedData.componentCode) {
      const componentPath = path.join(process.cwd(), 'components', 'tools', `${validatedData.componentType}.tsx`)

      try {
        // 确保目录存在
        const componentDir = path.dirname(componentPath)
        await fs.mkdir(componentDir, { recursive: true })

        // 写入组件代码
        await fs.writeFile(componentPath, validatedData.componentCode, 'utf-8')
      } catch (fileError) {
        console.error("Failed to save component file:", fileError)
        return NextResponse.json(
          { error: "Failed to save component file" },
          { status: 500 }
        )
      }
    }

    // 从数据中移除 componentCode，因为数据库不需要存储它
    const { componentCode, ...toolData } = validatedData

    // Update tool
    const tool = await prisma.tool.update({
      where: { id: params.id },
      data: toolData,
    })

    return NextResponse.json({
      message: "Tool updated successfully",
      tool,
    })
  } catch (error) {
    console.error("Tool update error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to update tool" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession()

    // Check if user is admin
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      )
    }

    // Check if tool exists
    const existingTool = await prisma.tool.findUnique({
      where: { id: params.id },
    })

    if (!existingTool) {
      return NextResponse.json(
        { error: "Tool not found" },
        { status: 404 }
      )
    }

    // Delete tool (cascade will handle related records)
    await prisma.tool.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: "Tool deleted successfully",
    })
  } catch (error) {
    console.error("Tool deletion error:", error)

    return NextResponse.json(
      { error: "Failed to delete tool" },
      { status: 500 }
    )
  }
}
