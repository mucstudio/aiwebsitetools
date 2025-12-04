import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const { type, fingerprint } = await req.json()
    const session = await auth()
    const userId = session?.user?.id
    
    // Get IP address
    const ipAddress = req.headers.get("x-forwarded-for") || "unknown"

    const tool = await prisma.tool.findUnique({
      where: { slug },
    })

    if (!tool) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 })
    }

    if (type === "view") {
      // Increment view count
      await prisma.tool.update({
        where: { id: tool.id },
        data: { usageCount: { increment: 1 } },
      })
      
      return NextResponse.json({ success: true })
    }

    if (type === "like") {
      // Check if user/IP/fingerprint has already liked
      let hasLiked = false

      if (userId) {
        const existingLike = await prisma.toolLike.findUnique({
          where: {
            toolId_userId: {
              toolId: tool.id,
              userId,
            },
          },
        })
        if (existingLike) hasLiked = true
      } else {
        // For anonymous users, check IP and fingerprint
        const existingLike = await prisma.toolLike.findFirst({
          where: {
            toolId: tool.id,
            ipAddress,
            fingerprint,
          },
        })
        if (existingLike) hasLiked = true
      }

      if (hasLiked) {
        return NextResponse.json({ error: "Already liked" }, { status: 400 })
      }

      // Create like record
      await prisma.$transaction([
        prisma.toolLike.create({
          data: {
            toolId: tool.id,
            userId,
            ipAddress,
            fingerprint,
          },
        }),
        prisma.tool.update({
          where: { id: tool.id },
          data: { likeCount: { increment: 1 } },
        }),
      ])

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  } catch (error) {
    console.error("Error updating stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const session = await auth()
    const userId = session?.user?.id
    
    // Get IP address for anonymous check (optional, but good for consistency)
    const ipAddress = req.headers.get("x-forwarded-for") || "unknown"
    const url = new URL(req.url)
    const fingerprint = url.searchParams.get("fingerprint")

    const tool = await prisma.tool.findUnique({
      where: { slug },
      select: {
        id: true,
        usageCount: true,
        likeCount: true,
      },
    }) as { id: string; usageCount: number; likeCount: number } | null

    if (!tool) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 })
    }

    let hasLiked = false
    if (userId) {
      const like = await prisma.toolLike.findUnique({
        where: {
          toolId_userId: {
            toolId: tool.id,
            userId,
          },
        },
      })
      if (like) hasLiked = true
    } else if (fingerprint) {
       const like = await prisma.toolLike.findFirst({
          where: {
            toolId: tool.id,
            ipAddress,
            fingerprint,
          },
        })
        if (like) hasLiked = true
    }

    return NextResponse.json({
      views: tool.usageCount,
      likes: tool.likeCount,
      hasLiked,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}