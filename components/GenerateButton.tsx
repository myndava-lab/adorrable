
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function GenerateButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const testGeneration = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      // Check if user is authenticated
      const { data: { session }, error: authError } = await supabase.auth.getSession()
      
      if (authError || !session?.user) {
        setResult('❌ User not authenticated')
        return
      }

      // Test AI generation API
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: 'Test website generation',
          language: 'English'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setResult('✅ AI Generation API working!')
      } else {
        const error = await response.text()
        setResult(`❌ AI Generation failed: ${error}`)
      }
    } catch (err: any) {
      setResult(`❌ Generation test error: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 border border-gray-300 rounded-lg bg-white">
      <h3 className="text-lg font-semibold mb-2">AI Generation Test</h3>
      <button
        onClick={testGeneration}
        disabled={isLoading}
        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
      >
        {isLoading ? 'Testing...' : 'Test AI Generation'}
      </button>
      {result && (
        <div className="mt-2 p-2 rounded bg-gray-100">
          <pre className="text-sm">{result}</pre>
        </div>
      )}
    </div>
  )
}
