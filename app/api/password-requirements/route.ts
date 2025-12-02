import { NextResponse } from "next/server"
import { getPasswordRequirements } from "@/lib/password-validator"

export async function GET() {
  try {
    const requirements = await getPasswordRequirements()

    return NextResponse.json({
      requirements,
    })
  } catch (error) {
    console.error("Failed to get password requirements:", error)
    return NextResponse.json(
      { error: "Failed to get password requirements" },
      { status: 500 }
    )
  }
}
