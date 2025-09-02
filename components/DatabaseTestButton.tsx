
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DatabaseTestButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const testConnection = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      // Test basic connection
      const { data, error } = await supabase
        .from('profiles')
        .select('count(*)')
        .limit(1)

      if (error) {
        setResult(`❌ Database connection failed: ${error.message}`)
      } else {
        setResult('✅ Database connection successful!')
      }
    } catch (err: any) {
      setResult(`❌ Connection error: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 border border-gray-300 rounded-lg bg-white">
      <h3 className="text-lg font-semibold mb-2">Database Connection Test</h3>
      <button
        onClick={testConnection}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Testing...' : 'Test Database Connection'}
      </button>
      {result && (
        <div className="mt-2 p-2 rounded bg-gray-100">
          <pre className="text-sm">{result}</pre>
        </div>
      )}
    </div>
  )
}
