import { NextRequest, NextResponse } from "next/server"
import { exchangeStripeCode, saveStripeConnection } from "@/lib/stripe-connect"

/**
 * Stripe Connect OAuth callback
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")
    const errorDescription = searchParams.get("error_description")

    // Handle OAuth errors
    if (error) {
      console.error("Stripe OAuth error:", error, errorDescription)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/admin/settings/payment?error=${encodeURIComponent(errorDescription || error)}`
      )
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/admin/settings/payment?error=missing_code`
      )
    }

    // TODO: Verify state parameter for CSRF protection

    // Exchange code for access token
    const tokenData = await exchangeStripeCode(code)

    // Save connection to database
    await saveStripeConnection(tokenData)

    // Redirect back to settings page with success message
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/admin/settings/payment?stripe_connected=true`
    )
  } catch (error: any) {
    console.error("Stripe Connect callback error:", error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/admin/settings/payment?error=${encodeURIComponent(error.message)}`
    )
  }
}
