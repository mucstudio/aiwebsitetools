import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/auth/check - Check if user is authenticated
export async function GET() {
  try {
    const adminId = await getSession()

    if (!adminId) {
      return NextResponse.json({ authenticated: false })
    }

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: { id: true, username: true }
    })

    if (!admin) {
      return NextResponse.json({ authenticated: false })
    }

    return NextResponse.json({
      authenticated: true,
      admin
    })
  } catch (error) {
    console.error('Error checking auth:', error)
    return NextResponse.json({ authenticated: false })
  }
}
