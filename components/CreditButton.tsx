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
      const { data: { session }, error: authError } = await supabase.auth.getSession()

      if (authError || !session?.user) {
        setResult(`❌ User not authenticated. Please sign in first.
Go to the main page and click "Sign in with Google"`)
        return
      }

      const response = await fetch('/api/credits', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setResult(`✅ Credits API working!
Current credits: ${data.credits}
Subscription tier: ${data.tier}`)
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        setResult(`❌ Credits API failed: ${errorData.error || 'Unknown error'}`)
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