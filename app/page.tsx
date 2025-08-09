'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        console.log('🏠 ROOT PAGE: Checking authentication status')
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        })
        console.log('🏠 ROOT PAGE: Auth API response:', response.status, response.statusText)
        
        if (response.ok) {
          const data = await response.json()
          console.log('✅ ROOT PAGE: User authenticated:', data.user?.username)
          console.log('🧭 NAVIGATION: Redirecting to /dashboard (reason: authenticated user)')
          // User is logged in, redirect to dashboard
          router.push('/dashboard')
        } else {
          console.log('🔍 ROOT PAGE: User not authenticated')
          console.log('🧭 NAVIGATION: Redirecting to /login (reason: not authenticated)')
          // User is not logged in, redirect to login
          router.push('/login')
        }
      } catch (error) {
        console.log('❌ ROOT PAGE: Auth check error:', error)
        console.log('🧭 NAVIGATION: Redirecting to /login (reason: auth check error)')
        // Error checking auth, redirect to login
        router.push('/login')
      }
    }

    console.log('🏠 ROOT PAGE: Component mounted, checking authentication')
    checkAuth()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
}
