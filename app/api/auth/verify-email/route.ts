import { NextResponse } from "next/server"
import { verifyEmail } from "@/lib/email-verification"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { error: "验证令牌不能为空" },
        { status: 400 }
      )
    }

    const result = await verifyEmail(token)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "验证失败" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "邮箱验证成功",
    })
  } catch (error: any) {
    console.error("Verify email error:", error)
    return NextResponse.json(
      { error: "验证失败，请重试" },
      { status: 500 }
    )
  }
}
