import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, validateEmail, validatePassword, createUserSession } from '@/lib/userAuth'
import { sendVerificationEmail } from '@/lib/email'
import crypto from 'crypto'

// POST /api/user/register - User registration
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: 'Password does not meet requirements', details: passwordValidation.errors },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Get free subscription plan
    let freeSubscription = null
    try {
      freeSubscription = await prisma.subscription.findFirst({
        where: { tier: 'FREE', isActive: true }
      })

      // Create free plan if it doesn't exist
      if (!freeSubscription) {
        freeSubscription = await prisma.subscription.create({
          data: {
            name: 'Free Plan',
            tier: 'FREE',
            price: 0,
            billingCycle: 'FREE',
            usageLimit: 50,
            features: JSON.stringify([
              '50 tool uses per month',
              'Access to basic tools',
              'Community support'
            ]),
            isActive: true
          }
        })
      }
    } catch (subError) {
      console.error('Error creating subscription:', subError)
      // Continue without subscription if there's an error
    }

    // Get site config to check if email verification is enabled
    const siteConfig = await prisma.siteConfig.findFirst()
    const emailVerificationEnabled = siteConfig?.emailVerification ?? true

    // Generate verification token if email verification is enabled
    const verificationToken = emailVerificationEnabled ? crypto.randomBytes(32).toString('hex') : null

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        membershipTier: 'FREE',
        subscriptionId: freeSubscription?.id || null,
        usageResetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
        emailVerified: !emailVerificationEnabled, // Auto-verify if email verification is disabled
        verificationToken
      }
    })

    // Send verification email if enabled
    if (emailVerificationEnabled && verificationToken && siteConfig) {
      try {
        await sendVerificationEmail(
          email,
          verificationToken,
          siteConfig.siteName,
          siteConfig.siteUrl
        )
      } catch (emailError) {
        console.error('Error sending verification email:', emailError)
        // Don't fail registration if email fails to send
      }
    }

    // Create session only if email verification is disabled or not required
    if (!emailVerificationEnabled) {
      await createUserSession(user.id)
    }

    return NextResponse.json({
      success: true,
      emailVerificationRequired: emailVerificationEnabled,
      message: emailVerificationEnabled
        ? 'Registration successful! Please check your email to verify your account.'
        : 'Registration successful!',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        membershipTier: user.membershipTier,
        emailVerified: user.emailVerified
      }
    })
  } catch (error: any) {
    console.error('Error during registration:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    })
    return NextResponse.json(
      {
        error: 'Registration failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
