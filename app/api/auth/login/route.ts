import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    console.log('🔑 API LOGIN: Received login request')
    const body = await request.json()
    const { username, password } = body
    
    console.log('🔑 API LOGIN: Login attempt for username:', username)

    // Validation
    if (!username || !password) {
      console.log('❌ API LOGIN: Missing username or password')
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Find user
    console.log('🔑 API LOGIN: Looking up user in database')
    const user = await prisma.user.findUnique({
      where: { username }
    })

    if (!user) {
      console.log('❌ API LOGIN: User not found:', username)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    console.log('✅ API LOGIN: User found:', user.username, 'Role:', user.role)

    // Verify password
    console.log('🔑 API LOGIN: Verifying password')
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      console.log('❌ API LOGIN: Invalid password for user:', username)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    console.log('✅ API LOGIN: Password verified successfully')

    // Generate JWT token
    console.log('🔑 API LOGIN: Generating JWT token')
    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    })
    console.log('✅ API LOGIN: JWT token generated, length:', token.length)

    // Create response with user data
    console.log('🔑 API LOGIN: Creating response with user data')
    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          role: user.role,
          wardNumber: user.wardNumber,
          localBody: user.localBody,
        },
      },
      { status: 200 }
    )

    // Set HTTP-only cookie
    console.log('🍪 API LOGIN: Setting HTTP-only auth cookie')
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: false, // Always false for development
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    })

    console.log('✅ API LOGIN: Login successful for user:', user.username)
    console.log('🍪 API LOGIN: Auth cookie set successfully')
    return response
  } catch (error) {
    console.log('❌ API LOGIN: Internal server error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    )
  }
} 