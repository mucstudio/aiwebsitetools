import { NextRequest, NextResponse } from "next/server"
import { getCurrentSession } from "@/lib/auth-utils"
import { disconnectStripe } from "@/lib/stripe-connect"

/**
 * Disconnect Stripe account
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

    await disconnectStripe()

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Stripe disconnect error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to disconnect Stripe" },
      { status: 500 }
    )
  }
}
