import { NextRequest, NextResponse } from "next/server"
import { getCurrentSession } from "@/lib/auth-utils"
import { getStripeConnectURL } from "@/lib/stripe-connect"
import { randomBytes } from "crypto"

/**
 * Initiate Stripe Connect OAuth flow
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession()

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Generate state parameter for CSRF protection
    const state = randomBytes(32).toString("hex")

    // Store state in session or database for verification
    // For simplicity, we'll encode it in the URL
    const connectURL = getStripeConnectURL(state)

    return NextResponse.json({ url: connectURL })
  } catch (error: any) {
    console.error("Stripe Connect initiation error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to initiate Stripe connection" },
      { status: 500 }
    )
  }
}
