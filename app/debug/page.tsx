'use client'

import { useState, useEffect } from 'react'

export default function DebugPage() {
  const [authStatus, setAuthStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [loginResult, setLoginResult] = useState<any>(null)
  
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()
      setAuthStatus({
        status: response.status,
        ok: response.ok,
        data
      })
    } catch (error) {
      setAuthStatus({
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
  
  const testLogin = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'testuser',
          password: 'Test123!'
        })
      })
      
      const data = await response.json()
      setLoginResult({
        status: response.status,
        ok: response.ok,
        data
      })
      
      // Check auth again after login
      setTimeout(() => {
        checkAuth()
      }, 100)
    } catch (error) {
      setLoginResult({
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
    setLoading(false)
  }
  
  useEffect(() => {
    checkAuth()
  }, [])
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Authentication Debug</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Current Auth Status</h2>
          <button 
            onClick={checkAuth}
            className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
          >
            Check Auth Status
          </button>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(authStatus, null, 2)}
          </pre>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Test Login</h2>
          <button 
            onClick={testLogin}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded mb-4 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Test Login (testuser/Test123!)'}
          </button>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(loginResult, null, 2)}
          </pre>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Actions</h2>
          <div className="space-y-2">
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="block bg-purple-500 text-white px-4 py-2 rounded"
            >
              Go to Dashboard (window.location)
            </button>
            <button 
              onClick={() => window.location.href = '/login'}
              className="block bg-red-500 text-white px-4 py-2 rounded"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}