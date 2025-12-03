const { pinyin } = require('pinyin-pro')

function generateSlug(name) {
  console.log('Input name:', JSON.stringify(name))

  // Convert Chinese characters to pinyin (keeps words together)
  const pinyinName = pinyin(name, {
    toneType: 'none',
    separator: ' '
  })

  console.log('After pinyin:', JSON.stringify(pinyinName))

  // Generate slug
  const result = pinyinName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')

  console.log('Final slug:', JSON.stringify(result))
  return result
}

// Test with the actual name from database
const testName = 'The Savage AI Roaster '
console.log('\n=== Testing slug generation ===\n')
generateSlug(testName)
