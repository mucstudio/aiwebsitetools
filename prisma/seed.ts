import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Check if data already exists
  const existingPlans = await prisma.plan.count()
  const existingCategories = await prisma.category.count()

  if (existingPlans > 0 && existingCategories > 0) {
    console.log('⚠️  Data already exists in database. Skipping seed.')
    return
  }

  // Create default plans
  if (existingPlans === 0) {
    console.log('📦 Creating plans...')

    const plans = [
      {
        name: 'Free',
        slug: 'free',
        description: 'Perfect for trying out our tools',
        price: 0,
        interval: 'month',
        stripePriceId: null,
        features: [
          'Access to basic tools',
          '10 uses per day',
          'Community support',
          'Basic features',
        ],
        limits: {
          dailyUsage: 10,
          toolAccess: 'basic',
        },
        isActive: true,
        order: 0,
      },
      {
        name: 'Pro',
        slug: 'pro',
        description: 'Best for regular users',
        price: 9,
        interval: 'month',
        stripePriceId: null,
        features: [
          'Access to all tools',
          'Unlimited uses',
          'Priority support',
          'Advanced features',
          'No ads',
          'API access',
        ],
        limits: {
          dailyUsage: -1,
          toolAccess: 'all',
        },
        isActive: true,
        order: 1,
      },
      {
        name: 'Enterprise',
        slug: 'enterprise',
        description: 'For teams and businesses',
        price: 29,
        interval: 'month',
        stripePriceId: null,
        features: [
          'Everything in Pro',
          'Team management',
          'Custom integrations',
          'Dedicated support',
          'SLA guarantee',
          'Custom tools',
          'White-label options',
        ],
        limits: {
          dailyUsage: -1,
          toolAccess: 'all',
          teamMembers: 10,
        },
        isActive: true,
        order: 2,
      },
    ]

    for (const plan of plans) {
      const created = await prisma.plan.create({
        data: plan,
      })
      console.log(`✅ Created plan: ${created.name} (${created.slug})`)
    }
  }

  // Create default categories
  if (existingCategories === 0) {
    console.log('📦 Creating categories...')

    const categories = [
      {
        name: 'Text Tools',
        slug: 'text',
        description: 'Text processing and editing tools',
        icon: '📝',
        order: 1,
      },
      {
        name: 'Image Tools',
        slug: 'image',
        description: 'Image editing and processing tools',
        icon: '🖼️',
        order: 2,
      },
      {
        name: 'Developer Tools',
        slug: 'developer',
        description: 'Useful tools for developers',
        icon: '💻',
        order: 3,
      },
      {
        name: 'Converter Tools',
        slug: 'converter',
        description: 'Various format conversion tools',
        icon: '🔄',
        order: 4,
      },
    ]

    for (const category of categories) {
      const created = await prisma.category.create({
        data: category,
      })
      console.log(`✅ Created category: ${created.name} (${created.slug})`)
    }

    // Create some sample tools
    console.log('📦 Creating sample tools...')

    const textCategory = await prisma.category.findUnique({ where: { slug: 'text' } })
    const imageCategory = await prisma.category.findUnique({ where: { slug: 'image' } })
    const devCategory = await prisma.category.findUnique({ where: { slug: 'developer' } })

    if (textCategory) {
      await prisma.tool.create({
        data: {
          name: 'Word Counter',
          slug: 'word-counter',
          description: 'Count words, characters, sentences, and paragraphs in your text',
          categoryId: textCategory.id,
          componentType: 'word-counter',
          isPremium: false,
          isPublished: true,
          seoTitle: 'Free Word Counter - Count Words & Characters Online',
          seoDescription: 'Free online word counter tool. Count words, characters, sentences, and paragraphs instantly.',
          tags: ['word count', 'character count', 'text analysis'],
        },
      })
      console.log('✅ Created tool: Word Counter')

      await prisma.tool.create({
        data: {
          name: 'Case Converter',
          slug: 'case-converter',
          description: 'Convert text between different cases (uppercase, lowercase, title case, etc.)',
          categoryId: textCategory.id,
          componentType: 'case-converter',
          isPremium: false,
          isPublished: true,
          seoTitle: 'Case Converter - Change Text Case Online',
          seoDescription: 'Convert text to uppercase, lowercase, title case, and more with our free online tool.',
          tags: ['case converter', 'text transform', 'uppercase', 'lowercase'],
        },
      })
      console.log('✅ Created tool: Case Converter')
    }

    if (imageCategory) {
      await prisma.tool.create({
        data: {
          name: 'Image Compressor',
          slug: 'image-compressor',
          description: 'Compress images without losing quality',
          categoryId: imageCategory.id,
          componentType: 'image-compressor',
          isPremium: false,
          isPublished: true,
          seoTitle: 'Image Compressor - Compress Images Online',
          seoDescription: 'Free online image compressor. Reduce image file size without losing quality.',
          tags: ['image compression', 'optimize images', 'reduce file size'],
        },
      })
      console.log('✅ Created tool: Image Compressor')
    }

    if (devCategory) {
      await prisma.tool.create({
        data: {
          name: 'JSON Formatter',
          slug: 'json-formatter',
          description: 'Format and validate JSON data with syntax highlighting',
          categoryId: devCategory.id,
          componentType: 'json-formatter',
          isPremium: false,
          isPublished: true,
          seoTitle: 'JSON Formatter - Format & Validate JSON Online',
          seoDescription: 'Free online JSON formatter and validator. Format, validate, and beautify JSON data.',
          tags: ['json', 'formatter', 'validator', 'beautify'],
        },
      })
      console.log('✅ Created tool: JSON Formatter')

      await prisma.tool.create({
        data: {
          name: 'Base64 Encoder/Decoder',
          slug: 'base64-encoder',
          description: 'Encode and decode Base64 strings',
          categoryId: devCategory.id,
          componentType: 'base64-encoder',
          isPremium: false,
          isPublished: true,
          seoTitle: 'Base64 Encoder/Decoder - Encode & Decode Online',
          seoDescription: 'Free online Base64 encoder and decoder. Convert text to Base64 and back.',
          tags: ['base64', 'encoder', 'decoder', 'encoding'],
        },
      })
      console.log('✅ Created tool: Base64 Encoder/Decoder')
    }
  }

  console.log('✨ Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
