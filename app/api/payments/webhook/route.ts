
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

  // Handle successful payment
  if (event.event === 'charge.success') {
    const { reference, amount, currency, status, metadata } = event.data

    if (status === 'success') {
      // Get the transaction
      const { data: transaction, error: fetchError } = await supabaseServer
        .from('payment_transactions')
        .select('*')
        .eq('id', reference)
        .single()

      if (fetchError || !transaction) {
        console.error('Transaction not found:', reference)
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
      }

      // Update transaction status
      const { error: updateError } = await supabaseServer
        .from('payment_transactions')
        .update({
          status: 'completed',
          provider_response: event.data
        })
        .eq('id', reference)

      if (updateError) {
        console.error('Failed to update transaction:', updateError)
        return NextResponse.json({ error: 'Transaction update failed' }, { status: 500 })
      }

      // Grant credits to user
      const { data: creditResult, error: creditError } = await supabaseServer.rpc('grant_credits_and_log', {
        p_user_id: transaction.profile_id,
        p_amount: transaction.credits_granted,
        p_reason: 'payment_completed',
        p_transaction_id: reference,
        p_metadata: { payment_data: event.data }
      })

      if (creditError) {
        console.error('Failed to grant credits:', creditError)
        return NextResponse.json({ error: 'Credit grant failed' }, { status: 500 })
      }

      console.log('✅ Payment completed successfully:', {
        transaction_id: reference,
        credits_granted: transaction.credits_granted,
        user_id: transaction.profile_id
      })

      return NextResponse.json({
        success: true,
        message: 'Payment processed and credits granted',
        credits_granted: transaction.credits_granted
      })
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
