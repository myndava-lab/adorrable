
import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'
import { headers } from 'next/headers'

export async function GET(req: NextRequest) {
  try {
    const headersList = headers()
    const authorization = headersList.get('authorization')
    
    if (!authorization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Extract user from JWT token
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser(
      authorization.replace('Bearer ', '')
    )

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get user profile with credits
    const { data: profile, error: profileError } = await supabaseServer
      .from('profiles')
      .select('credits, subscription_tier')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get recent credit logs
    const { data: logs, error: logsError } = await supabaseServer
      .from('credit_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      success: true,
      credits: profile.credits,
      subscription_tier: profile.subscription_tier,
      recent_transactions: logs || []
    })

  } catch (error: any) {
    console.error('Credits API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const headersList = headers()
    const authorization = headersList.get('authorization')
    
    if (!authorization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amount, reason } = await req.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // Extract user from JWT token
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser(
      authorization.replace('Bearer ', '')
    )

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Deduct credits
    const { data: result, error: deductError } = await supabaseServer
      .rpc('deduct_credits', {
        p_user_id: user.id,
        p_amount: amount,
        p_reason: reason || 'Website generation'
      })

    if (deductError || !result) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: 'Credits deducted successfully' })

  } catch (error: any) {
    console.error('Credits deduction error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
