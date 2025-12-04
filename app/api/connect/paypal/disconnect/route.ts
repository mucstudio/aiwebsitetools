import { NextRequest, NextResponse } from "next/server"
import { getCurrentSession } from "@/lib/auth-utils"
import { disconnectPayPal } from "@/lib/paypal-connect"

/**
 * Disconnect PayPal account
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession()

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    await disconnectPayPal()

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("PayPal disconnect error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to disconnect PayPal" },
      { status: 500 }
    )
  }
}
