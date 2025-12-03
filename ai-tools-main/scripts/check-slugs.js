const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkSlugs() {
  try {
    const tools = await prisma.tool.findMany()

    console.log('Current tools in database:\n')
    tools.forEach(tool => {
      console.log(`ID: ${tool.id}`)
      console.log(`Name: ${tool.name}`)
      console.log(`Slug: ${tool.slug}`)
      console.log('---')
    })
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSlugs()
