'use client'

import { useState } from 'react'

export default function DatabaseTestButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const testDatabase = async () => {
    setIsLoading(true)
    setResult('')

    try {
      console.log('🧪 Testing database...')

      const response = await fetch('/api/test', {
        method: 'GET'
      })

      console.log('Database test response status:', response.status)
      const data = await response.json()
      console.log('Database test response data:', data)

      if (response.ok && data.success) {
        setResult(`✅ Database test passed!\nConnection: ${data.database ? 'Working' : 'Failed'}\nAuth: ${data.auth?.working ? 'Working' : 'Failed'}\nUser: ${data.auth?.user || 'None'}\nEnvironment: All variables configured`)
      } else {
        setResult(`❌ Database test failed: ${data.error || data.details || 'Unknown error'}`)
      }
    } catch (err: any) {
      console.error('❌ Database test error:', err)
      setResult(`❌ Database test error: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 border border-gray-300 rounded-lg bg-white">
      <h3 className="text-lg font-semibold mb-2">Database Connection Test</h3>
      <button
        onClick={testDatabase}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Testing...' : 'Test Database Connection'}
      </button>
      {result && (
        <div className="mt-2 p-2 rounded bg-gray-100">
          <pre className="text-sm whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  )
}