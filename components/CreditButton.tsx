'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function CreditButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const testCredits = async () => {
    setIsLoading(true)
    setResult('')

    try {
      console.log('🔍 Starting Credits API test...')
      const response = await fetch('/api/credits')
      console.log('Credits API response status:', response.status)

      const data = await response.json()
      console.log('Credits API response data:', data)

      if (response.ok) {
        setResult(`✅ Credits API working!
Current credits: ${data.credits}
Profile: ${JSON.stringify(data.profile, null, 2)}`)
      } else {
        setResult(`❌ ${data.error || 'Credits API failed'}`)
      }
    } catch (err: any) {
      console.error('❌ Credits test error:', err)
      setResult(`❌ Credits test error: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 border border-gray-300 rounded-lg bg-white">
      <h3 className="text-lg font-semibold mb-2">Credits API Test</h3>
      <button
        onClick={testCredits}
        disabled={isLoading}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
      >
        {isLoading ? 'Testing...' : 'Test Credits API'}
      </button>
      {result && (
        <div className="mt-2 p-2 rounded bg-gray-100">
          <pre className="text-sm">{result}</pre>
        </div>
      )}
    </div>
  )
}