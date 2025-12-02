import { NextResponse } from "next/server"
import { sendPasswordResetEmail } from "@/lib/email-verification"

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

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const result = await sendPasswordResetEmail(email, baseUrl)

    // 为了安全，总是返回成功（不透露用户是否存在）
    return NextResponse.json({
      success: true,
      message: "如果该邮箱存在，我们已发送重置密码的链接",
    })
  } catch (error: any) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { error: "发送重置邮件失败，请重试" },
      { status: 500 }
    )
  }
}
