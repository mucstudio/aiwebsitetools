import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/userAuth'

/**
 * PUT /api/user/profile
 * Update user profile (name and email)
 */
export async function PUT(request: Request) {
  try {
    const userId = await getUserSession()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      name,
      email,
      phone,
      address,
      city,
      country,
      tiktok,
      instagram,
      facebook,
      twitter,
      youtube,
      linkedin,
      website,
      bio
    } = body

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    if (!email || !email.trim() || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    // Check if email is already taken by another user
    if (email.trim() !== (await prisma.user.findUnique({ where: { id: userId } }))?.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: email.trim() }
      })

      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json(
          { error: 'Email is already taken' },
          { status: 400 }
        )
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        city: city?.trim() || null,
        country: country?.trim() || null,
        tiktok: tiktok?.trim() || null,
        instagram: instagram?.trim() || null,
        facebook: facebook?.trim() || null,
        twitter: twitter?.trim() || null,
        youtube: youtube?.trim() || null,
        linkedin: linkedin?.trim() || null,
        website: website?.trim() || null,
        bio: bio?.trim() || null
      }
    })

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        city: updatedUser.city,
        country: updatedUser.country,
        tiktok: updatedUser.tiktok,
        instagram: updatedUser.instagram,
        facebook: updatedUser.facebook,
        twitter: updatedUser.twitter,
        youtube: updatedUser.youtube,
        linkedin: updatedUser.linkedin,
        website: updatedUser.website,
        bio: updatedUser.bio
      }
    })
  } catch (error: any) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
