import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const paystackSignature = request.headers.get('x-paystack-signature')
    const nowpaymentsSignature = request.headers.get('x-nowpayments-sig')

    console.log('Webhook received from:', {
      userAgent: request.headers.get('user-agent'),
      paystackSig: !!paystackSignature,
      nowpaymentsSig: !!nowpaymentsSignature
    })

    let event: any

    // Handle Paystack webhook
    if (paystackSignature) {
      const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!).update(body).digest('hex')
      if (hash !== paystackSignature) {
        return NextResponse.json({ error: 'Invalid Paystack signature' }, { status: 401 })
      }
      event = JSON.parse(body)
      return await handlePaystackWebhook(event)
    }

    // Handle NOWPayments webhook
    if (nowpaymentsSignature || request.headers.get('user-agent')?.includes('NOWPayments')) {
      event = JSON.parse(body)
      return await handleNowPaymentsWebhook(event)
    }

    // If no recognized webhook signature
    console.log('Unknown webhook source, processing as generic payment webhook')
    event = JSON.parse(body)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}

async function handlePaystackWebhook(event: any) {
  console.log('Processing Paystack webhook:', event.event)

  if (event.event === 'charge.success') {
    const { reference, amount, currency, status, metadata } = event.data

    if (status === 'success') {
      const { data, error } = await supabaseServer.rpc('complete_payment_transaction', {
        transaction_id: reference,
        provider_ref: reference,
        provider_response: event.data
      })

      if (error) {
        console.error('Failed to complete Paystack payment:', error)
        return NextResponse.json({ error: 'Payment completion failed' }, { status: 500 })
      }

      console.log('✅ Paystack payment completed:', data)
      return NextResponse.json({ success: true, message: 'Paystack payment processed' })
    }
  }

  return NextResponse.json({ success: true })
}

async function handleNowPaymentsWebhook(event: any) {
  console.log('Processing NOWPayments webhook:', event)

  if (event.payment_status === 'finished' || event.payment_status === 'confirmed') {
    const { order_id, payment_id, price_amount, price_currency } = event

    const { data, error } = await supabaseServer.rpc('complete_payment_transaction', {
      transaction_id: order_id,
      provider_ref: payment_id,
      provider_response: event
    })

    if (error) {
      console.error('Failed to complete NOWPayments payment:', error)
      return NextResponse.json({ error: 'Payment completion failed' }, { status: 500 })
    }

    console.log('✅ NOWPayments payment completed:', data)
    return NextResponse.json({ success: true, message: 'NOWPayments payment processed' })
  }

  return NextResponse.json({ success: true })
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

      // Grant credits to user using the database function
      const { data: creditResult, error: creditError } = await supabaseServer.rpc('grant_credits_and_log', {
        p_user_id: transaction.profile_id,
        p_amount: transaction.credits_granted,
        p_reason: `Payment successful - ${transaction.package_name} package`,
        p_transaction_id: transaction.id,
        p_metadata: {
          provider: 'paystack',
          amount: amount / 100,
          currency: currency,
          reference: reference
        }
      })

      if (creditError || !creditResult) {
        console.error('Failed to grant credits:', creditError)
        return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 })
      }

      // The following line seems to be an error as profileError is not defined.
      // Assuming it was intended to check for errors from a profile update,
      // but no such operation is present here.
      // if (profileError) {
      //   console.error('Failed to update profile credits:', profileError)
      // }

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

      // Grant credits to user using the database function
      const { data: creditResult, error: creditError } = await supabaseServer.rpc('grant_credits_and_log', {
        p_user_id: transaction.profile_id,
        p_amount: transaction.credits_granted,
        p_reason: `Crypto payment confirmed - ${transaction.package_name} package`,
        p_transaction_id: transaction.id,
        p_metadata: {
          provider: 'nowpayments',
          payment_id: payload.payment_id,
          crypto_amount: payload.pay_amount,
          crypto_currency: payload.pay_currency,
          hash: payload.outcome?.hash
        }
      })

      if (creditError || !creditResult) {
        console.error('Failed to grant crypto credits:', creditError)
        return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 })
      }

      // Similar to the Paystack handler, this likely had an intended profile update.
      // if (profileError) {
      //   console.error('Failed to update profile credits:', profileError)
      // }

      return NextResponse.json({ status: 'success' })

    } catch (error: any) {
      console.error('Crypto webhook processing error:', error)
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
    }
  }

  return NextResponse.json({ status: 'ignored' })
}