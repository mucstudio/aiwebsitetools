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
  codeMode: z.enum(['react', 'html']).default('react'),
  componentCode: z.string().optional(),
  htmlCode: z.string().optional(),
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

    // 根据代码模式读取对应的代码文件
    let componentCode = ""
    let htmlCode = ""

    if (tool.codeMode === 'html') {
      // 读取 HTML 文件
      const htmlPath = path.join(process.cwd(), 'public', 'tools', `${tool.componentType}.html`)
      try {
        htmlCode = await fs.readFile(htmlPath, 'utf-8')
      } catch (fileError) {
        console.error("Failed to read HTML file:", fileError)
        htmlCode = ""
      }
    } else {
      // 读取 React 组件文件
      const componentPath = path.join(process.cwd(), 'components', 'tools', `${tool.componentType}.tsx`)
      try {
        componentCode = await fs.readFile(componentPath, 'utf-8')
      } catch (fileError) {
        console.error("Failed to read component file:", fileError)
        componentCode = ""
      }
    }

    return NextResponse.json({
      tool: {
        ...tool,
        componentCode,
        htmlCode
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

    // 根据代码模式保存对应的文件
    if (validatedData.codeMode === 'html' && validatedData.htmlCode) {
      // 保存 HTML 文件
      const htmlPath = path.join(process.cwd(), 'public', 'tools', `${validatedData.componentType}.html`)

      try {
        // 确保目录存在
        const htmlDir = path.dirname(htmlPath)
        await fs.mkdir(htmlDir, { recursive: true })

        // 写入 HTML 代码
        await fs.writeFile(htmlPath, validatedData.htmlCode, 'utf-8')
      } catch (fileError) {
        console.error("Failed to save HTML file:", fileError)
        return NextResponse.json(
          { error: "Failed to save HTML file" },
          { status: 500 }
        )
      }
    } else if (validatedData.componentCode) {
      // 保存 React 组件文件
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

    // 从数据中移除代码字段，因为数据库不需要存储它们
    const { componentCode, htmlCode, ...toolData } = validatedData

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

    // Delete component file
    const componentPath = path.join(process.cwd(), 'components', 'tools', `${existingTool.componentType}.tsx`)

    try {
      await fs.unlink(componentPath)
      console.log(`Deleted component file: ${componentPath}`)
    } catch (fileError: any) {
      // 如果文件不存在，只记录警告，不阻止删除操作
      if (fileError.code !== 'ENOENT') {
        console.error("Failed to delete component file:", fileError)
        // 继续删除数据库记录，即使文件删除失败
      } else {
        console.log(`Component file not found: ${componentPath}`)
      }
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
