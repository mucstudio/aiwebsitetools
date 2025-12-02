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
  componentCode: z.string().min(1, "Component code is required"),
  icon: z.string().optional(),
  config: z.any().optional(),
  isPremium: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  tags: z.array(z.string()).default([]),
})

export async function POST(request: NextRequest) {
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

    // Check if slug already exists
    const existingTool = await prisma.tool.findUnique({
      where: { slug: validatedData.slug },
    })

    if (existingTool) {
      return NextResponse.json(
        { error: "A tool with this slug already exists" },
        { status: 400 }
      )
    }

    // 保存组件代码到文件系统
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

    // 从数据中移除 componentCode，因为数据库不需要存储它
    const { componentCode, ...toolData } = validatedData

    // Create tool
    const tool = await prisma.tool.create({
      data: toolData,
    })

    return NextResponse.json({
      message: "Tool created successfully",
      tool,
      componentPath: componentPath,
    })
  } catch (error) {
    console.error("Tool creation error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create tool" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession()

    // Check if user is admin
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      )
    }

    const tools = await prisma.tool.findMany({
      include: {
        category: true,
        _count: {
          select: { usageRecords: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ tools })
  } catch (error) {
    console.error("Get tools error:", error)

    return NextResponse.json(
      { error: "Failed to get tools" },
      { status: 500 }
    )
  }
}
