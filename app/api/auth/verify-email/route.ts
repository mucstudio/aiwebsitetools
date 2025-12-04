import { NextResponse } from "next/server"
import { verifyEmail } from "@/lib/email-verification"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      )
    }

    const result = await verifyEmail(token)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Verification failed" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
    })
  } catch (error: any) {
    console.error("Verify email error:", error)
    return NextResponse.json(
      { error: "Verification failed, please try again" },
      { status: 500 }
    )
  }
}
