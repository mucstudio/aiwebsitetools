import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { testEmailConnection } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      )
    }

    const result = await testEmailConnection(email)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Test email sent successfully",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to send test email",
        },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error("Test email error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to send test email" },
      { status: 500 }
    )
  }
}
