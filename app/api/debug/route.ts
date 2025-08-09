import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    const user = await getAuthUser(request)
    
    let tokenPayload = null
    if (token) {
      tokenPayload = verifyToken(token)
    }

    return NextResponse.json({
      hasToken: !!token,
      tokenValid: !!tokenPayload,
      tokenPayload: tokenPayload,
      user: user,
      cookies: Array.from(request.cookies).map(([name, value]) => ({ name, value })),
      url: request.url,
      timestamp: new Date().toISOString()
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      hasToken: false,
      tokenValid: false
    }, { status: 500 })
  }
} 