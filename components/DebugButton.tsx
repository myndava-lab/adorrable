'use client'

import { useState } from 'react'

export default function DebugButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const runDebug = async () => {
    setIsLoading(true)
    setResult('')

    try {
      console.log('🔍 Starting debug analysis...')

      const response = await fetch('/api/debug', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log('Debug response status:', response.status)
      const data = await response.json()
      console.log('Debug response data:', data)

      if (response.ok && data.tests) {
        let resultText = '🔍 DEBUG ANALYSIS RESULTS:\n\n'

        data.tests.forEach((test: any, index: number) => {
          const status = test.status === 'pass' ? '✅' : '❌'
          resultText += `${index + 1}. ${test.name}: ${status}\n`

          if (test.details) {
            if (test.name.includes('Credits API')) {
              resultText += `   Status Code: ${test.details.statusCode || 'N/A'}\n`
              resultText += `   Response: ${test.details.rawResponse ? 'Received' : 'Empty'}\n`
            } else if (test.name.includes('AI Generation')) {
              resultText += `   OpenAI Configured: ${test.details.openaiConfigured ? '✅' : '❌'}\n`
              resultText += `   Status Code: ${test.details.statusCode || 'N/A'}\n`
            } else if (test.name.includes('Database Schema')) {
              resultText += `   Tables Found: ${test.details.tablesCount || 0}\n`
              resultText += `   Required Tables: ${test.details.hasRequiredTables ? 'Present' : 'Missing'}\n`
            } else if (test.name.includes('Environment')) {
              resultText += `   NEXT_PUBLIC_SUPABASE_URL: ${test.details.NEXT_PUBLIC_SUPABASE_URL?.value || '❌'}\n`
              resultText += `   NEXT_PUBLIC_SUPABASE_ANON_KEY: ${test.details.NEXT_PUBLIC_SUPABASE_ANON_KEY?.value || '❌'}\n`
              resultText += `   SUPABASE_SERVICE_ROLE_KEY: ${test.details.SUPABASE_SERVICE_ROLE_KEY?.value || '❌'}\n`
              resultText += `   OPENAI_API_KEY: ${test.details.OPENAI_API_KEY?.value || '❌'}\n`
              resultText += `   NEXTAUTH_SECRET: ${test.details.NEXTAUTH_SECRET?.value || '❌'}\n`
              resultText += `   ADMIN_EMAIL: ${test.details.ADMIN_EMAIL?.value || '❌'}\n`
            }
          }

          if (test.error) {
            resultText += `   Error: ${test.error}\n`
          }

          resultText += '\n'
        })

        setResult(resultText)
      } else {
        setResult(`❌ Debug failed: ${data.error || data.details || 'Unknown error'}`)
      }
    } catch (err: any) {
      console.error('❌ Debug error:', err)
      setResult(`❌ Debug error: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 border border-gray-300 rounded-lg bg-white">
      <h3 className="text-lg font-semibold mb-2">System Debug Analysis</h3>
      <button
        onClick={runDebug}
        disabled={isLoading}
        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
      >
        {isLoading ? 'Analyzing...' : 'Run Debug Analysis'}
      </button>
      {result && (
        <div className="mt-2 p-2 rounded bg-gray-100 max-h-96 overflow-y-auto">
          <pre className="text-sm whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  )
}