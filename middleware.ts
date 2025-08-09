import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register', '/debug']
  
  // API routes that don't require authentication
  const publicApiRoutes = ['/api/auth/login', '/api/auth/register', '/api/auth/me', '/api/auth/logout', '/api/auth/test', '/api/debug']
  
  // Check if it's a public route
  if (publicRoutes.includes(pathname) || publicApiRoutes.includes(pathname)) {
    console.log('Middleware: Allowing access to public route:', pathname)
    return NextResponse.next()
  }
  
  // Get auth token from cookies
  const token = request.cookies.get('auth-token')?.value
  
  // If no token and trying to access protected route, redirect to login
  if (!token) {
    console.log('Middleware: No token found, redirecting to login for path:', pathname)
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }
  
  // For Edge Runtime compatibility, we'll do basic token existence check
  // and let the actual API routes handle JWT verification
  console.log('Middleware: Token exists for path:', pathname, 'Token preview:', token.substring(0, 20))
  
  // Simple check: if token exists and looks like a JWT (has dots), allow access
  if (token && token.split('.').length === 3) {
    console.log('Middleware: Token format valid, allowing access to', pathname)
    return NextResponse.next()
  } else {
    console.log('Middleware: Invalid token format, rejecting request')
    
    const response = pathname.startsWith('/api/')
      ? NextResponse.json(
          { error: 'Invalid authentication token' },
          { status: 401 }
        )
      : NextResponse.redirect(new URL('/login', request.url))
    
    // Clear invalid token
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })
    return response
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
} 