import { NextRequest, NextResponse } from "next/server"
import { getPayPalMerchantCredentials, savePayPalConnection } from "@/lib/paypal-connect"

/**
 * PayPal Commerce Platform OAuth callback
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const merchantId = searchParams.get("merchantId")
    const merchantIdInPayPal = searchParams.get("merchantIdInPayPal")
    const permissionsGranted = searchParams.get("permissionsGranted")
    const consentStatus = searchParams.get("consentStatus")
    const isEmailConfirmed = searchParams.get("isEmailConfirmed")

    // Check if user granted permissions
    if (permissionsGranted !== "true" || consentStatus !== "true") {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/admin/settings/payment?error=permissions_denied`
      )
    }

    if (!merchantIdInPayPal) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/admin/settings/payment?error=missing_merchant_id`
      )
    }

    // Get merchant credentials
    const merchantInfo = await getPayPalMerchantCredentials("", merchantIdInPayPal)

    // Save connection to database
    await savePayPalConnection(merchantInfo)

    // Redirect back to settings page with success message
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/admin/settings/payment?paypal_connected=true`
    )
  } catch (error: any) {
    console.error("PayPal Connect callback error:", error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/admin/settings/payment?error=${encodeURIComponent(error.message)}`
    )
  }
}
