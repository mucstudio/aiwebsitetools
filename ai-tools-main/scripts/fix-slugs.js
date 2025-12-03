const { PrismaClient } = require('@prisma/client')
const { pinyin } = require('pinyin-pro')

const prisma = new PrismaClient()

function generateSlug(name) {
  // Check if name contains Chinese characters
  const hasChinese = /[\u4e00-\u9fa5]/.test(name)

  let processedName

  if (hasChinese) {
    // Convert Chinese characters to pinyin
    processedName = pinyin(name, {
      toneType: 'none',
      separator: ' '
    })
  } else {
    // For non-Chinese text, use as-is
    processedName = name
  }

  // Generate slug: lowercase, replace spaces/special chars with hyphens
  return processedName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')          // Replace spaces with single hyphen
    .replace(/[^a-z0-9-]+/g, '-')  // Replace other non-alphanumeric with hyphens
    .replace(/-+/g, '-')           // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '')       // Remove leading/trailing hyphens
}

async function fixSlugs() {
  try {
    console.log('Fetching all tools...')
    const tools = await prisma.tool.findMany()

    console.log(`Found ${tools.length} tools`)

    for (const tool of tools) {
      const newSlug = generateSlug(tool.name)

      if (tool.slug !== newSlug) {
        console.log(`\nUpdating: ${tool.name}`)
        console.log(`  Old slug: ${tool.slug}`)
        console.log(`  New slug: ${newSlug}`)

        await prisma.tool.update({
          where: { id: tool.id },
          data: { slug: newSlug }
        })

        console.log('  ✓ Updated')
      } else {
        console.log(`\n✓ ${tool.name} - slug is already correct`)
      }
    }

    console.log('\n✅ All slugs have been fixed!')
  } catch (error) {
    console.error('Error fixing slugs:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixSlugs()
