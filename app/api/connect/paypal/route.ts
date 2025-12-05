import { NextRequest, NextResponse } from "next/server"
import { getCurrentSession } from "@/lib/auth-utils"
import { getPayPalConnectURL } from "@/lib/paypal-connect"
import { randomBytes } from "crypto"

/**
 * Initiate PayPal Commerce Platform OAuth flow
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

    // Generate tracking ID for this connection
    const trackingId = randomBytes(16).toString("hex")

    // Get PayPal Partner Referral URL
    const connectURL = await getPayPalConnectURL(trackingId)

    return NextResponse.json({ url: connectURL })
  } catch (error: any) {
    console.error("PayPal Connect initiation error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to initiate PayPal connection" },
      { status: 500 }
    )
  }
}
