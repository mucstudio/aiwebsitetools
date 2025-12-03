import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { encrypt, decrypt } from '@/lib/encryption'

// GET /api/admin/settings - Get site configuration
export async function GET(request: Request) {
  try {
    await requireAuth()

    // Get or create site config
    let config = await prisma.siteConfig.findFirst()

    if (!config) {
      // Create default config if it doesn't exist
      config = await prisma.siteConfig.create({
        data: {
          siteName: 'Online Tools Platform',
          siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          emailVerification: true,
          guestUsageLimit: 10,
          guestResetDays: 30
        }
      })
    }

    // Decrypt sensitive fields
    const decryptedConfig = {
      ...config,
      smtpPassword: config.smtpPassword ? decrypt(config.smtpPassword) : null
    }

    return NextResponse.json({
      success: true,
      config: decryptedConfig
    })
  } catch (error: any) {
    console.error('Error fetching site config:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch site configuration' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/settings - Update site configuration
export async function PUT(request: Request) {
  try {
    await requireAuth()

    const body = await request.json()
    const {
      siteName,
      siteUrl,
      description,
      logo,
      favicon,
      seoTitle,
      seoDescription,
      seoKeywords,
      ogImage,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPassword,
      smtpFrom,
      smtpFromName,
      emailVerification,
      guestUsageLimit,
      guestResetDays
    } = body

    // Get existing config
    let config = await prisma.siteConfig.findFirst()

    // Prepare update data
    const updateData: any = {}

    if (siteName !== undefined) updateData.siteName = siteName
    if (siteUrl !== undefined) updateData.siteUrl = siteUrl
    if (description !== undefined) updateData.description = description
    if (logo !== undefined) updateData.logo = logo
    if (favicon !== undefined) updateData.favicon = favicon
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription
    if (seoKeywords !== undefined) updateData.seoKeywords = seoKeywords
    if (ogImage !== undefined) updateData.ogImage = ogImage
    if (smtpHost !== undefined) updateData.smtpHost = smtpHost
    if (smtpPort !== undefined) updateData.smtpPort = parseInt(smtpPort)
    if (smtpUser !== undefined) updateData.smtpUser = smtpUser
    if (smtpFrom !== undefined) updateData.smtpFrom = smtpFrom
    if (smtpFromName !== undefined) updateData.smtpFromName = smtpFromName
    if (emailVerification !== undefined) updateData.emailVerification = emailVerification
    if (guestUsageLimit !== undefined) updateData.guestUsageLimit = parseInt(guestUsageLimit)
    if (guestResetDays !== undefined) updateData.guestResetDays = parseInt(guestResetDays)

    // Encrypt SMTP password if provided
    if (smtpPassword !== undefined && smtpPassword !== null && smtpPassword !== '') {
      updateData.smtpPassword = encrypt(smtpPassword)
    }

    // Update or create config
    if (config) {
      config = await prisma.siteConfig.update({
        where: { id: config.id },
        data: updateData
      })
    } else {
      config = await prisma.siteConfig.create({
        data: {
          siteName: siteName || 'Online Tools Platform',
          siteUrl: siteUrl || 'http://localhost:3000',
          emailVerification: emailVerification !== undefined ? emailVerification : true,
          guestUsageLimit: guestUsageLimit || 10,
          guestResetDays: guestResetDays || 30,
          ...updateData
        }
      })
    }

    return NextResponse.json({
      success: true,
      config,
      message: 'Site configuration updated successfully'
    })
  } catch (error: any) {
    console.error('Error updating site config:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update site configuration' },
      { status: 500 }
    )
  }
}
