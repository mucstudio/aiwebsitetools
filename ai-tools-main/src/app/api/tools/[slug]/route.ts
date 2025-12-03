import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

// GET /api/tools/[slug] - Get a single tool by slug
// Note: Public access returns full data including code because users need it to run the tool
// The security is in preventing BATCH downloads via /api/tools and /api/tools/categories endpoints
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const admin = searchParams.get('admin') === 'true'

    // Check if admin access is requested (for consistency with other endpoints)
    if (admin) {
      try {
        await requireAuth()
      } catch (error: any) {
        if (error.message === 'Unauthorized') {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        throw error
      }
    }

    // Fetch tool with full data (including code)
    // This is necessary for the tool to function on the frontend
    const tool = await prisma.tool.findUnique({
      where: { slug },
      include: {
        category: true
      }
    })

    if (!tool) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(tool)
  } catch (error) {
    console.error('Error fetching tool:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tool' },
      { status: 500 }
    )
  }
}
