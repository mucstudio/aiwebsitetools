import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { checkToolSecurity, generateSlug } from '@/lib/toolSecurity'

// GET /api/tools - Get all tools or single tool by ID (public access - limited fields)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const admin = searchParams.get('admin') === 'true'

    // Check if admin access is requested
    if (admin) {
      try {
        await requireAuth()

        // Admin access - return full data including source code
        if (id) {
          const tool = await prisma.tool.findUnique({
            where: { id: parseInt(id) },
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              }
            }
          })

          if (!tool) {
            return NextResponse.json(
              { error: 'Tool not found' },
              { status: 404 }
            )
          }

          return NextResponse.json(tool)
        }

        const tools = await prisma.tool.findMany({
          include: {
            category: true
          },
          orderBy: [
            { categoryId: 'asc' },
            { sortOrder: 'asc' }
          ]
        })

        return NextResponse.json(tools)
      } catch (error: any) {
        if (error.message === 'Unauthorized') {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        throw error
      }
    }

    // Public access - return only safe fields (no source code)
    const publicFields = {
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
    }

    if (id) {
      const tool = await prisma.tool.findUnique({
        where: { id: parseInt(id) },
        select: {
          ...publicFields,
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      })

      if (!tool) {
        return NextResponse.json(
          { error: 'Tool not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(tool)
    }

    // Fetch all tools with limited fields
    const tools = await prisma.tool.findMany({
      select: {
        ...publicFields,
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: [
        { categoryId: 'asc' },
        { sortOrder: 'asc' }
      ]
    })

    return NextResponse.json(tools)
  } catch (error) {
    console.error('Error fetching tools:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tools' },
      { status: 500 }
    )
  }
}

// POST /api/tools - Create a new tool
export async function POST(request: Request) {
  try {
    await requireAuth()

    const body = await request.json()
    const {
      name,
      slug,
      description,
      toolType = 'react',
      code,
      componentCode,
      styleCode,
      configJson,
      icon,
      categoryId,
      sortOrder,
      skipSecurityCheck
    } = body

    console.log('Creating tool with data:', { name, categoryId, toolType, icon, sortOrder, skipSecurityCheck })

    if (!name || !categoryId) {
      return NextResponse.json(
        { error: 'Name and categoryId are required' },
        { status: 400 }
      )
    }

    // Validate based on tool type
    if (toolType === 'react') {
      if (!componentCode) {
        return NextResponse.json(
          { error: 'Component code is required for React tools' },
          { status: 400 }
        )
      }

      // Security check for React components
      if (!skipSecurityCheck) {
        const securityCheck = checkToolSecurity(componentCode)
        if (!securityCheck.isSafe) {
          console.log('Security check failed:', securityCheck.errors)
          return NextResponse.json(
            {
              error: 'Code security check failed',
              details: securityCheck.errors
            },
            { status: 400 }
          )
        }
      }
    } else if (toolType === 'iframe') {
      if (!code) {
        return NextResponse.json(
          { error: 'Code is required for iframe tools' },
          { status: 400 }
        )
      }

      // Security check for iframe code
      if (!skipSecurityCheck) {
        const securityCheck = checkToolSecurity(code)
        if (!securityCheck.isSafe) {
          console.log('Security check failed:', securityCheck.errors)
          return NextResponse.json(
            {
              error: 'Code security check failed',
              details: securityCheck.errors
            },
            { status: 400 }
          )
        }
      }
    }

    // Generate slug from name if not provided or empty
    const toolSlug = (slug && slug.trim()) ? slug.trim() : generateSlug(name)
    console.log('Generated slug:', toolSlug)

    // Auto-increment sortOrder if not provided or is 0
    let finalSortOrder = sortOrder
    if (!sortOrder || sortOrder === 0) {
      // Get the maximum sortOrder from existing tools
      const maxSortOrderTool = await prisma.tool.findFirst({
        orderBy: { sortOrder: 'desc' },
        select: { sortOrder: true }
      })
      finalSortOrder = (maxSortOrderTool?.sortOrder || 0) + 1
      console.log('Auto-generated sortOrder:', finalSortOrder)
    }

    console.log('Creating tool in database...')
    const tool = await prisma.tool.create({
      data: {
        name,
        slug: toolSlug,
        description: description || null,
        toolType,
        code: code || '',
        componentCode: componentCode || null,
        styleCode: styleCode || null,
        configJson: configJson || null,
        icon: icon || null,
        categoryId: parseInt(categoryId),
        sortOrder: finalSortOrder,
        skipSecurityCheck: skipSecurityCheck || false,
        version: '1.0.0',
        isPublished: true
      }
    })

    console.log('Tool created successfully:', tool.id)
    return NextResponse.json(tool)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error creating tool:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    })
    return NextResponse.json(
      {
        error: 'Failed to create tool',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

// PUT /api/tools - Update a tool
export async function PUT(request: Request) {
  try {
    await requireAuth()

    const body = await request.json()
    const { id, name, slug, description, code, icon, categoryId, sortOrder, skipSecurityCheck } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Tool ID is required' },
        { status: 400 }
      )
    }

    // Generate slug from name if name is being updated and slug is not provided or empty
    const toolSlug = name && (!slug || !slug.trim()) ? generateSlug(name) : (slug ? slug.trim() : slug)

    // Security check if code is being updated
    if (code && !skipSecurityCheck) {
      const securityCheck = checkToolSecurity(code)
      if (!securityCheck.isSafe) {
        return NextResponse.json(
          {
            error: 'Code security check failed',
            details: securityCheck.errors
          },
          { status: 400 }
        )
      }
    }

    const tool = await prisma.tool.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(toolSlug && { slug: toolSlug }),
        ...(description !== undefined && { description }),
        ...(code && { code }),
        ...(icon !== undefined && { icon }),
        ...(categoryId && { categoryId }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(skipSecurityCheck !== undefined && { skipSecurityCheck })
      }
    })

    return NextResponse.json(tool)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error updating tool:', error)
    return NextResponse.json(
      { error: 'Failed to update tool' },
      { status: 500 }
    )
  }
}

// DELETE /api/tools?id={id} - Delete a tool
export async function DELETE(request: Request) {
  try {
    await requireAuth()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Tool ID is required' },
        { status: 400 }
      )
    }

    await prisma.tool.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error deleting tool:', error)
    return NextResponse.json(
      { error: 'Failed to delete tool' },
      { status: 500 }
    )
  }
}
