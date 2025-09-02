
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, getUserProfile, grantCredits, deductCredits } from '@/lib/supabaseServer'

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
      userId: user.id 
    })

  } catch (error) {
    console.error('Credits API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
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
    const { action, amount } = body

    if (!action || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid action or amount' }, { status: 400 })
    }

    let result
    if (action === 'grant') {
      result = await grantCredits(user.id, amount, 'Test grant')
    } else if (action === 'deduct') {
      result = await deductCredits(user.id, amount, 'Test deduction')
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true,
      newCredits: result.newCredits
    })

  } catch (error) {
    console.error('Credits POST API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
