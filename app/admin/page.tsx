'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  name: string
  username: string
  phone: string
  role: string
  isApproved: boolean
  wardNumber: number
  localBody: string
  createdAt: string
  approver?: {
    name: string
    username: string
  }
  _count: {
    surveys: number
  }
}

interface Statistics {
  totalSurveys: number
  totalUsers: number
  pendingApprovals: number
  recentSurveys: any[]
}

export default function AdminDashboard() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [users, setUsers] = useState<User[]>([])
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

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
    const checkAdminAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (!response.ok) {
          router.push('/login')
          return
        }

        const data = await response.json()
        if (data.user.role !== 'ADMIN' && data.user.role !== 'SUPER_ADMIN') {
          router.push('/login')
          return
        }

        setCurrentUser(data.user)
      } catch (error) {
        router.push('/login')
      }
    }

    checkAdminAuth()
  }, [router])

  useEffect(() => {
    if (currentUser) {
      fetchData()
    }
  }, [currentUser])

  const fetchData = async () => {
    try {
      const [usersResponse, statsResponse] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/surveys', { method: 'POST' })
      ])

      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData.users)
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStatistics(statsData.statistics)
      }
    } catch (error) {
      setError('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const approveUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'POST'
      })

      if (response.ok) {
        fetchData() // Refresh data
      } else {
        alert('Failed to approve user')
      }
    } catch (error) {
      alert('Error approving user')
    }
  }


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">{error || 'Admin access required'}</p>
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

  const pendingUsers = users.filter(user => !user.isApproved)
  const approvedUsers = users.filter(user => user.isApproved)

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex space-x-4">
              <Link
                href="/admin/users"
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Manage Users
              </Link>
              <Link
                href="/admin/surveys"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                View All Surveys
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
          <p className="text-gray-600">
            Welcome, {currentUser.name} ({currentUser.role})
          </p>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Surveys</h3>
              <p className="text-3xl font-bold text-blue-600">{statistics.totalSurveys}</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-green-600">{statistics.totalUsers}</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Pending Approvals</h3>
              <p className="text-3xl font-bold text-orange-600">{statistics.pendingApprovals}</p>
            </div>
          </div>
        )}

        {/* Pending Approvals */}
        {pendingUsers.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Pending User Approvals</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {pendingUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-600">
                        @{user.username} • {user.phone} • Ward {user.wardNumber}, {user.localBody}
                      </p>
                      <p className="text-xs text-gray-500">
                        Registered: {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => approveUser(user.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* User Management */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">User Management</h2>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="text-left border-b border-gray-200">
                    <th className="pb-3 font-semibold text-gray-700">User</th>
                    <th className="pb-3 font-semibold text-gray-700">Contact</th>
                    <th className="pb-3 font-semibold text-gray-700">Location</th>
                    <th className="pb-3 font-semibold text-gray-700">Role</th>
                    <th className="pb-3 font-semibold text-gray-700">Surveys</th>
                    <th className="pb-3 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100">
                      <td className="py-3">
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-600">@{user.username}</p>
                        </div>
                      </td>
                      <td className="py-3">
                        <p className="text-sm text-gray-900">{user.phone}</p>
                      </td>
                      <td className="py-3">
                        <p className="text-sm text-gray-900">Ward {user.wardNumber}</p>
                        <p className="text-sm text-gray-600">{user.localBody}</p>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="text-sm font-medium">{user._count.surveys}</span>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Approved
                        </span>
                        {user.approver && (
                          <p className="text-xs text-gray-500 mt-1">
                            by {user.approver.name}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}