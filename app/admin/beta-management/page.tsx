
'use client'

import { useState, useEffect } from 'react'

interface BetaStats {
  max_users: number
  current_users: number
  spots_remaining: number
  waiting_list_count: number
  is_beta_full: boolean
}

interface WaitingListUser {
  id: string
  email: string
  full_name: string
  joined_at: string
}

export default function BetaManagement() {
  const [stats, setStats] = useState<BetaStats | null>(null)
  const [waitingList, setWaitingList] = useState<WaitingListUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch beta stats
      const statsResponse = await fetch('/api/beta-stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // You'll need to create an admin API to fetch waiting list
      // For now, we'll show the structure
      
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Beta User Management</h1>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Active Beta Users</h3>
            <p className="text-3xl font-bold text-blue-600">{stats?.current_users || 0}</p>
            <p className="text-sm text-gray-600">of {stats?.max_users || 100} max</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Spots Remaining</h3>
            <p className={`text-3xl font-bold ${(stats?.spots_remaining || 0) > 10 ? 'text-green-600' : 'text-red-600'}`}>
              {stats?.spots_remaining || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Waiting List</h3>
            <p className="text-3xl font-bold text-orange-600">{stats?.waiting_list_count || 0}</p>
            <p className="text-sm text-gray-600">people waiting</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <p className={`text-lg font-bold ${stats?.is_beta_full ? 'text-red-600' : 'text-green-600'}`}>
              {stats?.is_beta_full ? '🚫 FULL' : '🎯 OPEN'}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Beta Progress</h2>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${((stats?.current_users || 0) / (stats?.max_users || 100)) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>{stats?.current_users || 0} users</span>
            <span>{((stats?.current_users || 0) / (stats?.max_users || 100) * 100).toFixed(1)}% full</span>
            <span>{stats?.max_users || 100} max</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Export User List
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              Notify Waiting List
            </button>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
              Increase Limit
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a href="/" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
