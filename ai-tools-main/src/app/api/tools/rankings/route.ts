import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/tools/rankings - Get tool rankings
export async function GET() {
  try {
    const [topLiked, topViewed] = await Promise.all([
      // Top 10 most liked tools
      prisma.tool.findMany({
        take: 10,
        orderBy: { likes: 'desc' },
        include: {
          category: true
        }
      }),
      // Top 10 most viewed tools
      prisma.tool.findMany({
        take: 10,
        orderBy: { views: 'desc' },
        include: {
          category: true
        }
      })
    ])

    return NextResponse.json({
      topLiked,
      topViewed
    })
  } catch (error) {
    console.error('Error fetching rankings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rankings' },
      { status: 500 }
    )
  }
}
