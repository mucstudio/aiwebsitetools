import { NextResponse } from "next/server"
import { verifyToken, consumeToken } from "@/lib/email-verification"
import { validatePassword } from "@/lib/password-validator"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, password } = body

    if (!token || !password) {
      return NextResponse.json(
        { error: "令牌和密码不能为空" },
        { status: 400 }
      )
    }

    // 验证令牌
    const tokenResult = await verifyToken(token, "password_reset")

    if (!tokenResult.valid) {
      return NextResponse.json(
        { error: tokenResult.error || "无效的重置令牌" },
        { status: 400 }
      )
    }

    // 验证密码强度
    const passwordValidation = await validatePassword(password)

    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: "密码不符合要求", errors: passwordValidation.errors },
        { status: 400 }
      )
    }

    // 更新密码
    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.update({
      where: { email: tokenResult.email },
      data: { password: hashedPassword },
    })

    // 删除已使用的令牌
    await consumeToken(token)

    return NextResponse.json({
      success: true,
      message: "密码重置成功",
    })
  } catch (error: any) {
    console.error("Reset password error:", error)
    return NextResponse.json(
      { error: "重置密码失败，请重试" },
      { status: 500 }
    )
  }
}
