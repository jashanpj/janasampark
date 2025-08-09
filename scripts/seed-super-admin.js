const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createSuperAdmin() {
  try {
    console.log('🌱 Seeding super admin...')

    // Check if super admin already exists
    const existingSuperAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    })

    if (existingSuperAdmin) {
      console.log('✅ Super admin already exists:', existingSuperAdmin.username)
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Jump!Candle4Tiger%Glass!Moon', 12)
    // Jump!Candle4Tiger%Glass!Moon

    // Create super admin
    const superAdmin = await prisma.user.create({
      data: {
        name: 'Super Administrator',
        username: 'superadmin',
        password: hashedPassword,
        phone: '7025541231',
        role: 'SUPER_ADMIN',
        isApproved: true,
        wardNumber: 1,
        localBody: 'System'
      }
    })

    console.log('✅ Super admin created successfully!')
    console.log('Username:', superAdmin.username)
    console.log('Password: Jump!Candle4Tiger%Glass!Moon')
    console.log('⚠️  Please change the default password after first login')

  } catch (error) {
    console.error('❌ Error creating super admin:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  createSuperAdmin()
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = { createSuperAdmin }