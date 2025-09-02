
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface PricingTier {
  id: string
  name: string
  credits: number
  price_usd: number
  price_ngn: number
  features: string[]
  popular?: boolean
}

const pricingTiers: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 25,
    price_usd: 19,
    price_ngn: 12000,
    features: ['25 AI Website Generations', 'Basic Templates', 'Export HTML/CSS', 'Email Support']
  },
  {
    id: 'pro',
    name: 'Pro',
    credits: 100,
    price_usd: 49,
    price_ngn: 48000,
    features: ['100 AI Website Generations', 'Premium Templates', 'Advanced Customization', 'Priority Support', 'API Access'],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    credits: 500,
    price_usd: 199,
    price_ngn: 195000,
    features: ['500 AI Website Generations', 'White-label Options', 'Custom Integrations', 'Dedicated Support', 'Advanced Analytics']
  }
]

export default function PricingCard() {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [currency, setCurrency] = useState<'USD' | 'NGN'>('USD')

  const handlePurchase = async (tier: PricingTier, method: 'paystack' | 'crypto') => {
    setIsLoading(tier.id)

    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession()
      
      if (authError || !session?.user) {
        alert('Please sign in to purchase credits')
        return
      }

      // Initialize payment
      const response = await fetch('/api/payments/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          tier: tier.id,
          method: method,
          currency: currency
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Payment initialization failed')
      }

      if (result.success) {
        // Redirect to payment page
        window.open(result.payment_url, '_blank')
      }

    } catch (error: any) {
      console.error('Purchase error:', error)
      alert(`Purchase failed: ${error.message}`)
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
        <div className="flex justify-center items-center gap-4 mb-6">
          <span className="text-sm">Currency:</span>
          <button
            onClick={() => setCurrency('USD')}
            className={`px-3 py-1 rounded ${currency === 'USD' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            USD
          </button>
          <button
            onClick={() => setCurrency('NGN')}
            className={`px-3 py-1 rounded ${currency === 'NGN' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            NGN
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {pricingTiers.map((tier) => (
          <div
            key={tier.id}
            className={`relative rounded-lg border-2 p-6 ${
              tier.popular ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
          >
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">{tier.name}</h3>
              <div className="text-3xl font-bold mb-1">
                {currency === 'USD' ? `$${tier.price_usd}` : `₦${tier.price_ngn.toLocaleString()}`}
              </div>
              <div className="text-gray-600 text-sm">{tier.credits} credits</div>
            </div>

            <ul className="space-y-2 mb-6">
              {tier.features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <div className="space-y-2">
              <button
                onClick={() => handlePurchase(tier, 'paystack')}
                disabled={isLoading === tier.id}
                className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm"
              >
                {isLoading === tier.id ? 'Processing...' : 'Pay with Card'}
              </button>
              
              <button
                onClick={() => handlePurchase(tier, 'crypto')}
                disabled={isLoading === tier.id}
                className="w-full py-2 px-4 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 text-sm"
              >
                {isLoading === tier.id ? 'Processing...' : 'Pay with Crypto'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
