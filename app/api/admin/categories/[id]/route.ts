import { NextRequest, NextResponse } from "next/server"
import { getCurrentSession } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  icon: z.string().optional(),
  order: z.number().default(0),
  parentId: z.string().optional().nullable(),
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

    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { tools: true, children: true },
        },
        parent: {
          select: { id: true, name: true, slug: true },
        },
        children: {
          select: { id: true, name: true, slug: true, order: true },
          orderBy: { order: "asc" },
        },
      },
    })

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ category })
  } catch (error) {
    console.error("Get category error:", error)

    return NextResponse.json(
      { error: "Failed to get category" },
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
    const validatedData = categorySchema.parse(body)

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: params.id },
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      )
    }

    // Check if slug is taken by another category
    if (validatedData.slug !== existingCategory.slug) {
      const slugTaken = await prisma.category.findUnique({
        where: { slug: validatedData.slug },
      })

      if (slugTaken) {
        return NextResponse.json(
          { error: "A category with this slug already exists" },
          { status: 400 }
        )
      }
    }

    // Update category
    const category = await prisma.category.update({
      where: { id: params.id },
      data: validatedData,
    })

    return NextResponse.json({
      message: "Category updated successfully",
      category,
    })
  } catch (error) {
    console.error("Category update error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to update category" },
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

    // Check if category has tools
    const toolCount = await prisma.tool.count({
      where: { categoryId: params.id },
    })

    if (toolCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with tools" },
        { status: 400 }
      )
    }

    // Delete category
    await prisma.category.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: "Category deleted successfully",
    })
  } catch (error) {
    console.error("Category deletion error:", error)

    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    )
  }
}
