import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API AUTH/ME: Received authentication verification request')
    const token = request.cookies.get('auth-token')?.value
    console.log('🍪 API AUTH/ME: Token exists:', !!token, 'Token preview:', token?.substring(0, 20))
    
    const user = await getAuthUser(request)
    console.log('🔍 API AUTH/ME: User lookup result:', user ? `Found user: ${user.username}` : 'Not found')

    if (!user) {
      console.log('❌ API AUTH/ME: No user found, returning 401')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log('✅ API AUTH/ME: Authentication successful for user:', user.username)
    return NextResponse.json(
      { user },
      { status: 200 }
    )
  } catch (error) {
    console.log('❌ API AUTH/ME: Auth verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 