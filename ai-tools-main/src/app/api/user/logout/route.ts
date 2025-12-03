import { NextResponse } from 'next/server'
import { clearUserSession } from '@/lib/userAuth'

// POST /api/user/logout - User logout
export async function POST() {
  try {
    await clearUserSession()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error during logout:', error)
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}
