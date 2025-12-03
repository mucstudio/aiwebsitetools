const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')

// Load .env file manually
const envPath = path.join(__dirname, '..', '.env')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim().replace(/^["']|["']$/g, '')
      process.env[key] = value
    }
  })
}

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Initializing admin user...')

    // Get credentials from environment variables
    const username = process.env.ADMIN_USERNAME || 'admin'
    const password = process.env.ADMIN_PASSWORD || 'admin123'

    if (!username || !password) {
      throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD must be set in .env file')
    }

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { username }
    })

    if (existingAdmin) {
      console.log(`Admin user "${username}" already exists.`)
      console.log('If you want to reset the password, please delete the existing admin first.')
      return
    }

    // Hash the password
    console.log('Hashing password...')
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create admin user
    console.log('Creating admin user...')
    const admin = await prisma.admin.create({
      data: {
        username,
        password: hashedPassword
      }
    })

    console.log('\n✅ Admin user created successfully!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`Username: ${admin.username}`)
    console.log(`Password: ${password}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\nYou can now login at: http://localhost:3000/admin/login')
    console.log('\n⚠️  IMPORTANT: Change the default password in production!')

  } catch (error) {
    console.error('Error creating admin user:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
