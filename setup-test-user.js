const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function setupTestUser() {
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { username: 'testuser' }
    })

    if (existingUser) {
      console.log('✅ Test user already exists')
      console.log('Username: testuser')
      console.log('Password: Test123!')
      return
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('Test123!', 10)
    
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        username: 'testuser',
        password: hashedPassword,
        phone: '9876543210',
        localBody: 'N.Paravur',
        role: 'WARD_MEMBER',
        wardNumber: 5
      }
    })

    console.log('✅ Test user created successfully!')
    console.log('Username: testuser')
    console.log('Password: Test123!')
    console.log('User ID:', user.id)
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

setupTestUser()