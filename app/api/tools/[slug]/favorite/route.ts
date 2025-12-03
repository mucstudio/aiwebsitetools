import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug } = params
    const tool = await prisma.tool.findUnique({
      where: { slug },
    })

    if (!tool) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 })
    }

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_toolId: {
          userId: session.user.id,
          toolId: tool.id,
        },
      },
    })

    if (existingFavorite) {
      // Remove favorite
      await prisma.favorite.delete({
        where: { id: existingFavorite.id },
      })
      return NextResponse.json({ isFavorited: false })
    } else {
      // Add favorite
      await prisma.favorite.create({
        data: {
          userId: session.user.id,
          toolId: tool.id,
        },
      })
      return NextResponse.json({ isFavorited: true })
    }
  } catch (error) {
    console.error("Error toggling favorite:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ isFavorited: false })
    }

    const { slug } = params
    const tool = await prisma.tool.findUnique({
      where: { slug },
    })

    if (!tool) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 })
    }

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_toolId: {
          userId: session.user.id,
          toolId: tool.id,
        },
      },
    })

    return NextResponse.json({ isFavorited: !!favorite })
  } catch (error) {
    console.error("Error checking favorite status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}