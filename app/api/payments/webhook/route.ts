
import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-paystack-signature') || 
                     req.headers.get('x-nowpayments-signature') ||
                     req.headers.get('x-webhook-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // Verify webhook signature (implementation depends on provider)
    const isValid = await verifyWebhookSignature(body, signature, req.headers.get('user-agent') || '')

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(body)
    
    // Route to appropriate handler based on payment provider
    if (req.headers.get('user-agent')?.includes('Paystack')) {
      return await handlePaystackWebhook(payload)
    } else if (req.headers.get('user-agent')?.includes('NOWPayments')) {
      return await handleCryptoWebhook(payload)
    } else {
      return NextResponse.json({ error: 'Unknown payment provider' }, { status: 400 })
    }

  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function verifyWebhookSignature(body: string, signature: string, userAgent: string): Promise<boolean> {
  // This is a simplified verification - in production, implement proper signature verification
  // for each payment provider
  const secret = process.env.WEBHOOK_SECRET || 'default-secret'
  const hash = crypto.createHmac('sha512', secret).update(body).digest('hex')
  return hash === signature
}

async function handlePaystackWebhook(payload: any) {
  if (payload.event === 'charge.success') {
    const { reference, amount, currency, customer, metadata } = payload.data
    
    // Extract user info from metadata
    const userId = metadata.user_id
    const tier = metadata.tier
    const credits = metadata.credits

    // Grant credits to user
    const { error } = await supabaseServer.rpc('grant_credits_and_log', {
      p_user_id: userId,
      p_amount: credits,
      p_reason: `Payment successful - ${tier} package`,
      p_transaction_id: reference,
      p_metadata: {
        provider: 'paystack',
        amount: amount / 100, // Convert back from kobo
        currency: currency
      }
    })

    if (error) {
      console.error('Failed to grant credits:', error)
      return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 })
    }

    return NextResponse.json({ status: 'success' })
  }

  return NextResponse.json({ status: 'ignored' })
}

async function handleCryptoWebhook(payload: any) {
  if (payload.payment_status === 'confirmed') {
    // Handle crypto payment confirmation
    // Similar logic to Paystack but for crypto payments
    return NextResponse.json({ status: 'success' })
  }

  return NextResponse.json({ status: 'ignored' })
}
