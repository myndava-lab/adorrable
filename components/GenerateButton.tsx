
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function GenerateButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const testGeneration = async () => {
    setIsLoading(true)
    setResult('')

    try {
      console.log('🔍 Starting AI Generation test...')
      
      if (!session) {
        setResult('❌ User not authenticated. Please sign in first.\nGo to the main page and click "Sign in with Google"')
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: 'Create a simple test HTML page with a blue header',
          language: 'English'
        })
      })
      
      console.log('AI Generation response status:', response.status)

      const data = await response.json()
      console.log('AI Generation response data:', data)

      if (response.ok) {
        setResult(`✅ AI Generation working!
Generated HTML length: ${data.html?.length || 0} characters
Credits remaining: ${data.creditsRemaining || 'N/A'}`)
      } else {
        setResult(`❌ ${data.error || 'AI Generation failed'}`)
      }
    } catch (err: any) {
      console.error('❌ AI Generation test error:', err)
      setResult(`❌ AI Generation test error: ${err.message}`)
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
          <pre className="text-sm whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  )
}
