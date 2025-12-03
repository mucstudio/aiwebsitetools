import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { encrypt, decrypt } from '@/lib/encryption'

// GET /api/admin/payment-config - Get payment configurations (admin only)
export async function GET() {
  try {
    await requireAuth()

    const configs = await prisma.paymentConfig.findMany({
      orderBy: { provider: 'asc' }
    })

    // Decrypt sensitive data for display (mask most of the key)
    const safeConfigs = configs.map(config => ({
      id: config.id,
      provider: config.provider,
      isEnabled: config.isEnabled,
      publicKey: config.publicKey,
      secretKey: config.secretKey ? '••••••••' + config.secretKey.slice(-4) : null,
      webhookSecret: config.webhookSecret ? '••••••••' : null,
      testMode: config.testMode,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt
    }))

    return NextResponse.json({ configs: safeConfigs })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching payment configs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment configurations' },
      { status: 500 }
    )
  }
}

// POST /api/admin/payment-config - Create or update payment configuration (admin only)
export async function POST(request: Request) {
  try {
    await requireAuth()

    const body = await request.json()
    const { provider, isEnabled, publicKey, secretKey, webhookSecret, testMode } = body

    if (!provider || !['stripe', 'paypal'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider. Must be "stripe" or "paypal"' },
        { status: 400 }
      )
    }

    // Check if config already exists
    const existingConfig = await prisma.paymentConfig.findUnique({
      where: { provider }
    })

    // Encrypt sensitive data
    const encryptedSecretKey = secretKey ? encrypt(secretKey) : null
    const encryptedWebhookSecret = webhookSecret ? encrypt(webhookSecret) : null

    const configData = {
      provider,
      isEnabled: isEnabled !== undefined ? isEnabled : false,
      publicKey: publicKey || null,
      secretKey: encryptedSecretKey,
      webhookSecret: encryptedWebhookSecret,
      testMode: testMode !== undefined ? testMode : true
    }

    let config
    if (existingConfig) {
      // Update existing config
      // Only update fields that are provided
      const updateData: any = {
        isEnabled: configData.isEnabled,
        testMode: configData.testMode
      }

      if (publicKey) updateData.publicKey = configData.publicKey
      if (secretKey) updateData.secretKey = configData.secretKey
      if (webhookSecret) updateData.webhookSecret = configData.webhookSecret

      config = await prisma.paymentConfig.update({
        where: { provider },
        data: updateData
      })
    } else {
      // Create new config
      config = await prisma.paymentConfig.create({
        data: configData
      })
    }

    return NextResponse.json({
      success: true,
      config: {
        id: config.id,
        provider: config.provider,
        isEnabled: config.isEnabled,
        testMode: config.testMode
      }
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error saving payment config:', error)
    return NextResponse.json(
      { error: 'Failed to save payment configuration' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/payment-config?provider={provider} - Delete payment configuration (admin only)
export async function DELETE(request: Request) {
  try {
    await requireAuth()

    const { searchParams } = new URL(request.url)
    const provider = searchParams.get('provider')

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider is required' },
        { status: 400 }
      )
    }

    await prisma.paymentConfig.delete({
      where: { provider }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error deleting payment config:', error)
    return NextResponse.json(
      { error: 'Failed to delete payment configuration' },
      { status: 500 }
    )
  }
}
