import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { testStripeConnection } from "@/lib/stripe"

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await testStripeConnection()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Stripe connection successful",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to connect to Stripe",
        },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error("Test Stripe connection error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to test Stripe connection" },
      { status: 500 }
    )
  }
}
