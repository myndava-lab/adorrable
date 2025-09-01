
import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'
import { headers } from 'next/headers'

// Payment provider types
type PaymentMethod = 'paystack' | 'crypto' | 'bank_transfer'

interface PaymentRequest {
  tier: 'basic' | 'pro' | 'enterprise'
  method: PaymentMethod
  currency: 'USD' | 'NGN'
}

export async function POST(req: NextRequest) {
  try {
    const headersList = headers()
    const authorization = headersList.get('authorization')
    
    if (!authorization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tier, method, currency }: PaymentRequest = await req.json()

    // Validate input
    if (!tier || !method || !currency) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Extract user from JWT token
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser(
      authorization.replace('Bearer ', '')
    )

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get pricing information
    const { data: pricing, error: pricingError } = await supabaseServer
      .from('price_config')
      .select('*')
      .eq('tier', tier)
      .eq('is_active', true)
      .single()

    if (pricingError || !pricing) {
      return NextResponse.json({ error: 'Invalid pricing tier' }, { status: 400 })
    }

    const amount = currency === 'USD' ? pricing.price_usd : pricing.price_ngn
    const transactionId = `adorrable_${Date.now()}_${user.id.slice(0, 8)}`

    // Route to appropriate payment provider
    switch (method) {
      case 'paystack':
        return await initializePaystack(user, amount, currency, tier, transactionId)
      
      case 'crypto':
        return await initializeCrypto(user, amount, currency, tier, transactionId)
      
      case 'bank_transfer':
        return await initializeBankTransfer(user, amount, currency, tier, transactionId)
      
      default:
        return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 })
    }

  } catch (error: any) {
    console.error('Payment initialization error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function initializePaystack(user: any, amount: number, currency: string, tier: string, transactionId: string) {
  // Paystack initialization logic
  const paystackData = {
    email: user.email,
    amount: Math.round(amount * 100), // Convert to kobo/cents
    currency: currency,
    reference: transactionId,
    callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payments/callback/paystack`,
    metadata: {
      user_id: user.id,
      tier: tier,
      credits: await getCreditsForTier(tier)
    }
  }

  // Here you would integrate with Paystack API
  // For now, return mock response
  return NextResponse.json({
    success: true,
    method: 'paystack',
    payment_url: 'https://checkout.paystack.com/mock', // Mock URL
    reference: transactionId,
    amount: amount,
    currency: currency
  })
}

async function initializeCrypto(user: any, amount: number, currency: string, tier: string, transactionId: string) {
  // Crypto payment initialization (NOWPayments/TripleA)
  return NextResponse.json({
    success: true,
    method: 'crypto',
    payment_url: 'https://nowpayments.io/mock', // Mock URL
    reference: transactionId,
    amount: amount,
    currency: currency,
    supported_currencies: ['BTC', 'ETH', 'USDT', 'LTC']
  })
}

async function initializeBankTransfer(user: any, amount: number, currency: string, tier: string, transactionId: string) {
  // Bank transfer details
  const bankDetails = {
    bank_name: 'Zenith Bank',
    account_number: '1234567890',
    account_name: 'Adorrable Technologies Ltd',
    reference: transactionId,
    amount: amount,
    currency: currency
  }

  return NextResponse.json({
    success: true,
    method: 'bank_transfer',
    bank_details: bankDetails,
    reference: transactionId,
    upload_url: `/api/payments/receipt-upload/${transactionId}`
  })
}

async function getCreditsForTier(tier: string): Promise<number> {
  const { data } = await supabaseServer
    .from('price_config')
    .select('credits')
    .eq('tier', tier)
    .single()
  
  return data?.credits || 0
}
