import { NextResponse } from "next/server"
import { sendEmailVerification } from "@/lib/email-verification"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: "邮箱地址不能为空" },
        { status: 400 }
      )
    }

    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      )
    }

    // 检查是否已经验证
    if (user.emailVerified) {
      return NextResponse.json(
        { error: "邮箱已经验证过了" },
        { status: 400 }
      )
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const result = await sendEmailVerification(email, baseUrl)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "发送验证邮件失败" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "验证邮件已发送",
    })
  } catch (error: any) {
    console.error("Resend verification error:", error)
    return NextResponse.json(
      { error: "发送验证邮件失败，请重试" },
      { status: 500 }
    )
  }
}
