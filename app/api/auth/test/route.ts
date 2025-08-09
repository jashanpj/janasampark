import { NextRequest, NextResponse } from 'next/server'
import { generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Create a test token
    const token = generateToken({
      userId: 'test-user-id',
      username: 'testuser',
      role: 'WARD_MEMBER',
    })

    const response = NextResponse.json({
      message: 'Test cookie set',
      token: token.substring(0, 20) + '...', // Show partial token for debugging
    })

    // Set test cookie with various configurations
    response.cookies.set('test-auth-token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    })

    console.log('Test cookie set with token:', token.substring(0, 50) + '...')
    return response
  } catch (error) {
    console.error('Test cookie error:', error)
    return NextResponse.json(
      { error: 'Failed to set test cookie' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const testToken = request.cookies.get('test-auth-token')?.value
    const authToken = request.cookies.get('auth-token')?.value

    return NextResponse.json({
      hasTestToken: !!testToken,
      hasAuthToken: !!authToken,
      testTokenPreview: testToken ? testToken.substring(0, 20) + '...' : null,
      authTokenPreview: authToken ? authToken.substring(0, 20) + '...' : null,
      allCookies: Array.from(request.cookies).map(([name, cookie]) => ({
        name,
        valuePreview: cookie.value.substring(0, 20) + (cookie.value.length > 20 ? '...' : '')
      }))
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to read cookies' },
      { status: 500 }
    )
  }
}