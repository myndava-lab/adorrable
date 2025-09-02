'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function GenerateButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const testGeneration = async () => {
    setIsLoading(true)
    setResult('')

    try {
      console.log('🔍 Starting AI Generation test...')
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          prompt: 'Test website for a modern bakery in Lagos',
          language: 'English'
        })
      })

      console.log('AI Generation response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('AI Generation response data:', data)
        setResult(`✅ AI Generation working!
Success: ${data.success}
Credits used: ${data.creditsUsed}
Credits remaining: ${data.creditsRemaining}
HTML generated: ${data.html?.length || 0} characters`)
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('AI Generation error data:', errorData)
        setResult(`❌ AI Generation failed: ${errorData.error || 'Unknown error'}`)
      }
    } catch (err: any) {
      console.error('❌ AI Generation test error:', err)
      setResult(`❌ AI test error: ${err.message}`)
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