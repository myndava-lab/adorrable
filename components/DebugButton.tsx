
'use client'

import { useState } from 'react'

export default function DebugButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const runDebug = async () => {
    setIsLoading(true)
    setResult('')

    try {
      console.log('🔍 Running debug analysis...')
      
      const response = await fetch('/api/debug', {
        method: 'GET'
      })
      
      console.log('Debug response status:', response.status)
      const data = await response.json()
      console.log('Debug response data:', data)

      if (response.ok) {
        let resultText = '🔍 DEBUG ANALYSIS RESULTS:\n\n'
        
        data.tests.forEach((test: any, index: number) => {
          resultText += `${index + 1}. ${test.name}: ${test.status.toUpperCase()}\n`
          
          if (test.details) {
            if (test.name === 'Credits API Debug') {
              resultText += `   Expected Status: ${test.details.expectedStatus}\n`
              resultText += `   Actual Status: ${test.details.actualStatus}\n`
              resultText += `   Response: ${JSON.stringify(test.details.response, null, 2)}\n`
            } else if (test.name === 'AI Generation API Debug') {
              resultText += `   OpenAI Connection: ${test.details.openaiConnection || 'unknown'}\n`
              resultText += `   API Status: ${test.details.apiEndpointStatus}\n`
              if (test.details.error) {
                resultText += `   Error: ${test.details.error}\n`
              }
            } else if (test.name === 'Database Schema Debug') {
              resultText += `   Missing Tables: ${test.details.missingTables?.join(', ') || 'None'}\n`
              resultText += `   All Tables Exist: ${test.details.allTablesExist}\n`
            } else if (test.name === 'Environment Variables Detailed') {
              Object.entries(test.details).forEach(([key, value]: [string, any]) => {
                resultText += `   ${key}: ${value.exists ? '✅' : '❌'}\n`
              })
            }
          }
          resultText += '\n'
        })

        setResult(resultText)
      } else {
        setResult(`❌ Debug failed: ${data.error || 'Unknown error'}`)
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
      <h3 className="text-lg font-semibold mb-2">🔍 Debug Analysis</h3>
      <p className="text-sm text-gray-600 mb-3">Comprehensive debugging of all failing components</p>
      <button
        onClick={runDebug}
        disabled={isLoading}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
      >
        {isLoading ? 'Debugging...' : '🔍 Run Debug Analysis'}
      </button>
      {result && (
        <div className="mt-2 p-2 rounded bg-gray-100 max-h-96 overflow-y-auto">
          <pre className="text-xs whitespace-pre-wrap font-mono">{result}</pre>
        </div>
      )}
    </div>
  )
}
