import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUserAuth } from '@/lib/userAuth'

// GET /api/user/favorites - Get user's favorite tools
export async function GET() {
  try {
    const userId = await requireUserAuth()

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        tool: {
          include: {
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      favorites: favorites.map(f => ({
        id: f.id,
        tool: f.tool,
        createdAt: f.createdAt
      }))
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching favorites:', error)
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    )
  }
}

// POST /api/user/favorites - Add tool to favorites
export async function POST(request: Request) {
  try {
    const userId = await requireUserAuth()
    const body = await request.json()
    const { toolId } = body

    if (!toolId) {
      return NextResponse.json(
        { error: 'Tool ID is required' },
        { status: 400 }
      )
    }

    // Check if tool exists
    const tool = await prisma.tool.findUnique({
      where: { id: toolId }
    })

    if (!tool) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      )
    }

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_toolId: {
          userId,
          toolId
        }
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Tool already in favorites' },
        { status: 409 }
      )
    }

    // Add to favorites
    const favorite = await prisma.favorite.create({
      data: {
        userId,
        toolId
      },
      include: {
        tool: true
      }
    })

    return NextResponse.json({
      success: true,
      favorite
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error adding favorite:', error)
    return NextResponse.json(
      { error: 'Failed to add favorite' },
      { status: 500 }
    )
  }
}

// DELETE /api/user/favorites?toolId={id} - Remove tool from favorites
export async function DELETE(request: Request) {
  try {
    const userId = await requireUserAuth()
    const { searchParams } = new URL(request.url)
    const toolId = searchParams.get('toolId')

    if (!toolId) {
      return NextResponse.json(
        { error: 'Tool ID is required' },
        { status: 400 }
      )
    }

    // Delete favorite
    await prisma.favorite.delete({
      where: {
        userId_toolId: {
          userId,
          toolId: parseInt(toolId)
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error removing favorite:', error)
    return NextResponse.json(
      { error: 'Failed to remove favorite' },
      { status: 500 }
    )
  }
}
