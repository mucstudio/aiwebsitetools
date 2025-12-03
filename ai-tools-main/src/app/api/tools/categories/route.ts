import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// GET /api/tools/categories - Get all categories with tools (public access - limited fields)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const admin = searchParams.get('admin') === 'true'

    // Check if admin access is requested
    if (admin) {
      try {
        await requireAuth()

        // Admin access - return full data including source code
        const categories = await prisma.toolCategory.findMany({
          include: {
            tools: {
              orderBy: { sortOrder: 'asc' }
            }
          },
          orderBy: { sortOrder: 'asc' }
        })

        return NextResponse.json(categories)
      } catch (error: any) {
        if (error.message === 'Unauthorized') {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        throw error
      }
    }

    // Public access - return only safe fields (no source code)
    const categories = await prisma.toolCategory.findMany({
      include: {
        tools: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            toolType: true,
            icon: true,
            categoryId: true,
            sortOrder: true,
            version: true,
            isPublished: true,
            createdAt: true,
            updatedAt: true,
            // Exclude: code, componentCode, styleCode, configJson, skipSecurityCheck
          },
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: { sortOrder: 'asc' }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST /api/tools/categories - Create a new category
export async function POST(request: Request) {
  try {
    await requireAuth()

    const body = await request.json()
    const { name, slug, icon, sortOrder } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    const category = await prisma.toolCategory.create({
      data: {
        name,
        slug,
        icon,
        sortOrder: sortOrder || 0
      }
    })

    return NextResponse.json(category)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}

// PUT /api/tools/categories - Update a category
export async function PUT(request: Request) {
  try {
    await requireAuth()

    const body = await request.json()
    const { id, name, slug, icon, sortOrder } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      )
    }

    const category = await prisma.toolCategory.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(icon !== undefined && { icon }),
        ...(sortOrder !== undefined && { sortOrder })
      }
    })

    return NextResponse.json(category)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

// DELETE /api/tools/categories?id={id} - Delete a category
export async function DELETE(request: Request) {
  try {
    await requireAuth()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      )
    }

    await prisma.toolCategory.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}
