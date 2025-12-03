import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getClientIp } from '@/lib/utils'

// POST /api/tools/interact - Handle tool interactions (like, view)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { toolId, type } = body

    if (!toolId || !type) {
      return NextResponse.json(
        { error: 'toolId and type are required' },
        { status: 400 }
      )
    }

    const ip = getClientIp(request)

    if (type === 'like') {
      // Check if already liked
      const existingLike = await prisma.toolLike.findUnique({
        where: {
          toolId_ip: {
            toolId,
            ip
          }
        }
      })

      if (existingLike) {
        return NextResponse.json(
          { error: 'Already liked' },
          { status: 400 }
        )
      }

      // Create like record and increment likes count
      await prisma.$transaction([
        prisma.toolLike.create({
          data: {
            toolId,
            ip
          }
        }),
        prisma.tool.update({
          where: { id: toolId },
          data: {
            likes: {
              increment: 1
            }
          }
        })
      ])

      return NextResponse.json({ success: true })
    } else if (type === 'view') {
      // Increment views count
      await prisma.tool.update({
        where: { id: toolId },
        data: {
          views: {
            increment: 1
          }
        }
      })

      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: 'Invalid interaction type' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error handling interaction:', error)
    return NextResponse.json(
      { error: 'Failed to handle interaction' },
      { status: 500 }
    )
  }
}
