import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

// 更新个人信息
export async function PUT(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, email } = body

    // 检查邮箱是否已被其他用户使用
    if (email && email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser && existingUser.id !== session.user.id) {
        return NextResponse.json(
          { error: "该邮箱已被使用" },
          { status: 400 }
        )
      }
    }

    // 更新用户信息
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || undefined,
        email: email || undefined,
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json(
      { error: "更新失败" },
      { status: 500 }
    )
  }
}
