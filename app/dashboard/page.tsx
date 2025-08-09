'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  name: string
  username: string
  role: string
  wardNumber: number
  localBody: string
}

interface Survey {
  id: string
  name: string
  age: number
  education: string
  job: string
  phone: string
  politicalAffiliation: string
  religion: string
  caste: string
  sex: string
  createdAt: string
  updatedAt: string
  user: {
    name: string
    username: string
  }
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🏠 DASHBOARD: Starting data fetch and auth verification')
        
        // Check authentication
        console.log('🔍 DASHBOARD: Checking authentication status')
        const authResponse = await fetch('/api/auth/me', {
          credentials: 'include'
        })
        console.log('🔍 DASHBOARD: Auth API response:', authResponse.status, authResponse.statusText)
        
        if (!authResponse.ok) {
          console.log('❌ DASHBOARD: Authentication failed, redirecting to login')
          console.log('🧭 NAVIGATION: Redirecting to /login (reason: authentication failed)')
          router.push('/login')
          return
        }
        
        const authData = await authResponse.json()
        console.log('✅ DASHBOARD: Authentication successful for user:', authData.user?.username)
        setUser(authData.user)

        // Fetch surveys
        console.log('📊 DASHBOARD: Fetching user surveys')
        const surveysResponse = await fetch('/api/surveys', {
          credentials: 'include'
        })
        console.log('📊 DASHBOARD: Surveys API response:', surveysResponse.status, surveysResponse.statusText)
        
        if (surveysResponse.ok) {
          const surveysData = await surveysResponse.json()
          console.log('✅ DASHBOARD: Successfully loaded', surveysData.surveys?.length || 0, 'surveys')
          setSurveys(surveysData.surveys)
        } else {
          console.log('❌ DASHBOARD: Failed to load surveys')
          setError('Failed to load surveys')
        }
      } catch (error) {
        console.log('❌ DASHBOARD: Network error:', error)
        setError('Network error. Please try again.')
      } finally {
        setIsLoading(false)
        console.log('🏠 DASHBOARD: Data fetch completed')
      }
    }

    console.log('🏠 DASHBOARD: Component mounted, starting data fetch')
    fetchData()
  }, [router])

  const handleLogout = async () => {
    try {
      console.log('🔓 LOGOUT: Starting logout process')
      const response = await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      })
      console.log('🔓 LOGOUT: API response:', response.status, response.statusText)
      console.log('🧭 NAVIGATION: Redirecting to /login (reason: user logout)')
      router.push('/login')
    } catch (error) {
      console.log('❌ LOGOUT: Logout error:', error)
    }
  }

  const deleteSurvey = async (surveyId: string) => {
    if (!confirm('Are you sure you want to delete this survey?')) {
      return
    }

    try {
      const response = await fetch(`/api/surveys/${surveyId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        setSurveys(surveys.filter(survey => survey.id !== surveyId))
      } else {
        alert('Failed to delete survey')
      }
    } catch (error) {
      alert('Network error. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">JanaSampark</h1>
              {user && (
                <p className="text-sm text-gray-600">
                  Welcome, {user.name} ({user.role.replace('_', ' ')})
                </p>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* User Info */}
        {user && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Name:</span> {user.name}
              </div>
              <div>
                <span className="font-medium text-gray-700">Username:</span> {user.username}
              </div>
              <div>
                <span className="font-medium text-gray-700">Role:</span> {user.role.replace('_', ' ')}
              </div>
              <div>
                <span className="font-medium text-gray-700">Ward:</span> {user.wardNumber}
              </div>
              <div className="md:col-span-2">
                <span className="font-medium text-gray-700">Local Body:</span> {user.localBody}
              </div>
            </div>
          </div>
        )}

        {/* Surveys Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-medium text-gray-900 mb-2 sm:mb-0">
                Survey Records ({surveys.length})
              </h2>
              <Link
                href="/surveys/new"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
              >
                Add New Survey
              </Link>
            </div>
          </div>

          {error && (
            <div className="p-6 bg-red-50 border-l-4 border-red-400">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {surveys.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500 mb-4">No surveys found. Create your first survey to get started.</p>
              <Link
                href="/surveys/new"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Create Survey
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {surveys.map((survey) => (
                <div key={survey.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1 mb-4 sm:mb-0">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{survey.name}</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div>Age: {survey.age}</div>
                        <div>Sex: {survey.sex}</div>
                        <div>Education: {survey.education}</div>
                        <div>Job: {survey.job}</div>
                        <div>Political: {survey.politicalAffiliation}</div>
                        <div>Phone: {survey.phone}</div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Created: {new Date(survey.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        href={`/surveys/${survey.id}`}
                        className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                      >
                        View
                      </Link>
                      <Link
                        href={`/surveys/${survey.id}/edit`}
                        className="bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => deleteSurvey(survey.id)}
                        className="bg-red-100 text-red-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 