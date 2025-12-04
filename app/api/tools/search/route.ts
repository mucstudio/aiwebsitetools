import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")

    if (!query) {
      return NextResponse.json({ tools: [] })
    }

    const tools = await prisma.tool.findMany({
      where: {
        isPublished: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { slug: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        icon: true,
      },
      take: 10,
    })

    return NextResponse.json({ tools })
  } catch (error) {
    console.error("Search tools error:", error)
    return NextResponse.json(
      { error: "Failed to search tools" },
      { status: 500 }
    )
  }
}