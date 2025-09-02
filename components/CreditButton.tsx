
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function CreditButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const testCredits = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        setResult('❌ User not authenticated')
        return
      }

      // Test credits API
      const response = await fetch('/api/credits', {
        headers: {
          'Authorization': `Bearer ${user.session?.access_token || ''}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setResult(`✅ Credits API working! Credits: ${data.profile?.credits || 0}`)
      } else {
        const error = await response.text()
        setResult(`❌ Credits API failed: ${error}`)
      }
    } catch (err: any) {
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
