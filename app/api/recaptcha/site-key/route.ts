import { NextResponse } from "next/server"
import { getRecaptchaSiteKey, isRecaptchaEnabled } from "@/lib/recaptcha"

export async function GET() {
  try {
    const enabled = await isRecaptchaEnabled()
    const siteKey = await getRecaptchaSiteKey()

    return NextResponse.json({
      enabled,
      siteKey,
    })
  } catch (error) {
    console.error("Failed to get reCAPTCHA site key:", error)
    return NextResponse.json(
      { error: "Failed to get reCAPTCHA configuration" },
      { status: 500 }
    )
  }
}
