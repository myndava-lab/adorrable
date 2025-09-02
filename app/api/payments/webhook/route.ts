
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
  try {
    if (userAgent?.includes('Paystack')) {
      // Paystack signature verification
      const secret = process.env.PAYSTACK_SECRET_KEY!
      const hash = crypto.createHmac('sha512', secret).update(body).digest('hex')
      return hash === signature
    } else if (userAgent?.includes('NOWPayments')) {
      // NOWPayments signature verification
      const secret = process.env.NOWPAYMENTS_API_KEY!
      const hash = crypto.createHmac('sha512', secret).update(body).digest('hex')
      return hash === signature
    }
    
    return false
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}

async function handlePaystackWebhook(payload: any) {
  if (payload.event === 'charge.success') {
    const { reference, amount, currency, customer, metadata } = payload.data
    
    try {
      // Update transaction status
      const { data: transaction, error: fetchError } = await supabaseServer
        .from('payment_transactions')
        .select('*')
        .eq('provider_reference', reference)
        .single()

      if (fetchError || !transaction) {
        console.error('Transaction not found:', reference)
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
      }

      // Update transaction to completed
      const { error: updateError } = await supabaseServer
        .from('payment_transactions')
        .update({
          status: 'completed',
          provider_response: payload
        })
        .eq('id', transaction.id)

      if (updateError) {
        console.error('Failed to update transaction:', updateError)
        return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 })
      }

      // Grant credits to user
      const { error: creditError } = await supabaseServer
        .from('credit_transactions')
        .insert({
          profile_id: transaction.profile_id,
          amount: transaction.credits_granted,
          type: 'purchase',
          description: `Payment successful - ${transaction.package_name} package`,
          reference_id: transaction.id,
          metadata: {
            provider: 'paystack',
            amount: amount / 100,
            currency: currency,
            reference: reference
          }
        })

      if (creditError) {
        console.error('Failed to grant credits:', creditError)
        return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 })
      }

      // Update user profile credits
      const { error: profileError } = await supabaseServer.rpc('increment_user_credits', {
        user_id: transaction.profile_id,
        credit_amount: transaction.credits_granted
      })

      if (profileError) {
        console.error('Failed to update profile credits:', profileError)
      }

      return NextResponse.json({ status: 'success' })

    } catch (error: any) {
      console.error('Paystack webhook processing error:', error)
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
    }
  }

  return NextResponse.json({ status: 'ignored' })
}

async function handleCryptoWebhook(payload: any) {
  if (payload.payment_status === 'confirmed' || payload.payment_status === 'finished') {
    try {
      // Find transaction by payment ID
      const { data: transaction, error: fetchError } = await supabaseServer
        .from('payment_transactions')
        .select('*')
        .eq('provider_reference', payload.payment_id.toString())
        .single()

      if (fetchError || !transaction) {
        console.error('Crypto transaction not found:', payload.payment_id)
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
      }

      // Update transaction status
      const { error: updateError } = await supabaseServer
        .from('payment_transactions')
        .update({
          status: 'completed',
          provider_response: payload
        })
        .eq('id', transaction.id)

      if (updateError) {
        console.error('Failed to update crypto transaction:', updateError)
        return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 })
      }

      // Grant credits to user
      const { error: creditError } = await supabaseServer
        .from('credit_transactions')
        .insert({
          profile_id: transaction.profile_id,
          amount: transaction.credits_granted,
          type: 'purchase',
          description: `Crypto payment confirmed - ${transaction.package_name} package`,
          reference_id: transaction.id,
          metadata: {
            provider: 'nowpayments',
            payment_id: payload.payment_id,
            crypto_amount: payload.pay_amount,
            crypto_currency: payload.pay_currency,
            hash: payload.outcome?.hash
          }
        })

      if (creditError) {
        console.error('Failed to grant crypto credits:', creditError)
        return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 })
      }

      // Update user profile credits
      const { error: profileError } = await supabaseServer.rpc('increment_user_credits', {
        user_id: transaction.profile_id,
        credit_amount: transaction.credits_granted
      })

      if (profileError) {
        console.error('Failed to update profile credits:', profileError)
      }

      return NextResponse.json({ status: 'success' })

    } catch (error: any) {
      console.error('Crypto webhook processing error:', error)
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
    }
  }

  return NextResponse.json({ status: 'ignored' })
}
