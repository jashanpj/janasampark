'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

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
  customCaste?: string
  category: string
  sex: string
  createdAt: string
  updatedAt: string
  user: {
    name: string
    username: string
  }
}

export default function SurveyViewPage() {
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const params = useParams()
  const surveyId = params.id as string

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/login')
    }
  }

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        // Check authentication
        const authResponse = await fetch('/api/auth/me')
        if (!authResponse.ok) {
          router.push('/login')
          return
        }

        // Fetch survey
        const response = await fetch(`/api/surveys/${surveyId}`)
        if (response.ok) {
          const data = await response.json()
          setSurvey(data.survey)
        } else if (response.status === 404) {
          setError('Survey not found')
        } else {
          setError('Failed to load survey')
        }
      } catch (error) {
        setError('Network error. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    if (surveyId) {
      fetchSurvey()
    }
  }, [surveyId, router])

  const deleteSurvey = async () => {
    if (!confirm('Are you sure you want to delete this survey?')) {
      return
    }

    try {
      const response = await fetch(`/api/surveys/${surveyId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/dashboard')
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

  if (error || !survey) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600 mb-6">{error || 'Survey not found'}</p>
            <Link
              href="/dashboard"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <Link
              href="/dashboard"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              ← Back to Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Survey Details</h1>
          <p className="text-gray-600 mt-2">View complete survey information</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Survey Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">{survey.name}</h2>
            <p className="text-blue-100">
              Created: {new Date(survey.createdAt).toLocaleDateString()} at{' '}
              {new Date(survey.createdAt).toLocaleTimeString()}
            </p>
            {survey.createdAt !== survey.updatedAt && (
              <p className="text-blue-100 text-sm">
                Last updated: {new Date(survey.updatedAt).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Survey Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <p className="text-gray-900 font-medium">{survey.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <p className="text-gray-900">{survey.age} years</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sex</label>
                  <p className="text-gray-900">{survey.sex}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <p className="text-gray-900 font-mono">{survey.phone}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                  <p className="text-gray-900">{survey.education}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job/Occupation</label>
                  <p className="text-gray-900">{survey.job}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Political Affiliation</label>
                  <p className="text-gray-900 font-medium">{survey.politicalAffiliation}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Religion</label>
                  <p className="text-gray-900">{survey.religion}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Caste</label>
                  <p className="text-gray-900">
                    {survey.caste === 'Other' && survey.customCaste 
                      ? survey.customCaste 
                      : survey.caste
                    }
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <p className="text-gray-900">{survey.category}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
                  <p className="text-gray-900">{survey.user.name} ({survey.user.username})</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <Link
              href={`/surveys/${survey.id}/edit`}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
            >
              Edit Survey
            </Link>
            <button
              onClick={deleteSurvey}
              className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Delete Survey
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 