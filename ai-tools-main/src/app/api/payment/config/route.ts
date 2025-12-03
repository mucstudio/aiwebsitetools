import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/payment/config - Get enabled payment providers (public)
export async function GET() {
  try {
    const configs = await prisma.paymentConfig.findMany({
      where: { isEnabled: true },
      select: {
        provider: true,
        publicKey: true,
        testMode: true
      }
    })

    return NextResponse.json({ providers: configs })
  } catch (error) {
    console.error('Error fetching payment configs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment configurations' },
      { status: 500 }
    )
  }
}
