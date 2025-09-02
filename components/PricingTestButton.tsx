
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function PricingTestButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const testPricing = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      // Check if user is authenticated
      const { data: { session }, error: authError } = await supabase.auth.getSession()
      
      if (authError || !session?.user) {
        setResult('❌ User not authenticated')
        return
      }

      // Test credit granting (simulating purchase)
      const grantResponse = await fetch('/api/credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'grant',
          amount: 10,
          reason: 'Test purchase - Basic tier',
          meta: { tier: 'basic', test: true }
        })
      })

      if (grantResponse.ok) {
        const grantData = await grantResponse.json()
        
        // Test credit deduction (simulating generation)
        const deductResponse = await fetch('/api/credits', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            action: 'deduct',
            amount: 1,
            reason: 'Website generation test',
            meta: { feature: 'ai_generation', test: true }
          })
        })

        if (deductResponse.ok) {
          const deductData = await deductResponse.json()
          setResult(`✅ Pricing system working!
📈 Granted 10 credits: ${grantData.newBalance} total
📉 Deducted 1 credit: ${deductData.newBalance} final balance`)
        } else {
          const deductError = await deductResponse.text()
          setResult(`❌ Credit deduction failed: ${deductError}`)
        }
      } else {
        const grantError = await grantResponse.text()
        setResult(`❌ Credit granting failed: ${grantError}`)
      }
    } catch (err: any) {
      setResult(`❌ Pricing test error: ${err.message}`)
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
