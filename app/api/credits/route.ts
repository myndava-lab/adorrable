
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabaseServer'
import { getUserProfile, grantCredits, deductCredits } from '@/lib/supabaseServer'

export async function GET(request: NextRequest) {
  try {
    const response = NextResponse.next()
    const supabase = createServerSupabaseClient(request, response)
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await getUserProfile(user.id)
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({
      credits: profile.credits,
      tier: profile.credits > 50 ? 'premium' : profile.credits > 10 ? 'basic' : 'free'
    })
  } catch (error) {
    console.error('Credits API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.next()
    const supabase = createServerSupabaseClient(request, response)
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, amount, reason, meta = {} } = body

    if (!action || !amount || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let result
    if (action === 'grant') {
      result = await grantCredits(user.id, amount, reason, meta)
    } else if (action === 'deduct') {
      result = await deductCredits(user.id, amount, reason, meta)
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      newBalance: result.newBalance,
      action,
      amount
    })
  } catch (error) {
    console.error('Credits POST API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
