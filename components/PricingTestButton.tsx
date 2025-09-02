'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function PricingTestButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const testPricing = async () => {
    setIsLoading(true)
    setResult('')

    try {
      console.log('🔍 Starting Pricing test...')
      const response = await fetch('/api/test')
      console.log('Pricing test response status:', response.status)

      const data = await response.json()
      console.log('Pricing test response data:', data)

      if (response.ok) {
        const results = data.tests.map((test: any) =>
          `${test.name}: ${test.status === 'pass' ? '✅' : '❌'} ${test.status}`
        ).join('\n')

        setResult(`Test Results:
${results}

Detailed Results:
${JSON.stringify(data, null, 2)}`)
      } else {
        setResult(`❌ Test failed: ${data.error || 'Unknown error'}`)
      }
    } catch (err: any) {
      console.error('❌ Pricing test error:', err)
      setResult(`❌ Test error: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 border border-gray-300 rounded-lg bg-white">
      <h3 className="text-lg font-semibold mb-2">Pricing System Test</h3>
      <p className="text-sm text-gray-600 mb-3">Tests credit granting and deduction flow</p>
      <button
        onClick={testPricing}
        disabled={isLoading}
        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
      >
        {isLoading ? 'Testing...' : 'Test Pricing Flow'}
      </button>
      {result && (
        <div className="mt-2 p-2 rounded bg-gray-100">
          <pre className="text-sm whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  )
}