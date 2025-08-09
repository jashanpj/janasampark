'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in (only if not currently loading)
    const checkAuth = async () => {
      if (isLoading) return // Don't check auth while in the middle of logging in
      
      try {
        console.log('🔍 LOGIN PAGE: Checking if user is already authenticated')
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        })
        console.log('🔍 LOGIN PAGE: Auth check response:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('✅ LOGIN PAGE: User already authenticated:', data.user?.username)
          console.log('🧭 NAVIGATION: Redirecting to /dashboard (reason: already authenticated)')
          router.push('/dashboard')
        } else {
          console.log('🔍 LOGIN PAGE: User not authenticated, staying on login page')
        }
      } catch (error) {
        console.log('❌ LOGIN PAGE: Auth check error:', error)
        // User is not logged in, stay on login page
      }
    }

    checkAuth()
  }, [router, isLoading])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    console.log('🔑 LOGIN: Starting login process for:', formData.username)

    try {
      console.log('🔑 LOGIN: Sending login request to /api/auth/login')
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: Include cookies in request
        body: JSON.stringify(formData),
      })

      console.log('🔑 LOGIN: API Response Status:', response.status, response.statusText)
      const data = await response.json()
      console.log('🔑 LOGIN: API Response Data:', data)

      if (response.ok) {
        console.log('✅ LOGIN: Login successful, preparing to redirect to dashboard')
        console.log('🧭 NAVIGATION: Redirecting to /dashboard (reason: successful login)')
        // Small delay to ensure cookie is processed, then redirect
        setTimeout(() => {
          console.log('🧭 NAVIGATION: Executing redirect to /dashboard')
          window.location.href = '/dashboard'
        }, 100)
      } else {
        console.log('❌ LOGIN: Login failed:', data.error || 'Login failed')
        setError(data.error || 'Login failed')
      }
    } catch (error) {
      console.log('❌ LOGIN: Network error:', error)
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
      console.log('🔑 LOGIN: Login process completed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">JanaSampark</h1>
          <p className="text-gray-600">Survey Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 