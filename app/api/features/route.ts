import { NextResponse } from "next/server"
import { getFeatureSettings } from "@/lib/settings"

export async function GET() {
  try {
    const features = await getFeatureSettings()

    return NextResponse.json({
      features,
    })
  } catch (error) {
    console.error("Failed to get features:", error)
    return NextResponse.json(
      { error: "Failed to get features" },
      { status: 500 }
    )
  }
}
