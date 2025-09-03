
'use client'

import { useState, useEffect } from 'react'

interface BetaStats {
  max_users: number
  current_users: number
  spots_remaining: number
  waiting_list_count: number
  is_beta_full: boolean
}

export default function BetaStatus() {
  const [stats, setStats] = useState<BetaStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/beta-stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching beta stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading || !stats) return null

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 text-center">
      <div className="max-w-4xl mx-auto">
        {stats.is_beta_full ? (
          <div className="flex items-center justify-center gap-4">
            <div>
              <span className="text-lg font-semibold">🚀 Beta is Full!</span>
              <p className="text-sm opacity-90">
                {stats.waiting_list_count} people are waiting for their turn
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-4">
            <div>
              <span className="text-lg font-semibold">
                🎯 Beta: {stats.current_users}/{stats.max_users} users
              </span>
              <p className="text-sm opacity-90">
                Only {stats.spots_remaining} spots left!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
